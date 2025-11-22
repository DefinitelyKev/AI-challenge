import { useEffect, useState } from "react";
import { TriageConfig, TriageRule, Condition } from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000";

export default function ConfigurePage() {
  const [config, setConfig] = useState<TriageConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingRule, setEditingRule] = useState<TriageRule | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/config`);
      if (!response.ok) {
        throw new Error("Failed to fetch configuration");
      }
      const data = await response.json();
      setConfig(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRule = () => {
    const newRule: TriageRule = {
      id: `rule-${Date.now()}`,
      requestType: config?.requestTypes[0] || "",
      conditions: [],
      assignee: "",
      priority: (config?.rules.length || 0) + 1,
    };
    setEditingRule(newRule);
    setIsFormOpen(true);
  };

  const handleEditRule = (rule: TriageRule) => {
    setEditingRule({ ...rule });
    setIsFormOpen(true);
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm("Are you sure you want to delete this rule?")) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/config/rules/${ruleId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete rule");
      }
      const updatedConfig = await response.json();
      setConfig(updatedConfig);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete rule");
    }
  };

  const handleSaveRule = async (rule: TriageRule) => {
    try {
      const isNew = !config?.rules.find((r) => r.id === rule.id);
      const url = isNew
        ? `${API_BASE_URL}/api/config/rules`
        : `${API_BASE_URL}/api/config/rules/${rule.id}`;
      const method = isNew ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rule),
      });

      if (!response.ok) {
        throw new Error("Failed to save rule");
      }

      const updatedConfig = await response.json();
      setConfig(updatedConfig);
      setIsFormOpen(false);
      setEditingRule(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save rule");
    }
  };

  const handleCancelEdit = () => {
    setIsFormOpen(false);
    setEditingRule(null);
  };

  if (isLoading) {
    return (
      <div className="configure-page">
        <h1>Configuration</h1>
        <p>Loading configuration...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="configure-page">
        <h1>Configuration</h1>
        <div className="error">{error}</div>
        <button onClick={fetchConfig}>Retry</button>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="configure-page">
        <h1>Configuration</h1>
        <p>No configuration available</p>
      </div>
    );
  }

  return (
    <div className="configure-page">
      <h1>Triage Configuration</h1>

      {error && <div className="error">{error}</div>}

      <div className="config-section">
        <div className="section-header">
          <h2>Triage Rules</h2>
          <button onClick={handleAddRule} className="btn-primary">
            Add New Rule
          </button>
        </div>

        {isFormOpen && editingRule && (
          <RuleForm
            rule={editingRule}
            config={config}
            onSave={handleSaveRule}
            onCancel={handleCancelEdit}
          />
        )}

        <div className="rules-list">
          {config.rules.length === 0 ? (
            <p className="placeholder">No rules configured yet.</p>
          ) : (
            config.rules
              .sort((a, b) => a.priority - b.priority)
              .map((rule) => (
                <RuleCard
                  key={rule.id}
                  rule={rule}
                  onEdit={() => handleEditRule(rule)}
                  onDelete={() => handleDeleteRule(rule.id)}
                />
              ))
          )}
        </div>
      </div>
    </div>
  );
}

interface RuleCardProps {
  rule: TriageRule;
  onEdit: () => void;
  onDelete: () => void;
}

function RuleCard({ rule, onEdit, onDelete }: RuleCardProps) {
  const conditionsText =
    rule.conditions.length > 0
      ? rule.conditions
          .map((c) => `${c.field} ${c.operator} "${c.value}"`)
          .join(" AND ")
      : "No conditions (matches all)";

  return (
    <div className="rule-card">
      <div className="rule-content">
        <div className="rule-priority">#{rule.priority}</div>
        <div className="rule-details">
          <div className="rule-type">{rule.requestType}</div>
          <div className="rule-conditions">{conditionsText}</div>
          <div className="rule-assignee">→ {rule.assignee}</div>
        </div>
      </div>
      <div className="rule-actions">
        <button onClick={onEdit} className="btn-secondary">
          Edit
        </button>
        <button onClick={onDelete} className="btn-danger">
          Delete
        </button>
      </div>
    </div>
  );
}

interface RuleFormProps {
  rule: TriageRule;
  config: TriageConfig;
  onSave: (rule: TriageRule) => void;
  onCancel: () => void;
}

function RuleForm({ rule, config, onSave, onCancel }: RuleFormProps) {
  const [formRule, setFormRule] = useState<TriageRule>(rule);

  const handleAddCondition = () => {
    const newCondition: Condition = {
      field: config.conditionFields[0]?.name || "location",
      operator: "equals",
      value: "",
    };
    setFormRule({
      ...formRule,
      conditions: [...formRule.conditions, newCondition],
    });
  };

  const handleRemoveCondition = (index: number) => {
    setFormRule({
      ...formRule,
      conditions: formRule.conditions.filter((_, i) => i !== index),
    });
  };

  const handleConditionChange = (
    index: number,
    field: keyof Condition,
    value: string
  ) => {
    const newConditions = [...formRule.conditions];
    newConditions[index] = { ...newConditions[index], [field]: value };
    setFormRule({ ...formRule, conditions: newConditions });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRule.assignee || !formRule.requestType) {
      alert("Please fill in all required fields");
      return;
    }
    onSave(formRule);
  };

  return (
    <div className="rule-form">
      <h3>{rule.id.startsWith("rule-") && rule.id.includes(Date.now().toString().substring(0, 8)) ? "Add" : "Edit"} Rule</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Request Type *</label>
          <select
            value={formRule.requestType}
            onChange={(e) =>
              setFormRule({ ...formRule, requestType: e.target.value })
            }
            required
          >
            {config.requestTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Conditions (all must match)</label>
          <div className="conditions-list">
            {formRule.conditions.map((condition, index) => (
              <div key={index} className="condition-row">
                <select
                  value={condition.field}
                  onChange={(e) =>
                    handleConditionChange(index, "field", e.target.value)
                  }
                >
                  {config.conditionFields.map((field) => (
                    <option key={field.name} value={field.name}>
                      {field.label}
                    </option>
                  ))}
                </select>

                <select
                  value={condition.operator}
                  onChange={(e) =>
                    handleConditionChange(index, "operator", e.target.value)
                  }
                >
                  <option value="equals">equals</option>
                  <option value="contains">contains</option>
                  <option value="in">in</option>
                </select>

                {config.conditionFields.find((f) => f.name === condition.field)
                  ?.type === "select" ? (
                  <select
                    value={condition.value as string}
                    onChange={(e) =>
                      handleConditionChange(index, "value", e.target.value)
                    }
                  >
                    <option value="">Select...</option>
                    {config.conditionFields
                      .find((f) => f.name === condition.field)
                      ?.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={condition.value as string}
                    onChange={(e) =>
                      handleConditionChange(index, "value", e.target.value)
                    }
                    placeholder="Value"
                  />
                )}

                <button
                  type="button"
                  onClick={() => handleRemoveCondition(index)}
                  className="btn-danger-small"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={handleAddCondition}
            className="btn-secondary"
          >
            + Add Condition
          </button>
        </div>

        <div className="form-group">
          <label>Assignee Email *</label>
          <input
            type="email"
            value={formRule.assignee}
            onChange={(e) =>
              setFormRule({ ...formRule, assignee: e.target.value })
            }
            placeholder="team-member@acme.corp"
            required
          />
        </div>

        <div className="form-group">
          <label>Priority</label>
          <input
            type="number"
            value={formRule.priority}
            onChange={(e) =>
              setFormRule({
                ...formRule,
                priority: parseInt(e.target.value) || 1,
              })
            }
            min="1"
          />
          <small>Lower numbers have higher priority</small>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            Save Rule
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
