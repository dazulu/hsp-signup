import { useCallback, useEffect, useState } from "react";
import * as SecureStore from "../secureStore";

export function useCredentials() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Load saved credentials on mount
  useEffect(() => {
    (async () => {
      const [savedEmail, savedPassword] = await Promise.all([
        SecureStore.getItemAsync("hsp_email"),
        SecureStore.getItemAsync("hsp_password"),
      ]);
      if (savedEmail) {
        setEmail(savedEmail);
      }
      if (savedPassword) {
        setPassword(savedPassword);
      }
    })();
  }, []);

  const saveCredentials = useCallback(async () => {
    await Promise.all([
      SecureStore.setItemAsync("hsp_email", email),
      SecureStore.setItemAsync("hsp_password", password),
    ]);
  }, [email, password]);

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    saveCredentials,
  };
}
