import { Card, CardContent, CardActions, Box, Typography, Button, Chip } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import type { TriageRule } from "../../schemas";

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
    <Card elevation={2}>
      <CardContent>
        <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
          <Chip label={`#${rule.priority}`} color="primary" size="small" sx={{ fontWeight: 600 }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom>
              {rule.requestType}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {conditionsText}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              → {rule.assignee}
            </Typography>
          </Box>
        </Box>
      </CardContent>
      <CardActions sx={{ justifyContent: "flex-end", px: 2, pb: 2 }}>
        <Button size="small" startIcon={<EditIcon />} onClick={onEdit}>
          Edit
        </Button>
        <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={onDelete}>
          Delete
        </Button>
      </CardActions>
    </Card>
  );
}
