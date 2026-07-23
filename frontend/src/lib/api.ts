const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export const fetchAPI = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const token = localStorage.getItem("access_token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  // Only send the token to protected endpoints
  if (
    token &&
    endpoint !== "/auth/login/" &&
    endpoint !== "/auth/register/"
  ) {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
};
