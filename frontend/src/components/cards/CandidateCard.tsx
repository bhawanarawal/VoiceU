import {
  Card,
  CardContent,
  CardActions,
  Avatar,
  Typography,
  Button,
  Stack,
  Divider,
  Collapse,
  IconButton,
} from "@mui/material";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useState } from "react";

interface CandidateCardProps {
  candidate_id: number;
  election_id: number;
  full_name: string;
  photo_url?: string;
  position_name: string;
  program_name?: string;
  organization_name?: string;
  affiliation_name?: string;
  manifesto?: string;
  hasVoted?: boolean;
  onVote: (candidate_id: number, election_id: number) => void;
}

export default function CandidateCard({
  candidate_id,
  election_id,
  full_name,
  photo_url,
  position_name,
  program_name,
  organization_name,
  affiliation_name,
  manifesto,
  hasVoted = false,
  onVote,
}: CandidateCardProps) {
  const [showManifesto, setShowManifesto] = useState(false);

  return (
    <Card
      sx={{
        width: 300,
        margin: "auto",
        boxShadow: 3,
        transition: "0.3s",
        "&:hover": { boxShadow: 6, transform: "scale(1.0)" },
        borderRadius: 0,
      }}
    >
      <Stack alignItems="center" spacing={1} sx={{ mt: 2 }}>
        <Avatar
          src={
            photo_url
              ? `http://localhost:8000${
                  "/" + photo_url.replace(/\\/g, "/").replace(/^\/+/, "")
                }`
              : undefined
          }
          alt={full_name}
          sx={{ width: 90, height: 90 }}
        />

        <Typography variant="h6" fontWeight={700} textAlign="center">
          {full_name}
        </Typography>
      </Stack>

      <Divider sx={{ my: 1 }} />

      <CardContent>
        <Stack spacing={0.5}>
          <Typography variant="body2">
            <strong>Position:</strong> {position_name}
          </Typography>
          {program_name && (
            <Typography variant="body2">
              <strong>Program:</strong> {program_name}
            </Typography>
          )}
          {organization_name && (
            <Typography variant="body2">
              <strong>Organization:</strong> {organization_name}
            </Typography>
          )}
          {affiliation_name && (
            <Typography variant="body2">
              <strong>Affiliation:</strong> {affiliation_name}
            </Typography>
          )}

          {manifesto && (
            <>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography variant="body1">
                  <strong>Manifesto:</strong>
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setShowManifesto((prev) => !prev)}
                >
                  <ExpandMoreIcon
                    sx={{
                      transform: showManifesto
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                      transition: "0.3s",
                    }}
                  />
                </IconButton>
              </Stack>

              <Collapse in={showManifesto} timeout="auto" unmountOnExit>
                <Typography
                  variant="body2"
                  sx={{ mt: 0.5, wordBreak: "break-word" }}
                >
                  {manifesto}
                </Typography>
              </Collapse>
            </>
          )}
        </Stack>
      </CardContent>

      <Divider />

      <CardActions sx={{ justifyContent: "center", pb: 2 }}>
        <Button
          variant="contained"
          color="success"
          startIcon={<ThumbUpIcon />}
          size="medium"
          onClick={() => onVote(candidate_id, election_id)}
          disabled={hasVoted}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            borderRadius: 2,
            px: 3,
          }}
        >
          {hasVoted ? "Voted" : "Vote"}
        </Button>
      </CardActions>
    </Card>
  );
}
