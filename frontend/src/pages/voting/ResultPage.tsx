import { useEffect, useState } from "react";
import { Box, Typography, Button, Chip } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/api";

interface CandidateResult {
  candidate_id: number;
  candidate_name: string; // 🔑 use name instead of id
  position_name: string;
  count: number;
}

interface PositionResult {
  name: string;
  candidates: CandidateResult[];
}

const MAX_BAR_HEIGHT = 130;

export default function ResultPage() {
  const { electionId } = useParams<{ electionId: string }>();
  const navigate = useNavigate();
  const [positions, setPositions] = useState<PositionResult[]>([]);

  useEffect(() => {
    const fetchResults = async () => {
      const res = await api.get(`/votes/election/${electionId}/counts`);
      const data: CandidateResult[] = res.data;

      const grouped: PositionResult[] = [];

      data.forEach((c) => {
        let pos = grouped.find((p) => p.name === c.position_name);
        if (!pos) {
          pos = { name: c.position_name, candidates: [] };
          grouped.push(pos);
        }
        pos.candidates.push(c);
      });

      // Sort each position candidates by votes descending
      grouped.forEach((p) => p.candidates.sort((a, b) => b.count - a.count));

      setPositions(grouped);
    };

    fetchResults();
  }, [electionId]);

  return (
    <Box sx={{ px: 3, py: 4, maxWidth: 1100, mx: "auto" }}>
      <Button variant="outlined" sx={{ mb: 2 }} onClick={() => navigate(-1)}>
        ← Back
      </Button>

      <Typography variant="h4" fontWeight={700} textAlign="center" mb={4}>
        🏆 Election Results
      </Typography>

      {positions.map((pos) => {
        const totalVotes = pos.candidates.reduce((s, c) => s + c.count, 0);
        const winner = pos.candidates[0];

        return (
          <Box key={pos.name} sx={{ mb: 7 }}>
            {/* Position Title */}
            <Typography variant="h5" fontWeight={600} mb={1}>
              {pos.name}
            </Typography>

            {/* Winner Info */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
              <Chip label="🏆 Winner" color="success" />
              <Typography fontWeight={600}>
                {winner.candidate_name} — {winner.count} votes
              </Typography>
            </Box>

            {/* Vertical Bars */}
            <Box
              sx={{
                display: "flex",
                gap: 4,
                alignItems: "flex-end",
                height: 220,
                mb: 4,
              }}
            >
              {pos.candidates.map((c, index) => {
                const percent =
                  totalVotes === 0
                    ? 0
                    : Math.round((c.count / totalVotes) * 100);
                const height =
                  totalVotes === 0
                    ? 0
                    : Math.round((c.count / totalVotes) * MAX_BAR_HEIGHT);
                const isWinner = index === 0;

                return (
                  <Box key={c.candidate_id} sx={{ textAlign: "center" }}>
                    {isWinner && (
                      <Typography fontWeight={700} color="success.main">
                        🏆
                      </Typography>
                    )}

                    <Typography fontWeight={600}>{percent}%</Typography>

                    <Box
                      sx={{
                        height: isWinner ? height + 15 : height,
                        width: isWinner ? 42 : 36,
                        bgcolor: isWinner ? "success.main" : "primary.light",
                        borderRadius: "6px 6px 0 0",
                        mx: "auto",
                      }}
                    />

                    <Typography variant="body2" mt={1}>
                      {c.candidate_name}
                    </Typography>
                    <Typography variant="caption">{c.count} votes</Typography>
                  </Box>
                );
              })}
            </Box>

            {/* Result Table */}
            <Box
              component="table"
              sx={{ width: "100%", borderCollapse: "collapse", mt: 2 }}
            >
              <Box component="thead" sx={{ bgcolor: "grey.100" }}>
                <Box component="tr">
                  <Box component="th" sx={{ border: 1, p: 1 }}>
                    Candidate
                  </Box>
                  <Box component="th" sx={{ border: 1, p: 1 }}>
                    Votes
                  </Box>
                  <Box component="th" sx={{ border: 1, p: 1 }}>
                    Percentage
                  </Box>
                  <Box component="th" sx={{ border: 1, p: 1 }}>
                    Status
                  </Box>
                </Box>
              </Box>

              <Box component="tbody">
                {pos.candidates.map((c, index) => {
                  const percent =
                    totalVotes === 0
                      ? 0
                      : Math.round((c.count / totalVotes) * 100);
                  return (
                    <Box
                      component="tr"
                      key={c.candidate_id}
                      sx={{
                        bgcolor: index === 0 ? "success.light" : "transparent",
                      }}
                    >
                      <Box component="td" sx={{ border: 1, p: 1 }}>
                        {c.candidate_name}
                      </Box>
                      <Box component="td" sx={{ border: 1, p: 1 }}>
                        {c.count}
                      </Box>
                      <Box component="td" sx={{ border: 1, p: 1 }}>
                        {percent}%
                      </Box>
                      <Box component="td" sx={{ border: 1, p: 1 }}>
                        {index === 0 ? "🏆 Winner" : "-"}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
