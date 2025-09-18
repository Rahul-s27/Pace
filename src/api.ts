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
