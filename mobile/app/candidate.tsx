import { useEffect, useState, useCallback, useLayoutEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, router, useFocusEffect } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";
import {
  getApprovedCandidatesByElection,
  voteForCandidate,
} from "../services/candidateService";
import CandidateCard from "../components/CandidateCard";
import { Ionicons } from "@expo/vector-icons";

interface Candidate {
  candidate_id: number;
  full_name: string;
  photo_url?: string;
  manifesto?: string;
  position_name: string;
  group_name?: string;
  organization_name?: string;
}

function HeaderRight() {
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
    <View style={styles.headerRight}>
      <Text style={styles.usernameText}>Hello,{full_name || "User"}</Text>
      <TouchableOpacity onPress={logout} style={{ marginLeft: 8 }}>
        <Ionicons name="log-out-outline" size={24} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );
}

export default function CandidateScreen() {
  const { electionId } = useLocalSearchParams();
  const electionIdNum = Number(electionId);
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Candidates",
      headerRight: () => <HeaderRight />,
    });
  }, [navigation]);

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [votedPositions, setVotedPositions] = useState<string[]>([]);
  const [electionStatus, setElectionStatus] = useState<
    "upcoming" | "ongoing" | "past"
  >("ongoing");
  const [loading, setLoading] = useState(true);

  const grouped: Record<string, Candidate[]> = {};
  candidates.forEach((c) => {
    const pos = c.position_name.trim();
    grouped[pos] ||= [];
    grouped[pos].push(c);
  });

  useEffect(() => {
    if (!electionIdNum) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const electionRes = await api.get(`/elections/${electionIdNum}`);
        setElectionStatus(electionRes.data.status);

        const candidatesRes =
          await getApprovedCandidatesByElection(electionIdNum);
        const candidatesData: Candidate[] = candidatesRes.data || [];
        setCandidates(candidatesData);

        const voteRes = await api.get(
          `/voter-elections/voted-positions/${electionIdNum}`,
        );
        const votedPosFromBackend: string[] = voteRes.data || [];
        setVotedPositions(votedPosFromBackend);
      } catch (err) {
        console.error("Error fetching candidate data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [electionIdNum]);

  const handleVote = async (candidate: Candidate) => {
    try {
      await voteForCandidate({
        candidate_id: candidate.candidate_id,
        election_id: electionIdNum,
      });

      setVotedPositions((prev) => {
        const newPositions = [...prev, candidate.position_name.trim()];
        return newPositions;
      });
    } catch (err: any) {
      alert(err.response?.data?.detail || "Vote failed");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {Object.entries(grouped).map(([position, list]) => (
        <View key={position} style={styles.positionGroup}>
          <Text style={styles.positionTitle}>{position}</Text>
          {list.map((c) => (
            <CandidateCard
              key={c.candidate_id}
              full_name={c.full_name}
              photo_url={c.photo_url}
              position_name={c.position_name}
              group_name={c.group_name}
              organization_name={c.organization_name}
              manifesto={c.manifesto}
              hasVoted={votedPositions.includes(c.position_name.trim())}
              isElectionOver={electionStatus === "past"}
              onVote={() => handleVote(c)}
            />
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 24,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  positionGroup: {
    marginBottom: 24,
  },
  positionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
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
