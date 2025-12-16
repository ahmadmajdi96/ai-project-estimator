import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmployeeLayout } from '@/components/employee/EmployeeLayout';
import { useHRAttendance } from '@/hooks/useHR';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, getDay, isFriday, isSaturday } from 'date-fns';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
  const { data: attendance = [] } = useHRAttendance();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const monthAttendance = attendance.filter(a => {
    if (!a.date) return false;
    const date = new Date(a.date);
    return date >= monthStart && date <= monthEnd;
  });

  const presentDays = monthAttendance.filter(a => a.status === 'present').length;
  const lateDays = monthAttendance.filter(a => a.status === 'late').length;
  const absentDays = monthAttendance.filter(a => a.status === 'absent').length;
  const leaveDays = monthAttendance.filter(a => a.status === 'leave').length;

  const getAttendanceForDay = (date: Date) => {
    return monthAttendance.find(a => a.date && isSameDay(parseISO(a.date), date));
  };

  // Check if day is weekend (Friday and Saturday for Middle Eastern calendar)
  const isWeekend = (date: Date) => {
    return isFriday(date) || isSaturday(date);
  };

  const prevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  return (
    <EmployeeLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Attendance</h1>
          <p className="text-muted-foreground">Track your attendance history</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

        {/* Calendar View */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
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
            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                  {day}
                </div>
              ))}
              
              {/* Empty cells for days before month starts */}
              {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="p-2" />
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
                      p-2 rounded-lg text-center cursor-default transition-colors
                      ${isToday ? 'ring-2 ring-primary' : ''}
                      ${record ? config?.bg + '/10' : weekend ? 'bg-slate-200/50 dark:bg-slate-700/30' : 'bg-muted/30'}
                    `}
                  >
                    <p className={`text-sm font-medium ${record ? config?.color : weekend ? 'text-slate-500' : ''}`}>
                      {format(day, 'd')}
                    </p>
                    {record ? (
                      <p className={`text-xs capitalize ${config?.color}`}>
                        {record.status}
                      </p>
                    ) : weekend ? (
                      <p className="text-xs text-slate-500">Weekend</p>
                    ) : null}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t">
              {Object.entries(statusConfig).map(([status, config]) => (
                <div key={status} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${config.bg}`} />
                  <span className="text-sm capitalize">{status.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Records */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Attendance Records</CardTitle>
            <CardDescription>Your latest attendance entries</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Hours Worked</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthAttendance.slice(0, 10).map((record) => {
                  const config = statusConfig[record.status] || statusConfig.present;
                  return (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {record.date ? format(parseISO(record.date), 'PPP') : '-'}
                      </TableCell>
                      <TableCell>{record.clock_in || '-'}</TableCell>
                      <TableCell>{record.clock_out || '-'}</TableCell>
                      <TableCell>{record.overtime_hours ? `${record.overtime_hours}h OT` : '-'}</TableCell>
                      <TableCell>
                        <Badge className={config.bg}>
                          {record.status?.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {monthAttendance.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No attendance records for this month
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </EmployeeLayout>
  );
}
