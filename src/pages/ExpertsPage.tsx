import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Rocket, ArrowRight, Linkedin, Calendar, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Expert {
  id?: string;
  name: string;
  title: string;
  photo_url?: string | null;
  linkedin_url?: string | null;
  booking_url?: string | null;
  scaleit_buckets: string[];
  bio: string;
  bullets: string[];
}

const FALLBACK_EXPERTS: Expert[] = [
  {
    name: 'Florina Ungureanu',
    title: 'Ecosystem Builder & EU Funding Lead',
    photo_url: null,
    linkedin_url: 'https://linkedin.com/in/florina-ungureanu',
    booking_url: 'https://calendly.com/florina-eu-enterprise',
    scaleit_buckets: ['Navigate Ready', 'Expansion Ready'],
    bio: "Florina builds bridges between startups, public institutions, and the EU ecosystem. She has led the AMS Startup Booster programme (NPS 9.8), currently drives inclusive AI innovation at AI4ALL Amsterdam, and is completing an MSc in Digital Business at UvA. Romanian-Dutch, with deep roots in both the Netherlands and CEE startup landscapes.",
    bullets: [
      'EU grant identification, consortium building & application coordination',
      'Ecosystem positioning and stakeholder mapping across Europe',
      'Public-private-academia partnerships and innovation programme design',
      'CEE market entry and Netherlands soft landing support',
      'Non-dilutive funding strategy for early to growth stage ventures',
    ],
  },
  {
    name: 'Giulia Falcone',
    title: 'Venture Capital & Innovation Specialist',
    photo_url: null,
    linkedin_url: 'https://linkedin.com/in/giuliafalcone27',
    booking_url: 'https://calendly.com/giulia-falcone',
    scaleit_buckets: ['Product Ready', 'Raise Ready', 'Finance Ready'],
    bio: "Giulia has supported 300+ startups through Startupbootcamp as Head of Portfolio and Innovation Manager, running full open innovation cycles with major corporates. With four years in private equity at MPD Partners and a Private Market Investments programme at Oxford Saïd Business School, she brings institutional finance rigour to early-stage ventures. She has led international expansions to Series A readiness and writes proposals for public and private tenders.",
    bullets: [
      'Fundraising strategy, pitch deck refinement and investor targeting',
      'Financial modeling, unit economics and cash flow management',
      'Open innovation programme management with corporate clients',
      'Portfolio management and startup scaling support (300+ alumni)',
      'Public and private tender proposal writing',
    ],
  },
  {
    name: 'Sabina Basariyeva',
    title: 'Venture Coach & Startup Matchmaker',
    photo_url: null,
    linkedin_url: 'https://linkedin.com/in/sabina-bsv',
    booking_url: 'https://calendly.com/sabina-basariyeva',
    scaleit_buckets: ['Sales Ready', 'Brand Ready'],
    bio: "Sabina has been building companies since she was 17. After leading global relations and growth at Startupbootcamp curating 60+ ecosystem events including FUTRXPO with 3,000+ attendees she now brings ecosystem intelligence to Dealroom, the world's leading startup data platform. She coaches founders on sales, personal brand, and visibility from both sides of the table: as an operator and as an entrepreneur.",
    bullets: [
      'ICP definition, sales funnel design and AI-powered outreach systems',
      'Founder and company positioning, LinkedIn strategy and messaging',
      'Startup scouting and ecosystem intelligence via Dealroom',
      'Business development through GTM, partnerships and sponsorships',
      'Keynote speaking preparation and thought leadership roadmap',
    ],
  },
  {
    name: 'Ruperto Calatrava',
    title: 'Open Innovation & Corporate Partnership Advisor',
    photo_url: null,
    linkedin_url: 'https://linkedin.com/in/rupertocalatrava',
    booking_url: 'https://calendly.com/ruperto-calatrava',
    scaleit_buckets: ['Enterprise Ready', 'Scale Ready'],
    bio: "Ruperto has spent a decade at the intersection of corporates and startups as Head of Innovation Consulting at TNW, Program Director at Startupbootcamp, and now Innovation Consultant at nlmtd Tech Discovery. He has run open innovation programmes for Heineken, Kraft Heinz, and major European corporations. An industrial engineer by training and an ecosystem builder by practice, he also builds partnerships across the LATAM ecosystem through uGlobally.",
    bullets: [
      'Corporate partnership strategy and enterprise sales readiness',
      'Open innovation programme design and corporate-startup matching',
      'Stakeholder mapping, procurement navigation and pilot-to-scale support',
      'Operational scaling, team structure and KPI systems',
      'LATAM and European ecosystem connections for international expansion',
    ],
  },
];

