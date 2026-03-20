import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { proxyFetch } from "@/lib/proxy";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await proxyFetch(`/agents/${id}`);
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
