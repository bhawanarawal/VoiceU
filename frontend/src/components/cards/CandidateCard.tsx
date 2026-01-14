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
  group_name?: string;
  organization_name?: string;
  manifesto?: string;
  hasVoted: boolean;
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
  onVote,
}: CandidateCardProps) {
  const [showManifesto, setShowManifesto] = useState(false);

  return (
    <Card sx={{ width: 280, boxShadow: 3 }}>
      <Stack alignItems="center" spacing={1} sx={{ mt: 2 }}>
        <Avatar
          src={
            photo_url
              ? `http://localhost:8000/${photo_url
                  .replace(/\\/g, "/")
                  .replace(/^\/+/, "")}`
              : undefined
          }
          sx={{ width: 90, height: 90 }}
        />
        <Typography fontWeight={700}>{full_name}</Typography>
      </Stack>

      <Divider sx={{ my: 1 }} />

      <CardContent>
        <Typography variant="body2">
          <strong>Position:</strong> {position_name}
        </Typography>
        {group_name && (
          <Typography variant="body2">
            <strong>Group: </strong>
            {group_name}
          </Typography>
        )}
        {organization_name && (
          <Typography variant="body2">
            <strong> Organization Name:</strong> {organization_name}
          </Typography>
        )}
        <Typography variant="body2">
          <strong>Manifesto:</strong>
        </Typography>
        {manifesto && (
          <>
            <IconButton onClick={() => setShowManifesto(!showManifesto)}>
              <ExpandMoreIcon />
            </IconButton>
            <Collapse in={showManifesto}>
              <Typography>{manifesto}</Typography>
            </Collapse>
          </>
        )}
      </CardContent>

      <Divider />

      <CardActions sx={{ justifyContent: "center" }}>
        <Button
          variant="contained"
          color="success"
          startIcon={<ThumbUpIcon />}
          disabled={hasVoted}
          onClick={onVote}
        >
          {hasVoted ? "Voted" : "Vote"}
        </Button>
      </CardActions>
    </Card>
  );
}
