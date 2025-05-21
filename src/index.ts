#!/usr/bin/env node
/**
 * shadcn MCP server
 *
 * Exposes shadcn-ui CLI functionality via MCP tools:
 *  - init_shadcn     → npx shadcn-ui@latest init -y
 *  - add_component   → npx shadcn-ui@latest add <components>
 *  - list_components → npx shadcn-ui@latest list
 *
 * Each tool accepts a `directory` argument (absolute path to the
 * project root).  Commands are executed in that directory and the
 * stdout/stderr are returned.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";

import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

/**
 * Helper to execute a shell command in a given directory.
 */
async function runCmd(cmd: string, cwd: string) {
  try {
    const { stdout, stderr } = await execAsync(cmd, { cwd });
    return { stdout, stderr };
  } catch (error: any) {
    // bubble up as MCP error so the frontend can surface it
    throw new McpError(
      ErrorCode.InternalError,
      error.stderr ?? error.message ?? "Unknown error"
    );
  }
}

const server = new Server(
  {
    name: "shadcn-mcp",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Advertise the three shadcn tools.
 */
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "init_shadcn",
      description: "Initialize shadcn-ui in a project directory",
      inputSchema: {
        type: "object",
        properties: {
          directory: {
            type: "string",
            description: "Absolute path to the project root",
          },
        },
        required: ["directory"],
      },
    },
    {
      name: "add_component",
      description: "Add one or more shadcn-ui components to a project",
      inputSchema: {
        type: "object",
        properties: {
          directory: {
            type: "string",
            description: "Absolute path to the project root",
          },
          components: {
            type: "array",
            items: { type: "string" },
            description: "Component names to add (e.g. button, card)",
          },
        },
        required: ["directory", "components"],
      },
    },
    {
      name: "list_components",
      description: "List available shadcn-ui components",
      inputSchema: {
        type: "object",
        properties: {
          directory: {
            type: "string",
            description: "Absolute path to the project root",
          },
        },
        required: ["directory"],
      },
    },
  ],
}));

/**
 * Handle tool invocations.
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "init_shadcn": {
      const dir = String(args?.directory);
      const { stdout, stderr } = await runCmd(
        "npx shadcn-ui@latest init -y",
        dir
      );
      return {
        content: [
          {
            type: "text",
            text: `shadcn-ui initialized in ${dir}\n${stdout}\n${stderr}`,
          },
        ],
      };
    }

    case "add_component": {
      const dir = String(args?.directory);
      const comps: string[] = Array.isArray(args?.components)
        ? args.components.map(String)
        : [];
      if (comps.length === 0) {
        throw new McpError(
          ErrorCode.InvalidParams,
          "`components` must be a non-empty array"
        );
      }
      const { stdout, stderr } = await runCmd(
        `npx shadcn-ui@latest add ${comps.join(" ")}`,
        dir
      );
      return {
        content: [
          {
            type: "text",
            text: `Added components to ${dir}\n${stdout}\n${stderr}`,
          },
        ],
      };
    }

    case "list_components": {
      const dir = String(args?.directory);
      const { stdout, stderr } = await runCmd(
        "npx shadcn-ui@latest list",
        dir
      );
      return {
        content: [
          {
            type: "text",
            text: stdout || stderr,
          },
        ],
      };
    }

    default:
      throw new McpError(
        ErrorCode.MethodNotFound,
        `Unknown tool: ${name}`
      );
  }
});

/**
 * Boot the server over stdio.
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("shadcn MCP server running on stdio");
}

main().catch((err) => {
  console.error("[shadcn-mcp] fatal:", err);
  process.exit(1);
});
