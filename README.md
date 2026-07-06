# Agentic CRM MCP Server

A production-ready Model Context Protocol (MCP) server for a CRM system, built with Bun, TypeScript, and SQLite.

## Features

- **Secure & Standard MCP**: Follows the Model Context Protocol for seamless integration with AI models like Claude.
- **Customer Management**:
  - `register_customer`: Self-registration of new leads.
  - `list_customers`: View all customers.
  - `search_customers`: Find customers by name, email, or company.
  - `update_customer_status`: Manage the lifecycle (Lead -> Prospect -> Customer -> Churned).
- **Document Management**:
  - `upload_document`: Attach necessary documents (ID, Contracts, etc.) to customer profiles.
- **Support System**:
  - `create_support_ticket`: Customers can open support requests.
  - `update_ticket_status`: Manage ticket resolution.
- **Sales & Engagement**:
  - `create_opportunity`: Track potential deals and their stages.
  - `add_note`: Record interactions and important information.
- **Rich Resources**:
  - `crm://customer/{id}`: Provides a comprehensive view of a customer, including their profile, documents, tickets, notes, and opportunities.

## Prerequisites

- [Bun](https://bun.sh/) installed on your machine.
- Alternatively, [Docker](https://www.docker.com/) and Docker Compose.

## Getting Started

### Using Bun

1. Install dependencies:
   ```bash
   bun install
   ```

2. Run the server:
   ```bash
   bun run src/index.ts
   ```

### Using Docker

1. Build and run with Docker Compose:
   ```bash
   docker-compose up -d
   ```

## Integration with Claude Desktop

Add the following to your Claude Desktop configuration (usually `~/Library/Application Support/Claude/claude_desktop_config.json` on macOS or `%APPDATA%\Claude\claude_desktop_config.json` on Windows):

### Using Bun directly

```json
{
  "mcpServers": {
    "agentic-crm": {
      "command": "bun",
      "args": ["run", "/path/to/agentic-crm/src/index.ts"]
    }
  }
}
```

### Using Docker

```json
{
  "mcpServers": {
    "agentic-crm": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "-v", "agentic-crm-data:/app/data", "agentic-crm"]
    }
  }
}
```

## Project Structure

- `src/index.ts`: MCP server implementation, tool definitions, and resource handlers.
- `src/db.ts`: SQLite database schema and operations using Bun's native SQLite driver.
- `src/types.ts`: TypeScript interfaces and Zod schemas for data validation.
- `data/`: Directory where the SQLite database is stored.

## License

MIT
