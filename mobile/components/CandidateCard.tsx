import { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface CandidateCardProps {
  full_name: string;
  photo_url?: string;
  position_name: string;
  group_name?: string;
  organization_name?: string;
  manifesto?: string;
  hasVoted: boolean;
  isElectionOver: boolean;
  onVote: () => void;
}

export default function CandidateCard({
  full_name,
  photo_url,
  position_name,
  group_name,
  organization_name,
  manifesto,
  hasVoted,
  isElectionOver,
  onVote,
}: CandidateCardProps) {
  const [showManifesto, setShowManifesto] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  const isDisabled = hasVoted || isElectionOver;
  const buttonText = hasVoted ? "Voted" : isElectionOver ? "Ended" : "Vote";

  const normalizedPhoto = photo_url
    ? `http://localhost:8000/${photo_url
        .replace(/\\/g, "/")
        .replace(/^\/+/, "")}`
    : undefined;

  useEffect(() => {
    if (hasVoted) {
      setShowBanner(true);
      const timer = setTimeout(() => setShowBanner(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [hasVoted]);

  return (
    <View style={styles.card}>
      {showBanner && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>You voted for {full_name}</Text>
        </View>
      )}
      <View style={styles.header}>
        {normalizedPhoto && (
          <Image source={{ uri: normalizedPhoto }} style={styles.avatar} />
        )}
        <Text style={styles.name}>{full_name}</Text>
      </View>

      <Text style={styles.info}>
        <Text style={styles.label}>Position: </Text>
        {position_name}
      </Text>
      {group_name && (
        <Text style={styles.info}>
          <Text style={styles.label}>Group: </Text>
          {group_name}
        </Text>
      )}
      {organization_name && (
        <Text style={styles.info}>
          <Text style={styles.label}>Organization Name: </Text>
          {organization_name}
        </Text>
      )}

      {manifesto && (
        <>
          <TouchableOpacity
            onPress={() => setShowManifesto((v) => !v)}
            style={styles.manifestoToggle}
          >
            <Text style={styles.manifestoToggleText}>
              {showManifesto ? "Hide Manifesto" : "Show Manifesto"}
            </Text>
          </TouchableOpacity>
          {showManifesto && <Text style={styles.manifesto}>{manifesto}</Text>}
        </>
      )}

      <TouchableOpacity
        style={[styles.voteBtn, isDisabled && styles.disabledBtn]}
        onPress={onVote}
        disabled={isDisabled}
      >
        <View style={styles.voteContent}>
          <Ionicons name="thumbs-up" size={16} color="#fff" />
          <Text style={styles.voteBtnText}>{buttonText}</Text>
        </View>
      </TouchableOpacity>

      {hasVoted && (
        <Text style={styles.votedMessage}>You have voted for {full_name}.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    flexShrink: 1,
  },
  info: {
    fontSize: 14,
    marginTop: 4,
    color: "#333",
  },
  label: {
    fontWeight: "600",
  },
  manifestoToggle: {
    marginTop: 8,
  },
  manifestoToggleText: {
    color: "#2563eb",
    fontWeight: "600",
  },
  manifesto: {
    marginTop: 4,
    fontSize: 14,
    color: "#444",
  },
  voteBtn: {
    marginTop: 12,
    backgroundColor: "#16a34a",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  disabledBtn: {
    backgroundColor: "#aaa",
  },
  voteContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  voteBtnText: {
    color: "#fff",
    fontWeight: "700",
  },
  votedMessage: {
    marginTop: 6,
    fontSize: 12,
    color: "#2563eb",
    fontStyle: "italic",
  },
  banner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(22,163,74,0.9)",
    paddingVertical: 4,
    alignItems: "center",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  bannerText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});
