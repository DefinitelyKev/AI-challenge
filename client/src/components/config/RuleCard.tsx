import { Card, CardContent, CardActions, Box, Typography, Button, Chip, Fade } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon, ArrowForward } from "@mui/icons-material";
import type { TriageRule } from "../../schemas";
import { colors } from "../../lib/theme";

interface RuleCardProps {
  rule: TriageRule;
  onEdit: () => void;
  onDelete: () => void;
}

export function RuleCard({ rule, onEdit, onDelete }: RuleCardProps) {
  const conditionsText =
    rule.conditions.length > 0
      ? rule.conditions.map((c) => `${c.field} ${c.operator} "${c.value}"`).join(" AND ")
      : "No conditions (matches all)";

  return (
    <Fade in timeout={400}>
      <Card
        elevation={2}
        sx={{
          backgroundColor: colors.alpha.card,
          border: `1px solid ${colors.alpha.primary[15]}`,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: `0 8px 24px ${colors.alpha.primary[20]}`,
            borderColor: colors.alpha.primary[30],
          },
        }}
      >
        <CardContent sx={{ p: 3, pb: 2 }}>
          <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
            <Chip
              label={`#${rule.priority}`}
              color="primary"
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: "0.75rem",
                height: 28,
                minWidth: 44,
              }}
            />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 1.5 }}>
                {rule.requestType}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mb: 1.5,
                  p: 1.5,
                  borderRadius: 1,
                  backgroundColor: colors.alpha.white[2],
                  fontFamily: "monospace",
                  fontSize: "0.85rem",
                }}
              >
                {conditionsText}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <ArrowForward sx={{ fontSize: 18, color: "primary.main" }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: "primary.light" }}>
                  {rule.assignee}
                </Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
        <CardActions sx={{ justifyContent: "flex-end", px: 3, pt: 0, pb: 2 }}>
          <Button size="small" startIcon={<EditIcon />} onClick={onEdit} sx={{ minWidth: 80 }}>
            Edit
          </Button>
          <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={onDelete} sx={{ minWidth: 90 }}>
            Delete
          </Button>
        </CardActions>
      </Card>
    </Fade>
  );
}
