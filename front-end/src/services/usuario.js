import { api } from "./api";

export async function cadastrarUsuario(dados) {
  return api.post("/usuarios", dados);
}
