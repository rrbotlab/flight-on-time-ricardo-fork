import api from "./api";

export function login(email, password) {
  return api.post("/auth/login", {
    email,
    password,
  });
}

export function isAuthenticated() {
  return !!localStorage.getItem("token");
}

export function logout() {
  localStorage.removeItem("token");
}

export function getToken() {
  return localStorage.getItem("token");
}
