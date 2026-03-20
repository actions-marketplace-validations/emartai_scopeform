import { proxyFetch } from "@/lib/proxy";
import type { NextRequest } from "next/server";

export async function GET() {
  const res = await proxyFetch("/integrations");
  const data = await res.json();
  return Response.json(data, { status: res.status });
}

export async function PUT(req: NextRequest) {
  const body = await req.text();
  const res = await proxyFetch("/integrations", { method: "PUT", body });
  const data = await res.json();
  return Response.json(data, { status: res.status });
}
