import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import api from "../../services/api";
import { LinearGradient } from "expo-linear-gradient";

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
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <LinearGradient
          colors={["#4f46e5", "#3b82f6"]}
          style={styles.container}
        >
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>

          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Full Name"
              value={fullName}
              onChangeText={setFullName}
              placeholderTextColor="rgba(255,255,255,0.7)"
              style={styles.input}
            />
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor="rgba(255,255,255,0.7)"
              style={styles.input}
            />
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor="rgba(255,255,255,0.7)"
              style={styles.input}
            />
          </View>

          <Pressable
            onPress={register}
            style={styles.button}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Signing up..." : "Sign Up"}
            </Text>
          </Pressable>

          <Pressable onPress={() => router.push({ pathname: "/signin" })}>
            <Text style={styles.linkText}>
              Already have an account?{" "}
              <Text style={{ fontWeight: "bold" }}>Sign In</Text>
            </Text>
          </Pressable>
        </LinearGradient>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center" },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#d1d5db",
    marginBottom: 32,
    textAlign: "center",
  },
  inputContainer: { marginBottom: 24 },
  input: {
    backgroundColor: "rgba(255,255,255,0.15)",
    color: "#fff",
    fontSize: 16,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#2563eb",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 5,
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  linkText: { textAlign: "center", color: "#e0e7ff", fontSize: 14 },
});
