// Shared API types for Hookline. Frontend and backend both build against this file.
// Change it only through a pull request that both sides review.

export type GenerationMode = "upwork" | "cover_letter" | "cold_email";
export type Plan = "free" | "pro";
export type Tone = "professional" | "friendly" | "confident" | "concise";

export const FREE_DAILY_LIMIT = 3;
export const MAX_INPUT_CHARS = 15_000;

// ---- Profile: GET /api/profile, PUT /api/profile ----
export interface Profile {
  fullName: string;
  headline: string;
  skills: string[];
  yearsExperience: number | null;
  portfolioLinks: string[];
  bio: string;
  tone: Tone;
}

// ---- Generate: POST /api/generate ----
// Response body is streamed plain text (Content-Type: text/plain).
// Response headers: X-Generation-Id, X-Usage-Remaining
export interface GenerateRequest {
  mode: GenerationMode;
  inputText: string; // the pasted job post or company info, max MAX_INPUT_CHARS
  extras?: {
    clientName?: string;
    companyName?: string;
    targetLength?: "short" | "medium" | "long";
    instructions?: string; // e.g. "make it more formal"
  };
  regenerateOf?: string; // id of the generation being regenerated
}

// ---- History: GET /api/history?mode=&cursor=, GET /api/history/:id, DELETE /api/history/:id ----
export interface GenerationSummary {
  id: string;
  mode: GenerationMode;
  preview: string; // first ~120 characters of the output
  createdAt: string; // ISO date
}

export interface Generation extends GenerationSummary {
  inputText: string;
  extras: GenerateRequest["extras"] | null;
  outputText: string;
}

export interface HistoryResponse {
  items: GenerationSummary[];
  nextCursor: string | null;
}

// ---- Usage: GET /api/usage ----
export interface UsageResponse {
  plan: Plan;
  usedToday: number;
  dailyLimit: number; // FREE_DAILY_LIMIT for free users
  remaining: number;
  resetsAt: string; // ISO date, next midnight UTC
}

// ---- Errors: every endpoint returns this shape on failure ----
export type ApiErrorCode =
  | "unauthorized"
  | "quota_exceeded"
  | "invalid_input"
  | "generation_failed"
  | "not_found";

export interface ApiError {
  error: { code: ApiErrorCode; message: string };
}