import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Stack,
  CircularProgress,
  Divider,
} from "@mui/material";
import { useSearchParams } from "react-router-dom";
import CandidateCard from "../../components/cards/CandidateCard";
import {
  getApprovedCandidatesByElection,
  voteForCandidate,
} from "./candidateService";

interface Candidate {
  candidate_id: number;
  full_name: string;
  photo_url?: string;
  manifesto?: string;
  position_name: string;
  program_name?: string;
  organization_name?: string;
  affiliation_name?: string;
}

export default function CandidatePage() {
  const [searchParams] = useSearchParams();
  const electionId = Number(searchParams.get("electionId"));

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [votedPositions, setVotedPositions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!electionId) return;

    getApprovedCandidatesByElection(electionId)
      .then((res) => setCandidates(res.data || []))
      .finally(() => setLoading(false));
  }, [electionId]);

  const handleVote = async (candidate: Candidate) => {
    try {
      await voteForCandidate({
        candidate_id: candidate.candidate_id,
        election_id: electionId,
      });

      alert("Vote cast successfully");

      setVotedPositions((prev) => [...prev, candidate.position_name]);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to vote");
    }
  };

  if (loading)
    return (
      <Box sx={{ textAlign: "center", mt: 6 }}>
        <CircularProgress />
      </Box>
    );

  const grouped: Record<string, Candidate[]> = {};
  candidates.forEach((c) => {
    grouped[c.position_name] ||= [];
    grouped[c.position_name].push(c);
  });

  return (
    <Box sx={{ px: 3, py: 4 }}>
      <Typography variant="h4" textAlign="center" fontWeight={700}>
        Approved Candidates
      </Typography>

      {Object.entries(grouped).map(([position, list]) => (
        <Box key={position} sx={{ mt: 5 }}>
          <Typography variant="h5" fontWeight={600}>
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
                program_name={c.program_name}
                organization_name={c.organization_name}
                affiliation_name={c.affiliation_name}
                manifesto={c.manifesto}
                hasVoted={votedPositions.includes(position)}
                onVote={() => handleVote(c)}
              />
            ))}
          </Stack>

          <Divider sx={{ mt: 4 }} />
        </Box>
      ))}
    </Box>
  );
}
