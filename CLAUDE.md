# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an MCP (Model Context Protocol) server implementation for Google Search functionality using TypeScript and Bun runtime. The server provides Google search capabilities through the MCP protocol using Google Custom Search API.

## Commands

```bash
# Install dependencies
bun install

# Run the MCP server
bun start

# Run in development mode with file watching
bun dev
```

## Architecture

- `src/index.ts`: Main server implementation using MCP SDK
- Uses Google Custom Search API for search functionality
- Communicates via stdio transport (standard MCP pattern)
- Implements a single `search` tool with query and result count parameters

## Development Notes

- Environment variables (`GOOGLE_API_KEY` and `GOOGLE_SEARCH_ENGINE_ID`) are required
- Google Custom Search API has a limit of 10 results per request
- Error handling includes API quota limits and missing credentials
- The server uses Bun runtime instead of Node.js
