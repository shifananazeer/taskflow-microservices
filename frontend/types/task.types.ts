
export type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED";

export interface Task {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskQueryParams {
  page?: number;
  limit?: number;
  status?: TaskStatus;
  search?: string;
}

export interface PaginatedTasks {
  tasks: Task[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}
