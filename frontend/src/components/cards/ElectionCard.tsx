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

/* ================= TYPES ================= */

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
  program?: string;
  organization?: string;
  affiliation?: string;
  status: "Upcoming" | "Ongoing" | "Past";
}

/* ================= STYLES ================= */

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
  status: "Upcoming" | "Ongoing" | "Past",
  theme: any
) => {
  switch (status) {
    case "Upcoming":
      return theme.palette.info.main;
    case "Ongoing":
      return theme.palette.success.main;
    case "Past":
    default:
      return theme.palette.grey[700];
  }
};

/* ================= COMPONENT ================= */

export default function ElectionCard({
  electionId,
  title,
  description,
  startDateTime,
  endDateTime,
  positions = [],
  program,
  organization,
  affiliation,
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
      {/* ===== HEADER ===== */}
      <CardHeader
        title={
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h6" fontWeight={700}>
              {title}
            </Typography>
            <Chip
              label={status}
              size="small"
              sx={{
                color: theme.palette.getContrastText(
                  getStatusColor(status, theme)
                ),
                backgroundColor: getStatusColor(status, theme),
                fontWeight: 500,
              }}
            />
          </Stack>
        }
        subheader={
          <Stack spacing={0.5} mt={1}>
            <Typography variant="body2">
              <strong>Start:</strong> {startDateTime}
            </Typography>
            <Typography variant="body2">
              <strong>End:</strong> {endDateTime}
            </Typography>
          </Stack>
        }
      />

      {/* ===== CONTENT ===== */}
      <CardContent sx={{ pt: 0, pb: 1 }}>
        <Stack spacing={0.5}>
          {organization && (
            <Typography variant="body2">
              <strong>Organization:</strong> {organization}
            </Typography>
          )}
          {program && (
            <Typography variant="body2">
              <strong>Program:</strong> {program}
            </Typography>
          )}
          {affiliation && (
            <Typography variant="body2">
              <strong>Affiliation:</strong> {affiliation}
            </Typography>
          )}
        </Stack>

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" gutterBottom>
          Available Positions
        </Typography>

        {positions.length > 0 ? (
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {positions.map((p) => (
              <Chip
                key={p.position_id}
                label={p.position_name}
                size="small"
                variant="outlined"
              />
            ))}
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No positions available
          </Typography>
        )}
      </CardContent>

      {/* ===== ACTIONS ===== */}
      <CardActions sx={{ px: 1.5, pb: 1.5, gap: 1, flexWrap: "wrap" }}>
        {/* UPCOMING */}
        {status === "Upcoming" && positions.length > 0 && (
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
              onClick={() => navigate(`/candidate?electionId=${electionId}`)}
            >
              View Candidates
            </Button>
          </>
        )}

        {/* ONGOING */}
        {status === "Ongoing" && (
          <Button
            variant="outlined"
            color="success"
            sx={{ textTransform: "none", fontWeight: 500 }}
            onClick={() => navigate(`/candidate?electionId=${electionId}`)}
          >
            View Candidates
          </Button>
        )}

        {/* PAST */}
        {status === "Past" && (
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

      {/* ===== DESCRIPTION ===== */}
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
