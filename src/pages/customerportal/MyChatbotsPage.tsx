import { CustomerPortalLayout } from "@/components/customerportal/CustomerPortalLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { 
  Bot, 
  Search, 
  Settings, 
  BarChart3, 
  Zap, 
  BookOpen,
  MoreVertical,
  ExternalLink,
  Calendar,
  MessageSquare
} from "lucide-react";
import { useCustomerChatbots } from "@/hooks/useCustomerPortal";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

export default function MyChatbotsPage() {
  const { data: chatbots, isLoading } = useCustomerChatbots();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChatbots = chatbots?.filter(bot =>
    bot.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'paused': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'expired': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <CustomerPortalLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Chatbots</h1>
            <p className="text-muted-foreground mt-1">Manage and configure your rented chatbots</p>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search chatbots..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Chatbots Grid */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading chatbots...</div>
        ) : filteredChatbots.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredChatbots.map((chatbot) => {
              const usagePercentage = Math.round((chatbot.used_messages / chatbot.max_messages_per_month) * 100);
              
              return (
                <Card 
                  key={chatbot.id} 
                  className="group hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => navigate(`/customer-portal/chatbots/${chatbot.id}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="h-12 w-12 rounded-xl flex items-center justify-center shadow-sm"
                          style={{ backgroundColor: chatbot.brand_color + '20' }}
                        >
                          <Bot className="h-6 w-6" style={{ color: chatbot.brand_color }} />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{chatbot.name}</CardTitle>
                          <CardDescription className="capitalize">{chatbot.type.replace('_', ' ')}</CardDescription>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/customer-portal/chatbots/${chatbot.id}/settings`);
                          }}>
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/customer-portal/chatbots/${chatbot.id}/analytics`);
                          }}>
                            <BarChart3 className="mr-2 h-4 w-4" />
                            Analytics
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/customer-portal/chatbots/${chatbot.id}/test`);
                          }}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Test Chat
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge className={getStatusColor(chatbot.status)}>
                        {chatbot.status}
                      </Badge>
                      {chatbot.subscription_tier && (
                        <Badge variant="outline">{chatbot.subscription_tier}</Badge>
                      )}
                    </div>

                    {/* Usage */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Monthly Usage</span>
                        <span className={usagePercentage > 80 ? "text-destructive" : "text-foreground"}>
                          {chatbot.used_messages} / {chatbot.max_messages_per_month}
                        </span>
                      </div>
                      <Progress value={usagePercentage} className="h-2" />
                    </div>

                    {/* Platform Integrations */}
                    {chatbot.platform_integrations && chatbot.platform_integrations.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Platforms:</span>
                        <div className="flex gap-1">
                          {chatbot.platform_integrations.slice(0, 3).map((platform) => (
                            <Badge key={platform} variant="secondary" className="text-xs">
                              {platform}
                            </Badge>
                          ))}
                          {chatbot.platform_integrations.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{chatbot.platform_integrations.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Expiry Info */}
                    {chatbot.expiry_date && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Expires: {format(new Date(chatbot.expiry_date), 'MMM d, yyyy')}</span>
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="pt-3 border-t flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/customer-portal/chatbots/${chatbot.id}/rules`);
                        }}
                      >
                        <Zap className="h-3 w-3 mr-1" />
                        Rules
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/customer-portal/chatbots/${chatbot.id}/knowledge-base`);
                        }}
                      >
                        <BookOpen className="h-3 w-3 mr-1" />
                        KB
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="py-12">
            <CardContent className="text-center">
              <Bot className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-xl font-semibold mb-2">No Chatbots Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "No chatbots match your search." : "You don't have any chatbots yet."}
              </p>
              <p className="text-sm text-muted-foreground">
                Contact our sales team to rent a chatbot for your business.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </CustomerPortalLayout>
  );
}
