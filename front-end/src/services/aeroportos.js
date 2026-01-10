import { api } from "./api";

export async function getAeroportos() {
  const response = await api.get("/airports");
  return response.data;
}
