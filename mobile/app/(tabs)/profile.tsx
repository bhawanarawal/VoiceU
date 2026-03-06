import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AuthUser {
  username: string;
  email: string;
  full_name: string;
}
interface VoterInfo {
  voter_id: number;
  org_name: string;
  is_voter: boolean;
  group_name: string;
  group_status: string;
}
export default function ProfileScreen() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [voter, setVoter] = useState<VoterInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExpired, setIsExpired] = useState(false);

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(["access_token", "full_name", "username"]);
    router.replace("/(auth)/signin");
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [userRes, voterRes] = await Promise.all([
          api.get("/auth/users/me"),
          api.get("/voters/me")
        ]);
        setUser(userRes.data);
        setVoter(voterRes.data);
        setIsExpired(false);
      } catch (error: any) {
        if (error.response?.status === 401) {
          setIsExpired(true);
        }

      } finally {
        setLoading(false);
      }
    };
    fetchAllData();

  }, []);

  if (loading) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#2563eb" />
    </View>
  )


  if (isExpired) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Ionicons name="lock-closed" size={80} color="#ef4444" />
        <Text style={{ fontSize: 22, fontWeight: 'bold', marginTop: 20, color: '#1e293b' }}>
          Session Expired
        </Text>
        <Text style={{ textAlign: 'center', color: '#64748b', marginTop: 10, marginBottom: 30 }}>
          For your security, you have been logged out. Please sign in again to access your voter profile.
        </Text>
        <TouchableOpacity
          style={[styles.logoutButton, { width: '100%', backgroundColor: '#2563eb' }]}
          onPress={handleLogout} // This clears storage and moves to signin
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Back to Login</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  const isApproved = voter?.is_voter && voter.group_status === "APPROVED";
  const ispending = voter?.is_voter && voter.group_status !== "APPROVED";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={["#2563eb", "#1e40af"]} style={styles.headerBackground} />

        <View style={styles.headerContent}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person-circle" size={120} color="white" />
            {/* Show checkmark only if verified voter */}
            {isApproved && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={24} color="#10b981" />
              </View>
            )}
          </View>
          <Text style={styles.nameText}>{user?.full_name}</Text>
          <Text style={styles.emailText}>{user?.username}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons
              name={isApproved ? "card" : ispending ? "time-outline" : "card-outline"}
              size={24}
              color={isApproved ? "#2563eb" : ispending ? "#f59e0b" : "#64748b"}
            />
            <Text style={[styles.cardTitle, ispending && { color: "#64748b" }, !voter?.is_voter && { color: "#64748b" }]}>
              {isApproved ? "OFFICIAL VOTER ID" : "VOTER SATUS"}
            </Text>
          </View>

          {isApproved ? (
            <>
              <View style={styles.statusContainer}>
                <View style={[styles.badge, { backgroundColor: "#d1fae5" }]}>
                  <Text style={[styles.badgeText, { color: "#065f46" }]}>VERIFIED VOTER</Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Voter ID</Text>
                <Text style={styles.value}>{voter?.voter_id}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>Organization</Text>
                <Text style={styles.value}>{voter?.org_name}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Affiliation</Text>
                <Text style={styles.value}>{voter?.group_name}</Text>
              </View>


            </>

          ) : ispending ?
            (
              <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                <Ionicons name="hourglass-outline" size={50} color="#f59e0b" />
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginTop: 10 }}>
                  Approval Pending
                </Text>
                <Text style={{ textAlign: 'center', color: '#64748b', marginTop: 8, paddingHorizontal: 15 }}>
                  Your application for {voter?.group_name} is being reviewed. You'll be able to vote once an admin approves you.
                </Text>
                <View style={[styles.badge, { backgroundColor: "#fef3c7", marginTop: 15 }]}>
                  <Text style={[styles.badgeText, { color: "#b45309" }]}>AWAITING VERIFICATION</Text>
                </View>
              </View>

            ) : (
              <View style={{ alignItems: 'center', paddingVertical: 10 }}>
                <Text style={{ color: "#64748b", marginBottom: 15, textAlign: 'center' }}>
                  You haven't registered as a voter yet.
                </Text>
                <TouchableOpacity
                  style={[styles.secondaryButton, { width: '100%', borderColor: '#2563eb' }]}
                  // Changed to /voter (ensure you moved the file to app/(tabs)/voter.tsx)
                  onPress={() => router.push("/voter")}
                >
                  <Text style={{ color: '#2563eb', fontWeight: 'bold' }}>Register Now</Text>
                </TouchableOpacity>

                <View style={styles.statusContainer}>
                  <View style={[styles.badge, { backgroundColor: "#fee2e2" }]}>
                    <Text style={[styles.badgeText, { color: "#ef4444" }]}>NOT REGISTERED</Text>
                  </View>
                </View>
              </View>
            )}

        </View>

        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  headerBackground: { position: "absolute", top: 0, left: 0, right: 0, height: 240, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerContent: { alignItems: "center", marginTop: 40, marginBottom: 20 },
  avatarContainer: { position: "relative" },
  verifiedBadge: { position: "absolute", bottom: 10, right: 10, backgroundColor: "white", borderRadius: 12 },
  nameText: { color: "white", fontSize: 24, fontWeight: "bold", marginTop: 10 },
  emailText: { color: "#bfdbfe", fontSize: 16 },
  card: { backgroundColor: "white", marginHorizontal: 20, borderRadius: 20, padding: 20, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10, elevation: 5, marginTop: 10 },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 20, borderBottomWidth: 1, borderBottomColor: "#f1f5f9", paddingBottom: 10 },
  cardTitle: { marginLeft: 10, fontWeight: "800", color: "#2563eb", letterSpacing: 1 },
  infoRow: { marginBottom: 15 },
  label: { color: "#64748b", fontSize: 12, fontWeight: "600", textTransform: "uppercase" },
  value: { color: "#1e293b", fontSize: 16, fontWeight: "700", marginTop: 2 },
  statusContainer: { marginTop: 10, alignItems: "flex-end" },
  statusLabel: { fontSize: 10, color: "#94a3b8", fontWeight: "bold" },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginTop: 5 },
  badgeText: { fontWeight: "bold", fontSize: 12 },
  actionContainer: { padding: 20 },
  secondaryButton: { flexDirection: "row", alignItems: "center", backgroundColor: "white", padding: 15, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: "#e2e8f0", justifyContent: 'center' },
  secondaryButtonText: { marginLeft: 10, color: "#64748b", fontWeight: "600" },
  logoutButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#fee2e2", padding: 15, borderRadius: 12, justifyContent: 'center' },
  logoutText: { marginLeft: 10, color: "#ef4444", fontWeight: "bold" },
});