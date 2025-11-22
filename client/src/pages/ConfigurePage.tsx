import { useState } from "react";
import { Container, Typography, Box, Button, Paper } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { useConfig, useCreateRule, useUpdateRule, useDeleteRule } from "../hooks";
import { RuleList, RuleForm } from "../components/config";
import { Loading, ErrorDisplay } from "../components/ui";
import type { TriageRule } from "../schemas";

export default function ConfigurePage() {
  const [editingRule, setEditingRule] = useState<TriageRule | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // TanStack Query hooks for data fetching and mutations
  const { data: config, isLoading, error, refetch } = useConfig();
  const createRule = useCreateRule();
  const updateRule = useUpdateRule();
  const deleteRule = useDeleteRule();

  /**
   * Opens form for creating a new rule
   */
  const handleAddRule = () => {
    if (!config) return;

    const newRule: TriageRule = {
      id: `rule-${Date.now()}`,
      requestType: config.requestTypes[0] || "",
      conditions: [],
      assignee: "",
      priority: (config.rules.length || 0) + 1,
    };
    setEditingRule(newRule);
    setIsFormOpen(true);
  };

  /**
   * Opens form for editing an existing rule
   */
  const handleEditRule = (rule: TriageRule) => {
    setEditingRule({ ...rule });
    setIsFormOpen(true);
  };

  /**
   * Deletes a rule with confirmation
   */
  const handleDeleteRule = (ruleId: string) => {
    if (!confirm("Are you sure you want to delete this rule?")) {
      return;
    }

    deleteRule.mutate(ruleId);
  };

  /**
   * Saves a rule (create or update)
   */
  const handleSaveRule = (rule: TriageRule) => {
    const isNew = !config?.rules.find((r) => r.id === rule.id);

    if (isNew) {
      const { id, ...ruleWithoutId } = rule;
      createRule.mutate(ruleWithoutId, {
        onSuccess: () => {
          setIsFormOpen(false);
          setEditingRule(null);
        },
      });
    } else {
      updateRule.mutate(
        { id: rule.id, rule },
        {
          onSuccess: () => {
            setIsFormOpen(false);
            setEditingRule(null);
          },
        }
      );
    }
  };

  /**
   * Cancels form and closes it
   */
  const handleCancelEdit = () => {
    setIsFormOpen(false);
    setEditingRule(null);
  };

  // Loading state
  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Configuration
        </Typography>
        <Loading message="Loading configuration..." />
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Configuration
        </Typography>
        <ErrorDisplay error={error.message} onRetry={() => refetch()} />
      </Container>
    );
  }

  // No config state
  if (!config) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Configuration
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          No configuration available
        </Typography>
      </Container>
    );
  }

  // Main UI with configuration
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Triage Configuration
      </Typography>

      {/* Mutation errors */}
      {createRule.error && <ErrorDisplay error={createRule.error.message} onDismiss={() => createRule.reset()} />}
      {updateRule.error && <ErrorDisplay error={updateRule.error.message} onDismiss={() => updateRule.reset()} />}
      {deleteRule.error && <ErrorDisplay error={deleteRule.error.message} onDismiss={() => deleteRule.reset()} />}

      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h5" component="h2">
            Triage Rules
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddRule}>
            Add New Rule
          </Button>
        </Box>

        {/* Form */}
        {isFormOpen && editingRule && (
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <RuleForm rule={editingRule} config={config} onSave={handleSaveRule} onCancel={handleCancelEdit} />
          </Paper>
        )}

        {/* Rules List */}
        <RuleList rules={config.rules} onEdit={handleEditRule} onDelete={handleDeleteRule} />
      </Box>
    </Container>
  );
}
