import { useEffect, useState } from "react";
import { STORAGE_KEYS } from "../constants/storage";

export interface User {
  id: string;
  email: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.USER);
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  return { user };
}
