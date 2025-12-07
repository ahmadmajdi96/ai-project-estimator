import { useState } from 'react';
import { ChatFlowLayout } from '@/components/chatflow/ChatFlowLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Search, 
  BookOpen, 
  MessageCircle, 
  Video, 
  FileText, 
  ExternalLink,
  Bot,
  Zap,
  Globe,
  Settings,
  Users,
  BarChart3
} from 'lucide-react';

const categories = [
  { name: 'Getting Started', icon: Zap, count: 12 },
  { name: 'Chatbot Setup', icon: Bot, count: 18 },
  { name: 'Integrations', icon: Globe, count: 8 },
  { name: 'Analytics', icon: BarChart3, count: 6 },
  { name: 'Team Management', icon: Users, count: 5 },
  { name: 'Account Settings', icon: Settings, count: 10 },
];

const faqs = [
  {
    question: 'How do I create my first chatbot?',
    answer: 'To create your first chatbot, go to the Chatbots page and click "Create Chatbot". Choose a template or start from scratch, give your chatbot a name, and select the type (AI-powered, rule-based, or hybrid). Follow the setup wizard to configure your chatbot\'s behavior and responses.',
  },
  {
    question: 'What\'s the difference between AI-powered and rule-based chatbots?',
    answer: 'Rule-based chatbots follow predefined conversation flows and respond based on keywords or patterns. AI-powered chatbots use natural language processing to understand context and generate responses. Hybrid chatbots combine both approaches for the best of both worlds.',
  },
  {
    question: 'How do I connect my chatbot to WhatsApp?',
    answer: 'Go to Integrations, select WhatsApp, and follow the setup process. You\'ll need a WhatsApp Business API account. Once connected, your chatbot will automatically respond to messages on WhatsApp.',
  },
  {
    question: 'Can I train my chatbot with my own data?',
    answer: 'Yes! You can upload documents, FAQs, and other content to your knowledge base. The AI will learn from this content to provide more accurate and relevant responses. Go to Knowledge Base to add your training data.',
  },
  {
    question: 'How do I track chatbot performance?',
    answer: 'The Analytics dashboard provides comprehensive metrics including conversation volume, response times, user satisfaction, and more. You can filter by date range and chatbot to get detailed insights.',
  },
  {
    question: 'What happens when the chatbot can\'t answer a question?',
    answer: 'You can configure fallback behaviors in your chatbot settings. Options include showing a default message, offering to connect with a human agent, or collecting the user\'s contact information for follow-up.',
  },
];

const resources = [
  {
    title: 'Quick Start Guide',
    description: 'Get up and running in 5 minutes',
    icon: Zap,
    type: 'guide',
  },
  {
    title: 'Video Tutorials',
    description: 'Step-by-step video walkthroughs',
    icon: Video,
    type: 'video',
  },
  {
    title: 'API Documentation',
    description: 'Complete API reference',
    icon: FileText,
    type: 'docs',
  },
  {
    title: 'Community Forum',
    description: 'Connect with other users',
    icon: Users,
    type: 'community',
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ChatFlowLayout title="Help Center">
      <div className="space-y-6">
        {/* Search */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="pt-6">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold mb-2">How can we help you?</h2>
              <p className="text-muted-foreground mb-6">
                Search our knowledge base or browse categories below
              </p>
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search for help..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-lg"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <Card 
              key={category.name} 
              className="cursor-pointer hover:shadow-md transition-shadow"
            >
              <CardContent className="pt-6 text-center">
                <div className="mx-auto w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <category.icon className="h-6 w-6 text-primary" />
                </div>
                <p className="font-medium text-sm">{category.name}</p>
                <p className="text-xs text-muted-foreground">{category.count} articles</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Resources */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {resources.map((resource) => (
            <Card 
              key={resource.title} 
              className="cursor-pointer hover:shadow-md transition-shadow"
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-muted">
                    <resource.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{resource.title}</p>
                    <p className="text-sm text-muted-foreground">{resource.description}</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQs */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
            <CardDescription>
              Quick answers to common questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {filteredFaqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            {filteredFaqs.length === 0 && (
              <div className="text-center py-8">
                <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Support */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Still need help?</h3>
                  <p className="text-sm text-muted-foreground">
                    Our support team is here to assist you
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="gap-2">
                  <BookOpen className="h-4 w-4" />
                  View Documentation
                </Button>
                <Button className="gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Contact Support
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ChatFlowLayout>
  );
}
