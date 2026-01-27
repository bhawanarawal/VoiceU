import * as React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Collapse,
  IconButton,
  Typography,
  Chip,
  Stack,
  Divider,
  useTheme,
  Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EventIcon from "@mui/icons-material/Event";
import BusinessIcon from "@mui/icons-material/Business";
import GroupsIcon from "@mui/icons-material/Groups";

interface Position {
  position_id: number;
  position_name: string;
}

interface ElectionCardProps {
  electionId: number;
  title: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  positions?: Position[];
  group?: string;
  organization?: string;
  status: "upcoming" | "ongoing" | "past";
}

const ExpandMore = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== "expand",
})<{ expand: boolean }>(({ theme, expand }) => ({
  marginLeft: "auto",
  transform: expand ? "rotate(180deg)" : "rotate(0deg)",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

const getStatusColor = (
  status: "upcoming" | "ongoing" | "past",
  theme: any,
) => {
  switch (status) {
    case "upcoming":
      return theme.palette.info.main;
    case "ongoing":
      return theme.palette.success.main;
    case "past":
    default:
      return theme.palette.grey[700];
  }
};

export default function ElectionCard({
  electionId,
  title,
  description,
  startDateTime,
  endDateTime,
  positions = [],
  group,
  organization,
  status,
}: ElectionCardProps) {
  const [expanded, setExpanded] = React.useState(false);
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Card
      sx={{
        width: "100%",
        "&:hover": { boxShadow: 6, transition: "0.3s" },
      }}
    >
      <CardHeader
        title={
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              sx={{
                bgcolor: getStatusColor(status, theme),
                width: 36,
                height: 36,
              }}
            >
              <HowToVoteIcon fontSize="small" />
            </Avatar>

            <Typography variant="h6" fontWeight={700}>
              {title}
            </Typography>

            <Chip
              label={status}
              size="small"
              sx={{
                color: theme.palette.getContrastText(
                  getStatusColor(status, theme),
                ),
                backgroundColor: getStatusColor(status, theme),
                fontWeight: 500,
                textTransform: "capitalize",
              }}
            />
          </Stack>
        }
        subheader={
          <Stack spacing={0.5} mt={1}>
            <Stack direction="row" spacing={1} alignItems="center">
              <EventIcon fontSize="small" color="action" />
              <Typography variant="body2">
                <strong>Start:</strong> {startDateTime}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <AccessTimeIcon fontSize="small" color="action" />
              <Typography variant="body2">
                <strong>End:</strong> {endDateTime}
              </Typography>
            </Stack>
          </Stack>
        }
      />

      <CardContent sx={{ pt: 0, pb: 1 }}>
        <Stack spacing={0.5}>
          {organization && (
            <Stack direction="row" spacing={1} alignItems="center">
              <BusinessIcon fontSize="small" color="action" />
              <Typography variant="body2">
                <strong>Organization:</strong> {organization}
              </Typography>
            </Stack>
          )}

          {group && (
            <Stack direction="row" spacing={1} alignItems="center">
              <GroupsIcon fontSize="small" color="action" />
              <Typography variant="body2">
                <strong>Group:</strong> {group}
              </Typography>
            </Stack>
          )}
        </Stack>

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" gutterBottom>
          <strong>Available Positions:</strong>
        </Typography>

        {positions.length > 0 ? (
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {positions.map((p) => (
              <Chip
                key={p.position_id}
                label={p.position_name}
                size="small"
                variant="outlined"
                sx={{ boxShadow: 1 }}
              />
            ))}
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No positions available
          </Typography>
        )}
      </CardContent>

      <CardActions sx={{ px: 1.5, pb: 1.5, gap: 1, flexWrap: "wrap" }}>
        {status === "upcoming" && positions.length > 0 && (
          <>
            <Button
              variant="contained"
              color="primary"
              sx={{ textTransform: "none", fontWeight: 500 }}
              onClick={() =>
                navigate(`/candidate/new?electionId=${electionId}`)
              }
            >
              Apply as Candidate
            </Button>

            <Button
              variant="outlined"
              color="info"
              sx={{ textTransform: "none", fontWeight: 500 }}
              onClick={() => navigate(`/candidates?electionId=${electionId}`)}
            >
              View Candidates
            </Button>
          </>
        )}

        {status === "ongoing" && positions.length > 0 && (
          <Button
            variant="contained"
            color="success"
            startIcon={<HowToVoteIcon />}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              boxShadow: 2,
              "&:hover": {
                transform: "scale(1.03)",
                boxShadow: 4,
              },
            }}
            onClick={() => navigate(`/candidates?electionId=${electionId}`)}
          >
            Vote
          </Button>
        )}

        {status === "past" && (
          <Button
            variant="outlined"
            color="secondary"
            sx={{ textTransform: "none", fontWeight: 500 }}
            onClick={() => navigate(`/election/result/${electionId}`)}
          >
            View Result
          </Button>
        )}

        <ExpandMore
          expand={expanded}
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
        >
          <ExpandMoreIcon />
        </ExpandMore>
      </CardActions>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Divider sx={{ mb: 1 }} />
          <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
            {description || "No description provided."}
          </Typography>
        </CardContent>
      </Collapse>
    </Card>
  );
}
