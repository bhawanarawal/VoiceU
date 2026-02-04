import { useEffect } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("access_token");

      if (token) {
        router.replace("/(tabs)/elections");
      } else {
        router.replace("/(auth)/signin");
      }
    };

    checkAuth();
  }, []);

  return null;
}
