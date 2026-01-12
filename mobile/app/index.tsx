import { useEffect } from "react";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  useEffect(() => {
    AsyncStorage.getItem("access_token").then((token) => {
      if (token) router.replace("/(tabs)");
      else router.replace("../(auth)/signin");
    });
  }, []);

  return null;
}
