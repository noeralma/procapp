const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

const getHeaders = (options?: FetchOptions) => {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options?.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

export const api = {
  get: async <T>(endpoint: string, options?: FetchOptions): Promise<T> => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      method: "GET",
      headers: getHeaders(options),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || `API Error: ${res.statusText}`);
    }

    return res.json();
  },

  post: async <T>(endpoint: string, body: unknown, options?: FetchOptions): Promise<T> => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      method: "POST",
      headers: getHeaders(options),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || `API Error: ${res.statusText}`);
    }

    return res.json();
  },

  put: async <T>(endpoint: string, body: unknown, options?: FetchOptions): Promise<T> => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      method: "PUT",
      headers: getHeaders(options),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || `API Error: ${res.statusText}`);
    }

    return res.json();
  },

  delete: async <T>(endpoint: string, options?: FetchOptions): Promise<T> => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      method: "DELETE",
      headers: getHeaders(options),
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || `API Error: ${res.statusText}`);
    }

    return res.json();
  },
};
