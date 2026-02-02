import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import api from "../../services/api";

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const login = async () => {
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }
    setLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const res = await api.post("/auth/token", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      await AsyncStorage.setItem("access_token", res.data.access_token);
      router.replace("/(auth)/voter");
    } catch (err: any) {
      alert(err.response?.data?.detail || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "flex-start",
          paddingTop: 120,
          paddingHorizontal: 20,
          backgroundColor: "#f0f4f8",
        }}
      >
        <LinearGradient
          colors={["#4f46e5", "#3b82f6"]}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 300,
          }}
        />

        <View
          style={{
            backgroundColor: "#fff",
            paddingVertical: 40,
            paddingHorizontal: 32,
            borderRadius: 16,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowOffset: { width: 0, height: 4 },
            shadowRadius: 6,
            elevation: 5,
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              textAlign: "center",
              color: "#1e293b",
              marginBottom: 6,
            }}
          >
            Welcome to VoiceU
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: "#64748b",
              textAlign: "center",
              marginBottom: 34,
            }}
          >
            Sign in to continue
          </Text>

          <View style={{ marginBottom: 18 }}>
            <Text
              style={{
                marginBottom: 6,
                fontWeight: "500",
                color: "#334155",
              }}
            >
              Email
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#f1f5f9",
                borderRadius: 10,
                paddingHorizontal: 15,
              }}
            >
              <Ionicons name="mail-outline" size={20} color="#64748b" />
              <TextInput
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="Email"
                placeholderTextColor="#94a3b8"
                style={{
                  flex: 1,
                  paddingVertical: 15,
                  marginLeft: 8,
                  color: "#334155",
                }}
              />
            </View>
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                marginBottom: 6,
                fontWeight: "500",
                color: "#334155",
              }}
            >
              Password
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#f1f5f9",
                borderRadius: 10,
                paddingHorizontal: 15,
              }}
            >
              <Ionicons name="lock-closed-outline" size={20} color="#64748b" />
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholder="Password"
                placeholderTextColor="#94a3b8"
                style={{
                  flex: 1,
                  paddingVertical: 15,
                  marginLeft: 8,
                  color: "#334155",
                }}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="#64748b"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={login}
            disabled={loading}
            style={{
              backgroundColor: "#2563eb",
              padding: 15,
              borderRadius: 12,
              alignItems: "center",
              marginTop: 25,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>
                Sign In
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push({ pathname: "/signup" })}
            style={{ marginTop: 16, marginBottom: 18 }}
          >
            <Text
              style={{ textAlign: "center", color: "#334155", fontSize: 15 }}
            >
              Don’t have an account?{" "}
              <Text style={{ fontWeight: "bold" }}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
export const screenOptions = {
  headerShown: false,
  title: "Sign In",
};
