import { HRLayout } from "@/components/hr/HRLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Target, Star, Plus, TrendingUp, Users } from "lucide-react";
import { usePerformanceReviews, useOKRs } from "@/hooks/useHR";
import { format } from "date-fns";

export default function HRPerformancePage() {
  const { data: reviews, isLoading: reviewsLoading } = usePerformanceReviews();
  const { data: okrs, isLoading: okrsLoading } = useOKRs();

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; className?: string }> = {
      draft: { variant: "secondary" },
      submitted: { variant: "default", className: "bg-blue-500" },
      acknowledged: { variant: "default", className: "bg-green-500" },
    };
    return (
      <Badge variant={config[status]?.variant || "default"} className={config[status]?.className}>
        {status}
      </Badge>
    );
  };

  const getRatingStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`}
          />
        ))}
      </div>
    );
  };

  const averageRating = reviews?.length
    ? (reviews.reduce((sum: number, r: any) => sum + (r.overall_rating || 0), 0) / reviews.length).toFixed(1)
    : "N/A";

  const averageOKRProgress = okrs?.length
    ? Math.round(okrs.reduce((sum: number, o: any) => sum + (o.progress || 0), 0) / okrs.length)
    : 0;

  return (
    <HRLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Performance Management</h1>
            <p className="text-muted-foreground">Track employee performance and reviews</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Review Cycle
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reviews?.length || 0}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageRating}</div>
              <p className="text-xs text-muted-foreground">Out of 5</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active OKRs</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{okrs?.filter((o: any) => o.status === 'active').length || 0}</div>
              <p className="text-xs text-muted-foreground">In progress</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg OKR Progress</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageOKRProgress}%</div>
              <Progress value={averageOKRProgress} className="mt-2 h-2" />
            </CardContent>
          </Card>
        </div>

        {/* Performance Reviews */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Reviews</CardTitle>
            <CardDescription>Employee review history</CardDescription>
          </CardHeader>
          <CardContent>
            {reviewsLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : reviews && reviews.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Review Type</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Reviewer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews.map((review: any) => (
                    <TableRow key={review.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{review.employee?.employee_code || 'N/A'}</p>
                          <p className="text-sm text-muted-foreground">{review.employee?.position}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{review.review_type}</Badge>
                      </TableCell>
                      <TableCell>{review.review_period || '-'}</TableCell>
                      <TableCell>{review.overall_rating ? getRatingStars(review.overall_rating) : '-'}</TableCell>
                      <TableCell>{review.reviewer?.position || 'N/A'}</TableCell>
                      <TableCell>{getStatusBadge(review.status)}</TableCell>
                      <TableCell>{format(new Date(review.created_at), "MMM d, yyyy")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No performance reviews found
              </div>
            )}
          </CardContent>
        </Card>

        {/* OKRs */}
        <Card>
          <CardHeader>
            <CardTitle>Objectives & Key Results (OKRs)</CardTitle>
            <CardDescription>Track goals and progress</CardDescription>
          </CardHeader>
          <CardContent>
            {okrsLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : okrs && okrs.length > 0 ? (
              <div className="space-y-4">
                {okrs.map((okr: any) => (
                  <div key={okr.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{okr.objective}</h4>
                        <p className="text-sm text-muted-foreground">
                          {okr.employees?.employee_code} • {okr.period || 'No period'}
                        </p>
                      </div>
                      <Badge variant={okr.status === 'active' ? 'default' : 'secondary'}>
                        {okr.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <Progress value={okr.progress || 0} className="flex-1 h-2" />
                      <span className="text-sm font-medium w-12 text-right">{okr.progress || 0}%</span>
                    </div>
                    {okr.key_results && Array.isArray(okr.key_results) && okr.key_results.length > 0 && (
                      <div className="mt-3 pl-4 border-l-2 border-muted">
                        {okr.key_results.map((kr: any, index: number) => (
                          <div key={index} className="text-sm text-muted-foreground py-1">
                            • {typeof kr === 'string' ? kr : kr.title || JSON.stringify(kr)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No OKRs found
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </HRLayout>
  );
}
