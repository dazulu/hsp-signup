import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";
import * as SecureStore from "../secure-store";

const SAVE_ON_DEVICE_KEY = "app_save_on_device";

export const useCredentials = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saveOnDevice, setSaveOnDeviceState] = useState(false);

  // Load saved credentials on mount (native only)
  useEffect(() => {
    if (Platform.OS === "web") {
      return;
    }
    (async () => {
      const shouldSave =
        (await AsyncStorage.getItem(SAVE_ON_DEVICE_KEY)) === "true";
      setSaveOnDeviceState(shouldSave);
      if (!shouldSave) {
        return;
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

  const setSaveOnDevice = useCallback(async (value: boolean) => {
    setSaveOnDeviceState(value);
    await AsyncStorage.setItem(SAVE_ON_DEVICE_KEY, String(value));
    if (!value) {
      await Promise.all([
        SecureStore.removeItemAsync("hsp_email"),
        SecureStore.removeItemAsync("hsp_password"),
      ]);
    }
  }, []);

  const saveCredentials = useCallback(async () => {
    if (Platform.OS === "web" || !saveOnDevice) {
      return;
    }
    await Promise.all([
      SecureStore.setItemAsync("hsp_email", email),
      SecureStore.setItemAsync("hsp_password", password),
    ]);
  }, [email, password, saveOnDevice]);

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    saveOnDevice,
    setSaveOnDevice,
    saveCredentials,
  };
};
