import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  getMyVoter,
  createVoter,
  getOrganizations,
  getGroupsByOrg,
} from "@/services/voterService";

interface Organization {
  org_id: number;
  name: string;
}
interface Group {
  group_id: number;
  group_name: string;
}

export default function Voter() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [orgId, setOrgId] = useState<number | null>(null);
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      try {
        const voterRes = await getMyVoter();
        const user = voterRes.data;
        if (user.voter_id) {
          router.replace("/(tabs)/elections");
          return;
        }
        setFullName(user.full_name);
        setUsername(user.username);

        const orgRes = await getOrganizations();
        setOrganizations(orgRes.data);
      } catch {
        setError("Failed to load voter data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleOrgChange = async (value: number | null) => {
    if (!value) return;
    setOrgId(value);
    setSelectedGroups([]);
    try {
      const res = await getGroupsByOrg(value);
      setGroups(res.data);
    } catch {
      setError("Failed to load groups");
    }
  };

  const toggleGroup = (groupId: number) => {
    setSelectedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId],
    );
  };

  const handleSubmit = async () => {
    if (!orgId || selectedGroups.length === 0) {
      setError("Select organization and at least one group");
      return;
    }

    setSubmitting(true);
    try {
      await createVoter({ org_id: orgId, group_ids: selectedGroups });
      router.replace("/(tabs)/elections");
    } catch {
      setError("Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "flex-start",
          paddingTop: 100,
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
            position: "absolute",
            top: 40,
            right: 20,
            zIndex: 10,
          }}
        >
          {!isRegistered && (
            <TouchableOpacity
              onPress={() => router.replace("/(tabs)/elections")}
            >
              <Text style={{ fontSize: 28, fontWeight: "bold", color: "#fff" }}>
                ✕
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <View
          style={{
            backgroundColor: "#fff",
            paddingVertical: 30,
            paddingHorizontal: 25,
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
              marginBottom: 10,
            }}
          >
            Voter Registration
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: "#64748b",
              textAlign: "center",
              marginBottom: 24,
            }}
          >
            Fill in your details to register
          </Text>

          {error && (
            <Text
              style={{
                color: "#dc2626",
                textAlign: "center",
                marginBottom: 12,
                fontWeight: "500",
              }}
            >
              {error}
            </Text>
          )}

          <View style={{ marginBottom: 16 }}>
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
                paddingHorizontal: 12,
              }}
            >
              <Ionicons name="mail-outline" size={20} color="#64748b" />
              <TextInput
                value={username}
                editable={false}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  marginLeft: 8,
                  color: "#64748b",
                }}
              />
            </View>
          </View>

          <View style={{ marginBottom: 16 }}>
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
                paddingHorizontal: 12,
              }}
            >
              <Ionicons name="person-outline" size={20} color="#64748b" />
              <TextInput
                value={fullName}
                editable={false}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  marginLeft: 8,
                  color: "#64748b",
                }}
              />
            </View>
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text
              style={{ marginBottom: 6, fontWeight: "500", color: "#334155" }}
            >
              Organization
            </Text>
            <View
              style={{
                borderWidth: 1,
                borderColor: "#cbd5e1",
                borderRadius: 10,
                overflow: "hidden",
              }}
            >
              <Picker
                selectedValue={orgId}
                onValueChange={handleOrgChange}
                enabled={!isRegistered}
              >
                <Picker.Item label="Select Organization" value={null} />
                {organizations.map((org) => (
                  <Picker.Item
                    key={org.org_id}
                    label={org.name}
                    value={org.org_id}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text
              style={{ marginBottom: 6, fontWeight: "500", color: "#334155" }}
            >
              Groups
            </Text>
            {groups.map((g) => (
              <TouchableOpacity
                key={g.group_id}
                onPress={() => toggleGroup(g.group_id)}
                disabled={isRegistered}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderWidth: 1,
                    borderColor: "#cbd5e1",
                    borderRadius: 6,
                    marginRight: 12,
                    backgroundColor: selectedGroups.includes(g.group_id)
                      ? "#2563eb"
                      : "#fff",
                  }}
                />
                <Text style={{ color: "#334155", fontWeight: "500" }}>
                  {g.group_name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting}
            style={{
              backgroundColor: "#2563eb",
              padding: 16,
              borderRadius: 12,
              alignItems: "center",
              marginTop: 10,
            }}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
                Register as Voter
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
