
"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../../services/task.service";
import type { Task, TaskStatus } from "../../types/task.types";

const STATUS_OPTIONS: TaskStatus[] = [
  "TODO",
  "IN_PROGRESS",
  "COMPLETED",
];

const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
};

export default function DashboardPage() {
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [userName, setUserName] = useState("User");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | TaskStatus>("ALL");

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [formStatus, setFormStatus] = useState<TaskStatus>("TODO");

  useEffect(() => {
    const savedToken = sessionStorage.getItem("taskflow_access_token");
    const savedUser = sessionStorage.getItem("taskflow_user");

    if (!savedToken) {
      router.replace("/");
      return;
    }

    setToken(savedToken);

    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setUserName(user.name || user.email || "User");
      } catch {
        setUserName("User");
      }
    }
  }, [router]);

  useEffect(() => {
  if (!message) return;

  const timer = setTimeout(() => {
    setMessage("");
  }, 3000);

  return () => clearTimeout(timer);
}, [message]);

  const loadTasks = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError("");

    try {
      const result = await getTasks(token, {
        page: 1,
        limit: 100,
        search: search.trim() || undefined,
        status: statusFilter === "ALL" ? undefined : statusFilter,
      });

      setTasks(Array.isArray(result.tasks) ? result.tasks : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load tasks."
      );
    } finally {
      setLoading(false);
    }
  }, [token, search, statusFilter]);

  useEffect(() => {
    if (token) {
      void loadTasks();
    }
  }, [token, loadTasks]);

  function resetForm() {
    setTitle("");
    setDescription("");
    setFormStatus("TODO");
    setEditingTask(null);
    setShowForm(false);
  }

  function openCreateForm() {
    setError("");
    setMessage("");
    setEditingTask(null);
    setTitle("");
    setDescription("");
    setFormStatus("TODO");
    setShowForm(true);
  }

  function openEditForm(task: Task) {
    setError("");
    setMessage("");
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || "");
    setFormStatus(task.status);
    setShowForm(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      setError("Please enter a task title.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      if (editingTask) {
        const taskId = editingTask._id || editingTask.id;

        if (!taskId) {
          throw new Error("This task does not have a valid ID.");
        }

        await updateTask(token, taskId, {
          title: title.trim(),
          description: description.trim(),
          status: formStatus,
        });

        setMessage("Task updated successfully.");
      } else {
        await createTask(token, {
          title: title.trim(),
          description: description.trim(),
          status: formStatus,
        });

        setMessage("Task created successfully.");
      }

      resetForm();
      await loadTasks();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not save task."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(task: Task, status: TaskStatus) {
    const taskId = task._id || task.id;

    if (!taskId) {
      setError("This task does not have a valid ID.");
      return;
    }

    setError("");
    setMessage("");

    try {
      await updateTask(token, taskId, { status });
      setMessage("Task status updated.");
      await loadTasks();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not update task."
      );
    }
  }

  async function handleDelete(task: Task) {
    const taskId = task._id || task.id;

    if (!taskId) {
      setError("This task does not have a valid ID.");
      return;
    }

    if (!window.confirm(`Delete "${task.title}"? This cannot be undone.`)) {
      return;
    }

    setError("");
    setMessage("");

    try {
      await deleteTask(token, taskId);
      setMessage("Task deleted successfully.");
      await loadTasks();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not delete task."
      );
    }
  }

  function handleLogout() {
    sessionStorage.removeItem("taskflow_access_token");
    sessionStorage.removeItem("taskflow_user");
    router.replace("/");
  }

  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter((task) => task.status === "TODO").length;
  const inProgressTasks = tasks.filter(
    (task) => task.status === "IN_PROGRESS"
  ).length;
  const completedTasks = tasks.filter(
    (task) => task.status === "COMPLETED"
  ).length;

  return (
    <main className="min-h-screen bg-slate-950 text-white md:flex">
      <aside className="flex w-full flex-col border-b border-slate-800 bg-slate-900 p-5 md:min-h-screen md:w-64 md:border-b-0 md:border-r">
        <h1 className="text-2xl font-bold text-blue-400">Taskflow</h1>
        <p className="mt-1 text-sm text-slate-400">
          Your personal task manager
        </p>

        <nav className="mt-8 flex gap-2 md:flex-col">
          <a
            href="#overview"
            className="rounded-lg bg-blue-600 px-4 py-3 font-medium"
          >
            Dashboard
          </a>
          <a
            href="#tasks"
            className="rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800"
          >
            My Tasks
          </a>
          <a
            href="#profile"
            className="rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800"
          >
            Profile
          </a>
        </nav>

        <button
          onClick={handleLogout}
          className="mt-6 rounded-lg border border-red-500/40 px-4 py-3 text-left text-red-400 hover:bg-red-500/10 md:mt-auto"
        >
          Logout
        </button>
      </aside>

      <section className="min-w-0 flex-1 p-5 md:p-10">
        <header
          id="overview"
          className="mb-8 flex flex-wrap items-center justify-between gap-4"
        >
          <div>
            <p className="text-sm text-slate-400">Your workspace</p>
            <h2 className="mt-1 text-3xl font-bold">
              Welcome, {userName}!
            </h2>
            <p className="mt-2 text-slate-400">
              Keep track of your work and progress.
            </p>
          </div>

          <button
            onClick={openCreateForm}
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500"
          >
            + Create Task
          </button>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300"
          >
            {error}
          </div>
        )}

        {message && (
          <div
            role="status"
            className="mb-5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300"
          >
            {message}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Tasks Found",
              value: totalTasks,
              color: "text-blue-400",
            },
            {
              label: "To Do",
              value: pendingTasks,
              color: "text-amber-400",
            },
            {
              label: "In Progress",
              value: inProgressTasks,
              color: "text-purple-400",
            },
            {
              label: "Completed",
              value: completedTasks,
              color: "text-emerald-400",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
            >
              <p className="text-sm text-slate-400">{item.label}</p>
              <p className={`mt-4 text-3xl font-bold ${item.color}`}>
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <section
          id="tasks"
          className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-5 md:p-7"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold">My Tasks</h3>
              <p className="mt-1 text-sm text-slate-400">
                Create, update, and manage your tasks.
              </p>
            </div>

            <button
              onClick={() => void loadTasks()}
              disabled={loading}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800 disabled:opacity-50"
            >
              Refresh
            </button>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-[1fr_200px]">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search tasks..."
              aria-label="Search tasks"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
            />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as "ALL" | TaskStatus)
              }
              aria-label="Filter tasks by status"
              className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="ALL">All statuses</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400">
              Loading tasks...
            </div>
          ) : tasks.length === 0 ? (
            <div className="mt-5 rounded-xl border border-dashed border-slate-700 px-5 py-12 text-center">
              <h4 className="font-semibold">No tasks found</h4>
              <p className="mt-2 text-sm text-slate-400">
                Create a task or change your search and filters.
              </p>
              <button
                onClick={openCreateForm}
                className="mt-5 rounded-lg bg-blue-600 px-4 py-2 font-medium hover:bg-blue-500"
              >
                Create your first task
              </button>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {tasks.map((task) => (
                <article
                  key={task._id || task.id || task.title}
                  className="rounded-xl border border-slate-800 bg-slate-950 p-4 md:p-5"
                >
                  <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                    <div className="min-w-0 flex-1">
                      <h4 className="break-words font-semibold">
                        {task.title}
                      </h4>
                      <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-400">
                        {task.description || "No description provided."}
                      </p>
                      {task.createdAt && (
                        <p className="mt-2 text-xs text-slate-500">
                          Created{" "}
                          {new Date(task.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={task.status}
                        onChange={(event) =>
                          void handleStatusChange(
                            task,
                            event.target.value as TaskStatus
                          )
                        }
                        aria-label={`Status for ${task.title}`}
                        className="max-w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {STATUS_LABELS[status]}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => openEditForm(task)}
                        className="rounded-lg border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => void handleDelete(task)}
                        className="rounded-lg border border-red-500/30 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section
          id="profile"
          className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6"
        >
          <h3 className="text-lg font-semibold">Profile</h3>
          <p className="mt-2 text-sm text-slate-400">
            Signed in as {userName}
          </p>
        </section>
      </section>

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              resetForm();
            }
          }}
        >
          <form
            onSubmit={handleSubmit}
            className="my-auto w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-center justify-between gap-4">
              <h3 className="text-xl font-bold">
                {editingTask ? "Edit Task" : "Create Task"}
              </h3>
              <button
                type="button"
                onClick={resetForm}
                disabled={saving}
                aria-label="Close form"
                className="rounded-lg px-3 py-2 text-slate-400 hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <label className="mb-2 block text-sm text-slate-300">
              Task title
            </label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={150}
              required
              placeholder="e.g. Complete project documentation"
              className="mb-5 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
            />

            <label className="mb-2 block text-sm text-slate-300">
              Description
            </label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              placeholder="Add task details..."
              className="mb-5 w-full resize-y rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
            />

            <label className="mb-2 block text-sm text-slate-300">
              Status
            </label>
            <select
              value={formStatus}
              onChange={(event) =>
                setFormStatus(event.target.value as TaskStatus)
              }
              className="mb-6 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={resetForm}
                disabled={saving}
                className="rounded-lg border border-slate-700 px-4 py-3 hover:bg-slate-800 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingTask
                    ? "Save Changes"
                    : "Create Task"}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
