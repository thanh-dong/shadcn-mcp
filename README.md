# shadcn-mcp · MCP Server

Expose the [`shadcn-ui`](https://ui.shadcn.com) CLI as **Model Context Protocol** tools so any MCP-aware client (Cline, Cursor, Windsurf, …) can:

* **init_shadcn**&nbsp;— Bootstrap shadcn-ui in a project  
  `npx shadcn-ui@latest init -y`
* **add_component**&nbsp;— Install one or more components  
  `npx shadcn-ui@latest add <components…>`
* **list_components**&nbsp;— Show all installable components  
  `npx shadcn-ui@latest list`

---

## Quick Start

```bash
# 1 · clone / create in your MCP servers directory
cd ~/Documents/Cline/MCP
npx @modelcontextprotocol/create-server shadcn-server
cd shadcn-server

# 2 · install deps & compile
npm install
npm run build         # emits build/index.js
```

### 3 · Register the server (Cline, Cursor, Windsurf)

All three editors look for the same JSON file:

```
~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json
```

Add (or merge) the following snippet:

```jsonc
{
  "mcpServers": {
    "shadcn": {
      "command": "node",
      "args": [
        "/Users/<YOU>/Documents/Cline/MCP/shadcn-server/build/index.js"
      ],
      "env": {},          // add env vars if you need any
      "disabled": false,  // start automatically
      "autoApprove": []   // list tool names to auto-approve
    }
  }
}
```

> • **Cline** – starts the server automatically once the file is saved  
> • **Cursor** – same path, same behaviour  
> • **Windsurf** – same path, same behaviour  

After you save, the editor reloads MCP servers; `shadcn` will appear in the *Connected MCP Servers* list with three tools.

---

## Tool Reference

| Tool name        | Description                                          | Required arguments |
| ---------------- | ---------------------------------------------------- | ------------------ |
| `init_shadcn`    | Initialise shadcn-ui in the target directory         | `directory` (absolute path) |
| `add_component`  | Add one or more components to a shadcn-ui project    | `directory`, `components` (array of strings) |
| `list_components`| List all available components for the project        | `directory` |

### JSON Schemas

```jsonc
// init_shadcn
{
  "directory": "string"
}

// add_component
{
  "directory": "string",
  "components": ["button", "card"]
}

// list_components
{
  "directory": "string"
}
```

---

## Usage Examples

### Initialise shadcn-ui

```xml
<use_mcp_tool>
  <server_name>shadcn</server_name>
  <tool_name>init_shadcn</tool_name>
  <arguments>
    {
      "directory": "/Users/<YOU>/code/my-app"
    }
  </arguments>
</use_mcp_tool>
```

### Add components

```xml
<use_mcp_tool>
  <server_name>shadcn</server_name>
  <tool_name>add_component</tool_name>
  <arguments>
    {
      "directory": "/Users/<YOU>/code/my-app",
      "components": ["button", "card", "dialog"]
    }
  </arguments>
</use_mcp_tool>
```

### List components

```xml
<use_mcp_tool>
  <server_name>shadcn</server_name>
  <tool_name>list_components</tool_name>
  <arguments>
    {
      "directory": "/Users/<YOU>/code/my-app"
    }
  </arguments>
</use_mcp_tool>
```

---

## Development

```bash
npm run watch   # rebuild on file changes
npm run inspector
```

The **MCP Inspector** opens a browser UI to inspect messages exchanged between your server and the client.

---

## License

MIT
