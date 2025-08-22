import { NextResponse } from "next/server";
import { getCmeData } from "@/lib/cme-data-processor";

export async function GET() {
  const data = await getCmeData();
  return NextResponse.json(data);
}