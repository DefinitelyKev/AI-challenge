import { Box, Paper } from "@mui/material";
import { RuleCard } from "./RuleCard";
import { RuleForm } from "./RuleForm";
import { EmptyState } from "../ui";
import type { TriageRule, TriageConfig } from "../../schemas";
import { colors } from "../../lib/theme";

interface RuleListProps {
  rules: TriageRule[];
  onEdit: (rule: TriageRule) => void;
  onDelete: (ruleId: string) => void;
  onMoveUp: (ruleId: string) => void;
  onMoveDown: (ruleId: string) => void;
  editingRule: TriageRule | null;
  config: TriageConfig;
  onSave: (rule: TriageRule) => void;
  onCancel: () => void;
}

export function RuleList({ rules, onEdit, onDelete, onMoveUp, onMoveDown, editingRule, config, onSave, onCancel }: RuleListProps) {
  if (rules.length === 0) {
    return <EmptyState message="No rules configured yet." />;
  }

  // Sort rules by priority (lower number = higher priority)
  const sortedRules = [...rules].sort((a, b) => a.priority - b.priority);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {sortedRules.map((rule, index) => {
        const canMoveUp = index > 0;
        const canMoveDown = index < sortedRules.length - 1;

        return (
          <Box key={rule.id}>
            {editingRule?.id === rule.id ? (
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  backgroundColor: colors.alpha.card,
                  border: `1px solid ${colors.alpha.primary[20]}`,
                }}
              >
                <RuleForm rule={editingRule} config={config} onSave={onSave} onCancel={onCancel} />
              </Paper>
            ) : (
              <RuleCard
                rule={rule}
                onEdit={() => onEdit(rule)}
                onDelete={() => onDelete(rule.id)}
                onMoveUp={() => onMoveUp(rule.id)}
                onMoveDown={() => onMoveDown(rule.id)}
                canMoveUp={canMoveUp}
                canMoveDown={canMoveDown}
              />
            )}
          </Box>
        );
      })}
    </Box>
  );
}
