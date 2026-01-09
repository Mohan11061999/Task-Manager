import { sql } from "@/src/lib/db";
import { NextResponse } from "next/server";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(req: Request, context: Context) {
  try {
    const { id } = await context.params; // ✅ IMPORTANT FIX
    const taskId = Number(id);

    if (!Number.isInteger(taskId)) {
      return NextResponse.json(
        { error: "Invalid task id" },
        { status: 400 }
      );
    }

    const { status } = await req.json();

    if (!status) {
      return NextResponse.json(
        { error: "status is required" },
        { status: 400 }
      );
    }

    const result = await sql`
      UPDATE task
      SET status = ${status}
      WHERE id = ${taskId}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, context: Context) {
  try {
    const { id } = await context.params; // ✅ IMPORTANT FIX
    const taskId = Number(id);

    if (!Number.isInteger(taskId)) {
      return NextResponse.json(
        { error: "Invalid task id" },
        { status: 400 }
      );
    }

    const result = await sql`
        DELETE FROM task
        WHERE id = ${taskId}
        RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
