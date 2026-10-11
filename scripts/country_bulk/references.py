"""Whole-snapshot current checks and separately pinned historical corroboration."""
import calendar
from dataclasses import asdict, dataclass
import hashlib
from html.parser import HTMLParser
import re
from .model import contexts, safe_integer, require
from .sources import PAGES


class TableRows(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.text=[];self.rows=[];self.row=None;self.cell=None

    def handle_starttag(self,tag,attributes):
        if tag=='tr': self.row=[]
        elif tag in ('td','th') and self.row is not None: self.cell=''

    def handle_data(self,data):
        self.text.append(data)
        if self.cell is not None: self.cell+=data

    def handle_endtag(self,tag):
        if tag in ('td','th') and self.cell is not None:
            self.row.append(' '.join(self.cell.split()));self.cell=None
        elif tag=='tr' and self.row is not None:
            self.rows.append(self.row);self.row=None


def parse_table(html):
    parser=TableRows();parser.feed(html.decode('utf-8'))
    plain=' '.join(' '.join(parser.text).split())
    require('trade in goods with canada' in plain.lower() and 'millions of U.S. dollars on a nominal basis' in plain and 'not seasonally adjusted' in plain, 'reference-units-or-country')
    header=False;seen=set();values={};requested={c.month for c in contexts()}
    for row in parser.rows:
        if row and row[0]=='Month':
            require(row==['Month','Exports','Imports','Balance'], 'reference-columns');header=True;continue
        match=re.fullmatch(r'(\w+) (20\d{2})',row[0] if row else '')
        if not match or match[1] not in calendar.month_name: continue
        month=f'{match[2]}-{list(calendar.month_name).index(match[1]):02d}'
        require(header and len(row)==4 and month not in seen, 'reference-month-identity');seen.add(month)
        amounts=[]
        for value in row[1:3]:
            require(bool(re.fullmatch(r'(?:\d{1,3}(?:,\d{3})*|\d+)\.\d',value)), 'reference-value')
            amounts.append(safe_integer(int(value.replace(',','').replace('.',''))*100000))
        if month in requested:
            values['exports-'+month],values['imports-'+month]=amounts
    require(len(values)==48,'incomplete-reference-snapshot')
    return values


def snapshot_stability(before,after):
    required={c.id for c in contexts()}
    if before is None or after is None or set(before)!=required or set(after)!=required: return 'unavailable'
    return 'matched' if before==after else 'mismatch'


@dataclass(frozen=True)
class Comparison:
    reference_check: str
    publication_check: str
    reference_corroboration: str
    current_difference_usd: int | None
    publication_difference_usd: int | None


def compare_references(total,current,publication,verified):
    if total is not None: safe_integer(total)
    if current is not None: safe_integer(current)
    if publication is not None: safe_integer(publication)
    rounded=None if total is None else (total+50000)//100000
    current_check='unavailable' if rounded is None or current is None else 'matched' if rounded==current//100000 else 'mismatch'
    publication_check='unavailable' if rounded is None or publication is None or not verified else 'matched' if rounded==publication//100000 else 'mismatch'
    corroboration='current-reference' if current_check=='matched' else 'original-publication-only' if publication_check=='matched' else 'unavailable'
    return Comparison(current_check,publication_check,corroboration,None if total is None or current is None else total-current,None if total is None or publication is None or not verified else total-publication)


def validate_publication(pin,record,raw):
    return record.outcome=='complete' and record.kind=='pdf' and record.context_id=='exports-'+pin.month and record.source_url==pin.url and record.status==200 and (record.content_type or '').split(';')[0].strip().lower()=='application/pdf' and raw.startswith(b'%PDF-') and len(raw)==record.bytes==pin.bytes and hashlib.sha256(raw).hexdigest()==record.sha256==pin.sha256


def comparison_json(comparison):
    return dict(referenceCheck=comparison.reference_check,publicationCheck=comparison.publication_check,referenceCorroboration=comparison.reference_corroboration,currentDifferenceUsd=comparison.current_difference_usd,publicationDifferenceUsd=comparison.publication_difference_usd)


def build_report(outcomes,records,before,after,publications,contracts,budget,commit):
    required={c.id for c in contexts()}
    before=before if before is not None and set(before)==required else None
    after=after if after is not None and set(after)==required else None
    stability=snapshot_stability(before,after);rows=[]
    by_id={record.id:record for record in records}
    request_ids=required|{name for name,_ in PAGES}|{'canada-after'}|{f'publication-2026-{month:02d}' for month in range(1,8)}
    requests_unique=len(by_id)==len(records)==64 and set(by_id)==set(contracts)==request_ids
    for context in contexts():
        outcome=outcomes.get(context.id,{})
        validated=outcome.get('state')=='validated' and by_id.get(context.id) is not None and by_id[context.id].outcome=='complete'
        total=outcome.get('countryTotalUsd') if validated else None
        publication=publications.get(context.id)
        prior=compare_references(total,None if before is None else before[context.id],publication,publication is not None)
        following=compare_references(total,None if after is None else after[context.id],publication,publication is not None)
        rows.append({'id':context.id,'month':context.month,'direction':context.direction,'measure':context.measure,'state':outcome.get('state','unattempted'),'reason':outcome.get('reason'),'sumUsd':outcome.get('sumUsd') if validated else None,'countryTotalUsd':total,'residualUsd':outcome.get('residualUsd') if validated else None,'beforeComparison':comparison_json(prior),'afterComparison':comparison_json(following),'files':outcome.get('files'),'worker':outcome.get('worker')})
    coverage=stability=='matched' and set(outcomes)=={c.id for c in contexts()} and all(row['state']=='validated' and row['residualUsd']==0 and row['beforeComparison']['referenceCheck']==row['afterComparison']['referenceCheck']=='matched' for row in rows)
    diagnostic=coverage and requests_unique and all(record.outcome=='complete' and contracts.get(record.id) is True for record in records) and not budget.stops
    counts={state:sum(r.outcome==state for r in records) for state in ('complete','partial','failed','unattempted')}
    return {'schemaVersion':1,'countryCode':'1220','endMonth':'2026-08','months':24,'processingCommit':commit,'sourceCoverage':'passed' if coverage else 'failed','diagnosticOutcome':'passed' if diagnostic else 'failed','classificationStatus':'unverified','releaseAccepted':False,'rollingComparisonsAvailable':False,'defaultAuditRetrievalChanged':False,'snapshotStability':stability,'contexts':rows,'requests':[asdict(r) for r in records],'sourceContracts':contracts,'requestCounts':{'planned':64,'attempted':sum(r.attempted for r in records),**counts},'resources':{'limits':asdict(budget.limits),'originalBytes':budget.original_bytes,'generatedBytes':budget.generated_bytes,'elapsedSeconds':budget.clock()-budget.started,'stops':list(budget.stops)}}


def markdown_summary(report):
    counts=report['requestCounts']
    lines=['# Canada bulk diagnostic','',f"Source coverage: {report['sourceCoverage']}. Diagnostic: {report['diagnosticOutcome']}.",f"Originals: {counts['complete']} complete, {counts['partial']} partial, {counts['failed']} failed, {counts['unattempted']} unattempted.",'Classification unverified; release, rolling comparisons and default retrieval remain withheld.','','| Context | State | Residual USD | Current before / after |','| --- | --- | ---: | --- |']
    for row in report['contexts']:
        lines.append(f"| {row['id']} | {row['state']} | {row['residualUsd']} | {row['beforeComparison']['referenceCheck']} / {row['afterComparison']['referenceCheck']} |")
    return '\n'.join(lines)+'\n'
