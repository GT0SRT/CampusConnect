import api from "./api";

// LOGIN
export async function login({ identifier, password }) {
  const response = await api.post("/auth/login", {
    identifier,
    password,
  });

  return response.data;
}

// REGISTER
export async function register({ username, email, password, confirmPassword }) {
  const response = await api.post("/auth/register", {
    username,
    email,
    password,
    confirmPassword,
  });
  return response.data;
}

// LOGOUT
export async function logout() {
  const response = await api.post("/auth/logout");
  return response.data;
}