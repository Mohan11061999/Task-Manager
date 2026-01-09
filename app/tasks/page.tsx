"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

/* ---------------- TYPES ---------------- */

type TaskStatus = "pending" | "in_progress" | "done";

type Task = {
  id: number;
  task_desc: string;
  status: TaskStatus;
  created_at: string;
};

type ApiResponse = {
  data: Task[];
  total: number;
  page: number;
  limit: number;
};

/* ---------------- DEBOUNCE HOOK ---------------- */

function useDebounce<T>(value: T, delay = 400): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

/* ---------------- COMPONENT ---------------- */

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskDesc, setTaskDesc] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const limit = 5;
  const [total, setTotal] = useState(0);

  const debouncedSearch = useDebounce(search);

  /* ---------------- FETCH TASKS ---------------- */

  const fetchTasks = async (signal?: AbortSignal) => {
    try {
      const res = await fetch(
        `/api/tasks?page=${page}&limit=${limit}`,
        { cache: "no-store", signal }
      );

      if (!res.ok) throw new Error();

      const json: ApiResponse = await res.json();
      setTasks(json.data);
      setTotal(json.total);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        toast.error("Failed to load tasks");
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchTasks(controller.signal);
    return () => controller.abort();
  }, [page]);

  /* ---------------- FILTER ---------------- */

  const filteredTasks = useMemo(() => {
    if (!debouncedSearch.trim()) return tasks;

    return tasks.filter((task) =>
      task.task_desc.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [tasks, debouncedSearch]);

  /* ---------------- CREATE ---------------- */

  const createTask = async () => {
    if (!taskDesc.trim()) {
      toast.warn("Task description cannot be empty");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task_desc: taskDesc.trim() }),
      });

      if (!res.ok) throw new Error();

      setTaskDesc("");
      toast.success("Task created");
      setPage(1);
      fetchTasks();
    } catch {
      toast.error("Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UPDATE ---------------- */

  const updateStatus = async (id: number, status: TaskStatus) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error();

      toast.info("Status updated");
      fetchTasks();
    } catch {
      toast.error("Failed to update status");
    }
  };

  /* ---------------- DELETE ---------------- */

  const deleteTask = async (id: number) => {
    if (!confirm("Delete this task?")) return;

    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();

      toast.error("Task deleted");
      fetchTasks();
    } catch {
      toast.error("Failed to delete task");
    }
  };

  const totalPages = Math.ceil(total / limit);

  /* ---------------- UI ---------------- */

  return (
    <main style={styles.container}>
      <h1>📝 Task Manager</h1>

      {/* CREATE */}
      <div style={styles.createBox}>
        <input
          placeholder="New task"
          value={taskDesc}
          onChange={(e) => setTaskDesc(e.target.value)}
          style={styles.input}
        />
        <button onClick={createTask} disabled={loading} style={styles.button}>
          {loading ? "Adding..." : "Add"}
        </button>
      </div>

      {/* SEARCH */}
      <input
        placeholder="Search tasks..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={styles.search}
      />

      {/* EMPTY STATE */}
      {filteredTasks.length === 0 && (
        <div style={styles.empty}>🚫 No tasks available</div>
      )}

      {/* LIST */}
      <ul style={styles.list}>
        {filteredTasks.map((task) => (
          <li key={task.id} style={styles.listItem}>
            <div>
              <strong>{task.task_desc}</strong>
              <div style={styles.meta}>
                Status: {task.status}
                <br />
                Created: {new Date(task.created_at).toLocaleString()}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <select
                value={task.status}
                onChange={(e) =>
                  updateStatus(task.id, e.target.value as TaskStatus)
                }
                style={styles.select}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>

              <button
                onClick={() => deleteTask(task.id)}
                style={styles.deleteButton}
              >
                ❌
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div style={styles.pagination}>
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ◀ Prev
          </button>

          <span>
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next ▶
          </button>
        </div>
      )}
    </main>
  );
}

/* ---------------- STYLES ---------------- */

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 600,
    margin: "40px auto",
    padding: 20,
    fontFamily: "sans-serif",
  },
  createBox: {
    display: "flex",
    gap: 10,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    padding: "8px 4px",
    border: "none",
    borderBottom: "2px solid #1976d2",
    outline: "none",
    fontSize: 16,
  },
  search: {
    width: "100%",
    padding: "8px 4px",
    border: "none",
    borderBottom: "1px solid #aaa",
    outline: "none",
    marginBottom: 16,
  },
  button: {
    padding: "8px 16px",
    cursor: "pointer",
  },
  list: {
    listStyle: "none",
    padding: 0,
  },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: 12,
    border: "1px solid #ddd",
    borderRadius: 6,
    marginBottom: 10,
  },
  meta: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  select: {
    padding: 6,
  },
  deleteButton: {
    padding: "6px 10px",
    border: "1px solid #f44336",
    background: "#ffecec",
    color: "#d32f2f",
    borderRadius: 4,
    cursor: "pointer",
  },
  empty: {
    textAlign: "center",
    padding: 20,
    color: "#999",
    fontStyle: "italic",
  },
  pagination: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
};
