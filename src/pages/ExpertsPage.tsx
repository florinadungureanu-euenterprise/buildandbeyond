import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Rocket, ArrowRight, Linkedin, CheckCircle2 } from 'lucide-react';
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
  provenAt: string[];
  signatureOutcomes: string[];
  bestFor: string;
  passionateAbout: string;
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
    provenAt: ['AMS Startup Booster', 'AI4ALL Amsterdam', 'UvA'],
    signatureOutcomes: [
      'Led AMS Startup Booster to an NPS of 9.8',
      'Designed CEE soft-landing routes into the Netherlands',
    ],
    bestFor:
      'Founders chasing non-dilutive EU funding, CEE startups entering Western Europe, and programmes building consortia.',
    passionateAbout:
      'Connecting underrepresented founders with the EU ecosystem and turning public funding into real growth capital.',
  },
  {
    name: 'Giulia Falcone',
    title: 'Venture Capital & Innovation Specialist',
    photo_url: null,
    linkedin_url: 'https://linkedin.com/in/giuliafalcone27',
    booking_url: 'https://calendly.com/giulia-falcone',
    scaleit_buckets: ['Product Ready', 'Raise Ready', 'Finance Ready'],
    bio: "Giulia has supported 300+ startups through Startupbootcamp as Head of Portfolio and Innovation Manager, running full open innovation cycles with major corporates. With four years in private equity at MPD Partners and a Private Market Investments programme at Oxford Saïd Business School, she brings institutional finance rigour to early-stage ventures.",
    bullets: [
      'Fundraising strategy, pitch deck refinement and investor targeting',
      'Financial modeling, unit economics and cash flow management',
      'Open innovation programme management with corporate clients',
      'Portfolio management and startup scaling support (300+ alumni)',
      'Public and private tender proposal writing',
    ],
    provenAt: ['Startupbootcamp', 'MPD Partners', 'Oxford Saïd'],
    signatureOutcomes: [
      'Supported 300+ startups to Series A readiness',
      '4 years deploying capital in private equity at MPD Partners',
    ],
    bestFor:
      'Founders preparing to raise, finance leads tightening models, and programmes selecting and scaling cohorts.',
    passionateAbout:
      'Bringing institutional finance rigour into early-stage decisions so founders raise on their own terms.',
  },
  {
    name: 'Sabina Basariyeva',
    title: 'Venture Coach & Startup Matchmaker',
    photo_url: null,
    linkedin_url: 'https://linkedin.com/in/sabina-bsv',
    booking_url: 'https://calendly.com/sabina-basariyeva',
    scaleit_buckets: ['Sales Ready', 'Brand Ready'],
    bio: "Sabina has been building companies since she was 17. After leading global relations and growth at Startupbootcamp curating 60+ ecosystem events including FUTRXPO with 3,000+ attendees she now brings ecosystem intelligence to Dealroom, the world's leading startup data platform. She coaches founders on sales, personal brand, and visibility from both sides of the table.",
    bullets: [
      'ICP definition, sales funnel design and AI-powered outreach systems',
      'Founder and company positioning, LinkedIn strategy and messaging',
      'Startup scouting and ecosystem intelligence via Dealroom',
      'Business development through GTM, partnerships and sponsorships',
      'Keynote speaking preparation and thought leadership roadmap',
    ],
    provenAt: ['Dealroom', 'Startupbootcamp', 'FUTRXPO'],
    signatureOutcomes: [
      'Curated 60+ ecosystem events including FUTRXPO with 3,000+ attendees',
      'Built AI-powered outreach systems used to scale founder pipelines',
    ],
    bestFor:
      'Founders building authority from zero, GTM leads designing outbound, and investors scouting through Dealroom.',
    passionateAbout:
      'Helping founders find their voice and turning data into defensible sales and brand systems.',
  },
  {
    name: 'Ruperto Calatrava',
    title: 'Open Innovation & Corporate Partnership Advisor',
    photo_url: null,
    linkedin_url: 'https://linkedin.com/in/rupertocalatrava',
    booking_url: 'https://calendly.com/ruperto-calatrava',
    scaleit_buckets: ['Enterprise Ready', 'Scale Ready'],
    bio: "Ruperto has spent a decade at the intersection of corporates and startups as Head of Innovation Consulting at TNW, Program Director at Startupbootcamp, and now Innovation Consultant at nlmtd Tech Discovery. He has run open innovation programmes for Heineken, Kraft Heinz, and major European corporations.",
    bullets: [
      'Corporate partnership strategy and enterprise sales readiness',
      'Open innovation programme design and corporate-startup matching',
      'Stakeholder mapping, procurement navigation and pilot-to-scale support',
      'Operational scaling, team structure and KPI systems',
      'LATAM and European ecosystem connections for international expansion',
    ],
    provenAt: ['TNW', 'Heineken', 'Kraft Heinz', 'Startupbootcamp'],
    signatureOutcomes: [
      'Ran open innovation programmes for Heineken and Kraft Heinz',
      'Built LATAM-EU partnership bridges through uGlobally',
    ],
    bestFor:
      'Corporates building open innovation engines and scaleups entering enterprise sales and procurement.',
    passionateAbout:
      'Bridging the gap between legacy corporate processes and agile startup innovation cycles.',
  },
];

