import { useEffect, useState, useRef } from "react";
import { Box, Typography, Button } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/api";

interface CandidateCount {
  candidate_id: number;
  candidate_name: string;
  position_id: number;
  position_name: string;
  count: number;
}

interface Position {
  id: number;
  name: string;
  candidates: CandidateCount[];
}

const MAX_BAR_HEIGHT = 200;

export default function VotingPage() {
  const { electionId } = useParams<{ electionId: string }>();
  const navigate = useNavigate();

  const [positions, setPositions] = useState<Position[]>([]);
  const [animatedVotes, setAnimatedVotes] = useState<Record<number, number>>(
    {}
  );
  const [isElectionOver, setIsElectionOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [electionEndTime, setElectionEndTime] = useState<Date | null>(null);

  const hasAnimated = useRef(false);

  const fetchVotes = async () => {
    if (!electionId) return;

    const electionRes = await api.get(`/elections/${electionId}`);
    const status = electionRes.data.status;
    const endDate = new Date(electionRes.data.end_date);
    setElectionEndTime(endDate);

    const diff = endDate.getTime() - Date.now();
    if (diff > 0) {
      const totalSeconds = Math.floor(diff / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s left`);
    }

    if (status === "past") {
      setIsElectionOver(true);
      navigate(`/election/result/${electionId}`, { replace: true });
      return;
    }

    const res = await api.get(`/votes/election/${electionId}/counts`);
    const allCandidates: CandidateCount[] = res.data;

    const grouped: Position[] = [];
    allCandidates.forEach((c) => {
      let pos = grouped.find((p) => p.name === c.position_name);
      if (!pos) {
        pos = { id: grouped.length + 1, name: c.position_name, candidates: [] };
        grouped.push(pos);
      }
      pos.candidates.push(c);
    });

    setPositions(grouped);

    const finalHeights: Record<number, number> = {};
    grouped.forEach((p) => {
      const totalVotes = p.candidates.reduce((s, c) => s + c.count, 0);
      p.candidates.forEach((c) => {
        finalHeights[c.candidate_id] =
          totalVotes === 0
            ? 0
            : Math.round((c.count / totalVotes) * MAX_BAR_HEIGHT);
      });
    });

    if (!hasAnimated.current) {
      const zeroHeights: Record<number, number> = {};
      allCandidates.forEach((c) => (zeroHeights[c.candidate_id] = 0));
      setAnimatedVotes(zeroHeights);

      setTimeout(() => {
        setAnimatedVotes(finalHeights);
        hasAnimated.current = true;
      }, 100);
    } else {
      setAnimatedVotes(finalHeights);
    }
  };

  useEffect(() => {
    fetchVotes();

    const interval = setInterval(() => {
      if (!electionEndTime) return;

      const diff = electionEndTime.getTime() - Date.now();

      if (diff <= 0) {
        setIsElectionOver(true);
        setTimeLeft("Election ended");
        navigate(`/election/result/${electionId}`, { replace: true });
      } else {
        const totalSeconds = Math.floor(diff / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        setTimeLeft(`${hours}h ${minutes}m ${seconds}s left`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [electionId, electionEndTime]);

  return (
    <Box sx={{ px: 1, py: 4, maxWidth: 1250, mx: "auto" }}>
      <Box sx={{ mb: 2 }}>
        <Button
          variant="outlined"
          sx={{
            position: "absolute",
            top: 20,
            left: 20,
          }}
          onClick={() => navigate(`/candidates?electionId=${electionId}`)}
        >
          ← Back to Candidates
        </Button>
      </Box>

      <Typography variant="h4" textAlign="center" fontWeight={700} mb={1}>
        {isElectionOver
          ? "Election Ended - Final Results"
          : "Live Voting Progress"}
      </Typography>

      {!isElectionOver && (
        <Typography textAlign="center" sx={{ mb: 3, color: "primary.main" }}>
          ⏳ {timeLeft}
        </Typography>
      )}

      {positions.map((pos) => {
        const totalVotes = pos.candidates.reduce((s, c) => s + c.count, 0);

        return (
          <Box key={pos.id} sx={{ mb: 9 }}>
            <Typography variant="h5" fontWeight={600} mb={2}>
              Candidate of {pos.name} Position
            </Typography>

            <Box
              sx={{
                display: "flex",
                gap: 2,
                alignItems: "flex-end",
                height: 200,
                mb: 2,
                overflow: "hidden",
              }}
            >
              {pos.candidates.map((c) => (
                <Box
                  key={c.candidate_id}
                  sx={{ textAlign: "center", minWidth: 50 }}
                >
                  <Box
                    sx={{
                      height: animatedVotes[c.candidate_id] || 0,
                      width: 30,
                      bgcolor: "primary.light",
                      borderRadius: "4px 4px 0 0",
                      transition: "height 0.8s ease",
                      mx: "auto",
                    }}
                  />
                  <Typography variant="body2" mt={0.5}>
                    {c.candidate_name}
                  </Typography>
                  <Typography variant="caption">
                    {totalVotes === 0
                      ? 0
                      : Math.round((c.count / totalVotes) * 100)}
                    %
                  </Typography>
                </Box>
              ))}
            </Box>

            <Box
              component="table"
              sx={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "center",
              }}
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
                </Box>
              </Box>
              <Box component="tbody">
                {pos.candidates.map((c) => (
                  <Box component="tr" key={c.candidate_name}>
                    <Box component="td" sx={{ border: 1, p: 1 }}>
                      {c.candidate_name}
                    </Box>
                    <Box component="td" sx={{ border: 1, p: 1 }}>
                      {c.count}
                    </Box>
                    <Box component="td" sx={{ border: 1, p: 1 }}>
                      {totalVotes === 0
                        ? 0
                        : Math.round((c.count / totalVotes) * 100)}
                      %
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
