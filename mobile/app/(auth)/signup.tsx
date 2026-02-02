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
import api from "../../services/api";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function SignUpScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const register = async () => {
    if (!fullName || !email || !password) {
      alert("Please fill all fields");
      return;
    }
    if (password.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/register", {
        full_name: fullName,
        email,
        password,
      });

      alert("Successfully registered! Redirecting to Sign In...");
      router.replace({ pathname: "/signin" });
    } catch (err: any) {
      alert(err.response?.data?.detail || "Registration failed");
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
          paddingTop: 90,
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
            paddingVertical: 30,
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
              fontSize: 26,
              fontWeight: "bold",
              textAlign: "center",
              color: "#1e293b",
              marginBottom: 2,
            }}
          >
            Welcome to VoiceU
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: "#64748b",
              textAlign: "center",
              marginBottom: 25,
            }}
          >
            Sign up to get started
          </Text>

          <View style={{ marginBottom: 15 }}>
            <Text
              style={{ marginBottom: 6, fontWeight: "500", color: "#334155" }}
            >
              Full Name
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
              <Ionicons name="person-outline" size={20} color="#64748b" />
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="Full Name"
                placeholderTextColor="#94a3b8"
                style={{
                  backgroundColor: "#f1f5f9",
                  paddingHorizontal: 15,
                  paddingVertical: 15,
                  borderRadius: 10,
                  color: "#334155",
                  fontSize: 16,
                }}
              />
            </View>
          </View>

          <View style={{ marginBottom: 15 }}>
            <Text
              style={{ marginBottom: 6, fontWeight: "500", color: "#334155" }}
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
                  backgroundColor: "#f1f5f9",
                  paddingHorizontal: 15,
                  paddingVertical: 15,
                  borderRadius: 10,
                  color: "#334155",
                  fontSize: 16,
                }}
              />
            </View>
          </View>

          <View style={{ marginBottom: 15 }}>
            <Text
              style={{ marginBottom: 6, fontWeight: "500", color: "#334155" }}
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
                secureTextEntry
                placeholder="Password"
                placeholderTextColor="#94a3b8"
                style={{
                  backgroundColor: "#f1f5f9",
                  paddingHorizontal: 15,
                  paddingVertical: 15,
                  borderRadius: 10,
                  color: "#334155",
                  fontSize: 16,
                }}
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={register}
            disabled={loading}
            style={{
              backgroundColor: "#2563eb",
              padding: 15,
              borderRadius: 12,
              alignItems: "center",
              marginTop: 20,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>
                Sign Up
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push({ pathname: "/signin" })}
            style={{ marginTop: 15, marginBottom: 15 }}
          >
            <Text
              style={{ textAlign: "center", color: "#334155", fontSize: 15 }}
            >
              Already have an account?{" "}
              <Text style={{ fontWeight: "bold" }}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
