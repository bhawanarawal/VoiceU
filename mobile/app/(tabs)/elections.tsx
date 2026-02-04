import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

interface Election {
  election_id: number;
  election_name: string;
  description?: string;
  start_date: string;
  end_date: string;
  group_name?: string;
  organization_name?: string;
  status: "upcoming" | "ongoing" | "past";
}

const getElectionPhase = (startUTC: string, endUTC: string) => {
  const startUTCDate = new Date(startUTC);
  const endUTCDate = new Date(endUTC);
  const nowUTC = new Date();

  const nptOffset = 5.75 * 60 * 60 * 1000;

  const start = new Date(
    startUTCDate.getTime() +
      startUTCDate.getTimezoneOffset() * 60000 +
      nptOffset,
  );

  const end = new Date(
    endUTCDate.getTime() + endUTCDate.getTimezoneOffset() * 60000 + nptOffset,
  );

  const now = new Date(
    nowUTC.getTime() + nowUTC.getTimezoneOffset() * 60000 + nptOffset,
  );

  if (now < start) return "upcoming";
  if (now >= start && now <= end) return "ongoing";
  return "past";
};

export default function ElectionsScreen() {
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const res = await api.get("/elections");

        const formatted: Election[] = res.data.map((e: any) => ({
          election_id: e.election_id,
          election_name: e.election_name,
          description: e.description,
          start_date: e.start_date,
          end_date: e.end_date,
          group_name: e.group_name,
          organization_name: e.organization_name,
          status: getElectionPhase(e.start_date, e.end_date),
        }));

        setElections(formatted.filter((e) => e.status === "ongoing"));
      } catch (err) {
        console.error("Failed to load elections", err);
      } finally {
        setLoading(false);
      }
    };

    fetchElections();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.topBar}>
        <Text style={styles.pageTitle}>Ongoing Elections</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      ) : elections.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No ongoing elections right now</Text>
        </View>
      ) : (
        <FlatList
          data={elections}
          keyExtractor={(item) => item.election_id.toString()}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <ElectionCard election={item} />}
        />
      )}
    </View>
  );
}

function ElectionCard({ election }: { election: Election }) {
  const [expanded, setExpanded] = useState(false);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{election.election_name}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Ongoing</Text>
        </View>
      </View>

      {election.organization_name && (
        <Text style={styles.meta}>
          <Text style={styles.metaLabel}>Organization: </Text>
          {election.organization_name}
        </Text>
      )}

      {election.group_name && (
        <Text style={styles.meta}>
          <Text style={styles.metaLabel}>Group: </Text>
          {election.group_name}
        </Text>
      )}

      <TouchableOpacity style={styles.expandBtn} onPress={toggle}>
        <Text style={styles.expandText}>
          {expanded ? "Hide Details" : "View Details"}
        </Text>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={20}
          color="#2563eb"
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.expandArea}>
          <Text style={styles.description}>
            {election.description || "No description available."}
          </Text>
        </View>
      )}

      <TouchableOpacity style={styles.voteBtn}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Ionicons name="thumbs-up" size={16} color="#fff" />
          <Text style={styles.voteText}>Vote Now</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
    marginRight: 8,
  },
  badge: {
    backgroundColor: "#16a34a",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  meta: {
    marginTop: 6,
    fontSize: 14,
    color: "#475569",
  },
  metaLabel: {
    fontWeight: "600",
  },
  expandBtn: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  expandText: {
    color: "#2563eb",
    fontWeight: "600",
  },
  expandArea: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  description: {
    fontSize: 14,
    color: "#334155",
    lineHeight: 20,
  },
  voteBtn: {
    marginTop: 14,
    backgroundColor: "#16a34a",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    paddingHorizontal: 30,
    alignSelf: "flex-start",
  },
  voteText: {
    color: "#fff",
    fontWeight: "700",
  },
  topBar: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 3,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
  },
});
