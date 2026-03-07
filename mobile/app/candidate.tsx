import { useEffect, useState, useCallback, useLayoutEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
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
  const [votedCandidateId, setVotedCandidateId] = useState<number[]>([]);
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
        const votedIdRes = await api.get(`/votes/my-votes/${electionIdNum}`);
        setVotedCandidateId(votedIdRes.data || []);
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
      const rsponse =
        await voteForCandidate({
          candidate_id: candidate.candidate_id,
          election_id: electionIdNum,
        });
      setVotedCandidateId((prev) => [...prev, candidate.candidate_id]);

      setVotedPositions((prev) => {
        const newPositions = [...prev, candidate.position_name.trim()];
        return newPositions;
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || "An unspected error occured.";
      if (err.response?.status === 403) {
        Alert.alert("Registration Pending",
          errorMessage || "Your account is awaiting admin approval. You cannot vote yet.",
          [{ text: "Understood", style: "cancel" }]
        );
      } else {
        Alert.alert("Vote failed", errorMessage || "Something went wrong")
      }
      throw err;
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
          <Text style={styles.positionTitle}>{position} Position</Text>

          <FlatList
            data={list}
            keyExtractor={(item) => String(item.candidate_id)}
            numColumns={3}
            columnWrapperStyle={styles.columnWrapper}
            scrollEnabled={false}
            renderItem={({ item }) => {
              const isThisCandidate = votedCandidateId.includes(item.candidate_id);
              const isPositionFilled = votedPositions.includes(item.position_name.trim());
              return (
                <CandidateCard
                  full_name={item.full_name}
                  photo_url={item.photo_url}
                  position_name={item.position_name}
                  group_name={item.group_name}
                  organization_name={item.organization_name}
                  manifesto={item.manifesto}
                  hasVoted={isThisCandidate}
                  isElectionOver={electionStatus === "past" || (isPositionFilled && !isThisCandidate)}
                  onVote={() => handleVote(item)}
                />
              )
            }}
          />
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
  columnWrapper: {
    justifyContent: "flex-start",
    alignItems: "flex-start",
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
