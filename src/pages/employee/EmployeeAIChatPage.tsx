import { useState, useRef, useEffect } from 'react';
import { EmployeeLayout } from '@/components/employee/EmployeeLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useEnterpriseAI } from '@/hooks/useEnterpriseAI';
import { useTasks } from '@/hooks/useTasks';
import { useEmployeeRequests, useSalarySlips } from '@/hooks/useEmployeeDashboard';
import { useLeaveRequests, useHRAttendance } from '@/hooks/useHR';
import { MarkdownRenderer } from '@/components/chat/MarkdownRenderer';
import { Bot, User, Send, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useMemo } from 'react';

export default function EmployeeAIChatPage() {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { data: tasks = [] } = useTasks();
  const { data: requests = [] } = useEmployeeRequests();
  const { data: salarySlips = [] } = useSalarySlips();
  const { data: leaveRequests = [] } = useLeaveRequests();
  const { data: attendance = [] } = useHRAttendance();

  const aiContext = useMemo(() => ({
    employeeData: {
      tasks: {
        total: tasks.length,
        pending: tasks.filter(t => t.status === 'todo').length,
        inProgress: tasks.filter(t => t.status === 'in_progress').length,
        completed: tasks.filter(t => t.status === 'done').length,
        overdue: tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done').length,
        recentTasks: tasks.slice(0, 5).map(t => ({
          title: t.title,
          status: t.status,
          priority: t.priority,
          dueDate: t.due_date,
        })),
      },
      requests: {
        total: requests.length,
        pending: requests.filter(r => r.status === 'pending').length,
        approved: requests.filter(r => r.status === 'approved').length,
        rejected: requests.filter(r => r.status === 'rejected').length,
      },
      leave: {
        total: leaveRequests.length,
        pending: leaveRequests.filter(l => l.status === 'pending').length,
        approved: leaveRequests.filter(l => l.status === 'approved').length,
      },
      attendance: {
        thisMonth: attendance.filter(a => a.date?.startsWith(format(new Date(), 'yyyy-MM'))).length,
        present: attendance.filter(a => a.status === 'present').length,
        late: attendance.filter(a => a.status === 'late').length,
        absent: attendance.filter(a => a.status === 'absent').length,
      },
      salary: salarySlips.length > 0 ? {
        lastPayment: salarySlips[0]?.net_salary,
        lastPeriod: salarySlips[0]?.period_end,
      } : null,
    },
    currentDate: format(new Date(), 'PPP'),
  }), [tasks, requests, leaveRequests, attendance, salarySlips]);

  const { messages, isLoading, sendMessage, clearMessages } = useEnterpriseAI({ context: aiContext });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      sendMessage(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedQuestions = [
    "How many tasks do I have pending?",
    "What's my attendance this month?",
    "Any overdue tasks I should prioritize?",
    "Summarize my work status",
    "How can I improve my productivity?",
  ];

  return (
    <EmployeeLayout>
      <div className="h-[calc(100vh-140px)] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-primary" />
              AI Assistant
            </h1>
            <p className="text-muted-foreground">Get help with your tasks, requests, and work-related questions</p>
          </div>
          <Button variant="outline" onClick={clearMessages} disabled={messages.length === 0}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Chat
          </Button>
        </div>

        <Card className="flex-1 flex flex-col">
          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <Bot className="h-16 w-16 text-primary/50 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">How can I help you today?</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    I can help you with task management, leave requests, attendance tracking, 
                    and answer questions about your work.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                    {suggestedQuestions.map((q, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setInput(q);
                          sendMessage(q);
                        }}
                      >
                        {q}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.role === 'assistant' && (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            <Bot className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        {msg.role === 'assistant' ? (
                          <MarkdownRenderer content={msg.content} />
                        ) : (
                          <p>{msg.content}</p>
                        )}
                      </div>
                      {msg.role === 'user' && (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-secondary">
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3 justify-start">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-muted rounded-lg p-3 flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Thinking...</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>

            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything about your work..."
                  className="min-h-[60px] resize-none"
                  disabled={isLoading}
                />
                <Button onClick={handleSend} disabled={isLoading || !input.trim()} className="h-auto">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </EmployeeLayout>
  );
}
