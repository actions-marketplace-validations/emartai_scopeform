import { proxyFetch } from "@/lib/proxy";
import type { NextRequest } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ service: string }> }) {
  const { service } = await params;
  const body = await req.text();
  const res = await proxyFetch(`/integrations/${service}`, { method: "PUT", body });
  const data = await res.json();
  return Response.json(data, { status: res.status });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ service: string }> }) {
  const { service } = await params;
  const res = await proxyFetch(`/integrations/${service}`, { method: "DELETE" });
  if (res.status === 204) return new Response(null, { status: 204 });
  const data = await res.json();
  return Response.json(data, { status: res.status });
}
