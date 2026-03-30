import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Rocket, Eye, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface ProposalRequest {
  id: string;
  user_id: string;
  created_at: string;
  onboarding_answers: any;
  generated_modules: any;
  status: string;
  notes: string | null;
}

interface Profile {
  id: string;
  full_name: string | null;
  company_name: string | null;
}

interface ProposalRequestsTabProps {
  requests: ProposalRequest[];
  profiles: Profile[];
  onRefresh: () => void;
}

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  reviewing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  proposal_sent: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  declined: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

export function ProposalRequestsTab({ requests, profiles, onRefresh }: ProposalRequestsTabProps) {
  const { toast } = useToast();
  const [selectedRequest, setSelectedRequest] = useState<ProposalRequest | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);

  const getProfileName = (userId: string) => {
    const profile = profiles.find((p) => p.id === userId);
    return profile?.full_name || 'Unknown';
  };

  const getCompanyName = (userId: string) => {
    const profile = profiles.find((p) => p.id === userId);
    return profile?.company_name || '-';
  };

  const generateModules = async (request: ProposalRequest) => {
    setGenerating(request.id);
    try {
      const answers = request.onboarding_answers || {};
      const userInputs = answers.userInputs || {};
      const selectedModules = answers.selectedModules || [];

      const prompt = `Based on the following founder profile, generate personalized action module recommendations.

Startup: ${answers.startupName || 'Unknown'}
Industry: ${answers.industry || 'Unknown'}
Summary: ${answers.summary || answers.tagline || 'No summary provided'}

Founder Answers:
${Object.entries(userInputs).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

Selected interest areas: ${selectedModules.join(', ')}

For each selected module, provide:
1. Module title
2. Objective (1 sentence)
3. Key deliverables (3-4 bullet points)
4. Estimated timeline
5. Priority level (high/medium/low)

Format as JSON array with objects: { title, objective, deliverables: string[], timeline, priority }`;

      const { data, error } = await supabase.functions.invoke('chat-guidance', {
        body: { messages: [{ role: 'user', content: prompt }], context: 'proposal_generation' },
      });

      if (error) throw error;

      let modules;
      try {
        const responseText = data?.response || data?.content || JSON.stringify(data);
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        modules = jsonMatch ? JSON.parse(jsonMatch[0]) : [{ title: 'Generated Proposal', objective: responseText, deliverables: [], timeline: 'TBD', priority: 'high' }];
      } catch {
        modules = [{ title: 'AI Proposal', objective: typeof data === 'string' ? data : JSON.stringify(data), deliverables: [], timeline: 'TBD', priority: 'high' }];
      }

      await supabase
        .from('proposal_requests' as any)
        .update({ generated_modules: modules, status: 'reviewing' } as any)
        .eq('id', request.id);

      toast({ title: 'Modules generated', description: 'AI recommendations have been created for this founder.' });
      onRefresh();
    } catch (err) {
      console.error('Error generating modules:', err);
      toast({ title: 'Generation failed', description: 'Could not generate modules. Try again.', variant: 'destructive' });
    } finally {
      setGenerating(null);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('proposal_requests' as any).update({ status } as any).eq('id', id);
    onRefresh();
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="w-5 h-5" /> Proposal Requests ({requests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No proposal requests yet</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Founder</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Modules Requested</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((req) => {
                    const selectedModules = req.onboarding_answers?.selectedModules || [];
                    return (
                      <TableRow key={req.id}>
                        <TableCell className="text-xs">{format(new Date(req.created_at), 'dd MMM yyyy')}</TableCell>
                        <TableCell className="font-medium">{getProfileName(req.user_id)}</TableCell>
                        <TableCell>{getCompanyName(req.user_id)}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {selectedModules.slice(0, 3).map((m: string) => (
                              <Badge key={m} variant="outline" className="text-xs">{m}</Badge>
                            ))}
                            {selectedModules.length > 3 && (
                              <Badge variant="outline" className="text-xs">+{selectedModules.length - 3}</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[req.status] || 'bg-muted text-muted-foreground'}`}>
                            {req.status.replace('_', ' ')}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => setSelectedRequest(req)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => generateModules(req)}
                              disabled={generating === req.id}
                            >
                              {generating === req.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Sparkles className="w-4 h-4" />
                              )}
                            </Button>
                            {req.status === 'reviewing' && (
                              <Button variant="ghost" size="sm" onClick={() => updateStatus(req.id, 'proposal_sent')}>
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              Proposal Request: {getProfileName(selectedRequest?.user_id || '')}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            {selectedRequest && (
              <div className="space-y-6 pr-4">
                {/* Founder Info */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">Founder Profile</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-muted-foreground">Startup:</span> {selectedRequest.onboarding_answers?.startupName || '-'}</div>
                    <div><span className="text-muted-foreground">Industry:</span> {selectedRequest.onboarding_answers?.industry || '-'}</div>
                    <div className="col-span-2"><span className="text-muted-foreground">Tagline:</span> {selectedRequest.onboarding_answers?.tagline || '-'}</div>
                  </div>
                </div>

                {/* Selected Modules */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">Requested Modules</h4>
                  <div className="flex flex-wrap gap-2">
                    {(selectedRequest.onboarding_answers?.selectedModules || []).map((m: string) => (
                      <Badge key={m} variant="secondary">{m}</Badge>
                    ))}
                  </div>
                </div>

                {/* Onboarding Answers */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">Onboarding Answers</h4>
                  <div className="space-y-2">
                    {Object.entries(selectedRequest.onboarding_answers?.userInputs || {}).map(([key, value]) => (
                      <div key={key} className="p-3 bg-muted rounded-lg">
                        <span className="text-xs font-medium text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                        <p className="text-sm text-foreground mt-1">{String(value)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Generated Modules */}
                {selectedRequest.generated_modules && (
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">AI-Generated Recommendations</h4>
                    <div className="space-y-3">
                      {(Array.isArray(selectedRequest.generated_modules) ? selectedRequest.generated_modules : []).map((mod: any, idx: number) => (
                        <Card key={idx}>
                          <CardContent className="pt-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <h5 className="font-medium text-foreground">{mod.title}</h5>
                              <Badge variant={mod.priority === 'high' ? 'destructive' : mod.priority === 'medium' ? 'default' : 'secondary'}>
                                {mod.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{mod.objective}</p>
                            {mod.deliverables?.length > 0 && (
                              <ul className="text-sm text-muted-foreground list-disc pl-4 space-y-1">
                                {mod.deliverables.map((d: string, i: number) => <li key={i}>{d}</li>)}
                              </ul>
                            )}
                            <p className="text-xs text-muted-foreground">Timeline: {mod.timeline}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {!selectedRequest.generated_modules && (
                    <Button onClick={() => { generateModules(selectedRequest); }} disabled={generating === selectedRequest.id}>
                      {generating === selectedRequest.id ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                      ) : (
                        <><Sparkles className="w-4 h-4 mr-2" /> Generate Proposal</>
                      )}
                    </Button>
                  )}
                  {selectedRequest.status !== 'proposal_sent' && selectedRequest.generated_modules && (
                    <Button onClick={() => { updateStatus(selectedRequest.id, 'proposal_sent'); setSelectedRequest(null); }}>
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Mark as Sent
                    </Button>
                  )}
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
