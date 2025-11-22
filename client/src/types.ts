export interface Condition {
  field: string;
  operator: 'equals' | 'contains' | 'in';
  value: string | string[];
}

export interface TriageRule {
  id: string;
  requestType: string;
  conditions: Condition[];
  assignee: string;
  priority: number;
}

export interface ConditionField {
  name: string;
  label: string;
  type: 'select' | 'text';
  options?: string[];
}

export interface TriageConfig {
  rules: TriageRule[];
  requestTypes: string[];
  conditionFields: ConditionField[];
}
