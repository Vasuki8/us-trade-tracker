"""Fixed audit identities and resource accounting, separate from acceptance."""
from dataclasses import dataclass, field
from datetime import date
import re
import time
from typing import Callable

SAFE_INTEGER = 9_007_199_254_740_991


def require(condition: bool, reason: str) -> None:
    if not condition:
        raise ValueError(reason)


def safe_integer(value: object, reason: str = 'unsafe-integer') -> int:
    require(type(value) is int and 0 <= value <= SAFE_INTEGER, reason)
    return value


@dataclass(frozen=True)
class Limits:
    original_bytes: int = 12 * 1024**3
    generated_bytes: int = 128 * 1024**2
    final_reserve: int = 8 * 1024**2
    preflight_free: int = 16 * 1024**3
    disk_guard: int = 2 * 1024**3
    zip_bytes: int = 384 * 1024**2
    html_bytes: int = 1024**2
    pdf_bytes: int = 4 * 1024**2
    header_seconds: float = 30
    body_seconds: float = 120
    work_seconds: float = 55 * 60
    overall_seconds: float = 60 * 60
    worker_seconds: float = 60
    sample_seconds: float = 0.25
    working_set_bytes: int = 1024**3
    archive_members: int = 100
    archive_uncompressed_bytes: int = 3 * 1024**3
    detail_keys: int = 5_000_000


@dataclass(frozen=True)
class Context:
    country_code: str
    month: str
    direction: str
    measure: str
    basename: str

    @property
    def id(self) -> str:
        return f'{self.direction}-{self.month}'


def contexts(country: str = '1220', end: str = '2026-08', months: int = 24) -> tuple[Context, ...]:
    require((country, end, months) == ('1220', '2026-08', 24) and type(months) is int, 'unsupported-scope')
    grid = []
    for index in range(24):
        absolute = 2024 * 12 + 8 + index
        year, zero_month = divmod(absolute, 12)
        month = f'{year:04d}-{zero_month + 1:02d}'
        suffix = f'{year % 100:02d}{zero_month + 1:02d}.ZIP'
        grid.extend((Context('1220', month, 'imports', 'GEN_VAL_MO', 'IMDB' + suffix), Context('1220', month, 'exports', 'ALL_VAL_MO', 'EXDB' + suffix)))
    return tuple(grid)


@dataclass(frozen=True)
class PublicationPin:
    month: str
    url: str
    value_usd: int
    bytes: int
    sha256: str
    reviewed: dict


def validate_projection(payload: dict) -> tuple[PublicationPin, ...]:
    require(type(payload) is dict and set(payload) == {'schemaVersion', 'countryCode', 'publications'}, 'invalid-projection')
    require(type(payload['schemaVersion']) is int and payload['schemaVersion'] == 1 and payload['countryCode'] == '1220', 'invalid-projection')
    entries = payload['publications']
    require(type(entries) is list and len(entries) == 7, 'invalid-publication-grid')
    expected_fields = {'countryCode', 'month', 'direction', 'measure', 'url', 'publicationDate', 'pdfPage', 'printedPage', 'table', 'column', 'units', 'quantumUsd', 'valueUsd', 'bytes', 'sha256'}
    pins = []
    for number, entry in enumerate(entries, 1):
        require(type(entry) is dict and set(entry) == expected_fields, 'invalid-publication-fields')
        require(all(type(entry[name]) is str and len(entry[name]) <= 512 for name in expected_fields - {'pdfPage', 'quantumUsd', 'valueUsd', 'bytes'}), 'invalid-publication-text')
        month = f'2026-{number:02d}'
        url = f'https://www.census.gov/foreign-trade/Press-Release/ft900/ft900_26{number:02d}.pdf'
        require((entry['countryCode'], entry['month'], entry['direction'], entry['measure'], entry['url']) == ('1220', month, 'exports', 'ALL_VAL_MO', url), 'crossed-publication-context')
        require(type(entry['quantumUsd']) is int and entry['quantumUsd'] == 100000, 'invalid-publication-quantum')
        require(bool(re.fullmatch(r'[0-9a-f]{64}', entry['sha256'])), 'invalid-publication-digest')
        require(bool(re.fullmatch(r'\d{4}-\d{2}-\d{2}', entry['publicationDate'])), 'invalid-publication-date')
        date.fromisoformat(entry['publicationDate'])
        require(0 < safe_integer(entry['bytes']) <= Limits().pdf_bytes and safe_integer(entry['pdfPage']) > 0, 'invalid-publication-size')
        pins.append(PublicationPin(month, url, safe_integer(entry['valueUsd']), entry['bytes'], entry['sha256'], dict(entry)))
    return tuple(pins)


@dataclass
class Budget:
    limits: Limits = field(default_factory=Limits)
    clock: Callable[[], float] = time.monotonic
    original_bytes: int = 0
    generated_bytes: int = 0
    stops: list[str] = field(default_factory=list)

    def __post_init__(self):
        self.started = self.clock()

    def remaining_work(self) -> float:
        return max(0.0, self.limits.work_seconds - (self.clock() - self.started))

    def remaining_overall(self) -> float:
        return max(0.0, self.limits.overall_seconds - (self.clock() - self.started))

    def stop(self, reason: str) -> None:
        if reason not in self.stops:
            self.stops.append(reason)

    def ensure(self, category: str, count: int, final: bool = False) -> None:
        require(type(count) is int and count >= 0, 'invalid-byte-charge')
        require(category in ('original', 'generated'), 'invalid-byte-category')
        used = self.original_bytes if category == 'original' else self.generated_bytes
        limit = self.limits.original_bytes if category == 'original' else self.limits.generated_bytes - (0 if final else self.limits.final_reserve)
        if used + count > limit:
            self.stop(category + '-budget')
            raise ValueError(category + '-budget')

    def charge_original(self, count: int) -> None:
        self.ensure('original', count)
        self.original_bytes += count

    def charge_generated(self, count: int, final: bool = False) -> None:
        self.ensure('generated', count, final)
        self.generated_bytes += count
