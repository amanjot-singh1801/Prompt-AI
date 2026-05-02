// import { ChatOpenAI } from "@langchain/openai";
// import { createReactAgent } from "@langchain/langgraph/prebuilt";
// import { tool } from "@langchain/core/tools";
// import { z } from "zod";
// import Exa from "exa-js";

// const model = new ChatOpenAI({
//   model: "gpt-4o",
//   configuration: {
//     baseURL: "https://openrouter.ai/api/v1",
//     apiKey: process.env.OPENROUTER_API_KEY!,
//   },
// });

// const exa = new Exa(process.env.EXA_API_KEY!);

// function normalizeQuery(rawQuery: string) {
//   const trimmed = rawQuery.trim();
//   if (!trimmed) return trimmed;

//   const year = String(new Date().getFullYear());
//   const hasYear = /\b20\d{2}\b/.test(trimmed);
//   const wantsLatest = /\b(latest|recent|today|news|current)\b/i.test(trimmed);

//   let normalized = trimmed;
//   if (wantsLatest) {
//     normalized = normalized.replace(/\b20\d{2}\b/g, year);
//   }
//   if (wantsLatest && !hasYear) {
//     normalized = `${normalized} ${year}`;
//   }

//   return normalized;
// }

// const exaSearch = tool(
//   async ({ query }) => {
//     try {
//       const normalizedQuery = normalizeQuery(query);
//       const results = await exa.search(normalizedQuery, {
//         type: "keyword",
//         numResults: 5,
//         useAutoprompt: true,
//         includeDomains: [],
//         excludeDomains: [],
//         startCrawlDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
//         endCrawlDate: new Date().toISOString(),
//         contents: {
//           text: {
//             maxCharacters: 1000,
//             includeHtmlTags: false,
//           },
//         },
//       });

//       return {
//         query: normalizedQuery,
//         results: results.results.map((r) => ({
//           title: r.title,
//           url: r.url,
//           content: r.text?.slice(0, 300),
//         })),
//       };
//     } catch (error) {
//       console.error("Exa search error:", error);
//       return { query, results: [] };
//     }
//   },
//   {
//     name: "web_search",
//     description: "Search the web for current information, news, or any topic. Use this when you need up-to-date information from the internet.",
//     schema: z.object({
//       query: z.string().describe("The search query"),
//     }),
//   }
// );

// export const agent = createReactAgent({
//   llm: model,
//   tools: [exaSearch],
//   prompt: `You are a helpful AI assistant with access to web search capabilities.

// When users ask about current events, recent news, or anything that might require up-to-date information, you MUST use the web_search tool to find the most recent and relevant information. Prefer the latest sources and avoid stale years unless the user explicitly asks for historical info.

// Format your responses in markdown when appropriate. Be concise and helpful. If using web search results, cite your sources.`,
// });



import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { TavilySearch } from "@langchain/tavily";

const model = new ChatOpenAI({
  model: "google/gemini-2.0-flash-001",
  configuration: {
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY!,
  },
});

// console.log("MODEL : ",model);

const tavilySearch = new TavilySearch({
  maxResults: 5,
});

export const agent = createReactAgent({
  llm: model,
  tools: [tavilySearch], 
  prompt: `You are a helpful and intelligent AI assistant with access to web search and a memory of this conversation.

### DECISION MAKING (WHEN TO SEARCH VS. WHEN TO REMEMBER)
1. **Memory First:** Always check your conversation history. If the user asks about something you've already discussed (like their name or previous context), answer directly from memory.
2. **Internal Knowledge:** You can answer general, historical, or common-knowledge questions using your own built-in intelligence. Do not search the web if you are 100% confident in the answer.
3. **Web Search (Tavily):** You MUST use the tavily_search tool if:
   - You do not know the answer.
   - The question is about current events, news, or recent trends.
   - The user asks for real-time data (like crypto prices, sports scores, or weather).

### SPECIAL WEATHER RULE
If you need to search for the weather, search specifically for text-based reports (e.g., "current temperature [location] timeanddate" or "weather conditions [location] accuweather"). Do not search generic terms that trigger visual widgets.

Be conversational, synthesize your answers cleanly, and use Markdown formatting for readability.`,
});
