import { tool } from "@opencode-ai/plugin"
import path from "path"

const isWindows = process.platform === "win32"

async function ensureUv(): Promise<string> {
  const check = isWindows ? "where uv" : "command -v uv"
  try {
    await Bun.$`bash -c '${check}'`.quiet()
    return "uv"
  } catch {
    if (isWindows) {
      await Bun.$`powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"`
        .env({ PATH: `${process.env.USERPROFILE}\\.local\\bin;${process.env.PATH}` })
    } else {
      await Bun.$`curl -LsSf https://astral.sh/uv/install.sh | sh`
    }
    return isWindows
      ? `${process.env.USERPROFILE}\\.local\\bin\\uv`
      : `${process.env.HOME}/.local/bin/uv`
  }
}

export default tool({
  description:
    "Web research: search DuckDuckGo + Brave, fetch pages in parallel with TLS fingerprinting, extract readable text. Returns combined results.",
  args: {
    // Prompt suggest agent not to use most of these parameters. Should we just remove them?
    query: tool.schema
      .string()
      .describe(
        "Search query (or multiple queries space-separated for parallel multi-query)",
      ),
    search: tool.schema
      .number()
      .optional()
      .describe("Number of search results per query (default: 20)"),
    fetch: tool.schema
      .number()
      .optional()
      .describe("Max pages to fetch (default: 0 = fetch ALL)"),
    "max-length": tool.schema
      .number()
      .optional()
      .describe("Max content length per page (default: 8000)"),
    timeout: tool.schema
      .number()
      .optional()
      .describe("Fetch timeout in seconds (default: 5)"),
    concurrent: tool.schema
      .number()
      .optional()
      .describe("Max concurrent connections (default: 50)"),
    "global-budget": tool.schema
      .number()
      .optional()
      .describe(
        "Global char budget across all pages (0 = unlimited)",
      ),
    sci: tool.schema
      .boolean()
      .optional()
      .describe(
        "Enable scientific bonus sources (arXiv, OpenAlex)",
      ),
    med: tool.schema
      .boolean()
      .optional()
      .describe(
        "Enable medical bonus sources (PubMed, Europe PMC, OpenAlex)",
      ),
    tech: tool.schema
      .boolean()
      .optional()
      .describe(
        "Enable tech bonus sources (Hacker News, Stack Overflow, Dev.to, GitHub)",
      ),
  },
  async execute(args, context) {
    const uv = await ensureUv()
    const script = path.join(import.meta.dir, "web_research.py")

    const cmd: string[] = [uv, "run", script, args.query]

    if (args.search != null) cmd.push("-s", String(args.search))
    if (args.fetch != null) cmd.push("-f", String(args.fetch))
    if (args["max-length"] != null)
      cmd.push("-m", String(args["max-length"]))
    if (args.timeout != null) cmd.push("-t", String(args.timeout))
    if (args.concurrent != null)
      cmd.push("-c", String(args.concurrent))
    if (args["global-budget"] != null)
      cmd.push("-g", String(args["global-budget"]))
    if (args.sci) cmd.push("--sci")
    if (args.med) cmd.push("--med")
    if (args.tech) cmd.push("--tech")

    cmd.push("-q", "-o", "raw")

    const envPath = isWindows
      ? `${process.env.USERPROFILE}\\.local\\bin;${process.env.PATH}`
      : `${process.env.HOME}/.local/bin:${process.env.PATH}`

    try {
      const result = await Bun.$`${cmd}`
        .env({
          ...process.env,
          PATH: envPath,
          PYTHONPATH: "",
          PYTHONIOENCODING: "utf-8",
        })
        .text()
      return result.trim() || "No results found"
    } catch (e: any) {
      return `Web search failed: ${e.message || e}`
    }
  },
})
