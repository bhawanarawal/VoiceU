import { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import api from "../services/api";

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
  const router = useRouter();
  const [showManifesto, setShowManifesto] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [localVoted, setLocalVoted] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const isDisabled = hasVoted || isElectionOver || localVoted;
  const buttonText =
    hasVoted || localVoted ? "Voted" : isElectionOver ? "Ended" : "Vote";

  const normalizedPhoto = photo_url
    ? `${(api.defaults?.baseURL || "http://localhost:8000").replace(
        /\/+$/,
        "",
      )}/${photo_url.replace(/\\/g, "/").replace(/^\/+/, "")}`
    : undefined;

  useEffect(() => {
    if (hasVoted) {
      setShowBanner(true);
      const timer = setTimeout(() => setShowBanner(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [hasVoted]);
  return (
    <View style={styles.tile}>
      {showBanner && (
        <View style={styles.smallBanner}>
          <Text style={styles.smallBannerText}>Voted</Text>
        </View>
      )}

      {normalizedPhoto ? (
        <Image source={{ uri: normalizedPhoto }} style={styles.tileAvatar} />
      ) : (
        <View style={styles.tileAvatarPlaceholder} />
      )}

      <Text style={styles.tileName} numberOfLines={1} ellipsizeMode="tail">
        {full_name}
      </Text>

      <Text style={styles.tileGroup} numberOfLines={1} ellipsizeMode="tail">
        {group_name || organization_name || ""}
      </Text>

      {manifesto && (
        <TouchableOpacity
          style={styles.manifestoToggle}
          onPress={() => setShowManifesto((v) => !v)}
        >
          <Text style={styles.manifestoToggleText}>
            {showManifesto ? "Hide " : "Manifesto"}
          </Text>
          <Ionicons
            name={showManifesto ? "chevron-up" : "chevron-down"}
            size={16}
            color="#2563eb"
            style={styles.manifestoToggleIcon}
          />
        </TouchableOpacity>
      )}

      {manifesto && showManifesto && (
        <Text style={styles.manifestoCompactFull}>{manifesto}</Text>
      )}

      <TouchableOpacity
        style={[styles.voteButton, isDisabled && styles.disabledBtn]}
        onPress={() => {
          if (isDisabled) return;
          setLocalVoted(true);
          setShowPopup(true);
          try {
            onVote();
          } catch (e) {
            // swallow - parent handles errors
          }
        }}
        disabled={isDisabled}
      >
        <Ionicons
          name="thumbs-up"
          size={14}
          color="#fff"
          style={styles.voteIcon}
        />
        <Text style={styles.voteButtonText}>
          {buttonText === "Vote" ? "Vote" : buttonText}
        </Text>
      </TouchableOpacity>

      <Modal visible={showPopup} transparent animationType="fade">
        <View style={styles.popupOverlay}>
          <View style={styles.popupBoxSquare}>
            <View style={styles.popupVotedRow}>
              <Text style={styles.popupText}>You Voted for {full_name} </Text>
            </View>

            <View style={styles.popupThanksRow}>
              <Ionicons
                name="thumbs-up"
                size={16}
                color="#2563eb"
                style={styles.popupThanksIcon}
              />
              <Text style={styles.popupSubText}>Thanks for voting!</Text>
            </View>

            <TouchableOpacity
              style={styles.popupOkBottom}
              onPress={() => {
                setShowPopup(false);
                router.replace("/(tabs)/elections");
              }}
            >
              <Text style={styles.popupOkText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  cardSingle: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 1,
  },
  rowSingle: {
    flexDirection: "row",
    alignItems: "center",
  },
  smallAvatar: {
    width: 45,
    height: 45,
    borderRadius: 24,
    marginRight: 12,
  },
  placeholderAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: "#e2e8f0",
  },
  singleLineText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  compactVoteBtn: {
    backgroundColor: "#16a34a",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  voteInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  voteTextSmall: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
    marginLeft: 6,
  },
  disabledBtn: {
    backgroundColor: "#94a3b8",
  },
  detailsRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  detailText: {
    fontSize: 12,
    color: "#475569",
    marginRight: 6,
  },
  manifestoToggleCompact: {
    color: "#2563eb",
    fontSize: 12,
    marginLeft: 6,
  },
  manifestoCompactFull: {
    marginTop: 6,
    fontSize: 13,
    color: "#334155",
  },
  manifestoToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    marginBottom: 6,
    paddingHorizontal: 6,
  },
  manifestoToggleText: {
    color: "#2563eb",
    fontSize: 12,
    fontWeight: "600",
  },
  manifestoToggleIcon: {
    marginLeft: 4,
  },
  smallBanner: {
    position: "absolute",
    top: -8,
    right: 8,
    backgroundColor: "#16a34a",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    elevation: 2,
  },
  smallBannerText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  tile: {
    width: 120,
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    margin: 6,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
  },
  tileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 8,
    backgroundColor: "#f8fafc",
  },
  tileAvatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 8,
    backgroundColor: "#e2e8f0",
  },
  tileName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
    textAlign: "center",
    width: "100%",
  },
  tileGroup: {
    fontSize: 11,
    color: "#64748b",
    textAlign: "center",
    marginTop: 2,
    width: "100%",
  },
  voteCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#16a34a",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  voteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#16a34a",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
  },
  voteIcon: {
    marginRight: 6,
  },
  voteButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  popupOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  popupBox: {
    width: 280,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    elevation: 6,
  },
  popupBoxSquare: {
    width: 300,
    height: 200,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 18,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
  },
  popupTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    color: "#0f172a",
  },
  popupText: {
    fontSize: 18,
    color: "#334155",
    textAlign: "center",
    marginBottom: 16,
  },
  popupOk: {
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  popupOkBottom: {
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginTop: 16,
  },
  popupOkText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  popupVotedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  popupIcon: {
    marginBottom: 8,
  },
  popupName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
    textAlign: "center",
  },
  popupThanksRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  popupThanksIcon: {
    marginRight: 8,
  },
  popupSubText: {
    color: "#2563eb",
    fontWeight: "600",
  },
});
