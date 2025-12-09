import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, Bot, Users, BarChart3, MessageSquare, Shield, Zap, 
  Globe, CheckCircle, ArrowRight, Sparkles, Building2, Target,
  Lightbulb, Layers, Database, Cloud, Lock, TrendingUp,
  HeadphonesIcon, FileText, Calculator, Truck, Workflow, 
  Star, Award, ChevronDown
} from 'lucide-react';

const services = [
  {
    icon: Brain,
    title: 'Enterprise AI Solutions',
    description: 'Custom AI models and intelligent automation tailored to your business processes.',
    features: ['Machine Learning Models', 'Natural Language Processing', 'Predictive Analytics', 'Computer Vision']
  },
  {
    icon: Bot,
    title: 'AI Chatbots & Agents',
    description: 'Intelligent conversational agents that handle customer support, sales, and internal operations.',
    features: ['24/7 Customer Support', 'Multi-language Support', 'Contextual Understanding', 'Seamless Handoffs']
  },
  {
    icon: Users,
    title: 'CRM & Sales Automation',
    description: 'AI-powered customer relationship management with predictive insights and automation.',
    features: ['Lead Scoring', 'Pipeline Management', 'Sales Forecasting', 'Customer Insights']
  },
  {
    icon: Calculator,
    title: 'Smart Accounting',
    description: 'Automated financial management with AI-driven insights and reporting.',
    features: ['Automated Bookkeeping', 'Expense Tracking', 'Financial Forecasting', 'Compliance Management']
  },
  {
    icon: Truck,
    title: 'Logistics Intelligence',
    description: 'Optimize your supply chain and logistics with AI-powered route optimization and tracking.',
    features: ['Route Optimization', 'Real-time Tracking', 'Demand Forecasting', 'Fleet Management']
  },
  {
    icon: Workflow,
    title: 'Business Process Automation',
    description: 'Streamline operations with intelligent workflow automation and decision support.',
    features: ['Workflow Automation', 'Document Processing', 'Decision Support', 'Integration Hub']
  }
];

const stats = [
  { value: '500+', label: 'Clients Served' },
  { value: '99.9%', label: 'Uptime Guarantee' },
  { value: '50M+', label: 'AI Interactions' },
  { value: '85%', label: 'Cost Reduction' }
];

const testimonials = [
  {
    quote: "Coetanex AI transformed our customer service with their intelligent chatbot solution. Response times dropped by 80%.",
    author: "Sarah Chen",
    role: "CTO, TechFlow Industries",
    rating: 5
  },
  {
    quote: "The enterprise AI platform helped us automate 70% of our manual processes, freeing our team for strategic work.",
    author: "Michael Roberts",
    role: "Operations Director, Global Logistics Co",
    rating: 5
  },
  {
    quote: "Their CRM AI predicted customer churn with 95% accuracy, helping us retain our most valuable accounts.",
    author: "Lisa Thompson",
    role: "VP Sales, FinServe Solutions",
    rating: 5
  }
];

const values = [
  { icon: Lightbulb, title: 'Innovation', description: 'Pushing boundaries with cutting-edge AI technology' },
  { icon: Shield, title: 'Security', description: 'Enterprise-grade security and data protection' },
  { icon: Target, title: 'Results', description: 'Focused on measurable business outcomes' },
  { icon: Users, title: 'Partnership', description: 'Long-term relationships with our clients' }
];

