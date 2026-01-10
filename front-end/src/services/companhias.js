import { api } from "./api";

export async function getCompanhias() {
  const response = await api.get("/airlines");
  return response.data;
}
