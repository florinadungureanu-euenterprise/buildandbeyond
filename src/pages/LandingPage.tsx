import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Rocket, Zap, Globe, Shield, Map, BarChart3, 
  FileText, Users, CheckCircle2, ArrowRight, Sparkles,
  Building2, Briefcase, TrendingUp, Calendar, MapPin
} from 'lucide-react';
import { PartnerForm } from '@/components/landing/PartnerForm';
import { EventsPreview } from '@/components/landing/EventsPreview';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Rocket className="w-6 h-6 text-primary" />
            <span className="text-lg font-bold text-foreground">Build&nbsp;&amp;&nbsp;Beyond</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
              Log in
            </Button>
            <Button size="sm" onClick={() => navigate('/signup')}>
              Try it free
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute top-40 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm font-medium">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            AI-Powered Startup Intelligence
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-foreground tracking-tight leading-[1.1] mb-6">
            From Idea to{' '}
            <span className="text-primary">Unicorn</span>
            <br />
            and Beyond
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            The trusted co-pilot that builds your roadmap, validates your market, finds your funding and keeps you on track.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow"
              onClick={() => navigate('/signup')}
            >
              Try it free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <p className="text-sm text-muted-foreground">No credit card required</p>
          </div>
        </div>
      </section>

      {/* Social proof bar */}
      <section className="py-8 border-y border-border bg-muted/30">
        <div className="max-w-5xl mx-auto px-6 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
          <span className="flex items-center gap-2"><Globe className="w-4 h-4" /> EU Regulation-Ready</span>
          <span className="flex items-center gap-2"><Shield className="w-4 h-4" /> GDPR Ready</span>
          <span className="flex items-center gap-2"><Zap className="w-4 h-4" /> AI-Powered Research</span>
          <span className="flex items-center gap-2"><Users className="w-4 h-4" /> Built for European Founders</span>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything you need to build, validate, and grow
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Three onboarding paths. One powerful platform. Personalized to your stage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Sparkles className="w-6 h-6" />,
                title: 'AI Entrepreneur Whisperer',
                description: 'Guided Q&A that maps your idea into a structured venture profile — even if you\'re starting from scratch.',
                color: 'text-primary',
              },
              {
                icon: <FileText className="w-6 h-6" />,
                title: 'Startup Passport',
                description: 'A living, shareable profile: summary, validation, competitors, market data, compliance status — always up to date.',
                color: 'text-primary',
              },
              {
                icon: <Map className="w-6 h-6" />,
                title: '12-Month Roadmap',
                description: 'Auto-generated milestones matched to your stage, goals, and market — with tool recommendations at every step.',
                color: 'text-primary',
              },
              {
                icon: <BarChart3 className="w-6 h-6" />,
                title: 'Market Signals',
                description: 'Real-time competitor moves, funding trends, and regulatory changes — researched by AI, delivered to your dashboard.',
                color: 'text-primary',
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: 'Tool Recommendations',
                description: 'Curated tools matched to your roadmap stage — from dev platforms to payments to automation.',
                color: 'text-primary',
              },
              {
                icon: <Rocket className="w-6 h-6" />,
                title: 'Grants & Programs',
                description: 'Discover accelerators, EU grants, and competitions scored by fit to your startup profile.',
                color: 'text-primary',
              },
            ].map((feature, idx) => (
              <Card key={idx} className="p-6 hover:shadow-lg transition-shadow border-border group">
                <div className={`w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 ${feature.color} group-hover:bg-primary/20 transition-colors`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12">
            Up and running in 3 steps
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Choose your path', desc: 'Guided chat, intake form, or document upload — pick what fits your stage.' },
              { step: '2', title: 'AI does the research', desc: 'Market analysis, competitor mapping, and opportunity matching happen automatically.' },
              { step: '3', title: 'Get your roadmap', desc: 'Dashboard, passport, and signals populate with personalized, actionable insights.' },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Simple, founder-friendly pricing
            </h2>
            <p className="text-lg text-muted-foreground">
              Start free. Upgrade when you're ready to scale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free */}
            <Card className="p-8 border-border">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-foreground">Free</h3>
                <div className="mt-2">
                  <span className="text-4xl font-extrabold text-foreground">€0</span>
                  <span className="text-muted-foreground ml-1">/month</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Perfect for exploring your idea</p>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'AI Entrepreneur Whisperer',
                  'Startup Passport',
                  'Founder Intake Form',
                  'Document Upload',
                  'Basic Dashboard',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full" onClick={() => navigate('/signup')}>
                Get started
              </Button>
            </Card>

            {/* Pro */}
            <Card className="p-8 border-primary border-2 relative shadow-lg shadow-primary/10">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3">
                Most Popular
              </Badge>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-foreground">Pro</h3>
                <div className="mt-2">
                  <span className="text-4xl font-extrabold text-foreground">€11</span>
                  <span className="text-muted-foreground ml-1">/month</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">For founders ready to build &amp; raise</p>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Everything in Free',
                  'AI Market Signals (live)',
                  '12-Month Roadmap',
                  'Tool Recommendations',
                  'Grants & Programs Matching',
                  'Fundraising Tracker',
                  'Team Management',
                  'Passport PDF Export',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button className="w-full" onClick={() => navigate('/signup')}>
                Try it free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Events Preview */}
      <EventsPreview />

      {/* Supply Side - Partner CTA */}
      <section id="partners" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-sm">
              <Building2 className="w-3.5 h-3.5 mr-1.5" />
              For Programmes, Investors & Service Providers
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Reach Europe's most promising founders
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join Build & Beyond as a partner — connect with startups matched to your focus, stage, and geography.
            </p>
          </div>

          {/* Benefits for partners */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="p-6 text-center border-border">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Qualified Deal Flow</h3>
              <p className="text-sm text-muted-foreground">Access pre-validated startups with comprehensive passport profiles and readiness scores.</p>
            </Card>
            <Card className="p-6 text-center border-border">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Targeted Matching</h3>
              <p className="text-sm text-muted-foreground">Get matched with founders based on industry, stage, geography, and needs — no noise.</p>
            </Card>
            <Card className="p-6 text-center border-border">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Platform Visibility</h3>
              <p className="text-sm text-muted-foreground">Feature your programme, fund, or service directly in founder dashboards and recommendations.</p>
            </Card>
          </div>

          {/* Partner Form */}
          <PartnerForm />
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-primary/5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to build something extraordinary?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join founders across Europe who are using AI to build smarter, validate faster, and raise with confidence.
          </p>
          <Button 
            size="lg" 
            className="text-lg px-8 py-6 rounded-xl shadow-lg shadow-primary/25"
            onClick={() => navigate('/signup')}
          >
            Start building for free
            <Rocket className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">Build&nbsp;&amp;&nbsp;Beyond</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Build & Beyond. European Startup Passport Initiative.
          </p>
        </div>
      </footer>
    </div>
  );
}
