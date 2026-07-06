#!/usr/bin/env bun
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { dbOps } from "./db";
import { CustomerSchema, DocumentSchema, SupportTicketSchema, NoteSchema, OpportunitySchema } from "./types";

const server = new Server(
  {
    name: "agentic-crm",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

/**
 * Resources
 */
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  const customers = dbOps.listCustomers();
  return {
    resources: customers.map((c) => ({
      uri: `crm://customer/${c.id}`,
      name: `${c.name} Profile`,
      description: `Full profile and history for ${c.name} (${c.company || "No Company"})`,
      mimeType: "application/json",
    })),
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const url = new URL(request.params.uri);
  if (url.protocol !== "crm:") {
    throw new Error("Invalid protocol");
  }

  const parts = url.pathname.split("/");
  if (parts[1] === "customer") {
    const customerId = parts[2];
    const customer = dbOps.getCustomer(customerId);
    if (!customer) throw new Error("Customer not found");

    const documents = dbOps.getDocuments(customerId);
    const tickets = dbOps.getTickets(customerId);
    const notes = dbOps.getNotes(customerId);
    const opportunities = dbOps.getOpportunities(customerId);

    return {
      contents: [
        {
          uri: request.params.uri,
          mimeType: "application/json",
          text: JSON.stringify(
            {
              profile: customer,
              documents,
              tickets,
              notes,
              opportunities,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  throw new Error("Resource not found");
});

/**
 * Tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "register_customer",
        description: "Register a new customer lead in the CRM",
        inputSchema: {
          type: "object",
          properties: {
            name: { type: "string" },
            email: { type: "string" },
            phone: { type: "string" },
            company: { type: "string" },
          },
          required: ["name", "email"],
        },
      },
      {
        name: "upload_document",
        description: "Upload a document for a customer (e.g., ID, Contract)",
        inputSchema: {
          type: "object",
          properties: {
            customerId: { type: "string" },
            type: { type: "string", description: "Type of document (e.g., ID, KYC, Contract)" },
            url: { type: "string", description: "URL to the document" },
            name: { type: "string", description: "Display name of the document" },
          },
          required: ["customerId", "type", "url", "name"],
        },
      },
      {
        name: "update_customer_status",
        description: "Update the status of a customer",
        inputSchema: {
          type: "object",
          properties: {
            customerId: { type: "string" },
            status: { type: "string", enum: ["lead", "prospect", "customer", "churned"] },
          },
          required: ["customerId", "status"],
        },
      },
      {
        name: "create_support_ticket",
        description: "Create a support ticket for a customer",
        inputSchema: {
          type: "object",
          properties: {
            customerId: { type: "string" },
            subject: { type: "string" },
            description: { type: "string" },
            priority: { type: "string", enum: ["low", "medium", "high", "urgent"] },
          },
          required: ["customerId", "subject", "description"],
        },
      },
      {
        name: "update_ticket_status",
        description: "Update the status of a support ticket",
        inputSchema: {
          type: "object",
          properties: {
            ticketId: { type: "string" },
            status: { type: "string", enum: ["open", "in_progress", "resolved", "closed"] },
          },
          required: ["ticketId", "status"],
        },
      },
      {
        name: "add_note",
        description: "Add a note to a customer profile",
        inputSchema: {
          type: "object",
          properties: {
            customerId: { type: "string" },
            content: { type: "string" },
          },
          required: ["customerId", "content"],
        },
      },
      {
        name: "create_opportunity",
        description: "Create a new sales opportunity for a customer",
        inputSchema: {
          type: "object",
          properties: {
            customerId: { type: "string" },
            title: { type: "string" },
            value: { type: "number" },
            stage: { type: "string", enum: ["discovery", "proposal", "negotiation", "closed_won", "closed_lost"] },
          },
          required: ["customerId", "title", "value", "stage"],
        },
      },
      {
        name: "search_customers",
        description: "Search for customers by name, email or company",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string" },
          },
          required: ["query"],
        },
      },
      {
        name: "list_customers",
        description: "List all customers",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "register_customer": {
        const customer = CustomerSchema.omit({ id: true, createdAt: true, updatedAt: true }).parse(args);
        const id = dbOps.createCustomer(customer);
        return {
          content: [{ type: "text", text: `Customer registered successfully with ID: ${id}` }],
        };
      }
      case "upload_document": {
        const doc = DocumentSchema.omit({ id: true, uploadedAt: true }).parse(args);
        const id = dbOps.addDocument(doc);
        return {
          content: [{ type: "text", text: `Document uploaded successfully with ID: ${id}` }],
        };
      }
      case "update_customer_status": {
        const { customerId, status } = z.object({ customerId: z.string(), status: z.string() }).parse(args);
        dbOps.updateCustomerStatus(customerId, status);
        return {
          content: [{ type: "text", text: `Customer status updated to ${status}` }],
        };
      }
      case "create_support_ticket": {
        const ticket = SupportTicketSchema.omit({ id: true, createdAt: true, updatedAt: true, status: true }).parse(args);
        const id = dbOps.createTicket({ ...ticket, status: "open" });
        return {
          content: [{ type: "text", text: `Support ticket created successfully with ID: ${id}` }],
        };
      }
      case "update_ticket_status": {
        const { ticketId, status } = z.object({ ticketId: z.string(), status: z.string() }).parse(args);
        dbOps.updateTicketStatus(ticketId, status);
        return {
          content: [{ type: "text", text: `Ticket status updated to ${status}` }],
        };
      }
      case "add_note": {
        const note = NoteSchema.omit({ id: true, createdAt: true }).parse(args);
        const id = dbOps.addNote(note);
        return {
          content: [{ type: "text", text: `Note added successfully with ID: ${id}` }],
        };
      }
      case "create_opportunity": {
        const opp = OpportunitySchema.omit({ id: true, createdAt: true, updatedAt: true }).parse(args);
        const id = dbOps.createOpportunity(opp);
        return {
          content: [{ type: "text", text: `Opportunity created successfully with ID: ${id}` }],
        };
      }
      case "search_customers": {
        const { query } = z.object({ query: z.string() }).parse(args);
        const customers = dbOps.searchCustomers(query);
        return {
          content: [{ type: "text", text: JSON.stringify(customers, null, 2) }],
        };
      }
      case "list_customers": {
        const customers = dbOps.listCustomers();
        return {
          content: [{ type: "text", text: JSON.stringify(customers, null, 2) }],
        };
      }
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [{ type: "text", text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Agentic CRM MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
