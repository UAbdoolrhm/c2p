const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export const fetchAPI = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const token = localStorage.getItem("access_token");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
};
