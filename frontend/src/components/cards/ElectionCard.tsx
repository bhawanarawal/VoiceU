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
  Paper,
  Grow,
  ClickAwayListener,
  MenuItem,
  MenuList,
  Popper,
  ButtonGroup,
  Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
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
  program?: string;
  organization?: string;
  affiliation?: string;
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

interface ApplySplitButtonProps {
  positions: Position[];
  electionId: number;
  disabled?: boolean;
}

const ApplySplitButton: React.FC<ApplySplitButtonProps> = ({
  positions,
  electionId,
  disabled = false,
}) => {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const handleClick = () => {
    if (disabled) return;
    navigate(
      `/candidate/new?electionId=${electionId}&positionId=${positions[selectedIndex].position_id}`
    );
  };

  const handleMenuItemClick = (index: number) => {
    if (disabled) return;
    setSelectedIndex(index);
    setOpen(false);
    navigate(
      `/candidate/new?electionId=${electionId}&positionId=${positions[index].position_id}`
    );
  };

  const handleToggle = () => {
    if (!disabled) setOpen((prev) => !prev);
  };

  const handleClose = (event: Event) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    )
      return;
    setOpen(false);
  };

  if (positions.length === 0) return null;

  return (
    <>
      <ButtonGroup
        variant="contained"
        color="primary"
        ref={anchorRef}
        disabled={disabled}
        sx={{
          "& .MuiButton-root": { textTransform: "none", fontWeight: 500 },
          "& .MuiButton-root:hover": { boxShadow: !disabled ? 3 : 0 },
        }}
      >
        <Button onClick={handleClick}>Apply as</Button>
        <Button size="small" aria-haspopup="menu" onClick={handleToggle}>
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>

      <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal={false}
        sx={{
          zIndex: 1300,
          minWidth: anchorRef.current
            ? anchorRef.current.clientWidth
            : undefined,
        }}
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === "bottom" ? "center top" : "center bottom",
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id="split-button-menu" autoFocusItem>
                  {positions.map((p, index) => (
                    <MenuItem
                      key={p.position_id}
                      selected={index === selectedIndex}
                      onClick={() => handleMenuItemClick(index)}
                    >
                      {p.position_name}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
};

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
      <CardHeader
        title={
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{ fontFamily: "Roboto, Arial, sans-serif" }}
            >
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

      <CardActions sx={{ px: 1.5, pb: 1.5, gap: 1, flexWrap: "wrap" }}>
        {status === "Upcoming" && positions.length > 0 && (
          <>
            <ApplySplitButton
              positions={positions}
              electionId={electionId}
              disabled={false}
            />
            <Button
              variant="outlined"
              color="info"
              sx={{
                textTransform: "none",
                fontWeight: 500,
                "&:hover": { boxShadow: 3 },
              }}
              onClick={() => navigate(`/candidate?electionId=${electionId}`)}
            >
              View Candidates
            </Button>
          </>
        )}

        {status === "Ongoing" && positions.length > 0 && (
          <>
            <ApplySplitButton
              positions={positions}
              electionId={electionId}
              disabled={true}
            />
            <Button
              variant="outlined"
              color="success"
              sx={{
                textTransform: "none",
                fontWeight: 500,
                "&:hover": { boxShadow: 3 },
              }}
              onClick={() => navigate(`/candidate?electionId=${electionId}`)}
            >
              View Candidates
            </Button>
          </>
        )}

        {status === "Past" && (
          <Button
            variant="outlined"
            color="secondary"
            sx={{
              textTransform: "none",
              fontWeight: 500,
              "&:hover": { boxShadow: 3 },
            }}
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
          <Typography
            variant="body2"
            sx={{ whiteSpace: "pre-line", lineHeight: 1.6 }}
          >
            {description || "No description provided."}
          </Typography>
        </CardContent>
      </Collapse>
    </Card>
  );
}
