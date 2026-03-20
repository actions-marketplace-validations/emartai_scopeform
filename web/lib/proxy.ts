import { cookies } from "next/headers";

const RAILWAY_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function proxyFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const cookieStore = await cookies();
  const token = cookieStore.get("sf_token")?.value;

  return fetch(`${RAILWAY_URL}/api/v1${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(typeof init.headers === "object" ? init.headers : {})
    },
    cache: "no-store"
  });
}