const BUCKET_COLORS: Record<string, string> = {
  'Navigate Ready': 'bg-blue-50 text-blue-700 border-blue-200',
  'Expansion Ready': 'bg-teal-50 text-teal-700 border-teal-200',
  'Product Ready': 'bg-violet-50 text-violet-700 border-violet-200',
  'Raise Ready': 'bg-green-50 text-green-700 border-green-200',
  'Finance Ready': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Sales Ready': 'bg-orange-50 text-orange-700 border-orange-200',
  'Brand Ready': 'bg-pink-50 text-pink-700 border-pink-200',
  'Enterprise Ready': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Scale Ready': 'bg-amber-50 text-amber-700 border-amber-200',
};

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function BucketTag({ bucket }: { bucket: string }) {
  const cls = BUCKET_COLORS[bucket] || 'bg-gray-50 text-gray-700 border-gray-200';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      {bucket}
    </span>
  );
}

export default function ExpertsPage() {
  const [experts, setExperts] = useState<Expert[]>(FALLBACK_EXPERTS);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from('experts')
          .select('*')
          .eq('is_active', true)
          .order('name');
        if (error) throw error;
        if (data && data.length > 0) {
          const mapped: Expert[] = data.map((e: any) => ({
            id: e.id,
            name: e.name,
            title: e.title || e.role || '',
            photo_url: e.photo_url,
            linkedin_url: e.linkedin_url,
            booking_url: e.booking_url || e.calendly_url,
            scaleit_buckets: e.scaleit_buckets || e.service_buckets || [],
            bio: e.bio || '',
            bullets: e.bullets || e.specialties || [],
          }));
          // Merge with fallback to keep richer content if some fields are empty
          setExperts(mapped.map((m) => {
            const fb = FALLBACK_EXPERTS.find((f) => f.name === m.name);
            return {
              ...m,
              bio: m.bio || fb?.bio || '',
              bullets: m.bullets?.length ? m.bullets : (fb?.bullets || []),
              scaleit_buckets: m.scaleit_buckets?.length ? m.scaleit_buckets : (fb?.scaleit_buckets || []),
              linkedin_url: m.linkedin_url || fb?.linkedin_url,
              booking_url: m.booking_url || fb?.booking_url,
              title: m.title || fb?.title || '',
            };
          }));
        }
      } catch {
        // keep fallback
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Public nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Rocket className="w-6 h-6 text-primary" />
            <span className="text-lg font-bold text-foreground">Build&nbsp;&amp;&nbsp;Beyond</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/experts" className="text-sm font-medium text-foreground">Experts</Link>
            <Button variant="ghost" size="sm" asChild><Link to="/login">Log in</Link></Button>
            <Button size="sm" asChild><Link to="/signup">Try it free</Link></Button>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="px-6 pt-16 pb-10 max-w-5xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-4">
          Meet the Team
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Senior operators and ecosystem builders matched to your specific stage, challenge, and market. No generalist advice. Just the right expert at the right moment.
        </p>
      </section>

      {/* Cards */}
      <section className="px-6 pb-16 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {experts.map((exp) => (
            <Card key={exp.name} className="p-6 bg-white border-border flex flex-col">
              <div className="flex items-start gap-4 mb-4">
                <Avatar className="h-16 w-16">
                  {exp.photo_url ? <AvatarImage src={exp.photo_url} alt={exp.name} /> : null}
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                    {initials(exp.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-foreground leading-tight">{exp.name}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{exp.title}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {exp.scaleit_buckets.map((b) => (
                      <BucketTag key={b} bucket={b} />
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-sm text-foreground/80 leading-relaxed mb-4">{exp.bio}</p>

              <ul className="space-y-2 mb-6 flex-1">
                {exp.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-2 mt-auto">
                {exp.linkedin_url && (
                  <Button asChild variant="outline" className="flex-1">
                    <a href={exp.linkedin_url} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="w-4 h-4 mr-2" />
                      View LinkedIn
                    </a>
                  </Button>
                )}
                {exp.booking_url && (
                  <Button asChild className="flex-1">
                    <a href={exp.booking_url} target="_blank" rel="noopener noreferrer">
                      <Calendar className="w-4 h-4 mr-2" />
                      Book a session
                    </a>
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="px-6 py-16 bg-white border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Don't see the right fit?
          </h2>
          <p className="text-muted-foreground mb-6">
            Tell us what you're trying to solve — a specific challenge, a stage you're stuck at, or a market you want to enter — and we'll match you with the right expert, or bring in someone new from our wider network.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild size="lg">
              <a href="mailto:contact@scale-it.co?subject=Looking%20for%20an%20expert">
                Tell us what you need
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/expert-profile">
                Apply to join the team
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

export { FALLBACK_EXPERTS };
