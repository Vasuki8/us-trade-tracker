"""Observed official links and fixed source record contracts."""
from dataclasses import dataclass
from html.parser import HTMLParser
from urllib.parse import urlsplit, urljoin
import re

from .model import Context, Limits, PublicationPin, RequestSpec, contexts, require

ORIGIN = 'https://www.census.gov'
PAGES = (
    ('data-products', '/foreign-trade/data/dataproducts.html'),
    ('imports-history', '/foreign-trade/data/IMDB.html'),
    ('exports-history', '/foreign-trade/data/EXDB.html'),
    ('imports-layout', '/foreign-trade/reference/products/layouts/imdb.html'),
    ('exports-layout', '/foreign-trade/reference/products/layouts/exdb.html'),
    ('country-subcodes', '/foreign-trade/reference/codes/csc.html'),
    ('statistical-guide', '/foreign-trade/guide/sec2.html'),
    ('canada-before', '/foreign-trade/balance/c1220.html'),
)


def allowed_url(url: str) -> bool:
    if type(url) is not str or len(url) > 2048 or any(ord(char) <= 32 or ord(char) == 127 for char in url):
        return False
    try:
        parsed = urlsplit(url)
        return parsed.scheme == 'https' and parsed.netloc == 'www.census.gov' and not parsed.query and not parsed.fragment
    except ValueError:
        return False


def planned_requests(pins: tuple[PublicationPin, ...]) -> tuple[RequestSpec, ...]:
    require(len(pins) == 7 and tuple(pin.month for pin in pins) == tuple(f'2026-{number:02d}' for number in range(1,8)), 'invalid-publication-grid')
    limits = Limits()
    requests = [RequestSpec(name, 'html', ORIGIN+path, name+'.html', None, limits.html_bytes) for name,path in PAGES]
    requests += [RequestSpec('publication-'+pin.month, 'pdf', pin.url, 'ft900-'+pin.month+'.pdf', 'exports-'+pin.month, limits.pdf_bytes) for pin in pins]
    requests += [RequestSpec(context.id, 'zip', None, context.id+'.zip', context.id, limits.zip_bytes) for context in contexts()]
    requests.append(RequestSpec('canada-after', 'html', ORIGIN+'/foreign-trade/balance/c1220.html', 'canada-after.html', None, limits.html_bytes))
    return tuple(requests)


class Links(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.links = []

    def handle_starttag(self, tag, attributes):
        if tag.lower() == 'a':
            self.links.extend(value for name,value in attributes if name.lower() == 'href' and value is not None)


def discover_archive_url(pages: dict[str, bytes], context: Context) -> str:
    observed = set()
    bases = dict((name+'.html', ORIGIN+path) for name,path in PAGES)
    for name in ('data-products.html', context.direction+'-history.html'):
        if name not in pages:
            continue
        parser = Links()
        parser.feed(pages[name].decode('utf-8'))
        for href in parser.links:
            candidate = urljoin(bases[name], href)
            try:
                basename = urlsplit(candidate).path.rsplit('/',1)[-1]
            except ValueError:
                continue
            if basename == context.basename:
                require(allowed_url(candidate), 'unsupported-observed-url')
                observed.add(candidate)
    require(len(observed) == 1, 'missing-or-ambiguous-archive-link')
    return next(iter(observed))


@dataclass(frozen=True)
class LayoutContract:
    direction: str
    detail_width: int
    country_width: int
    detail_value: tuple[int,int]
    country_value: tuple[int,int]
    detail_fields: dict[str, tuple[int,int]]


class LayoutTables(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.prefix = ''
        self.tables = {}
        self.table = None
        self.row = None
        self.cell = None

    def handle_starttag(self, tag, attributes):
        tag = tag.lower()
        if tag == 'table':
            matches = list(re.finditer(r'FILENAME:\s*(\w+\.TXT).*?RECORD LENGTH:\s*(\d+)', self.prefix, re.S|re.I))
            self.table = (matches[-1].group(1).upper(), int(matches[-1].group(2)), {}) if matches else None
        elif tag == 'tr' and self.table:
            self.row = []
        elif tag in ('td','th') and self.row is not None:
            self.cell = ''

    def handle_data(self, data):
        if self.cell is not None:
            self.cell += data
        elif self.table is None:
            self.prefix = (self.prefix + ' ' + data)[-4096:]

    def handle_endtag(self, tag):
        tag = tag.lower()
        if tag in ('td','th') and self.cell is not None:
            self.row.append(' '.join(self.cell.split()))
            self.cell = None
        elif tag == 'tr' and self.row is not None:
            if len(self.row) >= 2:
                match = re.fullmatch(r'(\d+)\s*-\s*(\d+)', self.row[0])
                if match:
                    field = self.row[1].lower()
                    require(field not in self.table[2], 'duplicate-layout-field')
                    start,end = map(int, match.groups())
                    self.table[2][field] = (start-1,end)
            self.row = None
        elif tag == 'table':
            if self.table:
                require(self.table[0] not in self.tables, 'duplicate-layout-member')
                self.tables[self.table[0]] = self.table[1:]
            self.table = self.row = self.cell = None
            self.prefix = ''


def validate_layout(html: bytes, direction: str) -> LayoutContract:
    require(direction in ('imports','exports'), 'unsupported-direction')
    parser = LayoutTables()
    parser.feed(html.decode('utf-8'))
    importing = direction == 'imports'
    prefix, measure = ('IMP','gen_val_mo') if importing else ('EXP','all_val_mo')
    detail = {'commodity':(0,10),'cty_code':(10,14),'cty_subco':(14,16),'dist_entry':(16,18),'dist_unlad':(18,20),'rate_prov':(20,22),'year':(22,26),'month':(26,28),measure:(178,193)} if importing else {'df':(0,1),'commodity':(1,11),'cty_code':(11,15),'district':(15,17),'year':(17,21),'month':(21,23),measure:(68,83)}
    country = {'cty_code':(0,4),'cty_name':(4,34),'year':(34,38),'month':(38,40),measure:(130,145) if importing else (55,70)}
    expected = {prefix+'_DETL.TXT':(688 if importing else 323, detail), prefix+'_CTY.TXT':(580 if importing else 280,country), 'HSDESC.TXT':(206,{'commodity':(0,6),'descriptn':(6,156)})}
    for name,(width,fields) in expected.items():
        require(name in parser.tables, 'required-layout-member-missing')
        actual_width, actual_fields = parser.tables[name]
        require(actual_width == width and all(actual_fields.get(field) == position for field,position in fields.items()), 'incompatible-layout-contract')
    return LayoutContract(direction, expected[prefix+'_DETL.TXT'][0], expected[prefix+'_CTY.TXT'][0], detail[measure], country[measure], detail)
