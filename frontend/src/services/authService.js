import api from "./api";

// LOGIN
export async function login({ identifier, password }) {
  const normalizedIdentifier = String(identifier || "").trim();
  const payload = {
    identifier: normalizedIdentifier,
    password,
  };

  if (normalizedIdentifier.includes("@")) {
    payload.email = normalizedIdentifier;
  } else {
    payload.username = normalizedIdentifier;
  }

  const response = await api.post("/auth/login", payload);
  return response.data?.data || response.data;
}

// REGISTER
export async function register({ username, email, password, confirmPassword }) {
  const response = await api.post("/auth/register", {
    username,
    email,
    password,
    confirmPassword,
  });
  return response.data?.data || response.data;
}

// LOGOUT
export async function logout() {
  const response = await api.post("/auth/logout");
  return response.data;
}