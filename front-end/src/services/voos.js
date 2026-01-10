import api from "./api";


export async function listarVoos() {
  const response = await api.get("/voos");
  return response.data;
}
