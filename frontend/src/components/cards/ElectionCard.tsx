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
  status: "Upcoming" | "Ongoing" | "Past";
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

      <CardContent sx={{ pt: 0, pb: 1 }}>
        <Stack spacing={0.5}>
          {organization && (
            <Typography variant="body2">
              <strong>Organization Name:</strong> {organization}
            </Typography>
          )}
          {group && (
            <Typography variant="body2">
              <strong>Group:</strong> {group}
            </Typography>
          )}
        </Stack>

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="subtitle2" gutterBottom>
          Available Positions:
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

      <CardActions sx={{ px: 1.5, pb: 1.5, gap: 1, flexWrap: "wrap" }}>
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
              onClick={() => navigate(`/candidates?electionId=${electionId}`)}
            >
              View Candidates
            </Button>
          </>
        )}

        {status === "Ongoing" && (
          <Button
            variant="outlined"
            color="success"
            sx={{ textTransform: "none", fontWeight: 500 }}
            onClick={() => navigate(`/candidates?electionId=${electionId}`)}
          >
            View Candidates
          </Button>
        )}

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
