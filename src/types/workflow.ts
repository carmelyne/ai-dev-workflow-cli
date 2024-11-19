export interface WorkflowStep {
  description: string;
  command?: string;
  guidelines?: string[];
  files?: string[];
  steps?: string[];
  [key: string]: unknown;
}

export interface Workflow {
  description: string;
  steps: Record<string, WorkflowStep>;
  [key: string]: unknown;
}

// Type guard to check if a value is a Workflow
export function isWorkflow(value: unknown): value is Workflow {
  if (!value || typeof value !== 'object') return false;
  
  const workflow = value as Workflow;
  return (
    typeof workflow.description === 'string' &&
    typeof workflow.steps === 'object' &&
    workflow.steps !== null
  );
}

// Type guard to check if a value is a WorkflowStep
export function isWorkflowStep(value: unknown): value is WorkflowStep {
  if (!value || typeof value !== 'object') return false;
  
  const step = value as WorkflowStep;
  return typeof step.description === 'string';
}
