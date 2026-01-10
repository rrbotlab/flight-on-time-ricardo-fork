import axios from "axios";

export const api = axios.create({
  baseURL: "http://flight-on-time.api.vm3.arbly.com",
});
