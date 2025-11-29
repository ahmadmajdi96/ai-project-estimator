import { useState } from 'react';
import { CRMLayout } from '@/components/crm/CRMLayout';
import { useQuotes, useDeleteQuote, useUpdateQuote } from '@/hooks/useQuotes';
import { useClients } from '@/hooks/useClients';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QUOTE_STATUSES, QuoteStatus } from '@/types/crm';
import { MoreHorizontal, Trash2, ExternalLink, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export default function QuotesPage() {
  const { data: quotes = [] } = useQuotes();
  const { data: clients = [] } = useClients();
  const deleteQuote = useDeleteQuote();
  const updateQuote = useUpdateQuote();
  const navigate = useNavigate();

  const getClientName = (clientId: string | null) => {
    if (!clientId) return 'Unassigned';
    const client = clients.find(c => c.id === clientId);
    return client?.client_name || 'Unknown';
  };

  const handleStatusChange = async (quoteId: string, status: QuoteStatus) => {
    await updateQuote.mutateAsync({ id: quoteId, status });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this quote?')) {
      await deleteQuote.mutateAsync(id);
    }
  };

  return (
    <CRMLayout title="Quotes">
      <div className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {QUOTE_STATUSES.map(status => {
            const count = quotes.filter(q => q.status === status.value).length;
            return (
              <Card key={status.value} className="p-4 bg-card/50 border-border/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-sm text-muted-foreground">{status.label}</p>
                  </div>
                  <Badge className={status.color}>{status.label}</Badge>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Table */}
        <Card className="bg-card/50 border-border/50">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-muted/30">
                <TableHead>Quote</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
                <TableHead className="text-right">Discount</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.map(quote => {
                const status = QUOTE_STATUSES.find(s => s.value === quote.status);
                
                return (
                  <TableRow key={quote.id} className="hover:bg-muted/20">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{quote.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {quote.client_id ? (
                        <Button
                          variant="link"
                          className="p-0 h-auto"
                          onClick={() => navigate(`/crm/clients/${quote.client_id}`)}
                        >
                          {getClientName(quote.client_id)}
                        </Button>
                      ) : (
                        <span className="text-muted-foreground">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={quote.status}
                        onValueChange={(v) => handleStatusChange(quote.id, v as QuoteStatus)}
                      >
                        <SelectTrigger className="w-[130px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {QUOTE_STATUSES.map(s => (
                            <SelectItem key={s.value} value={s.value}>
                              <Badge className={`${s.color} text-xs`}>{s.label}</Badge>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">${quote.subtotal.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {quote.discount_percent > 0 ? `${quote.discount_percent}%` : '-'}
                    </TableCell>
                    <TableCell className="text-right font-medium text-primary">
                      ${quote.total.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(quote.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(quote.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
              {quotes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    No quotes yet. Create quotes from the Cost Estimator.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </CRMLayout>
  );
}
