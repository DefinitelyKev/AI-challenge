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
  const isNewRule = rule.id.startsWith("new-rule-");

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
      value: "",
    });
  };

  const onSubmit = (data: TriageRule) => {
    onSave(data);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        {isNewRule ? "Add" : "Edit"} Rule
      </Typography>

      {errors.root && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errors.root.message}
        </Alert>
      )}

      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{ display: "flex", flexDirection: "column", gap: 3.5 }}
      >
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
          <Typography variant="subtitle1" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
            Conditions (all must match)
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mb: fields.length > 0 ? 2.5 : 0 }}>
            {fields.map((field, index) => (
              <Box key={field.id} sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                <Controller
                  name={`conditions.${index}.field`}
                  control={control}
                  render={({ field }) => (
                    <FormControl sx={{ minWidth: 140, flex: 0.35 }}>
                      <InputLabel>Field</InputLabel>
                      <Select {...field} label="Field" size="small">
                        {config.conditionFields.map((condField) => (
                          <MenuItem key={condField.name} value={condField.name}>
                            {condField.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />

                {/* Static "is" text */}
                <Typography
                  variant="body2"
                  sx={{
                    alignSelf: "center",
                    color: "text.secondary",
                    fontWeight: 500,
                    px: 0.5,
                  }}
                >
                  is
                </Typography>

                <Controller
                  name={`conditions.${index}.value`}
                  control={control}
                  render={({ field: { value, onChange, ...rest } }) => {
                    const currentField = config.conditionFields.find((f) => f.name === fields[index].field);

                    if (currentField?.type === "select") {
                      return (
                        <FormControl sx={{ flex: 1 }}>
                          <InputLabel shrink={!!value || value === ""}>Value</InputLabel>
                          <Select
                            {...rest}
                            value={value as string}
                            onChange={(e) => onChange(e.target.value)}
                            label="Value"
                            size="small"
                            displayEmpty
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

                    const placeholders: Record<string, string> = {
                      location: "e.g., United States, France, APAC",
                      department: "e.g., Engineering, Sales, HR",
                    };
                    const placeholder = placeholders[currentField?.name || ""] || "Enter value";

                    return (
                      <TextField
                        {...rest}
                        sx={{ flex: 1 }}
                        label="Value"
                        value={value as string}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        size="small"
                        slotProps={{ inputLabel: { shrink: true } }}
                      />
                    );
                  }}
                />

                <IconButton color="error" onClick={() => remove(index)} aria-label="Remove condition" size="small">
                  <DeleteIcon fontSize="small" />
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
        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", pt: 1 }}>
          <Button variant="outlined" startIcon={<CancelIcon />} onClick={onCancel} sx={{ minWidth: 110 }}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" startIcon={<SaveIcon />} sx={{ minWidth: 130 }}>
            Save Rule
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
