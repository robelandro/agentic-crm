import { Database } from "bun:sqlite";
import { v4 as uuidv4 } from "uuid";
import type { Customer, Document, SupportTicket, Note, Opportunity } from "./types";

const db = new Database("data/crm.sqlite");

// Initialize tables
db.run(`
  CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    status TEXT DEFAULT 'lead',
    company TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    type TEXT NOT NULL,
    url TEXT NOT NULL,
    name TEXT NOT NULL,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS support_tickets (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'open',
    priority TEXT DEFAULT 'medium',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS opportunities (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    title TEXT NOT NULL,
    value REAL NOT NULL,
    stage TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
  )
`);

export const dbOps = {
  // Customer Operations
  createCustomer: (customer: Omit<Customer, "id" | "createdAt" | "updatedAt">) => {
    const id = uuidv4();
    db.run(
      "INSERT INTO customers (id, name, email, phone, status, company) VALUES (?, ?, ?, ?, ?, ?)",
      [id, customer.name, customer.email, customer.phone ?? null, customer.status ?? 'lead', customer.company ?? null]
    );
    return id;
  },

  getCustomer: (id: string): Customer | null => {
    const row = db.query("SELECT * FROM customers WHERE id = ?").get(id) as any;
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      status: row.status,
      company: row.company,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },

  listCustomers: (): Customer[] => {
    const rows = db.query("SELECT * FROM customers ORDER BY created_at DESC").all() as any[];
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      status: row.status,
      company: row.company,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  },

  updateCustomerStatus: (id: string, status: string) => {
    db.run("UPDATE customers SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [status, id]);
  },

  searchCustomers: (query: string): Customer[] => {
    const rows = db.query("SELECT * FROM customers WHERE name LIKE ? OR email LIKE ? OR company LIKE ?").all(`%${query}%`, `%${query}%`, `%${query}%`) as any[];
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      status: row.status,
      company: row.company,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  },

  // Document Operations
  addDocument: (doc: Omit<Document, "id" | "uploadedAt">) => {
    const id = uuidv4();
    db.run(
      "INSERT INTO documents (id, customer_id, type, url, name) VALUES (?, ?, ?, ?, ?)",
      [id, doc.customerId, doc.type, doc.url, doc.name]
    );
    return id;
  },

  getDocuments: (customerId: string): Document[] => {
    const rows = db.query("SELECT * FROM documents WHERE customer_id = ?").all(customerId) as any[];
    return rows.map(row => ({
      id: row.id,
      customerId: row.customer_id,
      type: row.type,
      url: row.url,
      name: row.name,
      uploadedAt: row.uploaded_at,
    }));
  },

  // Support Ticket Operations
  createTicket: (ticket: Omit<SupportTicket, "id" | "createdAt" | "updatedAt">) => {
    const id = uuidv4();
    db.run(
      "INSERT INTO support_tickets (id, customer_id, subject, description, status, priority) VALUES (?, ?, ?, ?, ?, ?)",
      [id, ticket.customerId, ticket.subject, ticket.description, ticket.status ?? 'open', ticket.priority ?? 'medium']
    );
    return id;
  },

  getTickets: (customerId: string): SupportTicket[] => {
    const rows = db.query("SELECT * FROM support_tickets WHERE customer_id = ?").all(customerId) as any[];
    return rows.map(row => ({
      id: row.id,
      customerId: row.customer_id,
      subject: row.subject,
      description: row.description,
      status: row.status,
      priority: row.priority,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  },

  updateTicketStatus: (id: string, status: string) => {
    db.run("UPDATE support_tickets SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [status, id]);
  },

  // Note Operations
  addNote: (note: Omit<Note, "id" | "createdAt">) => {
    const id = uuidv4();
    db.run("INSERT INTO notes (id, customer_id, content) VALUES (?, ?, ?)", [id, note.customerId, note.content]);
    return id;
  },

  getNotes: (customerId: string): Note[] => {
    const rows = db.query("SELECT * FROM notes WHERE customer_id = ? ORDER BY created_at DESC").all(customerId) as any[];
    return rows.map(row => ({
      id: row.id,
      customerId: row.customer_id,
      content: row.content,
      createdAt: row.created_at,
    }));
  },

  // Opportunity Operations
  createOpportunity: (opp: Omit<Opportunity, "id" | "createdAt" | "updatedAt">) => {
    const id = uuidv4();
    db.run(
      "INSERT INTO opportunities (id, customer_id, title, value, stage) VALUES (?, ?, ?, ?, ?)",
      [id, opp.customerId, opp.title, opp.value, opp.stage]
    );
    return id;
  },

  getOpportunities: (customerId: string): Opportunity[] => {
    const rows = db.query("SELECT * FROM opportunities WHERE customer_id = ?").all(customerId) as any[];
    return rows.map(row => ({
      id: row.id,
      customerId: row.customer_id,
      title: row.title,
      value: row.value,
      stage: row.stage,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  },

  updateOpportunityStage: (id: string, stage: string) => {
    db.run("UPDATE opportunities SET stage = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [stage, id]);
  },
};
