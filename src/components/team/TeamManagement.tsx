import { useStore } from '@/store';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Briefcase, FileText, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700 border-green-200',
  hiring: 'bg-blue-100 text-blue-700 border-blue-200',
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200'
};

export function TeamManagement() {
  const teamMembers = useStore((state) => state.teamMembers);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Team Management</h1>
        <p className="text-sm text-muted-foreground">
          Manage your team, hiring, payroll, and compliance
        </p>
      </div>

      <Tabs defaultValue="team" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Team
          </TabsTrigger>
          <TabsTrigger value="hiring" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Hiring
          </TabsTrigger>
          <TabsTrigger value="payroll" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Tax & Payroll
          </TabsTrigger>
          <TabsTrigger value="insolvency" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Insolvency
          </TabsTrigger>
        </TabsList>

        <TabsContent value="team" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member) => (
              <Card key={member.id} className="p-6 border-border">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </div>
                  <Badge className={cn('text-xs font-medium capitalize', statusColors[member.status])}>
                    {member.status}
                  </Badge>
                </div>
                {member.startDate && (
                  <p className="text-xs text-muted-foreground">
                    Started: {new Date(member.startDate).toLocaleDateString()}
                  </p>
                )}
                <div className="mt-4 flex gap-2">
                  {member.status === 'active' && (
                    <Button size="sm" variant="outline" className="flex-1">
                      View Profile
                    </Button>
                  )}
                  {member.status === 'hiring' && (
                    <Button size="sm" className="flex-1">
                      View Candidates
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
          <Button className="w-full md:w-auto">
            <Users className="w-4 h-4 mr-2" />
            Add Team Member
          </Button>
        </TabsContent>

        <TabsContent value="hiring" className="space-y-4">
          <Card className="p-6 border-border">
            <h3 className="font-semibold text-foreground mb-4">Open Positions</h3>
            <div className="space-y-4">
              {teamMembers
                .filter((m) => m.status === 'hiring')
                .map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg bg-card"
                  >
                    <div>
                      <h4 className="font-medium text-foreground">{member.role}</h4>
                      <p className="text-sm text-muted-foreground">Status: Actively recruiting</p>
                    </div>
                    <Button size="sm">Manage Applications</Button>
                  </div>
                ))}
            </div>
          </Card>

          <Card className="p-6 border-border">
            <h3 className="font-semibold text-foreground mb-2">Hiring Resources</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Access templates, interview guides, and best practices
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline">Job Description Templates</Button>
              <Button variant="outline">Interview Scorecards</Button>
              <Button variant="outline">Offer Letter Templates</Button>
              <Button variant="outline">Onboarding Checklists</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="payroll" className="space-y-4">
          <Card className="p-6 border-border">
            <h3 className="font-semibold text-foreground mb-4">Tax & Payroll Reporting</h3>
            <div className="space-y-4">
              <div className="p-4 border border-border rounded-lg bg-card">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-foreground">Monthly Payroll Report</h4>
                  <Badge className="bg-green-100 text-green-700 border-green-200">Current</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">December 2025</p>
                <Button size="sm" variant="outline">Download Report</Button>
              </div>

              <div className="p-4 border border-border rounded-lg bg-card">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-foreground">Tax Documents</h4>
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200">Ready</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">Annual tax forms and compliance</p>
                <Button size="sm" variant="outline">View Documents</Button>
              </div>

              <div className="p-4 border border-border rounded-lg bg-card">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-foreground">EU Compliance</h4>
                  <Badge className="bg-green-100 text-green-700 border-green-200">Compliant</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  GDPR, EU tax regulations, and employee rights
                </p>
                <Button size="sm" variant="outline">Review Status</Button>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-border">
            <h3 className="font-semibold text-foreground mb-2">Payroll Tools</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Integrate with payroll providers and accounting software
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline">Connect Payroll Provider</Button>
              <Button variant="outline">Setup Direct Deposit</Button>
              <Button variant="outline">Configure Benefits</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="insolvency" className="space-y-4">
          <Card className="p-6 border-border">
            <h3 className="font-semibold text-foreground mb-4">
              Cross-Recognition of Insolvency Procedures
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              EU cross-border insolvency framework compliance and documentation
            </p>

            <div className="space-y-4">
              <div className="p-4 border border-border rounded-lg bg-card">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-foreground">EU Insolvency Regulation</h4>
                  <Badge className="bg-green-100 text-green-700 border-green-200">Registered</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Regulation (EU) 2015/848 compliance and cross-border procedures
                </p>
                <Button size="sm" variant="outline">View Documentation</Button>
              </div>

              <div className="p-4 border border-border rounded-lg bg-card">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-foreground">Jurisdiction Registry</h4>
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200">Up to date</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Centre of main interests (COMI) and establishment registrations
                </p>
                <Button size="sm" variant="outline">Manage Registry</Button>
              </div>

              <div className="p-4 border border-border rounded-lg bg-card">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-foreground">Creditor Protection</h4>
                  <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Review Required</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Cross-border creditor rights and notification procedures
                </p>
                <Button size="sm" variant="outline">Review Requirements</Button>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-border">
            <h3 className="font-semibold text-foreground mb-2">Legal Resources</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Access EU insolvency frameworks and legal guidance
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline">EU Regulation 2015/848</Button>
              <Button variant="outline">National Procedures</Button>
              <Button variant="outline">Legal Counsel Directory</Button>
              <Button variant="outline">Compliance Checklist</Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
