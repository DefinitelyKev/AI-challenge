import { Box } from "@mui/material";
import { RuleCard } from "./RuleCard";
import { EmptyState } from "../ui";
import type { TriageRule } from "../../schemas";

interface RuleListProps {
  rules: TriageRule[];
  onEdit: (rule: TriageRule) => void;
  onDelete: (ruleId: string) => void;
}

export function RuleList({ rules, onEdit, onDelete }: RuleListProps) {
  if (rules.length === 0) {
    return <EmptyState message="No rules configured yet." />;
  }

  // Sort rules by priority (lower number = higher priority)
  const sortedRules = [...rules].sort((a, b) => a.priority - b.priority);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {sortedRules.map((rule) => (
        <RuleCard key={rule.id} rule={rule} onEdit={() => onEdit(rule)} onDelete={() => onDelete(rule.id)} />
      ))}
    </Box>
  );
}
