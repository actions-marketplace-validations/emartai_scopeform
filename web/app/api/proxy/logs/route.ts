import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { proxyFetch } from "@/lib/proxy";

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.toString();
  const suffix = search ? `?${search}` : "";
  const res = await proxyFetch(`/logs${suffix}`);
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
