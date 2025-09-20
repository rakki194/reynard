/**
 * API Types
 *
 * Type definitions for the NLWeb API.
 */

export interface NLWebAPIRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: unknown;
  query?: Record<string, string>;
}

export interface NLWebAPIResponse {
  status: number;
  headers: Record<string, string>;
  body: unknown;
}

export interface NLWebAPIHandler {
  (req: NLWebAPIRequest): Promise<NLWebAPIResponse>;
}
