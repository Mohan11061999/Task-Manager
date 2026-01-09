import { sql } from "@/src/lib/db";
import { NextResponse } from "next/server";


export async function GET() {
  try {
    const result = await sql`SELECT * FROM playing_with_neon`;
    return NextResponse.json({ success: true, time: result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "DB connection failed" },
      { status: 500 }
    );
  }
}
