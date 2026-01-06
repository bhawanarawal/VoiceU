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
import { getApprovedCandidatesByElection } from "./candidateService";

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
  const electionIdParam = searchParams.get("electionId");
  const electionId = electionIdParam ? Number(electionIdParam) : null;

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!electionId) return;

    const fetchCandidates = async () => {
      try {
        const res = await getApprovedCandidatesByElection(electionId);
        console.log("Fetched candidates:", res.data);
        setCandidates(res.data || []);
      } catch (err) {
        console.error("Failed to fetch candidates:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, [electionId]);

  const handleVote = (candidate_id: number) => {
    console.log("Vote clicked for candidate", candidate_id);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (candidates.length === 0) {
    return (
      <Box sx={{ px: 3, py: 6, textAlign: "center" }}>
        <Typography variant="h6" color="text.secondary">
          No approved candidates found.
        </Typography>
      </Box>
    );
  }

  const candidatesByPosition: Record<string, Candidate[]> = {};
  candidates.forEach((c) => {
    if (!candidatesByPosition[c.position_name]) {
      candidatesByPosition[c.position_name] = [];
    }
    candidatesByPosition[c.position_name].push(c);
  });

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom textAlign="center">
        Approved Candidates
      </Typography>

      {Object.keys(candidatesByPosition).map((position) => (
        <Box key={position} sx={{ mb: 5 }}>
          <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
            Candidate of {position} Position :
          </Typography>

          <Stack spacing={3}>
            {candidatesByPosition[position].map((c) => (
              <CandidateCard
                key={c.candidate_id}
                full_name={c.full_name}
                photo_url={c.photo_url}
                position_name={c.position_name}
                program_name={c.program_name}
                organization_name={c.organization_name}
                affiliation_name={c.affiliation_name}
                manifesto={c.manifesto}
                onVote={() => handleVote(c.candidate_id)}
              />
            ))}
          </Stack>

          <Divider sx={{ mt: 4 }} />
        </Box>
      ))}
    </Box>
  );
}
