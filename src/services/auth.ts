import { API } from "./api";

export const register = async (
  name: string,
  email: string,
  password: string
) => {
  const res = await API.post("/auth/register", {
    name,
    email,
    password,
  });

  return res.data;
};

export const login = async (email: string, password: string) => {
  const formData = new URLSearchParams();

  formData.append("username", email);
  formData.append("password", password);

  const res = await API.post("/auth/login", formData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  return res.data;
};

export const forgotPassword = async (email: string) => {
  const res = await API.post("/auth/forgot-password", { email });
  return res.data;
};
