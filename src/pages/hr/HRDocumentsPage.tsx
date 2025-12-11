import { HRLayout } from "@/components/hr/HRLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Plus, AlertTriangle, CheckCircle, Clock, Upload } from "lucide-react";
import { useEmployeeDocuments } from "@/hooks/useHR";
import { format, differenceInDays, isPast } from "date-fns";

export default function HRDocumentsPage() {
  const { data: documents, isLoading } = useEmployeeDocuments();

  const getExpiryStatus = (expiryDate: string | null) => {
    if (!expiryDate) return null;
    
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = differenceInDays(expiry, new Date());
    
    if (isPast(expiry)) {
      return { status: 'expired', badge: <Badge variant="destructive">Expired</Badge> };
    } else if (daysUntilExpiry <= 30) {
      return { status: 'expiring', badge: <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600">Expiring Soon</Badge> };
    } else {
      return { status: 'valid', badge: <Badge variant="outline" className="bg-green-500/10 text-green-600">Valid</Badge> };
    }
  };

  const expiredDocs = documents?.filter((d: any) => d.expiry_date && isPast(new Date(d.expiry_date))).length || 0;
  const expiringDocs = documents?.filter((d: any) => {
    if (!d.expiry_date) return false;
    const daysUntil = differenceInDays(new Date(d.expiry_date), new Date());
    return daysUntil > 0 && daysUntil <= 30;
  }).length || 0;

  return (
    <HRLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Employee Documents</h1>
            <p className="text-muted-foreground">Manage employee documentation and compliance</p>
          </div>
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        </div>

        {/* Alerts */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className={expiredDocs > 0 ? "border-red-500/50" : ""}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expired</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{expiredDocs}</div>
              <p className="text-xs text-muted-foreground">Need immediate attention</p>
            </CardContent>
          </Card>
          
          <Card className={expiringDocs > 0 ? "border-yellow-500/50" : ""}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{expiringDocs}</div>
              <p className="text-xs text-muted-foreground">Within 30 days</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{documents?.length || 0}</div>
              <p className="text-xs text-muted-foreground">All employee documents</p>
            </CardContent>
          </Card>
        </div>

        {/* Documents Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Documents</CardTitle>
            <CardDescription>Employee documentation records</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : documents && documents.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Document Type</TableHead>
                    <TableHead>Document Name</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Verified</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc: any) => {
                    const expiryStatus = getExpiryStatus(doc.expiry_date);
                    return (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <p className="font-medium">{doc.employees?.employee_code || 'N/A'}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{doc.document_type}</Badge>
                        </TableCell>
                        <TableCell>{doc.document_name}</TableCell>
                        <TableCell>
                          {doc.expiry_date ? format(new Date(doc.expiry_date), "MMM d, yyyy") : '-'}
                        </TableCell>
                        <TableCell>{expiryStatus?.badge || <Badge variant="outline">No Expiry</Badge>}</TableCell>
                        <TableCell>
                          {doc.is_verified ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <Clock className="h-5 w-5 text-muted-foreground" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">View</Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No documents uploaded</h3>
                <p className="text-muted-foreground mb-4">Upload employee documents for compliance tracking</p>
                <Button>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </HRLayout>
  );
}
