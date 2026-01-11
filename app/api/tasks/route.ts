import { authenticateRequest } from "@/src/lib/auth-middleware";
import { supabase } from "@/src/lib/db";
import { NextRequest, NextResponse } from "next/server";


/**
 * CREATE TASK
 * POST /api/tasks
 */
export async function POST(req: Request) {
  const auth = authenticateRequest(req as NextRequest);
  if (auth.error) return auth.error;

  try {
    const { task_desc } = await req.json();

    if (!task_desc) {
      return NextResponse.json(
        { error: "task_desc is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('task')
      .insert({ task_desc })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}

/**
 * LIST TASKS (Pagination)
 * GET /api/tasks?page=1&limit=5
 */
export async function GET(req: Request) {
  const auth = authenticateRequest(req as NextRequest);
  if (auth.error) return auth.error;

  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") ?? 1);
    const limit = Number(searchParams.get("limit") ?? 5);
    const offset = (page - 1) * limit;

    const { data: tasks, error: tasksError } = await supabase
      .from('task')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (tasksError) {
      throw tasksError;
    }

    const { count, error: countError } = await supabase
      .from('task')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      throw countError;
    }

    return NextResponse.json({
      data: tasks,
      total: count,
      page,
      limit,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}
