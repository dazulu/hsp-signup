import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";
import * as SecureStore from "../secure-store";

export const useCredentials = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Load saved credentials on mount (native only)
  useEffect(() => {
    if (Platform.OS === "web") {
      return;
    }
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
    if (Platform.OS === "web") {
      return;
    }
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
};
