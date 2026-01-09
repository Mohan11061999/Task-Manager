import { sql } from "@/src/lib/db";
import { NextResponse } from "next/server";

/**
 * CREATE TASK
 * POST /api/tasks
 */
export async function POST(req: Request) {
  try {
    const { task_desc } = await req.json();

    if (!task_desc) {
      return NextResponse.json(
        { error: "task_desc is required" },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO task (task_desc)
      VALUES (${task_desc})
      RETURNING *
    `;

    return NextResponse.json(result[0], { status: 201 });
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
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") ?? 1);
    const limit = Number(searchParams.get("limit") ?? 5);
    const offset = (page - 1) * limit;

    const tasks = await sql`
      SELECT *
      FROM task
      ORDER BY created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    const totalResult = await sql`
      SELECT COUNT(*) FROM task
    `;

    return NextResponse.json({
      data: tasks,
      total: Number(totalResult[0].count),
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
