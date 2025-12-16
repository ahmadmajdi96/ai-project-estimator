-- Task feedback and approval system
CREATE TABLE IF NOT EXISTS public.task_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID,
  feedback_type TEXT NOT NULL DEFAULT 'comment' CHECK (feedback_type IN ('comment', 'approval', 'rejection', 'request_changes')),
  content TEXT NOT NULL,
  is_approved BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add approval fields to tasks
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS requires_approval BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'changes_requested')),
ADD COLUMN IF NOT EXISTS approved_by UUID,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

-- Enable RLS
ALTER TABLE public.task_feedback ENABLE ROW LEVEL SECURITY;

-- RLS policies for task_feedback
CREATE POLICY "Users can view task feedback" ON public.task_feedback FOR SELECT USING (true);
CREATE POLICY "Users can insert task feedback" ON public.task_feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own feedback" ON public.task_feedback FOR UPDATE USING (true);
CREATE POLICY "Users can delete own feedback" ON public.task_feedback FOR DELETE USING (true);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_task_feedback_task_id ON public.task_feedback(task_id);

-- Add trigger for updated_at
CREATE TRIGGER update_task_feedback_updated_at BEFORE UPDATE ON public.task_feedback
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();