import { useState } from 'react';
import { ChatFlowLayout } from '@/components/chatflow/ChatFlowLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  CreditCard, 
  Download, 
  Check,
  Zap,
  Bot,
  MessageSquare,
  Users,
  Puzzle,
  ArrowUpRight
} from 'lucide-react';
import { format } from 'date-fns';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    chatbots: 1,
    messages: 100,
    integrations: 2,
    team: 1,
    features: ['Basic analytics', 'Email support', 'Web widget'],
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    interval: 'month',
    chatbots: 3,
    messages: 1000,
    integrations: 5,
    team: 3,
    features: ['Advanced analytics', 'AI chatbots', 'Facebook & WhatsApp', 'Priority support'],
    popular: true,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 99,
    interval: 'month',
    chatbots: 10,
    messages: 5000,
    integrations: 'Unlimited',
    team: 10,
    features: ['Custom AI models', 'API access', 'White label', 'Phone support', 'Advanced integrations'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    interval: 'month',
    chatbots: 'Unlimited',
    messages: 'Custom',
    integrations: 'Unlimited',
    team: 'Unlimited',
    features: ['SLA', 'Custom development', 'On-premise option', 'Training', 'Dedicated account manager'],
  },
];

const mockInvoices = [
  { id: '1', number: 'INV-2024-001', date: '2024-01-01', amount: 29, status: 'paid' },
  { id: '2', number: 'INV-2023-012', date: '2023-12-01', amount: 29, status: 'paid' },
  { id: '3', number: 'INV-2023-011', date: '2023-11-01', amount: 29, status: 'paid' },
];

export default function BillingPage() {
  const [currentPlan] = useState('starter');

  const usage = {
    chatbots: { used: 2, limit: 3 },
    messages: { used: 742, limit: 1000 },
    team: { used: 2, limit: 3 },
  };

  return (
    <ChatFlowLayout title="Billing">
      <div className="space-y-6">
        {/* Current Plan */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>Manage your subscription</CardDescription>
              </div>
              <Badge className="text-lg px-3 py-1">Starter</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">$29</span>
              <span className="text-muted-foreground">/month</span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Bot className="h-4 w-4" /> Chatbots
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {usage.chatbots.used} / {usage.chatbots.limit}
                  </span>
                </div>
                <Progress value={(usage.chatbots.used / usage.chatbots.limit) * 100} />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" /> Messages this month
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {usage.messages.used.toLocaleString()} / {usage.messages.limit.toLocaleString()}
                  </span>
                </div>
                <Progress value={(usage.messages.used / usage.messages.limit) * 100} />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" /> Team members
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {usage.team.used} / {usage.team.limit}
                  </span>
                </div>
                <Progress value={(usage.team.used / usage.team.limit) * 100} />
              </div>
            </div>

            <div className="flex gap-3">
              <Button className="gap-2">
                <ArrowUpRight className="h-4 w-4" />
                Upgrade Plan
              </Button>
              <Button variant="outline">Manage Subscription</Button>
            </div>
          </CardContent>
        </Card>

        {/* Plans Comparison */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Available Plans</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan) => (
              <Card key={plan.id} className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary">Most Popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <div className="flex items-baseline gap-1">
                    {typeof plan.price === 'number' ? (
                      <>
                        <span className="text-3xl font-bold">${plan.price}</span>
                        <span className="text-muted-foreground">/{plan.interval}</span>
                      </>
                    ) : (
                      <span className="text-2xl font-bold">{plan.price}</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-muted-foreground" />
                      <span>{plan.chatbots} chatbots</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <span>{typeof plan.messages === 'number' ? plan.messages.toLocaleString() : plan.messages} messages/mo</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Puzzle className="h-4 w-4 text-muted-foreground" />
                      <span>{plan.integrations} integrations</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{plan.team} team members</span>
                    </div>
                  </div>

                  <Separator />

                  <ul className="space-y-2 text-sm">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className="w-full" 
                    variant={plan.id === currentPlan ? 'secondary' : plan.popular ? 'default' : 'outline'}
                    disabled={plan.id === currentPlan}
                  >
                    {plan.id === currentPlan ? 'Current Plan' : plan.id === 'enterprise' ? 'Contact Sales' : 'Upgrade'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>Manage your payment details</CardDescription>
              </div>
              <Button variant="outline" className="gap-2">
                <CreditCard className="h-4 w-4" />
                Update Card
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 p-4 rounded-lg border bg-muted/50">
              <div className="w-12 h-8 rounded bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center">
                <span className="text-white text-xs font-bold">VISA</span>
              </div>
              <div>
                <p className="font-medium">•••• •••• •••• 4242</p>
                <p className="text-sm text-muted-foreground">Expires 12/2025</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoices */}
        <Card>
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
            <CardDescription>Download your past invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.number}</TableCell>
                    <TableCell>{format(new Date(invoice.date), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>${invoice.amount}.00</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-500/10 text-green-600">
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="gap-2">
                        <Download className="h-4 w-4" />
                        PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </ChatFlowLayout>
  );
}
