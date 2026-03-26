import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Rocket, Zap, Globe, Shield, Map, BarChart3, 
  FileText, Users, CheckCircle2, ArrowRight, Sparkles,
  Building2, Briefcase, TrendingUp, DollarSign, Target,
  Search, LineChart, Lightbulb, Megaphone, Scale,
  Landmark, Banknote, PiggyBank, HandCoins, CircleDollarSign,
  Star
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

      {/* === VALIDATE === */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-4">
            <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-sm font-medium">
              <Target className="w-3.5 h-3.5 mr-1.5" />
              Phase 1
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Validate</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              You have an idea but no clarity on whether it can work. You need honest answers before you invest your time and money.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <Card className="p-6 hover:shadow-lg transition-shadow border-border group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:bg-primary/20 transition-colors">
                <Sparkles className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">"I don't know how to structure my idea"</p>
              <h3 className="text-lg font-semibold text-foreground mb-2">AI Entrepreneur Whisperer</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Guided Q&A that maps your raw idea into a structured venture profile, even if you're starting from scratch.</p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow border-border group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:bg-primary/20 transition-colors">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">"Is anyone else doing this already?"</p>
              <h3 className="text-lg font-semibold text-foreground mb-2">Market Signals</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Real-time competitor moves, funding trends, and regulatory changes researched by AI and delivered to your dashboard.</p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow border-border group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:bg-primary/20 transition-colors">
                <FileText className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">"I need a single place that shows my startup's status"</p>
              <h3 className="text-lg font-semibold text-foreground mb-2">Startup Passport</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">A living, shareable profile: summary, validation, competitors, market data, compliance status, always up to date.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* === BUILD === */}
      <section className="py-24 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-4">
            <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-sm font-medium">
              <Map className="w-3.5 h-3.5 mr-1.5" />
              Phase 2
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Build</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              You know the idea works, but you're overwhelmed by what to do next. You need a clear path and the right tools to execute.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <Card className="p-6 hover:shadow-lg transition-shadow border-border group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:bg-primary/20 transition-colors">
                <Map className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">"I don't know what to focus on this quarter"</p>
              <h3 className="text-lg font-semibold text-foreground mb-2">12-Month Roadmap</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Auto-generated milestones matched to your stage, goals, and market, with tool recommendations at every step.</p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow border-border group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:bg-primary/20 transition-colors">
                <Zap className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">"Which tools should I actually be using?"</p>
              <h3 className="text-lg font-semibold text-foreground mb-2">Tool Recommendations</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Curated tools matched to your roadmap stage, from dev platforms to payments to automation.</p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow border-border group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:bg-primary/20 transition-colors">
                <Rocket className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">"How do I find the right resource to scale?"</p>
              <h3 className="text-lg font-semibold text-foreground mb-2">Venture Building Support</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Discover accelerators, competitions, venture builders, and experts scored by fit to your startup profile.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* === GROW / FUNDRAISING === */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-4">
            <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-sm font-medium">
              <DollarSign className="w-3.5 h-3.5 mr-1.5" />
              Phase 3
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Grow</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              You're ready to scale but funding feels like a maze. You need to find the right capital, build the right metrics, and pitch with confidence.
            </p>
          </div>

          <div className="mt-12">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-foreground mb-2">Fundraising done right</h3>
              <p className="text-muted-foreground">Your personalized path from first euro to growth capital</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <Card className="p-6 border-border text-center group hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mx-auto mb-4 text-green-700">
                  <Search className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">Identify your smart money</h4>
                <p className="text-sm text-muted-foreground">We analyze your stage, sector, and geography to match you with the funding sources that actually fit.</p>
              </Card>

              <Card className="p-6 border-border text-center group hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mx-auto mb-4 text-purple-700">
                  <Map className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">Personalized funding route</h4>
                <p className="text-sm text-muted-foreground">Subsidies, grants, angel investment, venture capital, corporate VC, bank loans, and more, mapped to your timeline.</p>
              </Card>

              <Card className="p-6 border-border text-center group hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mx-auto mb-4 text-blue-700">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">Funding metrics & readiness</h4>
                <p className="text-sm text-muted-foreground">Track burn rate, runway, MRR, and investor readiness. Know exactly when and how much to raise.</p>
              </Card>

              <Card className="p-6 border-border text-center group hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mx-auto mb-4 text-amber-700">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">Raise with confidence</h4>
                <p className="text-sm text-muted-foreground">Pipeline tracking, investor matching, funding goals, and progress dashboards all in one place.</p>
              </Card>
            </div>

            {/* Funding types */}
            <div className="flex flex-wrap justify-center gap-3">
              {['Subsidies', 'EU Grants', 'National Grants', 'Angel Investment', 'Venture Capital', 'Corporate VC', 'Bank Loans', 'Revenue-Based Financing', 'Crowdfunding'].map(type => (
                <Badge key={type} variant="outline" className="px-3 py-1.5 text-sm">
                  {type}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Supply Side / Partners */}
      <section id="partners" className="py-24 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-sm">
              <Building2 className="w-3.5 h-3.5 mr-1.5" />
              For the Ecosystem
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Reach Europe's most promising innovations
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Whether you're a programme, investor, service provider, venue, or institution, connect with startups matched to your focus, stage, and geography.
            </p>
          </div>

          {/* Benefits for partners */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="p-6 text-center border-border">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Qualified Deal Flow & Due Diligence Support</h3>
              <p className="text-sm text-muted-foreground">Access pre-validated startups with comprehensive passport profiles, readiness scores, and due diligence data.</p>
            </Card>
            <Card className="p-6 text-center border-border">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
                <Lightbulb className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Personalized Innovation Pipeline</h3>
              <p className="text-sm text-muted-foreground">Corporate open innovation, M&A scouting, R&D partnerships, and portfolio management powered by AI matching.</p>
            </Card>
            <Card className="p-6 text-center border-border">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Targeted Matching</h3>
              <p className="text-sm text-muted-foreground">Get matched with founders and partners based on industry, stage, geography, and needs. No noise, only relevant connections.</p>
            </Card>
            <Card className="p-6 text-center border-border">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
                <Megaphone className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Platform Visibility</h3>
              <p className="text-sm text-muted-foreground">Feature your programme, fund, or service directly in founder dashboards, recommendations, and the trusted-by section.</p>
            </Card>
          </div>

          {/* CTA before form */}
          <div className="text-center mb-10">
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Ready to join? Select your organization type below and complete the intake form. Our team will review your application and get you onboarded so you can start benefiting from the platform right away.
            </p>
          </div>

          {/* Partner Form */}
          <PartnerForm />
        </div>
      </section>

      {/* How it works + Pricing */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12">
            Up and running in 3 steps
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Choose your path', desc: 'Guided chat, intake form, or document upload. Pick what fits your stage.' },
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

        {/* Pricing */}
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
                  'Fundraising Hub',
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

      {/* Events */}
      <EventsPreview />

      {/* Trusted By */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Trusted by</h2>
          <p className="text-muted-foreground mb-10">
            Founders, programmes, and service providers building the future of European innovation
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
            {['Your organization here', 'Partner name', 'Early adopter', 'Innovation hub'].map((name, idx) => (
              <div key={idx} className="flex items-center gap-2 px-6 py-3 border border-border rounded-lg text-muted-foreground text-sm font-medium">
                <Star className="w-4 h-4" />
                {name}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-6">
            Want early brand visibility? <a href="#partners" className="text-primary underline">Join as a partner</a> and get featured here.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 bg-primary/5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to shape what's next?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Whether you're building the next big thing or enabling those who do, Build & Beyond is your launchpad.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 rounded-xl shadow-lg shadow-primary/25"
              onClick={() => navigate('/signup')}
            >
              Start for free
              <Rocket className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              variant="outline"
              size="lg" 
              className="text-lg px-8 py-6 rounded-xl"
              onClick={() => {
                document.getElementById('partners')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Become a partner
              <Building2 className="w-5 h-5 ml-2" />
            </Button>
          </div>
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
            © {new Date().getFullYear()} Build & Beyond. European Startup Intelligence.
          </p>
        </div>
      </footer>
    </div>
  );
}
