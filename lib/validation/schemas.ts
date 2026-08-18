import { z } from "zod";

export const membershipApplicationSchema = z.object({
  motivationText: z
    .string()
    .min(20, "Tell us a bit more — at least 20 characters.")
    .max(2000),
});

export const projectSubmissionSchema = z.object({
  title: z.string().min(3).max(120),
  summary: z.string().min(20).max(500),
  problemStatement: z.string().min(20).max(2000),
  materials: z.array(z.string()).default([]),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
  circuitDiagramUrl: z.string().url().optional().or(z.literal("")),
  codeRepoUrl: z.string().url().optional().or(z.literal("")),
  demoVideoUrl: z.string().url().optional().or(z.literal("")),
});

export const communityPostSchema = z.object({
  title: z.string().min(5).max(150),
  body: z.string().min(10).max(5000),
});

export const communityReplySchema = z.object({
  body: z.string().min(1).max(3000),
});

export const contactMessageSchema = z.object({
  fullName: z.string().min(2, "Enter your full name.").max(120),
  email: z.string().email("Enter a valid email address."),
  message: z.string().min(10, "Say a bit more — at least 10 characters.").max(2000),
});

export const profileUpdateSchema = z.object({
  fullName: z.string().min(2).max(120),
  bio: z.string().max(500).optional(),
  yearGroup: z.string().max(20).optional(),
});
