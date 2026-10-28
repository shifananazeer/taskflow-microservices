
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user?: {
    id?: string;
    email?: string;
    [key: string]: unknown;
  };
}






export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  message?: string;
  user?: {
    id?: string;
    name?: string;
    email?: string;
  };
}
