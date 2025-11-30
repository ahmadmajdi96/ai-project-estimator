import { supabase } from '@/integrations/supabase/client';

export interface WorkflowTriggerContext {
  trigger_type: string;
  entity_type: string;
  entity_id: string;
  old_value?: any;
  new_value?: any;
  metadata?: Record<string, any>;
}

interface WorkflowRule {
  id: string;
  name: string;
  trigger_type: string;
  trigger_config: Record<string, any>;
  action_type: string;
  action_config: Record<string, any>;
  is_active: boolean;
}

export const executeWorkflowTrigger = async (context: WorkflowTriggerContext) => {
  try {
    // Fetch active workflow rules matching the trigger type
    const { data: rules, error: rulesError } = await supabase
      .from('workflow_rules')
      .select('*')
      .eq('trigger_type', context.trigger_type)
      .eq('is_active', true);

    if (rulesError) {
      console.error('Error fetching workflow rules:', rulesError);
      return;
    }

    if (!rules || rules.length === 0) return;

    for (const rule of rules as WorkflowRule[]) {
      const shouldExecute = evaluateTriggerConditions(rule, context);
      
      if (shouldExecute) {
        await executeAction(rule, context);
      }
    }
  } catch (error) {
    console.error('Error executing workflow trigger:', error);
  }
};

const evaluateTriggerConditions = (rule: WorkflowRule, context: WorkflowTriggerContext): boolean => {
  const config = rule.trigger_config;

  switch (rule.trigger_type) {
    case 'stage_change':
      if (config.from_stage && config.from_stage !== 'any' && config.from_stage !== context.old_value) {
        return false;
      }
      if (config.to_stage && config.to_stage !== 'any' && config.to_stage !== context.new_value) {
        return false;
      }
      return true;

    case 'status_change':
      if (config.from_status && config.from_status !== 'any' && config.from_status !== context.old_value) {
        return false;
      }
      if (config.to_status && config.to_status !== 'any' && config.to_status !== context.new_value) {
        return false;
      }
      return true;

    case 'quote_accepted':
    case 'quote_sent':
    case 'new_client':
      return true;

    default:
      return true;
  }
};

const executeAction = async (rule: WorkflowRule, context: WorkflowTriggerContext) => {
  const config = rule.action_config;
  let actionResult: Record<string, any> = {};
  let status = 'success';
  let errorMessage: string | null = null;

  try {
    switch (rule.action_type) {
      case 'create_task':
        const taskTitle = config.task_title?.replace('{client_name}', context.metadata?.client_name || 'Client') || 'Follow-up Task';
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + (config.due_days || 3));
        
        const { data: taskData, error: taskError } = await supabase
          .from('tasks')
          .insert([{
            title: taskTitle,
            description: `Auto-generated from workflow: ${rule.name}`,
            status: 'todo',
            priority: config.priority || 'medium',
            due_date: dueDate.toISOString(),
          }])
          .select()
          .single();

        if (taskError) throw taskError;
        actionResult = { task_id: taskData?.id };
        break;

      case 'send_reminder':
        const reminderTitle = config.reminder_title?.replace('{client_name}', context.metadata?.client_name || 'Client') || 'Reminder';
        const reminderDue = new Date();
        reminderDue.setDate(reminderDue.getDate() + (config.due_days || 1));

        const { data: reminderData, error: reminderError } = await supabase
          .from('reminders')
          .insert([{
            title: reminderTitle,
            description: `Auto-generated from workflow: ${rule.name}`,
            reminder_type: 'follow_up',
            due_date: reminderDue.toISOString(),
            priority: config.priority || 'medium',
            related_client_id: context.entity_type === 'client' ? context.entity_id : null,
            is_completed: false,
          }])
          .select()
          .single();

        if (reminderError) throw reminderError;
        actionResult = { reminder_id: reminderData?.id };
        break;

      case 'log_activity':
        const { error: activityError } = await supabase
          .from('activity_logs')
          .insert([{
            activity_type: context.trigger_type,
            entity_type: context.entity_type,
            entity_id: context.entity_id,
            description: `Workflow triggered: ${rule.name}`,
            metadata: {
              old_value: context.old_value,
              new_value: context.new_value,
              workflow_id: rule.id,
            },
          }]);

        if (activityError) throw activityError;
        break;

      default:
        console.log(`Action type ${rule.action_type} not implemented`);
    }
  } catch (error: any) {
    status = 'failed';
    errorMessage = error.message;
    console.error('Error executing workflow action:', error);
  }

  // Log the workflow execution
  await supabase.from('workflow_logs').insert([{
    workflow_rule_id: rule.id,
    trigger_event: `${context.trigger_type}: ${context.entity_type}`,
    trigger_data: JSON.parse(JSON.stringify(context)),
    action_taken: rule.action_type,
    action_result: actionResult,
    status,
    error_message: errorMessage,
  }]);
};

// Helper to trigger stage change workflow
export const triggerStageChangeWorkflow = async (
  clientId: string,
  clientName: string,
  oldStage: string,
  newStage: string
) => {
  await executeWorkflowTrigger({
    trigger_type: 'stage_change',
    entity_type: 'client',
    entity_id: clientId,
    old_value: oldStage,
    new_value: newStage,
    metadata: { client_name: clientName },
  });

  // Also log the activity
  await supabase.from('activity_logs').insert([{
    activity_type: 'stage_changed',
    entity_type: 'client',
    entity_id: clientId,
    description: `Sales stage changed from ${oldStage} to ${newStage}`,
    metadata: { old_stage: oldStage, new_stage: newStage },
  }]);
};

// Helper to trigger status change workflow
export const triggerStatusChangeWorkflow = async (
  clientId: string,
  clientName: string,
  oldStatus: string,
  newStatus: string
) => {
  await executeWorkflowTrigger({
    trigger_type: 'status_change',
    entity_type: 'client',
    entity_id: clientId,
    old_value: oldStatus,
    new_value: newStatus,
    metadata: { client_name: clientName },
  });

  await supabase.from('activity_logs').insert([{
    activity_type: 'status_changed',
    entity_type: 'client',
    entity_id: clientId,
    description: `Status changed from ${oldStatus} to ${newStatus}`,
    metadata: { old_status: oldStatus, new_status: newStatus },
  }]);
};

// Helper to trigger quote accepted workflow
export const triggerQuoteAcceptedWorkflow = async (
  quoteId: string,
  clientId: string,
  clientName: string,
  quoteTitle: string
) => {
  await executeWorkflowTrigger({
    trigger_type: 'quote_accepted',
    entity_type: 'quote',
    entity_id: quoteId,
    metadata: { client_name: clientName, quote_title: quoteTitle, client_id: clientId },
  });

  await supabase.from('activity_logs').insert([{
    activity_type: 'quote_accepted',
    entity_type: 'quote',
    entity_id: quoteId,
    description: `Quote "${quoteTitle}" was accepted`,
    metadata: { client_id: clientId, client_name: clientName },
  }]);
};

// Helper to trigger new client workflow
export const triggerNewClientWorkflow = async (
  clientId: string,
  clientName: string
) => {
  await executeWorkflowTrigger({
    trigger_type: 'new_client',
    entity_type: 'client',
    entity_id: clientId,
    metadata: { client_name: clientName },
  });
};
