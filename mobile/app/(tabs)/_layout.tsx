import { Tabs } from "expo-router";
import React, { useState, useCallback } from "react";
import { TouchableOpacity, Text, View, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { HapticTab } from "@/components/haptic-tab";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";

export default function TabLayout() {
  const [full_name, setFullName] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      const fetchFullName = async () => {
        const name = await AsyncStorage.getItem("full_name");
        setFullName(name);
      };
      fetchFullName();
    }, []),
  );

  const logout = async () => {
    await AsyncStorage.removeItem("access_token");
    await AsyncStorage.removeItem("full_name");
    router.replace("/(auth)/signin");
  };

  return (
    <Tabs
      screenOptions={{
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="elections"
        options={{
          title: "Elections",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
          headerRight: () => (
            <View style={styles.headerRight}>
              <Text style={styles.usernameText}>
                Hello,{full_name || "User"}
              </Text>
              <TouchableOpacity onPress={logout} style={{ marginLeft: 8 }}>
                <Ionicons name="log-out-outline" size={24} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Ionicons size={28} name="person-circle" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  usernameText: {
    fontWeight: "600",
    color: "#1e293b",
    fontSize: 16,
  },
});