export default function CompanyProfile() {
  const navigate = useNavigate();
  const [activeService, setActiveService] = useState(0);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <Brain className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <span className="font-display font-bold text-xl">Coetanex</span>
                <span className="font-display font-bold text-xl text-primary"> AI</span>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center gap-8">
              <a href="#services" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Services</a>
              <a href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">About</a>
              <a href="#solutions" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Solutions</a>
              <a href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Testimonials</a>
            </nav>
            
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => navigate('/auth')}>
                Sign In
              </Button>
              <Button 
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                onClick={() => navigate('/auth')}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 lg:px-8 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-radial from-primary/5 to-transparent" />
        </div>

        <div className="container mx-auto max-w-6xl relative">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 px-4 py-2">
              <Sparkles className="h-4 w-4 mr-2" />
              Enterprise AI Solutions
            </Badge>
            
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Transform Your Business
              <br />
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                With Intelligent AI
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Coetanex AI delivers cutting-edge artificial intelligence solutions that automate operations, 
              enhance customer experiences, and drive unprecedented business growth.
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg px-8 h-14"
                onClick={() => navigate('/auth')}
              >
                Start Your AI Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 h-14"
              >
                Book a Demo
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, i) => (
              <div key={i} className="text-center p-6 rounded-2xl bg-card/50 backdrop-blur border border-border/50">
                <div className="font-display text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4 lg:px-8 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">Our Services</Badge>
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
              Complete AI Solutions Suite
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From intelligent chatbots to enterprise automation, we provide end-to-end AI solutions 
              that transform how businesses operate.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => {
              const Icon = service.icon;
              return (
                <Card 
                  key={i} 
                  className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-border/50 bg-card/80 backdrop-blur hover:-translate-y-1"
                  onClick={() => setActiveService(i)}
                >
                  <CardContent className="p-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="font-display text-xl font-bold mb-2">{service.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{service.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {service.features.map((feature, j) => (
                        <Badge key={j} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">About Coetanex AI</Badge>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
                Pioneering the Future of
                <span className="text-primary"> Enterprise AI</span>
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Founded with a vision to democratize artificial intelligence for businesses of all sizes, 
                Coetanex AI has become a trusted partner for organizations seeking to leverage the power of AI.
              </p>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Our team of AI researchers, engineers, and business strategists work together to deliver 
                solutions that not only implement cutting-edge technology but also deliver measurable business results.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                {values.map((value, i) => {
                  const Icon = value.icon;
                  return (
                    <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-muted/50">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">{value.title}</h4>
                        <p className="text-xs text-muted-foreground">{value.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/5" />
                
                {/* Floating Icons */}
                <div className="absolute top-8 left-8 w-16 h-16 rounded-2xl bg-card shadow-lg flex items-center justify-center animate-float">
                  <Brain className="h-8 w-8 text-primary" />
                </div>
                <div className="absolute top-1/4 right-12 w-14 h-14 rounded-xl bg-card shadow-lg flex items-center justify-center animate-float delay-100">
                  <Bot className="h-7 w-7 text-accent" />
                </div>
                <div className="absolute bottom-1/4 left-12 w-12 h-12 rounded-lg bg-card shadow-lg flex items-center justify-center animate-float delay-200">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div className="absolute bottom-8 right-8 w-20 h-20 rounded-2xl bg-card shadow-lg flex items-center justify-center animate-float delay-300">
                  <BarChart3 className="h-10 w-10 text-accent" />
                </div>
                
                {/* Central Element */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl">
                    <span className="font-display text-5xl font-bold text-primary-foreground">C</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions/Products Section */}
      <section id="solutions" className="py-20 px-4 lg:px-8 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">Platform Features</Badge>
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
              All-in-One Enterprise Platform
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything your business needs to harness the power of AI, integrated into one seamless platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Cloud, title: 'Cloud Infrastructure', desc: 'Scalable, secure cloud deployment' },
              { icon: Database, title: 'Data Integration', desc: 'Connect all your data sources' },
              { icon: Lock, title: 'Enterprise Security', desc: 'SOC2 & GDPR compliant' },
              { icon: TrendingUp, title: 'Analytics Dashboard', desc: 'Real-time insights & reporting' },
              { icon: Bot, title: 'AI Assistants', desc: 'Intelligent virtual agents' },
              { icon: Workflow, title: 'Automation Engine', desc: 'No-code workflow builder' },
              { icon: Globe, title: 'Multi-language', desc: '100+ languages supported' },
              { icon: HeadphonesIcon, title: '24/7 Support', desc: 'Dedicated success team' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="p-5 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-colors group">
                  <Icon className="h-8 w-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                  <h4 className="font-semibold mb-1">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Testimonials</Badge>
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
              Trusted by Industry Leaders
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See what our clients say about transforming their operations with Coetanex AI.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <Card key={i} className="border-border/50 bg-card/50 backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 italic">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <span className="text-primary-foreground font-bold">{testimonial.author[0]}</span>
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{testimonial.author}</div>
                      <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <div className="relative rounded-3xl bg-gradient-to-r from-primary via-accent to-primary p-12 text-center overflow-hidden">
            <div className="absolute inset-0 bg-grid-white/10" />
            <div className="relative">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                Ready to Transform Your Business?
              </h2>
              <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
                Join hundreds of companies already using Coetanex AI to automate operations 
                and deliver exceptional customer experiences.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button 
                  size="lg" 
                  variant="secondary" 
                  className="text-lg px-8 h-14"
                  onClick={() => navigate('/auth')}
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-lg px-8 h-14 bg-transparent text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/10"
                >
                  Contact Sales
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 px-4 lg:px-8 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Brain className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-display font-bold">Coetanex AI</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Transforming businesses with intelligent AI solutions.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Solutions</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">AI Chatbots</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">CRM Automation</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Enterprise AI</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Analytics</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#about" className="hover:text-foreground transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 Coetanex AI. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="gap-1">
                <Shield className="h-3 w-3" />
                SOC2 Certified
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Lock className="h-3 w-3" />
                GDPR Compliant
              </Badge>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
