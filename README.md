# Web Search Agent

Deep web search for [OpenCode](https://opencode.ai) (v1 & v2). Requests up to 30 search results across several engines and fetches up to 20 pages per query — more depth than the typical 10-20 result limit of built-in tools — and delivers a compact digest plus a full report file you can grep.

## Why use it

Most LLM search tools return 10-20 results, limiting research depth on complex questions. This tool digs deeper — more sources, smarter extraction, quality filtering, better answers. Works with any LLM through OpenCode.

## Quick Start

```bash
git clone https://github.com/itohnobue/research-agent-opencode
cp -R research-agent-opencode/.opencode /path/to/your/project/
cp research-agent-opencode/AGENTS.md /path/to/your/project/
cp research-agent-opencode/opencode.json /path/to/your/project/   # skip if you already have one
```

If you already have an `AGENTS.md` or `opencode.json`, keep your own (append this AGENTS.md's instructions) instead of overwriting. This teaches OpenCode to route all web searches through this tool. Test it: *"Search for the most performant Rust web frameworks"*

## Usage

| Flag | Sources | Best for |
|------|---------|----------|
| *(none)* | DuckDuckGo | General web |
| `--tech` | + Hacker News, Stack Overflow, Dev.to, GitHub | Software, DevOps |
| `--sci` | + arXiv, OpenAlex | CS, physics, math, engineering |
| `--med` | + PubMed, Europe PMC, OpenAlex | Medicine, clinical trials |
| `--url` | direct fetch of one specific URL, skips search | Known-page retrieval only (never file downloads), full page text saved raw to its own report file (no quality filters) |
| `--url-chrome` | direct fetch of one URL with real Google Chrome (provisioned repo-local into `tmp/browser/chrome/`) | Pages the cheaper tiers cannot reach — JS anti-bot gates, 403 or bot-wall responses. A fallback, never a first attempt: use it only after `--url` on that same URL clearly failed, or its automatic retry already ran. `--url` escalates to it on its own; either path provisions Chrome on first use |
| `--since <d\|w\|m\|y>` | engine time window (primary search only) | Freshness-sensitive questions where a period is named — trades recall for recency |
| `--map <URL>` | sitemap, else page links | Site coverage: list a host's URLs inside the URL's path subtree (fixed cap 100) |
| `--cite <SEED>` | OpenAlex, Semantic Scholar | Literature expansion: citers + references for one DOI/arXiv/OpenAlex seed (25 each) |

## Key features

- **Up to 30 requested results / 20 pages per query** via DuckDuckGo and its multi-engine backend
- **Anti-bot bypass** — Scrapling with TLS fingerprinting, auto-fallback to httpx
- **Smart extraction** — Trafilatura content-area detection (article body, not sidebars)
- **Quality filters** — content-farm/syndication detection (F5), recency filtering on time-sensitive queries (F7), stub-page drop, cross-page deduplication
- **Non-English support** — auto-detects Japanese, Chinese, Korean and sets the appropriate DDG region
- **Wayback Machine fallback** for paywalled pages
- **PDF extraction** via pdftotext, with a built-in pure-Python fallback (no poppler required)
- **Structured sources** — RSS/Atom feeds return dated entry lists with entry URLs; Hacker News item pages return the comment thread; peer-reviewed links resolve to open-access full text (Europe PMC, OpenAlex, arXiv)
- **Page dates in the digest** — `[YYYY-MM-DD]` from page meta/JSON-LD, `[~YYYY-MM-DD]` when heuristic, `[upd …]` for modified-only; informational, never used to drop pages
- **Site map mode** (`--map`) — list a docs section's URLs from its sitemap (or page links), then fetch only the ones you need
- **Citation graph** (`--cite`) — citers and references for one DOI/arXiv/OpenAlex seed, for expanding a literature search
- **Search retry** — one retry when the search backend returns zero URLs (throttling), with a distinct failure message
- **Page image URLs in the report** — every page section carries an `[images] …` line (`og:image`, then `twitter:image`, then the `<img>` attributes), so a picture can be taken straight from a result
- **Wall-clock watchdog** — hard timeout kills hung fetches on all platforms

Full feature list and blocked/API-routed domain documentation in `.opencode/agents/web-searcher.md`.

## Requirements

- Python 3.11+ (managed by `uv`; downloaded into uv's cache if needed)
- `pdftotext` (optional — from [poppler](https://poppler.freedesktop.org/); used when present for layout-aware PDF text. Without it, a bundled pure-Python extractor handles text PDFs — scanned pages and encrypted files still yield nothing)

## License

MIT
