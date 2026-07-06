import { describe, expect, it, beforeAll } from "bun:test";
import { dbOps } from "./db";
import fs from "node:fs";

describe("CRM DB Operations", () => {
  beforeAll(() => {
    if (fs.existsSync("data/crm.sqlite")) {
      // Use a test database if needed, but for now we just clean up or use the default
    }
  });

  it("should register a new customer", () => {
    const customerId = dbOps.createCustomer({
      name: "John Doe",
      email: "john@example.com",
      phone: "123456789",
      status: "lead",
      company: "Acme Corp",
    });
    expect(customerId).toBeDefined();

    const customer = dbOps.getCustomer(customerId);
    expect(customer?.name).toBe("John Doe");
    expect(customer?.email).toBe("john@example.com");
  });

  it("should add a note to a customer", () => {
    const customers = dbOps.listCustomers();
    const customerId = customers[0].id!;

    const noteId = dbOps.addNote({
      customerId,
      content: "This is a test note",
    });
    expect(noteId).toBeDefined();

    const notes = dbOps.getNotes(customerId);
    expect(notes.length).toBeGreaterThan(0);
    expect(notes[0].content).toBe("This is a test note");
  });

  it("should create a support ticket", () => {
    const customers = dbOps.listCustomers();
    const customerId = customers[0].id!;

    const ticketId = dbOps.createTicket({
      customerId,
      subject: "Issue with login",
      description: "Cannot login to the portal",
      priority: "high",
      status: "open"
    });
    expect(ticketId).toBeDefined();

    const tickets = dbOps.getTickets(customerId);
    expect(tickets.some(t => t.id === ticketId)).toBe(true);
  });

  it("should search for customers", () => {
    const results = dbOps.searchCustomers("Acme");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].company).toBe("Acme Corp");
  });
});
