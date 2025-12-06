import { CustomerPortalLayout } from "@/components/customerportal/CustomerPortalLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bot, 
  Send, 
  ArrowLeft,
  User,
  RotateCcw,
  Settings,
  Maximize2
} from "lucide-react";
import { useCustomerChatbot } from "@/hooks/useCustomerPortal";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  matchedRule?: string;
}

const mockBotResponses: Record<string, { response: string; rule: string }> = {
  'hello': { response: 'Hello! How can I help you today?', rule: 'Welcome Message' },
  'hi': { response: 'Hi there! What can I do for you?', rule: 'Welcome Message' },
  'hours': { response: 'We\'re open Monday-Friday, 9AM-5PM.', rule: 'Business Hours' },
  'price': { response: 'Our pricing starts at $29/month. Would you like more details?', rule: 'Pricing Query' },
  'help': { response: 'I\'m here to help! You can ask me about our products, services, or policies.', rule: 'Help Request' },
};

export default function TestChatbotPage() {
  const { id: chatbotId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: chatbot } = useCustomerChatbot(chatbotId || '');
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatbot?.welcome_message && messages.length === 0) {
      setMessages([{
        id: '0',
        content: chatbot.welcome_message,
        sender: 'bot',
        timestamp: new Date(),
      }]);
    }
  }, [chatbot]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getBotResponse = (userMessage: string): { response: string; rule?: string } => {
    const lowerMessage = userMessage.toLowerCase();
    
    for (const [keyword, data] of Object.entries(mockBotResponses)) {
      if (lowerMessage.includes(keyword)) {
        return data;
      }
    }
    
    return { 
      response: chatbot?.fallback_message || "I'm sorry, I don't have an answer for that. Could you please rephrase your question?",
      rule: undefined
    };
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate bot response delay
    setTimeout(() => {
      const { response, rule } = getBotResponse(inputValue);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: 'bot',
        timestamp: new Date(),
        matchedRule: rule,
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    setMessages(chatbot?.welcome_message ? [{
      id: '0',
      content: chatbot.welcome_message,
      sender: 'bot',
      timestamp: new Date(),
    }] : []);
  };

  return (
    <CustomerPortalLayout>
      <div className="space-y-6 h-[calc(100vh-8rem)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/customer-portal/chatbots/${chatbotId}`)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Test Chatbot</h1>
              <p className="text-muted-foreground">Test your chatbot in a live environment</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button variant="outline" onClick={() => navigate(`/customer-portal/chatbots/${chatbotId}/settings`)}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 h-full">
          {/* Chat Window */}
          <Card className="lg:col-span-2 flex flex-col h-[calc(100vh-14rem)]">
            <CardHeader className="flex-shrink-0 border-b">
              <div className="flex items-center gap-3">
                <div 
                  className="h-10 w-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: (chatbot?.brand_color || '#3B82F6') + '20' }}
                >
                  <Bot className="h-5 w-5" style={{ color: chatbot?.brand_color || '#3B82F6' }} />
                </div>
                <div>
                  <CardTitle className="text-base">{chatbot?.name || 'Chatbot'}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    Online - Test Mode
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start gap-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div 
                        className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.sender === 'user' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}
                        style={message.sender === 'bot' ? { backgroundColor: (chatbot?.brand_color || '#3B82F6') + '20' } : {}}
                      >
                        {message.sender === 'user' 
                          ? <User className="h-4 w-4" /> 
                          : <Bot className="h-4 w-4" style={{ color: chatbot?.brand_color || '#3B82F6' }} />
                        }
                      </div>
                      <div>
                        <div 
                          className={`rounded-2xl px-4 py-2 ${
                            message.sender === 'user' 
                              ? 'bg-primary text-primary-foreground rounded-tr-none' 
                              : 'bg-muted rounded-tl-none'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>
                        {message.matchedRule && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            Rule: {message.matchedRule}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-8 w-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: (chatbot?.brand_color || '#3B82F6') + '20' }}
                      >
                        <Bot className="h-4 w-4" style={{ color: chatbot?.brand_color || '#3B82F6' }} />
                      </div>
                      <div className="bg-muted rounded-2xl rounded-tl-none px-4 py-2">
                        <div className="flex gap-1">
                          <span className="h-2 w-2 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="h-2 w-2 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="h-2 w-2 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="flex-shrink-0 p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button onClick={handleSend} disabled={!inputValue.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>

          {/* Test Info Panel */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-lg">Test Information</CardTitle>
              <CardDescription>Debug info and suggestions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Try these phrases:</h4>
                <div className="space-y-1">
                  {['Hello', 'What are your hours?', 'Tell me about pricing', 'I need help'].map((phrase) => (
                    <Button
                      key={phrase}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-sm"
                      onClick={() => {
                        setInputValue(phrase);
                      }}
                    >
                      "{phrase}"
                    </Button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-2">Session Stats</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Messages sent:</span>
                    <span>{messages.filter(m => m.sender === 'user').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rules matched:</span>
                    <span>{messages.filter(m => m.matchedRule).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fallback responses:</span>
                    <span>{messages.filter(m => m.sender === 'bot' && !m.matchedRule).length}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-2">Chatbot Config</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <Badge variant="outline">{chatbot?.type || 'rule_based'}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant={chatbot?.status === 'active' ? 'default' : 'secondary'}>
                      {chatbot?.status || 'unknown'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CustomerPortalLayout>
  );
}
