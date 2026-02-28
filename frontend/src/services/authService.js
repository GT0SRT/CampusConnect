import api from "./api";

// LOGIN
export async function login({ email, password }) {
  const response = await api.post("/auth/login", {
    email,
    password,
  });

  return response.data;
}

// REGISTER
export async function register({ username, email, password }) {
  const response = await api.post("/auth/register", {
    username,
    email,
    password,
  });
  return response.data;
}

// LOGOUT
export async function logout() {
  const response = await api.post("/auth/logout");
  return response.data;
}