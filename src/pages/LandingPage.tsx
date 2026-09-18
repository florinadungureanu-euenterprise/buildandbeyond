import { useState } from 'react';
import {
  ArrowRight, Building2, CalendarDays, Check, ChevronRight, FileText,
  Globe2, Menu, Network, Route, Search, Sparkles, Target, Users, X, Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PartnerForm } from '@/components/landing/PartnerForm';
import { EventsPreview } from '@/components/landing/EventsPreview';
import { WaitlistForm } from '@/components/landing/WaitlistForm';
import lightwave from '@/assets/eu-enterprise-lightwave.jpg';

const journey = [
  { step: '01', title: 'Validate', icon: Search, copy: 'Turn an early idea into a clear venture profile, with market signals and honest evidence.' },
  { step: '02', title: 'Build', icon: Route, copy: 'Move from uncertainty to a focused 12-month roadmap, matched tools, and the right support.' },
  { step: '03', title: 'Grow', icon: Zap, copy: 'Navigate funding, partnerships, European expansion, and opportunities in one place.' },
];

const outcomes = [
  { icon: FileText, label: 'Startup Passport', copy: 'One living, shareable view of your venture and its readiness.' },
  { icon: Target, label: 'Personal roadmap', copy: 'The next milestones that matter for your stage and ambitions.' },
  { icon: Globe2, label: 'European intelligence', copy: 'Relevant funding, programmes, partners, and market signals.' },
  { icon: Network, label: 'Trusted network', copy: 'A direct path to proven operators through Build Beyond, the EU Enterprise expert collective.' },
];

const questions = [
  'Which funding routes fit my startup now?',
  'Where should I expand first?',
  'Which partners can help me move faster?',
  'What deserves my focus this quarter?',
];

const CALENDLY_URL = 'https://calendly.com/florina-d-ungureanu-euenterprise';

