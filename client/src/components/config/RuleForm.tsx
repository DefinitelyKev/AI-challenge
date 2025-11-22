import { useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  FormHelperText,
  Button,
  Alert,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon, Save as SaveIcon, Cancel as CancelIcon } from "@mui/icons-material";
import { triageRuleSchema } from "../../schemas";
import type { TriageRule, TriageConfig } from "../../schemas";

interface RuleFormProps {
  rule: TriageRule;
  config: TriageConfig;
  onSave: (rule: TriageRule) => void;
  onCancel: () => void;
}

export function RuleForm({ rule, config, onSave, onCancel }: RuleFormProps) {
  const isNewRule = rule.id.startsWith("rule-");

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TriageRule>({
    resolver: zodResolver(triageRuleSchema),
    defaultValues: rule,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "conditions",
  });

  // Reset form when rule changes
  useEffect(() => {
    reset(rule);
  }, [rule, reset]);

  const handleAddCondition = () => {
    append({
      field: config.conditionFields[0]?.name || "location",
      operator: "equals",
      value: "",
    });
  };

  const onSubmit = (data: TriageRule) => {
    onSave(data);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        {isNewRule ? "Add" : "Edit"} Rule
      </Typography>

      {errors.root && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errors.root.message}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {/* Request Type */}
        <Controller
          name="requestType"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth error={!!errors.requestType}>
              <InputLabel>Request Type *</InputLabel>
              <Select {...field} label="Request Type *">
                {config.requestTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
              {errors.requestType && <FormHelperText>{errors.requestType.message}</FormHelperText>}
            </FormControl>
          )}
        />

        {/* Conditions */}
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Conditions (all must match)
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 2 }}>
            {fields.map((field, index) => (
              <Box key={field.id} sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                <Controller
                  name={`conditions.${index}.field`}
                  control={control}
                  render={({ field }) => (
                    <FormControl sx={{ minWidth: 150 }}>
                      <InputLabel>Field</InputLabel>
                      <Select {...field} label="Field">
                        {config.conditionFields.map((condField) => (
                          <MenuItem key={condField.name} value={condField.name}>
                            {condField.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />

                <Controller
                  name={`conditions.${index}.operator`}
                  control={control}
                  render={({ field }) => (
                    <FormControl sx={{ minWidth: 120 }}>
                      <InputLabel>Operator</InputLabel>
                      <Select {...field} label="Operator">
                        <MenuItem value="equals">equals</MenuItem>
                        <MenuItem value="contains">contains</MenuItem>
                        <MenuItem value="in">in</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />

                <Controller
                  name={`conditions.${index}.value`}
                  control={control}
                  render={({ field: { value, onChange, ...rest } }) => {
                    const currentField = config.conditionFields.find((f) => f.name === fields[index].field);

                    if (currentField?.type === "select") {
                      return (
                        <FormControl sx={{ flex: 1 }}>
                          <InputLabel>Value</InputLabel>
                          <Select
                            {...rest}
                            value={value as string}
                            onChange={(e) => onChange(e.target.value)}
                            label="Value"
                          >
                            <MenuItem value="">Select...</MenuItem>
                            {currentField.options?.map((opt) => (
                              <MenuItem key={opt} value={opt}>
                                {opt}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      );
                    }

                    return (
                      <TextField
                        {...rest}
                        sx={{ flex: 1 }}
                        label="Value"
                        value={value as string}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="Value"
                      />
                    );
                  }}
                />

                <IconButton color="error" onClick={() => remove(index)} aria-label="Remove condition">
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
          </Box>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddCondition}>
            Add Condition
          </Button>
        </Box>

        {/* Assignee Email */}
        <Controller
          name="assignee"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              required
              type="email"
              label="Assignee Email"
              placeholder="team-member@acme.corp"
              error={!!errors.assignee}
              helperText={errors.assignee?.message}
            />
          )}
        />

        {/* Priority */}
        <Controller
          name="priority"
          control={control}
          render={({ field: { value, onChange, ...rest } }) => (
            <FormControl fullWidth>
              <TextField
                {...rest}
                type="number"
                label="Priority"
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value) || 1)}
                inputProps={{ min: 1 }}
                error={!!errors.priority}
                helperText={errors.priority?.message || "Lower numbers have higher priority"}
              />
            </FormControl>
          )}
        />

        {/* Form Actions */}
        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
          <Button variant="outlined" startIcon={<CancelIcon />} onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" startIcon={<SaveIcon />}>
            Save Rule
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
