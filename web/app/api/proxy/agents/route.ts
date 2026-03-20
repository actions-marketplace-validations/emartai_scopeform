import { NextResponse } from "next/server";

import { proxyFetch } from "@/lib/proxy";

export async function GET() {
  const res = await proxyFetch("/agents");
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
