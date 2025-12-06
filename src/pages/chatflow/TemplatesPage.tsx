import { useState } from 'react';
import { ChatFlowLayout } from '@/components/chatflow/ChatFlowLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search,
  Star,
  Download,
  Eye,
  Zap,
  ShoppingCart,
  Headphones,
  Calendar,
  HelpCircle,
  MessageSquare,
  Building2,
  GraduationCap,
  Heart
} from 'lucide-react';
import { useTemplates } from '@/hooks/useChatFlow';

const categories = [
  { id: 'all', name: 'All Templates', icon: Zap },
  { id: 'sales', name: 'Sales', icon: ShoppingCart },
  { id: 'support', name: 'Customer Support', icon: Headphones },
  { id: 'booking', name: 'Booking & Scheduling', icon: Calendar },
  { id: 'faq', name: 'FAQ & Help Desk', icon: HelpCircle },
  { id: 'lead', name: 'Lead Generation', icon: MessageSquare },
  { id: 'real-estate', name: 'Real Estate', icon: Building2 },
  { id: 'education', name: 'Education', icon: GraduationCap },
  { id: 'healthcare', name: 'Healthcare', icon: Heart },
];

// Mock templates
const mockTemplates = [
  {
    id: '1',
    name: 'E-commerce Assistant',
    description: 'Help customers find products, track orders, and answer FAQs',
    category: 'sales',
    use_case: 'Online retail and e-commerce',
    rating: 4.8,
    review_count: 234,
    download_count: 1520,
    is_featured: true,
    tags: ['e-commerce', 'product search', 'order tracking'],
    preview_image_url: null,
  },
  {
    id: '2',
    name: 'Customer Support Bot',
    description: 'Handle support tickets, provide solutions, and escalate when needed',
    category: 'support',
    use_case: 'Technical and customer support',
    rating: 4.7,
    review_count: 189,
    download_count: 1280,
    is_featured: true,
    tags: ['support', 'ticketing', 'troubleshooting'],
    preview_image_url: null,
  },
  {
    id: '3',
    name: 'Appointment Scheduler',
    description: 'Book, reschedule, and manage appointments automatically',
    category: 'booking',
    use_case: 'Service businesses and clinics',
    rating: 4.6,
    review_count: 156,
    download_count: 890,
    is_featured: false,
    tags: ['appointments', 'calendar', 'reminders'],
    preview_image_url: null,
  },
  {
    id: '4',
    name: 'Lead Qualification Bot',
    description: 'Qualify leads, collect information, and route to sales team',
    category: 'lead',
    use_case: 'B2B and B2C lead generation',
    rating: 4.5,
    review_count: 98,
    download_count: 650,
    is_featured: true,
    tags: ['leads', 'qualification', 'forms'],
    preview_image_url: null,
  },
  {
    id: '5',
    name: 'FAQ Assistant',
    description: 'Answer frequently asked questions from your knowledge base',
    category: 'faq',
    use_case: 'Any business with FAQs',
    rating: 4.9,
    review_count: 312,
    download_count: 2100,
    is_featured: true,
    tags: ['faq', 'knowledge base', 'self-service'],
    preview_image_url: null,
  },
  {
    id: '6',
    name: 'Real Estate Agent',
    description: 'Help buyers find properties and schedule viewings',
    category: 'real-estate',
    use_case: 'Real estate agencies',
    rating: 4.4,
    review_count: 67,
    download_count: 420,
    is_featured: false,
    tags: ['real estate', 'property', 'viewings'],
    preview_image_url: null,
  },
];

export default function TemplatesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const templates = mockTemplates;

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredTemplates = templates.filter(t => t.is_featured);

  const getCategoryIcon = (categoryId: string) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat?.icon || Zap;
  };

  return (
    <ChatFlowLayout title="Templates">
      <div className="space-y-6">
        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Featured Templates */}
        {selectedCategory === 'all' && !searchQuery && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Featured Templates</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {featuredTemplates.slice(0, 3).map((template) => {
                const CategoryIcon = getCategoryIcon(template.category);
                return (
                  <Card key={template.id} className="group hover:shadow-lg transition-shadow relative overflow-hidden">
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-yellow-500 text-yellow-950">Featured</Badge>
                    </div>
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <CategoryIcon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                              <span className="text-sm font-medium">{template.rating}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">({template.review_count} reviews)</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {template.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Download className="h-3 w-3" />
                          {template.download_count.toLocaleString()} uses
                        </span>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="gap-1">
                            <Eye className="h-3 w-3" />
                            Preview
                          </Button>
                          <Button size="sm" className="gap-1">
                            <Zap className="h-3 w-3" />
                            Use
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Categories */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-4">
          <TabsList className="flex-wrap h-auto gap-2 bg-transparent p-0">
            {categories.map((cat) => (
              <TabsTrigger
                key={cat.id}
                value={cat.id}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
              >
                <cat.icon className="h-4 w-4" />
                {cat.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((cat) => (
            <TabsContent key={cat.id} value={cat.id} className="space-y-4">
              {filteredTemplates.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredTemplates.map((template) => {
                    const CategoryIcon = getCategoryIcon(template.category);
                    return (
                      <Card key={template.id} className="group hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <CategoryIcon className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <CardTitle className="text-base">{template.name}</CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                  <span className="text-xs font-medium">{template.rating}</span>
                                </div>
                                <span className="text-xs text-muted-foreground">({template.review_count})</span>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{template.description}</p>
                          <div className="flex flex-wrap gap-1 mb-4">
                            {template.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                            ))}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Download className="h-3 w-3" />
                              {template.download_count.toLocaleString()}
                            </span>
                            <Button size="sm" className="gap-1">
                              <Zap className="h-3 w-3" />
                              Use Template
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <Search className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No templates found</h3>
                    <p className="text-muted-foreground text-center">
                      Try adjusting your search or browse a different category
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </ChatFlowLayout>
  );
}
