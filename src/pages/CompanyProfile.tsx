import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, Bot, Users, BarChart3, Shield, Globe, Building2, Target,
  Lightbulb, Mail, Phone, MapPin, Calendar, Award, CheckCircle2,
  Calculator, Truck, Workflow, Briefcase, GraduationCap, Heart,
  Clock, FileText, Linkedin, Twitter
} from 'lucide-react';
import coetanexLogo from '@/assets/coetanex-logo.png';

const companyInfo = {
  name: 'Coetanex AI',
  tagline: 'Enterprise Artificial Intelligence Solutions',
  founded: '2020',
  headquarters: 'San Francisco, California, USA',
  employees: '150+',
  industry: 'Enterprise Software & AI',
  website: 'www.coetanex.ai',
  email: 'contact@coetanex.ai',
  phone: '+1 (555) 123-4567'
};

const leadership = [
  { name: 'Alexandra Chen', title: 'Chief Executive Officer', expertise: 'AI Strategy & Business Development' },
  { name: 'Dr. Marcus Williams', title: 'Chief Technology Officer', expertise: 'Machine Learning & Systems Architecture' },
  { name: 'Sarah Martinez', title: 'Chief Operating Officer', expertise: 'Enterprise Operations & Scaling' },
  { name: 'James Thompson', title: 'Chief Product Officer', expertise: 'Product Strategy & Innovation' }
];

const solutions = [
  { 
    icon: Brain, 
    name: 'Enterprise AI Platform', 
    description: 'Custom AI models for business process automation, predictive analytics, and intelligent decision support systems.'
  },
  { 
    icon: Bot, 
    name: 'AI Agents & Chatbots', 
    description: 'Intelligent conversational agents for customer service, sales support, and internal operations automation.'
  },
  { 
    icon: Users, 
    name: 'CRM Intelligence', 
    description: 'AI-powered customer relationship management with lead scoring, churn prediction, and sales forecasting.'
  },
  { 
    icon: Calculator, 
    name: 'Financial Automation', 
    description: 'Automated accounting, expense management, invoice processing, and financial reporting solutions.'
  },
  { 
    icon: Truck, 
    name: 'Logistics Optimization', 
    description: 'Route optimization, demand forecasting, fleet management, and supply chain intelligence.'
  },
  { 
    icon: Workflow, 
    name: 'Process Automation', 
    description: 'End-to-end workflow automation, document processing, and intelligent task management.'
  }
];

const certifications = [
  'SOC 2 Type II Certified',
  'ISO 27001 Compliant',
  'GDPR Compliant',
  'HIPAA Ready',
  'AWS Partner',
  'Google Cloud Partner'
];

const milestones = [
  { year: '2020', event: 'Company Founded' },
  { year: '2021', event: 'Series A Funding - $15M' },
  { year: '2022', event: 'Launched Enterprise AI Platform' },
  { year: '2023', event: 'Expanded to 500+ Enterprise Clients' },
  { year: '2024', event: 'Series B Funding - $45M' }
];

export default function CompanyProfile() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={coetanexLogo} 
                alt="Coetanex AI Logo" 
                className="w-14 h-14 rounded-xl object-contain"
              />
              <div>
                <h1 className="font-display text-2xl font-bold">{companyInfo.name}</h1>
                <p className="text-sm text-muted-foreground">{companyInfo.tagline}</p>
              </div>
            </div>
            <Button onClick={() => navigate('/auth')}>
              Access Platform
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-5xl">
        {/* Company Overview */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-semibold">Company Overview</h2>
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Coetanex AI is a leading enterprise artificial intelligence company dedicated to transforming 
                    business operations through intelligent automation and data-driven insights. We develop 
                    comprehensive AI solutions that enable organizations to optimize processes, enhance customer 
                    experiences, and drive sustainable growth.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Our integrated platform combines advanced machine learning, natural language processing, 
                    and predictive analytics to deliver measurable business outcomes across CRM, finance, 
                    logistics, and operational management.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Founded:</span>
                    <span className="text-sm font-medium">{companyInfo.founded}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Headquarters:</span>
                    <span className="text-sm font-medium">{companyInfo.headquarters}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Employees:</span>
                    <span className="text-sm font-medium">{companyInfo.employees}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Industry:</span>
                    <span className="text-sm font-medium">{companyInfo.industry}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Mission & Vision */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-semibold">Mission & Vision</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-accent" />
                  Our Mission
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  To democratize artificial intelligence for businesses of all sizes, enabling organizations 
                  to harness the power of intelligent automation to optimize operations, enhance decision-making, 
                  and create exceptional value for their customers and stakeholders.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="h-4 w-4 text-accent" />
                  Our Vision
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  To be the global leader in enterprise AI solutions, recognized for our innovation, 
                  reliability, and commitment to delivering transformative technology that empowers 
                  businesses to thrive in an increasingly data-driven world.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Core Values */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-semibold">Core Values</h2>
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Lightbulb, label: 'Innovation', desc: 'Pushing boundaries' },
                  { icon: Shield, label: 'Integrity', desc: 'Trust and transparency' },
                  { icon: Users, label: 'Collaboration', desc: 'Partnership focused' },
                  { icon: Award, label: 'Excellence', desc: 'Quality driven' }
                ].map((value, i) => {
                  const Icon = value.icon;
                  return (
                    <div key={i} className="text-center p-4 rounded-lg bg-muted/30">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <p className="font-medium text-sm">{value.label}</p>
                      <p className="text-xs text-muted-foreground">{value.desc}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Solutions & Services */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-semibold">Solutions & Services</h2>
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-4">
                {solutions.map((solution, i) => {
                  const Icon = solution.icon;
                  return (
                    <div key={i} className="flex gap-3 p-4 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center shrink-0">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-1">{solution.name}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">{solution.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Leadership Team */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-semibold">Leadership Team</h2>
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-4">
                {leadership.map((leader, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-muted/30">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <span className="text-primary-foreground font-bold">{leader.name.split(' ').map(n => n[0]).join('')}</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{leader.name}</p>
                      <p className="text-xs text-primary">{leader.title}</p>
                      <p className="text-xs text-muted-foreground">{leader.expertise}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Company Milestones */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-semibold">Company Milestones</h2>
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-3">
                {milestones.map((milestone, i) => (
                  <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50">
                    <span className="text-sm font-semibold text-primary">{milestone.year}</span>
                    <span className="text-sm text-muted-foreground">{milestone.event}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Certifications & Compliance */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-semibold">Certifications & Compliance</h2>
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-2">
                {certifications.map((cert, i) => (
                  <Badge key={i} variant="secondary" className="px-3 py-1.5 gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    {cert}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Contact Information */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-semibold">Contact Information</h2>
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Globe className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Website</p>
                    <p className="text-sm font-medium">{companyInfo.website}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium">{companyInfo.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm font-medium">{companyInfo.phone}</p>
                  </div>
                </div>
              </div>
              <Separator className="my-6" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{companyInfo.headquarters}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Linkedin className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Twitter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 bg-muted/30">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 {companyInfo.name}. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-xs">
                Company Profile v1.0
              </Badge>
              <Button variant="outline" size="sm" onClick={() => navigate('/auth')}>
                Access Platform
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
