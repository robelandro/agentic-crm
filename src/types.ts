import { z } from "zod";

export const CustomerSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  status: z.enum(["lead", "prospect", "customer", "churned"]).default("lead"),
  company: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Customer = z.infer<typeof CustomerSchema>;

export const DocumentSchema = z.object({
  id: z.string().uuid().optional(),
  customerId: z.string().uuid(),
  type: z.string(),
  url: z.string().url(),
  name: z.string(),
  uploadedAt: z.string().optional(),
});

export type Document = z.infer<typeof DocumentSchema>;

export const SupportTicketSchema = z.object({
  id: z.string().uuid().optional(),
  customerId: z.string().uuid(),
  subject: z.string().min(1),
  description: z.string(),
  status: z.enum(["open", "in_progress", "resolved", "closed"]).default("open"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type SupportTicket = z.infer<typeof SupportTicketSchema>;

export const NoteSchema = z.object({
  id: z.string().uuid().optional(),
  customerId: z.string().uuid(),
  content: z.string(),
  createdAt: z.string().optional(),
});

export type Note = z.infer<typeof NoteSchema>;

export const OpportunitySchema = z.object({
  id: z.string().uuid().optional(),
  customerId: z.string().uuid(),
  title: z.string(),
  value: z.number().nonnegative(),
  stage: z.enum(["discovery", "proposal", "negotiation", "closed_won", "closed_lost"]),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Opportunity = z.infer<typeof OpportunitySchema>;
