import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmployeeLayout } from '@/components/employee/EmployeeLayout';
import { useRoleBasedAttendance } from '@/hooks/useRoleBasedData';
import { useUserRole } from '@/hooks/useUserRole';
import { useEmployees } from '@/hooks/useEmployees';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Users, User } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, isFriday, isSaturday } from 'date-fns';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const statusConfig: Record<string, { color: string; bg: string }> = {
  present: { color: 'text-green-600', bg: 'bg-green-500' },
  absent: { color: 'text-red-600', bg: 'bg-red-500' },
  late: { color: 'text-amber-600', bg: 'bg-amber-500' },
  half_day: { color: 'text-blue-600', bg: 'bg-blue-500' },
  leave: { color: 'text-purple-600', bg: 'bg-purple-500' },
  weekend: { color: 'text-slate-500', bg: 'bg-slate-400' },
};

export default function EmployeeAttendancePage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeTab, setActiveTab] = useState('my-attendance');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  
  const { data: attendanceData } = useRoleBasedAttendance();
  const myAttendance = attendanceData?.myAttendance || [];
  const teamAttendance = attendanceData?.teamAttendance || [];
  
  const { data: employees = [] } = useEmployees();
  const { canViewTeamData, role } = useUserRole();
  const isTeamLead = canViewTeamData && (role === 'team_lead' || role === 'department_head' || role === 'ceo' || role === 'super_admin');

  const currentAttendance = activeTab === 'my-attendance' ? myAttendance : teamAttendance;

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const filteredAttendance = currentAttendance.filter(a => {
    if (!a.date) return false;
    const date = new Date(a.date);
    const inMonth = date >= monthStart && date <= monthEnd;
    const matchesEmployee = activeTab === 'my-attendance' || selectedEmployee === 'all' || a.employee_id === selectedEmployee;
    return inMonth && matchesEmployee;
  });

  const presentDays = filteredAttendance.filter(a => a.status === 'present').length;
  const lateDays = filteredAttendance.filter(a => a.status === 'late').length;
  const absentDays = filteredAttendance.filter(a => a.status === 'absent').length;
  const leaveDays = filteredAttendance.filter(a => a.status === 'leave').length;

  const getAttendanceForDay = (date: Date) => {
    return filteredAttendance.find(a => a.date && isSameDay(parseISO(a.date), date));
  };

  const getEmployeeName = (employeeId: string | null) => {
    if (!employeeId) return 'Unknown';
    return employees.find(e => e.id === employeeId)?.full_name || 'Unknown';
  };

  const isWeekend = (date: Date) => {
    return isFriday(date) || isSaturday(date);
  };

  const prevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Get unique team members from attendance
  const teamMemberIds = [...new Set(teamAttendance.map(a => a.employee_id).filter(Boolean))];

  const renderAttendanceContent = () => (
    <>
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Present</p>
                <p className="text-2xl font-bold text-green-600">{presentDays} days</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Late</p>
                <p className="text-2xl font-bold text-amber-600">{lateDays} days</p>
              </div>
              <AlertCircle className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-rose-500/10 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Absent</p>
                <p className="text-2xl font-bold text-red-600">{absentDays} days</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">On Leave</p>
                <p className="text-2xl font-bold text-purple-600">{leaveDays} days</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter for team attendance */}
      {activeTab === 'team-attendance' && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger className="w-[250px]">
                  <Users className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by employee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Team Members</SelectItem>
                  {teamMemberIds.map(id => (
                    <SelectItem key={id} value={id || ''}>
                      {getEmployeeName(id)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar View */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>Attendance Calendar</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-medium min-w-[150px] text-center">
                {format(currentMonth, 'MMMM yyyy')}
              </span>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs sm:text-sm font-medium text-muted-foreground p-1 sm:p-2">
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{day.charAt(0)}</span>
              </div>
            ))}
            
            {Array.from({ length: monthStart.getDay() }).map((_, i) => (
              <div key={`empty-${i}`} className="p-1 sm:p-2" />
            ))}
            
            {daysInMonth.map(day => {
              const record = getAttendanceForDay(day);
              const isToday = isSameDay(day, new Date());
              const weekend = isWeekend(day);
              const config = record 
                ? statusConfig[record.status] || statusConfig.present 
                : weekend 
                  ? statusConfig.weekend 
                  : null;
              
              return (
                <div
                  key={day.toISOString()}
                  className={`
                    p-1 sm:p-2 rounded-lg text-center cursor-default transition-colors
                    ${isToday ? 'ring-2 ring-primary' : ''}
                    ${record ? config?.bg + '/10' : weekend ? 'bg-slate-200/50 dark:bg-slate-700/30' : 'bg-muted/30'}
                  `}
                >
                  <p className={`text-xs sm:text-sm font-medium ${record ? config?.color : weekend ? 'text-slate-500' : ''}`}>
                    {format(day, 'd')}
                  </p>
                  {record ? (
                    <p className={`text-[10px] sm:text-xs capitalize ${config?.color} hidden sm:block`}>
                      {record.status}
                    </p>
                  ) : weekend ? (
                    <p className="text-[10px] sm:text-xs text-slate-500 hidden sm:block">Weekend</p>
                  ) : null}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-2 sm:gap-4 mt-6 pt-4 border-t">
            {Object.entries(statusConfig).map(([status, config]) => (
              <div key={status} className="flex items-center gap-1 sm:gap-2">
                <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${config.bg}`} />
                <span className="text-xs sm:text-sm capitalize">{status.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Records */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Attendance Records</CardTitle>
          <CardDescription>
            {activeTab === 'my-attendance' ? 'Your latest attendance entries' : 'Team attendance entries'}
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {activeTab === 'team-attendance' && <TableHead>Employee</TableHead>}
                <TableHead>Date</TableHead>
                <TableHead className="hidden sm:table-cell">Check In</TableHead>
                <TableHead className="hidden sm:table-cell">Check Out</TableHead>
                <TableHead className="hidden md:table-cell">Hours Worked</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAttendance.slice(0, 10).map((record) => {
                const config = statusConfig[record.status] || statusConfig.present;
                return (
                  <TableRow key={record.id}>
                    {activeTab === 'team-attendance' && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {getEmployeeName(record.employee_id).substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="hidden sm:inline">{getEmployeeName(record.employee_id)}</span>
                        </div>
                      </TableCell>
                    )}
                    <TableCell className="font-medium whitespace-nowrap">
                      {record.date ? format(parseISO(record.date), 'MMM d, yyyy') : '-'}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{record.clock_in || '-'}</TableCell>
                    <TableCell className="hidden sm:table-cell">{record.clock_out || '-'}</TableCell>
                    <TableCell className="hidden md:table-cell">{record.overtime_hours ? `${record.overtime_hours}h OT` : '-'}</TableCell>
                    <TableCell>
                      <Badge className={config.bg}>
                        {record.status?.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredAttendance.length === 0 && (
                <TableRow>
                  <TableCell colSpan={activeTab === 'team-attendance' ? 6 : 5} className="text-center py-8 text-muted-foreground">
                    No attendance records for this month
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );

  return (
    <EmployeeLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">
            {isTeamLead ? 'Attendance Management' : 'My Attendance'}
          </h1>
          <p className="text-muted-foreground">
            {isTeamLead ? 'Track your attendance and team attendance' : 'Track your attendance history'}
          </p>
        </div>

        {isTeamLead ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="my-attendance" className="gap-2">
                <User className="h-4 w-4" />
                My Attendance
              </TabsTrigger>
              <TabsTrigger value="team-attendance" className="gap-2">
                <Users className="h-4 w-4" />
                Team Attendance
              </TabsTrigger>
            </TabsList>
            <TabsContent value="my-attendance" className="space-y-6">
              {renderAttendanceContent()}
            </TabsContent>
            <TabsContent value="team-attendance" className="space-y-6">
              {renderAttendanceContent()}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-6">
            {renderAttendanceContent()}
          </div>
        )}
      </div>
    </EmployeeLayout>
  );
}
