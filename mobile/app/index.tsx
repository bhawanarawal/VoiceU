import { useEffect } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const initApp = async () => {
      try {
        await AsyncStorage.removeItem("access_token");

        router.replace("/(auth)/signin");
      } catch (error) {
        console.error("Error clearing token:", error);
        router.replace("/(auth)/signin");
      }
    };

    initApp();
  }, []);

  return null;
}
