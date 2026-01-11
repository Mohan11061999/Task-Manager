import { supabase } from "@/src/lib/db";
import { NextResponse } from "next/server";
import { authenticateRequest } from "@/src/lib/auth-middleware";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(req: Request, context: Context) {
  const auth = authenticateRequest(req as any);
  if (auth.error) return auth.error;

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

    const { data, error } = await supabase
      .from('task')
      .update({ status })
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, context: Context) {
  const auth = authenticateRequest(req as any);
  if (auth.error) return auth.error;

  try {
    const { id } = await context.params; // ✅ IMPORTANT FIX
    const taskId = Number(id);

    if (!Number.isInteger(taskId)) {
      return NextResponse.json(
        { error: "Invalid task id" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('task')
      .delete()
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
