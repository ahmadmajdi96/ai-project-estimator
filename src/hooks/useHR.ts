import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Attendance
export function useHRAttendance(date?: string) {
  return useQuery({
    queryKey: ['hr-attendance', date],
    queryFn: async () => {
      let query = supabase
        .from('hr_attendance')
        .select(`
          *,
          employees:employee_id (
            id,
            position,
            employee_code,
            departments:department_id (name)
          )
        `)
        .order('date', { ascending: false });
      
      if (date) {
        query = query.eq('date', date);
      }
      
      const { data, error } = await query.limit(100);
      if (error) throw error;
      return data;
    },
  });
}

export function useAddAttendance() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (attendance: {
      employee_id: string;
      date: string;
      clock_in?: string;
      clock_out?: string;
      status?: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('hr_attendance')
        .insert(attendance)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-attendance'] });
      toast.success('Attendance recorded');
    },
    onError: (error) => {
      toast.error('Failed to record attendance: ' + error.message);
    },
  });
}

// Leave Types
export function useLeaveTypes() {
  return useQuery({
    queryKey: ['hr-leave-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hr_leave_types')
        .select('*')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data;
    },
  });
}

// Leave Requests
export function useLeaveRequests(status?: string) {
  return useQuery({
    queryKey: ['hr-leave-requests', status],
    queryFn: async () => {
      let query = supabase
        .from('hr_leave_requests')
        .select(`
          *,
          employees:employee_id (
            id,
            position,
            employee_code,
            departments:department_id (name)
          ),
          leave_type:leave_type_id (name, is_paid)
        `)
        .order('created_at', { ascending: false });
      
      if (status) {
        query = query.eq('status', status);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useAddLeaveRequest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (request: {
      employee_id: string;
      leave_type_id: string;
      start_date: string;
      end_date: string;
      reason?: string;
    }) => {
      const { data, error } = await supabase
        .from('hr_leave_requests')
        .insert(request)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-leave-requests'] });
      toast.success('Leave request submitted');
    },
    onError: (error) => {
      toast.error('Failed to submit leave request: ' + error.message);
    },
  });
}

export function useUpdateLeaveRequest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; status?: string; approved_by?: string }) => {
      const updateData: Record<string, unknown> = { ...updates };
      if (updates.status === 'approved' || updates.status === 'rejected') {
        updateData.approved_at = new Date().toISOString();
      }
      
      const { data, error } = await supabase
        .from('hr_leave_requests')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-leave-requests'] });
      toast.success('Leave request updated');
    },
    onError: (error) => {
      toast.error('Failed to update leave request: ' + error.message);
    },
  });
}