function BrandMark() {
  return (
    <span className="flex items-center gap-3">
      <span className="brand-mark" aria-hidden="true"><ChevronRight /><ChevronRight /></span>
      <span className="font-heading text-sm font-semibold">EU Enterprise</span>
    </span>
  );
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const scrollTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="landing-shell min-h-screen bg-background text-foreground">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
          <a href="#top" aria-label="EU Enterprise home"><BrandMark /></a>
          <nav className="hidden items-center gap-8 md:flex" aria-label="Primary navigation">
            <button onClick={() => scrollTo('platform')} className="nav-link">For founders</button>
            <button onClick={() => scrollTo('partners')} className="nav-link">For the ecosystem</button>
            <a href="https://scale-it.co/" target="_blank" rel="noopener noreferrer" className="nav-link">Experts</a>
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <Button asChild variant="ghost" size="sm"><a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer">Book a demo</a></Button>
            <Button size="sm" onClick={() => scrollTo('waitlist')}>Join the waiting list <ArrowRight /></Button>
          </div>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? 'Close menu' : 'Open menu'}>
            {menuOpen ? <X /> : <Menu />}
          </Button>
        </div>
        {menuOpen && (
          <div className="border-t border-border bg-background px-5 py-5 md:hidden">
            <div className="flex flex-col gap-1">
              <Button variant="ghost" className="justify-start" onClick={() => scrollTo('platform')}>For founders</Button>
              <Button variant="ghost" className="justify-start" onClick={() => scrollTo('partners')}>For the ecosystem</Button>
              <Button asChild variant="ghost" className="justify-start"><a href="https://scale-it.co/">Experts</a></Button>
              <Button asChild variant="ghost" className="justify-start"><a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer">Book a demo</a></Button>
              <Button className="mt-3" onClick={() => scrollTo('waitlist')}>Join the waiting list <ArrowRight /></Button>
            </div>
          </div>
        )}
      </header>

      <main>
        <section id="top" className="relative min-h-[92svh] overflow-hidden border-b border-border pt-16">
          <img src={lightwave} alt="" width={1920} height={1080} className="absolute inset-0 h-full w-full object-cover object-center" />
          <div className="absolute inset-0 bg-hero-overlay" />
          <div className="absolute inset-0 tech-grid opacity-30" />
          <div className="relative mx-auto flex min-h-[calc(92svh-4rem)] max-w-7xl items-center px-5 py-16 lg:px-8">
            <div className="max-w-4xl">
              <div className="section-label mb-7"><span className="status-dot" /> THE TRUSTED PARTNER FOR EUROPEAN INNOVATION</div>
              <h1 className="font-heading text-[clamp(3.2rem,8vw,7.4rem)] font-semibold leading-[0.95]">
                Build with clarity.<br /><span className="gradient-text">Scale across Europe.</span>
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-7 text-muted-foreground md:text-xl md:leading-8">
                EU Enterprise brings your roadmap, market intelligence, funding routes, tools, and trusted support into one focused place.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" className="h-13 px-7" onClick={() => scrollTo('waitlist')}>Join the waiting list <ArrowRight /></Button>
                <Button size="lg" variant="outline" className="h-13 px-7" onClick={() => scrollTo('platform')}>Explore the platform</Button>
              </div>
              <p className="mt-5 text-xs text-muted-foreground">{"\n"}</p>
            </div>
          </div>
          <div className="relative border-t border-border/60 bg-background/50 backdrop-blur-md">
            <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-border/60 px-5 md:grid-cols-4 lg:px-8">
              {['Regulation-Ready', 'Founder-led', 'AI-powered research', 'Built for Europe'].map((item) => (
                <div key={item} className="flex items-center gap-2 py-4 pr-3 text-[11px] text-muted-foreground md:justify-center md:text-xs"><Check className="text-primary" /> {item}</div>
              ))}
            </div>
          </div>
        </section>

        <section id="platform" className="section-band">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">
              <div>
                <div className="section-label">A clearer path forward</div>
                <h2 className="section-title mt-6">From one question to your next move.</h2>
                <p className="mt-6 max-w-xl text-muted-foreground leading-7">Europe is full of opportunity. Finding what is relevant to your startup should not take weeks of fragmented searching.</p>
              </div>
              <div className="divide-y divide-border border-y border-border">
                {questions.map((question, index) => (
                  <div key={question} className="group flex items-center gap-5 py-6">
                    <span className="font-heading text-xs text-primary">0{index + 1}</span>
                    <p className="font-heading text-lg text-foreground md:text-xl">{question}</p>
                    <ArrowRight className="ml-auto text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-24 border border-border bg-card/60">
              <div className="grid md:grid-cols-3">
                {journey.map((item, index) => (
                  <article key={item.title} className={`p-7 md:p-9 ${index < journey.length - 1 ? 'border-b border-border md:border-b-0 md:border-r' : ''}`}>
                    <div className="mb-12 flex items-center justify-between">
                      <item.icon className="text-primary" />
                      <span className="font-heading text-xs text-muted-foreground">{item.step}</span>
                    </div>
                    <h3 className="font-heading text-2xl font-semibold">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.copy}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-secondary/40">
          <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
            <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
              <div>
                <div className="section-label">One connected workspace</div>
                <h2 className="section-title mt-6 max-w-3xl">Less noise. More momentum.</h2>
              </div>
              <p className="max-w-xl text-muted-foreground leading-7">Every recommendation connects back to your venture profile and roadmap, so the platform grows more relevant as you progress.</p>
            </div>
            <div className="mt-14 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
              {outcomes.map((item) => (
                <article key={item.label} className="bg-background p-6 md:min-h-56">
                  <item.icon className="mb-10 text-accent" />
                  <h3 className="font-heading text-lg font-semibold">{item.label}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section-band">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-2 lg:items-center lg:px-8">
            <div className="relative min-h-[390px] overflow-hidden border border-border bg-card md:min-h-[520px]">
              <img src={lightwave} alt="Connected European innovation network" loading="lazy" width={1920} height={1080} className="absolute inset-0 h-full w-full object-cover object-right" />
              <div className="absolute inset-0 bg-image-panel" />
              <div className="absolute inset-x-0 bottom-0 p-7 md:p-10">
                <div className="section-label">Build Beyond · the expert arm of EU Enterprise</div>
                <p className="mt-4 max-w-lg font-heading text-2xl font-semibold md:text-3xl">Strategy meets hands-on execution through the Build Beyond expert collective.</p>
              </div>
            </div>
            <div className="lg:pl-12">
              <div className="section-label">Build Beyond · expert support</div>
              <h2 className="section-title mt-6">Bring in the right operator at the right moment.</h2>
              <p className="mt-6 text-muted-foreground leading-7">EU Enterprise pairs its AI layer with Build Beyond, our expert collective. Get hands-on support across go-to-market, fundraising, European expansion, corporate partnerships, and venture building.</p>
              <Button asChild variant="outline" size="lg" className="mt-8"><a href="https://scale-it.co/" target="_blank" rel="noopener noreferrer">Meet the experts <ArrowRight /></a></Button>
            </div>
          </div>
        </section>

        <EventsPreview />

        <section id="partners" className="section-band border-t border-border bg-secondary/35">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="mx-auto mb-14 max-w-3xl text-center">
              <div className="section-label justify-center"><Building2 /> For the ecosystem</div>
              <h2 className="section-title mt-6">Put your opportunity in front of the right founders.</h2>
              <p className="mt-5 text-muted-foreground leading-7">Join as a programme, investor, service provider, community, corporate, institution, or innovation hub.</p>
            </div>
            <div className="partner-form-shell"><PartnerForm /></div>
          </div>
        </section>

        <section id="waitlist" className="relative scroll-mt-16 overflow-hidden border-t border-border py-20 md:py-28">
          <img src={lightwave} alt="" loading="lazy" width={1920} height={1080} className="absolute inset-0 h-full w-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-waitlist-overlay" />
          <div className="relative mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8">
            <div>
              <div className="section-label"><Sparkles /> Early access</div>
              <h2 className="section-title mt-6">Ready to move through Europe with clarity?</h2>
              <p className="mt-5 max-w-lg text-muted-foreground leading-7">Tell us what you are building and what you want to gain from EU Enterprise. We will reach out when your place is ready.</p>
            </div>
            <WaitlistForm />
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-background">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-10 md:flex-row md:items-center md:justify-between lg:px-8">
          <div><BrandMark /><p className="mt-3 text-xs text-muted-foreground">The trusted co-pilot for European founders.</p></div>
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
            <button onClick={() => scrollTo('platform')}>For founders</button>
            <button onClick={() => scrollTo('partners')}>Partners</button>
            <a href="https://scale-it.co/">Experts</a>
            <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer">Book a demo</a>
          </div>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} EU Enterprise</p>
        </div>
      </footer>
    </div>
  );
}