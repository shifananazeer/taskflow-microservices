
import { apiRequest } from "./api";
import type {
  PaginatedTasks,
  Task,
  TaskQueryParams,
} from "../types/task.types";

export async function getTasks(
  token: string,
  params: TaskQueryParams = {}
): Promise<PaginatedTasks> {
  const query = new URLSearchParams();

  if (params.page !== undefined) {
    query.set("page", String(params.page));
  }

  if (params.limit !== undefined) {
    query.set("limit", String(params.limit));
  }

  if (params.status) {
    query.set("status", params.status);
  }

  if (params.search?.trim()) {
    query.set("search", params.search.trim());
  }

  const queryString = query.toString();
  const endpoint = `/tasks${queryString ? `?${queryString}` : ""}`;

  return apiRequest<PaginatedTasks>(endpoint, { token });
}

export function createTask(
  token: string,
  task: Pick<Task, "title"> & Partial<Pick<Task, "description" | "status">>
): Promise<Task> {
  return apiRequest<Task>("/tasks", {
    method: "POST",
    token,
    body: task,
  });
}

export function updateTask(
  token: string,
  taskId: string,
  updates: Partial<Pick<Task, "title" | "description" | "status">>
): Promise<Task> {
  return apiRequest<Task>(`/tasks/${encodeURIComponent(taskId)}`, {
    method: "PATCH",
    token,
    body: updates,
  });
}

export function deleteTask(
  token: string,
  taskId: string
): Promise<unknown> {
  return apiRequest<unknown>(
    `/tasks/${encodeURIComponent(taskId)}`,
    {
      method: "DELETE",
      token,
    }
  );
}