// Job Postings
export function useJobPostings() {
  return useQuery({
    queryKey: ['hr-job-postings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hr_job_postings')
        .select(`
          *,
          departments:department_id (name)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useAddJobPosting() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (job: {
      title: string;
      department_id?: string;
      description?: string;
      requirements?: string;
      location?: string;
      employment_type?: string;
      status?: string;
    }) => {
      const { data, error } = await supabase
        .from('hr_job_postings')
        .insert({ ...job, posted_date: new Date().toISOString().split('T')[0] })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-job-postings'] });
      toast.success('Job posting created');
    },
    onError: (error) => {
      toast.error('Failed to create job posting: ' + error.message);
    },
  });
}

// Candidates
export function useCandidates(jobId?: string) {
  return useQuery({
    queryKey: ['hr-candidates', jobId],
    queryFn: async () => {
      let query = supabase
        .from('hr_candidates')
        .select(`
          *,
          job_posting:job_posting_id (title, department_id)
        `)
        .order('created_at', { ascending: false });
      
      if (jobId) {
        query = query.eq('job_posting_id', jobId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useAddCandidate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (candidate: {
      first_name: string;
      last_name: string;
      email: string;
      phone?: string;
      job_posting_id?: string;
      source?: string;
    }) => {
      const { data, error } = await supabase
        .from('hr_candidates')
        .insert(candidate)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-candidates'] });
      toast.success('Candidate added');
    },
    onError: (error) => {
      toast.error('Failed to add candidate: ' + error.message);
    },
  });
}

export function useUpdateCandidateStage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, stage }: { id: string; stage: string }) => {
      const { data, error } = await supabase
        .from('hr_candidates')
        .update({ stage })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-candidates'] });
      toast.success('Candidate stage updated');
    },
    onError: (error) => {
      toast.error('Failed to update candidate: ' + error.message);
    },
  });
}

// Payroll
export function usePayrollPeriods() {
  return useQuery({
    queryKey: ['hr-payroll-periods'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hr_payroll_periods')
        .select('*')
        .order('start_date', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function usePayrollEntries(periodId?: string) {
  return useQuery({
    queryKey: ['hr-payroll-entries', periodId],
    queryFn: async () => {
      let query = supabase
        .from('hr_payroll_entries')
        .select(`
          *,
          employees:employee_id (
            id,
            position,
            employee_code,
            departments:department_id (name)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (periodId) {
        query = query.eq('payroll_period_id', periodId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!periodId || true,
  });
}

// Performance Reviews
export function usePerformanceReviews(employeeId?: string) {
  return useQuery({
    queryKey: ['hr-performance-reviews', employeeId],
    queryFn: async () => {
      let query = supabase
        .from('hr_performance_reviews')
        .select(`
          *,
          employee:employee_id (
            id,
            position,
            employee_code
          ),
          reviewer:reviewer_id (
            id,
            position
          )
        `)
        .order('created_at', { ascending: false });
      
      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

// OKRs
export function useOKRs(employeeId?: string) {
  return useQuery({
    queryKey: ['hr-okrs', employeeId],
    queryFn: async () => {
      let query = supabase
        .from('hr_okrs')
        .select(`
          *,
          employees:employee_id (
            id,
            position,
            employee_code
          )
        `)
        .order('created_at', { ascending: false });
      
      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

// Training
export function useTrainingCourses() {
  return useQuery({
    queryKey: ['hr-training-courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hr_training_courses')
        .select('*')
        .eq('is_active', true)
        .order('title');
      if (error) throw error;
      return data;
    },
  });
}

export function useEmployeeTraining(employeeId?: string) {
  return useQuery({
    queryKey: ['hr-employee-training', employeeId],
    queryFn: async () => {
      let query = supabase
        .from('hr_employee_training')
        .select(`
          *,
          course:course_id (title, category, difficulty),
          employees:employee_id (
            id,
            position,
            employee_code
          )
        `)
        .order('assigned_date', { ascending: false });
      
      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

// Benefits
export function useBenefits() {
  return useQuery({
    queryKey: ['hr-benefits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hr_benefits')
        .select('*')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data;
    },
  });
}

// Onboarding Tasks
export function useOnboardingTasks(employeeId?: string) {
  return useQuery({
    queryKey: ['hr-onboarding-tasks', employeeId],
    queryFn: async () => {
      let query = supabase
        .from('hr_onboarding_tasks')
        .select(`
          *,
          employees:employee_id (
            id,
            position,
            employee_code,
            hire_date
          )
        `)
        .order('due_date', { ascending: true });
      
      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

// Employee Documents
export function useEmployeeDocuments(employeeId?: string) {
  return useQuery({
    queryKey: ['hr-employee-documents', employeeId],
    queryFn: async () => {
      let query = supabase
        .from('hr_employee_documents')
        .select(`
          *,
          employees:employee_id (
            id,
            position,
            employee_code
          )
        `)
        .order('expiry_date', { ascending: true });
      
      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

// HR Settings
export function useHRSettings() {
  return useQuery({
    queryKey: ['hr-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hr_settings')
        .select('*');
      if (error) throw error;
      return data;
    },
  });
}

// Dashboard Stats
export function useHRDashboardStats() {
  return useQuery({
    queryKey: ['hr-dashboard-stats'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
      
      // Get employees count
      const { count: totalEmployees } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true });
      
      const { count: activeEmployees } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');
      
      // Get new hires this month
      const { count: newHires } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .gte('hire_date', monthStart);
      
      // Get today's attendance
      const { data: todayAttendance } = await supabase
        .from('hr_attendance')
        .select('status')
        .eq('date', today);
      
      const presentCount = todayAttendance?.filter(a => a.status === 'present').length || 0;
      const lateCount = todayAttendance?.filter(a => a.status === 'late').length || 0;
      const absentCount = todayAttendance?.filter(a => a.status === 'absent').length || 0;
      
      // Get pending leave requests
      const { count: pendingLeaves } = await supabase
        .from('hr_leave_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      
      // Get open job postings
      const { count: openJobs } = await supabase
        .from('hr_job_postings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open');
      
      // Get candidates in pipeline
      const { data: candidates } = await supabase
        .from('hr_candidates')
        .select('stage');
      
      const candidatesByStage = {
        applied: candidates?.filter(c => c.stage === 'applied').length || 0,
        screening: candidates?.filter(c => c.stage === 'screening').length || 0,
        interview: candidates?.filter(c => c.stage === 'interview').length || 0,
        assessment: candidates?.filter(c => c.stage === 'assessment').length || 0,
        offer: candidates?.filter(c => c.stage === 'offer').length || 0,
      };
      
      return {
        totalEmployees: totalEmployees || 0,
        activeEmployees: activeEmployees || 0,
        newHires: newHires || 0,
        attendance: {
          present: presentCount,
          late: lateCount,
          absent: absentCount,
        },
        pendingLeaves: pendingLeaves || 0,
        openJobs: openJobs || 0,
        candidatesByStage,
      };
    },
  });
}