const BUCKET_COLORS: Record<string, string> = {
  'Navigate Ready': 'bg-blue-50 text-blue-700 border-blue-100',
  'Expansion Ready': 'bg-teal-50 text-teal-700 border-teal-100',
  'Product Ready': 'bg-violet-50 text-violet-700 border-violet-100',
  'Raise Ready': 'bg-green-50 text-green-700 border-green-100',
  'Finance Ready': 'bg-emerald-50 text-emerald-700 border-emerald-100',
  'Sales Ready': 'bg-orange-50 text-orange-700 border-orange-100',
  'Brand Ready': 'bg-pink-50 text-pink-700 border-pink-100',
  'Enterprise Ready': 'bg-purple-50 text-purple-700 border-purple-100',
  'Scale Ready': 'bg-indigo-50 text-indigo-700 border-indigo-100',
};

const ICP_FILTERS: { key: string; label: string; buckets: string[] | null }[] = [
  { key: 'all', label: 'All Experts', buckets: null },
  { key: 'founders', label: 'Founders', buckets: ['Raise Ready', 'Product Ready', 'Sales Ready', 'Brand Ready', 'Navigate Ready'] },
  { key: 'accelerators', label: 'Accelerators', buckets: ['Navigate Ready', 'Expansion Ready', 'Brand Ready'] },
  { key: 'investors', label: 'Investors', buckets: ['Raise Ready', 'Finance Ready', 'Product Ready'] },
  { key: 'corporates', label: 'Corporates', buckets: ['Enterprise Ready', 'Scale Ready'] },
];

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
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${cls}`}>
      {bucket}
    </span>
  );
}

const AVATAR_BG = [
  'bg-blue-100 text-blue-700',
  'bg-orange-100 text-orange-700',
  'bg-emerald-100 text-emerald-700',
  'bg-purple-100 text-purple-700',
];

export default function ExpertsPage() {
  const [experts, setExperts] = useState<Expert[]>(FALLBACK_EXPERTS);
  const [filter, setFilter] = useState<string>('all');

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
          const mapped: Expert[] = data.map((e: any) => {
            const fb = FALLBACK_EXPERTS.find((f) => f.name === e.name);
            return {
              id: e.id,
              name: e.name,
              title: e.title || e.role || fb?.title || '',
              photo_url: e.photo_url,
              linkedin_url: e.linkedin_url || fb?.linkedin_url,
              booking_url: e.booking_url || e.calendly_url || fb?.booking_url,
              scaleit_buckets: (e.scaleit_buckets || e.service_buckets || []).length
                ? (e.scaleit_buckets || e.service_buckets)
                : (fb?.scaleit_buckets || []),
              bio: e.bio || fb?.bio || '',
              bullets: (e.bullets || e.specialties || []).length
                ? (e.bullets || e.specialties)
                : (fb?.bullets || []),
              provenAt: fb?.provenAt || [],
              signatureOutcomes: fb?.signatureOutcomes || [],
              bestFor: fb?.bestFor || '',
              passionateAbout: fb?.passionateAbout || '',
            };
          });
          setExperts(mapped);
        }
      } catch {
        // keep fallback
      }
    })();
  }, []);

  const visible = useMemo(() => {
    const f = ICP_FILTERS.find((x) => x.key === filter);
    if (!f || !f.buckets) return experts;
    return experts.filter((e) => e.scaleit_buckets.some((b) => f.buckets!.includes(b)));
  }, [experts, filter]);

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

      {/* Header + ICP selector */}
      <section className="px-4 pt-16 pb-10 max-w-5xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4">
          Meet the Team
        </h1>
        <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8">
          Senior operators with proven track records. Select your profile to see who can help you most.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {ICP_FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={
                  active
                    ? 'px-4 py-2 rounded-full text-sm font-medium bg-blue-600 text-white shadow-sm'
                    : 'px-4 py-2 rounded-full text-sm font-medium bg-white border border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-colors'
                }
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Cards */}
      <section className="px-4 pb-16 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {visible.map((exp, idx) => (
            <div
              key={exp.name}
              className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow"
            >
              <div className="p-6 md:p-8 flex-1">
                {/* Header */}
                <div className="flex items-start justify-between mb-6 gap-3">
                  <div className="flex gap-4 min-w-0">
                    <Avatar className="h-16 w-16 border-2 border-white shadow-sm shrink-0">
                      {exp.photo_url ? <AvatarImage src={exp.photo_url} alt={exp.name} /> : null}
                      <AvatarFallback className={`${AVATAR_BG[idx % AVATAR_BG.length]} font-bold text-xl`}>
                        {initials(exp.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <h3 className="text-xl font-bold text-slate-900 leading-tight">{exp.name}</h3>
                      <p className="text-sm text-slate-500 mt-0.5">{exp.title}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {exp.scaleit_buckets.map((b) => (
                          <BucketTag key={b} bucket={b} />
                        ))}
                      </div>
                    </div>
                  </div>
                  {exp.linkedin_url && (
                    <a
                      href={exp.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-blue-600 transition-colors shrink-0"
                      aria-label={`${exp.name} on LinkedIn`}
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                  )}
                </div>

                {/* Bio */}
                <p className="text-sm text-slate-600 leading-relaxed mb-6">{exp.bio}</p>

                {/* Two-column proof + best-for */}
                <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                  <div className="space-y-4">
                    {exp.provenAt.length > 0 && (
                      <div>
                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                          Proven at
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-700 text-sm font-medium">
                          {exp.provenAt.map((p, i) => (
                            <span key={p} className="flex items-center gap-3">
                              <span>{p}</span>
                              {i < exp.provenAt.length - 1 && <span className="text-slate-300">•</span>}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {exp.signatureOutcomes.length > 0 && (
                      <div>
                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                          Signature Outcomes
                        </h4>
                        <ul className="space-y-2">
                          {exp.signatureOutcomes.map((b) => (
                            <li key={b} className="flex items-start gap-2 text-sm text-slate-600">
                              <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {exp.bestFor && (
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                          Best for
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">{exp.bestFor}</p>
                      </div>
                    )}
                    {exp.passionateAbout && (
                      <div>
                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                          Passionate about
                        </h4>
                        <p className="text-sm text-slate-600 leading-relaxed">{exp.passionateAbout}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Specialties */}
                {exp.bullets.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                      How they help
                    </h4>
                    <ul className="grid sm:grid-cols-2 gap-x-4 gap-y-1.5">
                      {exp.bullets.map((b, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                          <span className="w-1 h-1 rounded-full bg-slate-400 mt-2 shrink-0" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="px-6 md:px-8 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                <Button asChild variant="outline" className="flex-1 bg-white">
                  <a href="mailto:contact@scale-it.co?subject=Looking%20for%20an%20expert">
                    Tell us what you need
                  </a>
                </Button>
                {exp.booking_url && (
                  <Button asChild className="flex-1 bg-blue-600 hover:bg-blue-700">
                    <a href={exp.booking_url} target="_blank" rel="noopener noreferrer">
                      Book a session
                    </a>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {visible.length === 0 && (
          <div className="text-center text-sm text-slate-500 py-16">
            No experts match this profile yet. Try another filter or tell us what you need.
          </div>
        )}
      </section>

      {/* Footer CTA */}
      <section className="px-6 py-16 bg-white border-t border-slate-200">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
            Don't see the right fit?
          </h2>
          <p className="text-slate-600 mb-6">
            Tell us what you're trying to solve and we'll match you with the right expert, or bring in someone new from our wider network.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <a href="mailto:contact@scale-it.co?subject=Looking%20for%20an%20expert">
                Tell us what you need
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/expert-profile">Apply to join the team</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

export { FALLBACK_EXPERTS };
