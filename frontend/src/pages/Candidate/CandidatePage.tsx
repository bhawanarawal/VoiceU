import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Stack,
  CircularProgress,
  Divider,
  Button,
} from "@mui/material";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import CandidateCard from "../../components/cards/CandidateCard";
import {
  getApprovedCandidatesByElection,
  voteForCandidate,
} from "./candidateService";
import api from "../../utils/api";
import Nav from "../../layout/Nav";
import Footer from "../../layout/Footer";

interface Candidate {
  candidate_id: number;
  full_name: string;
  photo_url?: string;
  manifesto?: string;
  position_name: string;
  group_name?: string;
  organization_name?: string;
}

export default function CandidatePage() {
  const [searchParams] = useSearchParams();
  const electionId = Number(searchParams.get("electionId"));
  const navigate = useNavigate();
  const location = useLocation();

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [votedPositions, setVotedPositions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [electionStatus, setElectionStatus] = useState<
    "upcoming" | "ongoing" | "past"
  >("ongoing");
  const [hasVotedAll, setHasVotedAll] = useState(false);

  const computeHasVotedAll = (
    allCandidates: Candidate[],
    votedPos: string[],
  ) => {
    const positionsWithCandidates = [
      ...new Set(allCandidates.map((c) => c.position_name.trim())),
    ];
    return (
      positionsWithCandidates.length > 0 &&
      positionsWithCandidates.every((pos) => votedPos.includes(pos))
    );
  };

  const grouped: Record<string, Candidate[]> = {};
  candidates.forEach((c) => {
    const pos = c.position_name.trim();
    grouped[pos] ||= [];
    grouped[pos].push(c);
  });

  useEffect(() => {
    if (!electionId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const electionRes = await api.get(`/elections/${electionId}`);
        setElectionStatus(electionRes.data.status);

        const candidatesRes = await getApprovedCandidatesByElection(electionId);
        const candidatesData: Candidate[] = candidatesRes.data || [];
        setCandidates(candidatesData);

        const voteRes = await api.get(
          `/voter-elections/voted-positions/${electionId}`,
        );
        const votedPosFromBackend: string[] = voteRes.data || [];
        setVotedPositions(votedPosFromBackend);

        setHasVotedAll(computeHasVotedAll(candidatesData, votedPosFromBackend));
      } catch (err) {
        console.error("Error fetching candidate data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [electionId, location.key]);

  const handleVote = async (candidate: Candidate) => {
    try {
      await voteForCandidate({
        candidate_id: candidate.candidate_id,
        election_id: electionId,
      });

      setVotedPositions((prev) => {
        const newPositions = [...prev, candidate.position_name.trim()];
        setHasVotedAll(computeHasVotedAll(candidates, newPositions));
        return newPositions;
      });
    } catch (err: any) {
      alert(err.response?.data?.detail || "Vote failed");
    }
  };

  if (loading) {
    return (
      <Box textAlign="center" mt={6}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Box display="flex" flexDirection="column" minHeight="100vh">
        <Nav />
        <Box px={3} py={4} mt="80px" flex="1">
          <Typography variant="h4" textAlign="center" fontWeight={700} mb={3}>
            Approved Candidates
          </Typography>

          {hasVotedAll && (
            <Box textAlign="center" mb={4}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => navigate(`/election/${electionId}/voting`)}
              >
                View Live Voting
              </Button>
            </Box>
          )}

          {Object.entries(grouped).map(([position, list]) => (
            <Box key={position} mt={5}>
              <Typography variant="h5" mb={2}>
                {position}
              </Typography>

              <Stack direction="row" spacing={3} flexWrap="wrap">
                {list.map((c) => (
                  <CandidateCard
                    key={c.candidate_id}
                    candidate_id={c.candidate_id}
                    election_id={electionId}
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
              </Stack>

              <Divider sx={{ mt: 4 }} />
            </Box>
          ))}
        </Box>
        <Footer />
      </Box>
    </>
  );
}
