## Web Research

For any internet search:

1. Use the `@web-searcher` agent for comprehensive web research, or call the best_web_search tool directly
2. **ALL internet research must go through `best_web_search` tool** — no exceptions. This means: no built-in websearch tool, no WebFetch tool, no `curl` against APIs, no manual GitHub API calls, no `wget`, nothing else. Every time you need information from the internet, use `best_web_search`.
   - **One query per call** — run each query as a separate `best_web_search` tool invocation. Never combine multiple queries into a single call. Run calls **sequentially** (one after another, not in parallel) to avoid hitting API rate limits
   - **Always use default options** — never use `search`, `max-length`, or any result-limiting parameters. Let the tool use its built-in defaults
   - **Scientific queries: use `sci`** for CS, physics, math, engineering (arXiv + OpenAlex)
   - **Medical queries: use `med`** for medicine, clinical trials, biomedical (PubMed + Europe PMC + OpenAlex)
   - **Tech queries: use `tech`** for software dev, DevOps, IT, startups (Hacker News + Stack Overflow + Dev.to + GitHub)
3. Synthesize results into a report

