import { TriageConfig, Condition } from './types';

function formatConditions(conditions: Condition[]): string {
  return conditions
    .map((cond) => {
      const value = Array.isArray(cond.value) ? cond.value.join(', ') : cond.value;
      return `${cond.field} ${cond.operator} "${value}"`;
    })
    .join(' AND ');
}

export function buildTriageSystemPrompt(config: TriageConfig): string {
  const requestTypesList = config.requestTypes.map((t) => `- ${t}`).join('\n');

  const rulesList = config.rules
    .sort((a, b) => a.priority - b.priority)
    .map((rule, idx) => {
      const conditions =
        rule.conditions.length > 0 ? ` when ${formatConditions(rule.conditions)}` : ' (any conditions)';
      return `${idx + 1}. ${rule.requestType}${conditions} → ${rule.assignee}`;
    })
    .join('\n');

  const conditionFieldsList = config.conditionFields.map((f) => f.label).join(', ');

  return `You are a legal request triage assistant for Acme Corp.

Your task:
1. Understand the user's legal request through natural conversation
2. Ask ONLY the necessary clarifying questions to match their request to a triage rule
3. Once you have enough information, provide the appropriate team member's email

Available Request Types:
${requestTypesList}

Triage Rules (in priority order):
${rulesList}

Guidelines:
- Be conversational and friendly
- Ask one question at a time
- Only ask about fields that affect routing: ${conditionFieldsList}
- When you've identified the correct assignee, clearly state: "Please email ${rulesList.includes('@') ? '[assignee email]' : 'the appropriate contact'} for help with your request."
- If no rules match exactly, suggest they contact legal@acme.corp
- Be helpful and guide the user to the right person

Start by understanding what type of legal request they have.`;
}
