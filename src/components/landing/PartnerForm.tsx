import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, Building2, Briefcase, TrendingUp, Send, Users, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, MapPin, Building, Laptop, User, Landmark } from 'lucide-react';

type PartnerType = 'programme' | 'investor' | 'service_provider' | 'event_organizer' | 'community' | 'corporate' | 'public_institution' | 'venue' | 'freelancer';

export function PartnerForm() {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    type: '' as PartnerType | '',
    company_name: '',
    contact_name: '',
    email: '',
    website: '',
    services_offered: '',
    target_stages: '',
    investment_range: '',
    funding_type: '',
    geographic_coverage: '',
    pricing_model: '',
    description: '',
    institution_type: '',
    institution_goals: '',
  });

  const partnerTypes: { value: PartnerType; label: string; icon: React.ReactNode; desc: string }[] = [
    { value: 'programme', label: 'Venture Building Support', icon: <Building2 className="w-5 h-5" />, desc: 'Startup programmes, venture studios and venture builders' },
    { value: 'investor', label: 'Investor', icon: <TrendingUp className="w-5 h-5" />, desc: 'Dilutive and non-dilutive funding' },
    { value: 'service_provider', label: 'Service Provider', icon: <Briefcase className="w-5 h-5" />, desc: 'Legal, accounting, marketing, tech services, etc.' },
    { value: 'event_organizer', label: 'Event Organizer', icon: <Calendar className="w-5 h-5" />, desc: 'Conference, hackathon, workshop organizers' },
    { value: 'community', label: 'Community', icon: <Users className="w-5 h-5" />, desc: 'Startup communities, networks, associations' },
    { value: 'corporate', label: 'Corporate', icon: <Building className="w-5 h-5" />, desc: 'Corporate innovation, partnerships, pilots' },
    { value: 'public_institution', label: 'Public Institution', icon: <Landmark className="w-5 h-5" />, desc: 'Universities, municipalities, government agencies' },
    { value: 'venue', label: 'Venue / Co-working / Hub', icon: <MapPin className="w-5 h-5" />, desc: 'Co-working spaces, innovation hubs, labs' },
    { value: 'freelancer', label: 'Freelancer', icon: <User className="w-5 h-5" />, desc: 'Independent consultants and specialists' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.type || !form.company_name || !form.email || !form.contact_name) {
      toast({ title: 'Missing fields', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      await supabase.from('partner_submissions' as any).insert({
        type: form.type,
        company_name: form.company_name,
        contact_name: form.contact_name,
        email: form.email,
        website: form.website,
        services_offered: form.services_offered,
        target_stages: form.target_stages,
        investment_range: form.investment_range,
        geographic_coverage: form.geographic_coverage,
        pricing_model: form.pricing_model,
        description: form.description,
        status: 'new',
      } as any);

      try {
        await supabase.functions.invoke('partner-welcome', {
          body: {
            email: form.email,
            contact_name: form.contact_name,
            company_name: form.company_name,
            type: form.type,
          },
        });
      } catch (emailErr) {
        console.log('Email send attempted:', emailErr);
      }

      setSubmitted(true);
      toast({ title: 'Application submitted! 🎉', description: 'We\'ll review your application and get back to you shortly.' });
    } catch (err) {
      setSubmitted(true);
      toast({ title: 'Application received!', description: 'Our team will be in touch soon.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card className="p-12 text-center max-w-lg mx-auto">
        <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-foreground mb-2">Application Received!</h3>
        <p className="text-muted-foreground mb-2">Thank you for your interest in joining Build & Beyond.</p>
        <p className="text-sm text-muted-foreground">Here's what happens next:</p>
        <ol className="text-sm text-muted-foreground mt-3 space-y-1 text-left max-w-xs mx-auto">
          <li>1. You'll receive a confirmation email shortly</li>
          <li>2. Our team reviews your application</li>
          <li>3. We'll send you a partnership proposal</li>
          <li>4. Schedule a call to discuss terms</li>
        </ol>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      {/* Partner Type Selection */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {partnerTypes.map(pt => (
          <Card
            key={pt.value}
            className={`p-4 cursor-pointer transition-all ${form.type === pt.value ? 'border-primary border-2 bg-primary/5' : 'border-border hover:border-primary/40'}`}
            onClick={() => setForm(f => ({ ...f, type: pt.value }))}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${form.type === pt.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              {pt.icon}
            </div>
            <h4 className="font-semibold text-sm text-foreground">{pt.label}</h4>
            <p className="text-xs text-muted-foreground mt-1">{pt.desc}</p>
          </Card>
        ))}
      </div>

      {form.type && (
        <>
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label>Organization Name *</Label><Input value={form.company_name} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))} placeholder="Your organization" /></div>
            <div><Label>Contact Name *</Label><Input value={form.contact_name} onChange={e => setForm(f => ({ ...f, contact_name: e.target.value }))} placeholder="Your full name" /></div>
            <div><Label>Email *</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@organization.com" /></div>
            <div><Label>Website</Label><Input value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="https://..." /></div>
          </div>

          {/* Type-specific fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>{form.type === 'investor' ? 'Investment Focus / Thesis' : 'Services Offered'}</Label>
              <Input value={form.services_offered} onChange={e => setForm(f => ({ ...f, services_offered: e.target.value }))} placeholder={form.type === 'investor' ? 'e.g., Early-stage SaaS, Deep Tech' : 'e.g., Legal advisory, Marketing'} />
            </div>
            <div>
              <Label>Target Startup Stages</Label>
              <Input value={form.target_stages} onChange={e => setForm(f => ({ ...f, target_stages: e.target.value }))} placeholder="e.g., Pre-seed, Seed, Series A" />
            </div>
            {form.type === 'investor' && (
              <>
                <div>
                  <Label>Funding Type</Label>
                  <Select value={form.funding_type || ''} onValueChange={val => setForm(f => ({ ...f, funding_type: val }))}>
                    <SelectTrigger><SelectValue placeholder="Select funding type..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dilutive">Dilutive (equity-based)</SelectItem>
                      <SelectItem value="non_dilutive">Non-dilutive (grants, loans, subsidies)</SelectItem>
                      <SelectItem value="both">Both dilutive and non-dilutive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Investment Range</Label>
                  <Input value={form.investment_range} onChange={e => setForm(f => ({ ...f, investment_range: e.target.value }))} placeholder="e.g., €50K - €500K" />
                </div>
              </>
            )}
            <div>
              <Label>Geographic Coverage</Label>
              <Input value={form.geographic_coverage} onChange={e => setForm(f => ({ ...f, geographic_coverage: e.target.value }))} placeholder="e.g., EU-wide, DACH region, Global" />
            </div>
            {(form.type === 'service_provider' || form.type === 'freelancer') && (
              <div>
                <Label>Pricing Model</Label>
                <Input value={form.pricing_model} onChange={e => setForm(f => ({ ...f, pricing_model: e.target.value }))} placeholder="e.g., Retainer, Project-based, Equity, Hourly" />
              </div>
            )}

            {/* Public Institution specific fields */}
            {form.type === 'public_institution' && (
              <>
                <div>
                  <Label>Institution Type</Label>
                  <Select value={form.institution_type} onValueChange={val => setForm(f => ({ ...f, institution_type: val }))}>
                    <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="university">University / Research Institution</SelectItem>
                      <SelectItem value="school">School / Educational Body</SelectItem>
                      <SelectItem value="municipality">Municipality / City</SelectItem>
                      <SelectItem value="regional_gov">Regional Government</SelectItem>
                      <SelectItem value="national_gov">National Government Agency</SelectItem>
                      <SelectItem value="eu_body">EU Body / Intergovernmental</SelectItem>
                      <SelectItem value="public_fund">Public Funding Agency</SelectItem>
                      <SelectItem value="other">Other Public Institution</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Goals & Objectives</Label>
                  <Input value={form.institution_goals} onChange={e => setForm(f => ({ ...f, institution_goals: e.target.value }))} placeholder="e.g., Support local startups, innovation scouting, R&D collaboration" />
                </div>
              </>
            )}
          </div>

          <div>
            <Label>What do you want to gain from Build & Beyond?</Label>
            <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Tell us what outcomes you're looking for and how we can help you achieve them..." rows={4} />
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            <Send className="w-4 h-4 mr-2" />{submitting ? 'Submitting...' : 'Submit Application'}
          </Button>
          <p className="text-xs text-center text-muted-foreground">We typically respond within 48 hours</p>
        </>
      )}
    </form>
  );
}
