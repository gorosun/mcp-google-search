#!/usr/bin/env bun

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import axios from 'axios';
import dotenv from 'dotenv';
import { trackUsage, getUsage } from './usage-tracker.js';

dotenv.config();

const SearchArgsSchema = z.object({
  query: z.string().describe('Search query'),
  num: z.number().optional().default(10).describe('Number of results to return'),
});

const server = new Server(
  {
    name: 'google-search',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'search',
        description: 'Search Google for information',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query',
            },
            num: {
              type: 'number',
              description: 'Number of results to return',
              default: 10,
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'get_usage',
        description: 'Get current API usage and remaining quota',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case 'search': {
      const args = SearchArgsSchema.parse(request.params.arguments);
      
      try {
        const searchResults = await performGoogleSearch(args.query, args.num);
        const usage = await trackUsage();
        
        console.error(`API usage: ${usage.used}/100 (${usage.remaining} remaining today)`);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(searchResults, null, 2),
            },
          ],
        };
      } catch (error) {
        throw new Error(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    case 'get_usage': {
      const usage = await getUsage();
      
      return {
        content: [
          {
            type: 'text',
            text: `Google Custom Search API Usage:\n\nUsed today: ${usage.used}/100\nRemaining: ${usage.remaining}\n\nNote: This is a local estimate. Check Google Cloud Console for accurate usage.`,
          },
        ],
      };
    }
    
    default:
      throw new Error(`Unknown tool: ${request.params.name}`);
  }
});

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
}

async function performGoogleSearch(query: string, num: number): Promise<SearchResult[]> {
  const apiKey = process.env.GOOGLE_API_KEY;
  const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

  if (!apiKey || !searchEngineId) {
    throw new Error('Missing GOOGLE_API_KEY or GOOGLE_SEARCH_ENGINE_ID environment variables');
  }

  try {
    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: apiKey,
        cx: searchEngineId,
        q: query,
        num: Math.min(num, 10), // Google Custom Search API limits to 10 results per request
      },
    });

    const results: SearchResult[] = response.data.items?.map((item: any) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet,
    })) || [];

    return results;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        throw new Error('Google API quota exceeded or invalid API key');
      }
      throw new Error(`Google Search API error: ${error.response?.data?.error?.message || error.message}`);
    }
    throw error;
  }
}

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Google Search MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});