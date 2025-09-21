export interface VerifiedUser {
  uid: string;
  email?: string;
  name?: string;
  picture?: string;
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export async function verifyToken(idToken: string): Promise<VerifiedUser> {
  const res = await fetch(`${BASE_URL}/verify-token`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Token verification failed: ${msg || res.statusText}`);
  }
  return res.json();
}

// ---------------- Opportunities API ----------------
export type OpportunityType = "Internship" | "Job" | "Competition" | "Scholarship" | "Fellowship" | "Hackathon" | "Other";

export interface OpportunityDoc {
  id: string;
  title: string;
  company?: string | null;
  type: OpportunityType;
  education_level?: string[];
  domain?: string[];
  skills_required?: string[];
  location?: string;
  country?: string | null;
  description?: string;
  full_description?: string;
  deadline?: string | null; // ISO date string
  apply_link?: string;
  source?: string;
  tags?: string[];
  posted_at?: string | null;
  fetched_at?: string | null;
}

export interface OpportunitySearchRequest {
  q?: string;
  type?: "Internship" | "Job" | "Competition" | "All";
  education_level?: "School" | "College" | "Graduate" | "Auto";
  domain?: string | "All";
  location?: string | "All";
  deadline_before?: string; // YYYY-MM-DD
  sort?: "relevance" | "deadline_soon" | "newest";
  page?: number;
  page_size?: number;
  source?: string; // e.g. 'unstop'
}

export interface OpportunitySearchResponse {
  total: number; // -1 when approximate
  page: number;
  page_size: number;
  items: OpportunityDoc[];
  partial: boolean;
  cached: boolean;
}

export async function searchOpportunities(idToken: string, req: OpportunitySearchRequest): Promise<OpportunitySearchResponse> {
  const res = await fetch(`${BASE_URL}/api/opportunities/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Search failed: ${msg || res.statusText}`);
  }
  return res.json();
}

export async function getOpportunityById(idToken: string, id: string): Promise<OpportunityDoc> {
  const res = await fetch(`${BASE_URL}/api/opportunities/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Fetch opportunity failed: ${msg || res.statusText}`);
  }
  return res.json();
}

export async function saveOpportunity(idToken: string, uid: string, opportunityId: string): Promise<{ success: boolean }>{
  const res = await fetch(`${BASE_URL}/api/users/${encodeURIComponent(uid)}/saved_opportunities`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ opportunityId }),
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Save failed: ${msg || res.statusText}`);
  }
  return res.json();
}

export async function getRecommended(idToken: string, uid: string): Promise<{ success: boolean; items: OpportunityDoc[] }>{
  const res = await fetch(`${BASE_URL}/api/users/${encodeURIComponent(uid)}/recommended`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Recommendations failed: ${msg || res.statusText}`);
  }
  return res.json();
}

export interface CounsellingRequest {
  user_message: string;
  session_id?: string;
  conversation_history?: Array<{
    sender: "user" | "mentor";
    content: string;
    timestamp: Date;
  }>;
  user_profile?: {
    name?: string;
    age?: string;
    education_level?: string;
    stream_of_interest?: string;
  };
}

export interface CounsellingResponse {
  success: boolean;
  text?: string; // preferred, ready-to-display
  answer: string;
  follow_up_question: string;
  raw?: any;
}

export async function getCounsellingResponse(
  idToken: string,
  request: CounsellingRequest
): Promise<CounsellingResponse> {
  const res = await fetch(`${BASE_URL}/counselling`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(request),
  });
  
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Counselling request failed: ${msg || res.statusText}`);
  }
  
  return res.json();
}
