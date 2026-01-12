import { View, Text, Pressable } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export default function Home() {
  const logout = async () => {
    await AsyncStorage.removeItem("access_token");
    router.replace("../(auth)/signin");
  };

  return (
    <View
      style={{
        padding: 30,
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ fontSize: 24 }}>Welcome to VoiceU !</Text>

      <Pressable onPress={logout}>
        <Text style={{ marginTop: 20, color: "red" }}>Logout</Text>
      </Pressable>
    </View>
  );
}
