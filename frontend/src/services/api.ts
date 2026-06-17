import axios from "axios";
import { API_BASE_URL } from "../lib/env";

export const API = axios.create({
  baseURL: API_BASE_URL,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
