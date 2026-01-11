import { supabase } from "@/src/lib/db";
import { NextResponse } from "next/server";
import { authenticateRequest } from "@/src/lib/auth-middleware";


export async function GET(req: Request) {
  const auth = authenticateRequest(req as any);
  if (auth.error) return auth.error;

  try {
    const { data, error } = await supabase
      .from('playing_with_neon')
      .select('*');

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, time: data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "DB connection failed" },
      { status: 500 }
    );
  }
}
