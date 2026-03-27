import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";
import * as SecureStore from "../secure-store";

const SAVE_ON_WEB_KEY = "hsp_save_on_web";

export const useCredentials = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saveOnWeb, setSaveOnWebState] = useState(false);

  // Load saved credentials on mount
  useEffect(() => {
    (async () => {
      if (Platform.OS === "web") {
        const shouldSave = localStorage.getItem(SAVE_ON_WEB_KEY) === "true";
        setSaveOnWebState(shouldSave);
        if (!shouldSave) {
          return;
        }
      }
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

  // On web, keep localStorage in sync whenever credentials or the toggle change
  useEffect(() => {
    if (Platform.OS !== "web" || !saveOnWeb) {
      return;
    }
    SecureStore.setItemAsync("hsp_email", email);
    SecureStore.setItemAsync("hsp_password", password);
  }, [email, password, saveOnWeb]);

  const setSaveOnWeb = useCallback(async (value: boolean) => {
    setSaveOnWebState(value);
    localStorage.setItem(SAVE_ON_WEB_KEY, String(value));
    if (!value) {
      await Promise.all([
        SecureStore.removeItemAsync("hsp_email"),
        SecureStore.removeItemAsync("hsp_password"),
      ]);
    }
  }, []);

  const saveCredentials = useCallback(async () => {
    if (Platform.OS === "web" && !saveOnWeb) {
      return;
    }
    await Promise.all([
      SecureStore.setItemAsync("hsp_email", email),
      SecureStore.setItemAsync("hsp_password", password),
    ]);
  }, [email, password, saveOnWeb]);

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    saveOnWeb,
    setSaveOnWeb,
    saveCredentials,
  };
};
