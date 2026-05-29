import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Rocket, Eye, Sparkles, Loader2, CheckCircle2, Send, Plus, Trash2 } from 'lucide-react';
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

interface ProposalModule {
  title: string;
  objective: string;
  deliverables: string[];
  timeline: string;
  priority: 'high' | 'medium' | 'low';
  assigned_expert_name: string;
}

interface Proposal {
  executive_summary: string;
  modules: ProposalModule[];
  total_timeline: string;
  estimated_investment_range: string;
  next_steps: string[];
}

const emptyProposal: Proposal = {
  executive_summary: '',
  modules: [],
  total_timeline: '',
  estimated_investment_range: '',
  next_steps: [],
};

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  reviewing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  proposal_generated: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  proposal_sent: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  declined: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

function normaliseProposal(input: unknown): Proposal {
  if (!input || typeof input !== 'object') return { ...emptyProposal };
  const obj = input as Record<string, unknown>;
  // Legacy shape: an array of modules only
  if (Array.isArray(input)) {
    return { ...emptyProposal, modules: input as ProposalModule[] };
  }
  return {
    executive_summary: (obj.executive_summary as string) || '',
    modules: Array.isArray(obj.modules) ? (obj.modules as ProposalModule[]) : [],
    total_timeline: (obj.total_timeline as string) || '',
    estimated_investment_range: (obj.estimated_investment_range as string) || '',
    next_steps: Array.isArray(obj.next_steps) ? (obj.next_steps as string[]) : [],
  };
}

export function ProposalRequestsTab({ requests, profiles, onRefresh }: ProposalRequestsTabProps) {
  const { toast } = useToast();
  const [selectedRequest, setSelectedRequest] = useState<ProposalRequest | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);
  const [sending, setSending] = useState<string | null>(null);
  const [confirmSendId, setConfirmSendId] = useState<string | null>(null);
  const [editedProposal, setEditedProposal] = useState<Proposal>(emptyProposal);

  useEffect(() => {
    if (selectedRequest) {
      setEditedProposal(normaliseProposal(selectedRequest.generated_modules));
    } else {
      setEditedProposal(emptyProposal);
    }
  }, [selectedRequest]);

  const getProfileName = (userId: string) =>
    profiles.find((p) => p.id === userId)?.full_name || 'Unknown';
  const getCompanyName = (userId: string) =>
    profiles.find((p) => p.id === userId)?.company_name || '-';

  const generateProposal = async (request: ProposalRequest) => {
    setGenerating(request.id);
    try {
      const { data, error } = await supabase.functions.invoke('generate-proposal', {
        body: { proposal_request_id: request.id },
      });
      if (error) throw error;
      if (data?.proposal) {
        setEditedProposal(normaliseProposal(data.proposal));
      }
      toast({ title: 'Proposal generated', description: 'AI proposal is ready for review.' });
      onRefresh();
    } catch (err) {
      console.error(err);
      toast({ title: 'Generation failed', description: 'Could not generate proposal.', variant: 'destructive' });
    } finally {
      setGenerating(null);
    }
  };

  const saveDraft = async (id: string) => {
    const { error } = await supabase
      .from('proposal_requests')
      .update({ generated_modules: editedProposal as never })
      .eq('id', id);
    if (error) {
      toast({ title: 'Save failed', variant: 'destructive' });
      return;
    }
    toast({ title: 'Draft saved' });
    onRefresh();
  };

  const sendProposal = async (id: string) => {
    setSending(id);
    try {
      // Save edits first
      await supabase.from('proposal_requests').update({ generated_modules: editedProposal as never }).eq('id', id);
      const { error } = await supabase.functions.invoke('send-proposal', {
        body: { proposal_request_id: id },
      });
      if (error) throw error;
      toast({ title: 'Proposal sent to founder' });
      setConfirmSendId(null);
      setSelectedRequest(null);
      onRefresh();
    } catch (err) {
      console.error(err);
      toast({ title: 'Send failed', variant: 'destructive' });
    } finally {
      setSending(null);
    }
  };

  const updateModule = (idx: number, patch: Partial<ProposalModule>) => {
    setEditedProposal((p) => ({
      ...p,
      modules: p.modules.map((m, i) => (i === idx ? { ...m, ...patch } : m)),
    }));
  };

  const addModule = () => {
    setEditedProposal((p) => ({
      ...p,
      modules: [
        ...p.modules,
        { title: 'New module', objective: '', deliverables: [], timeline: '', priority: 'medium', assigned_expert_name: '' },
      ],
    }));
  };

  const removeModule = (idx: number) => {
    setEditedProposal((p) => ({ ...p, modules: p.modules.filter((_, i) => i !== idx) }));
  };

  return (
    <TooltipProvider>
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
                    const isGen = generating === req.id;
                    const isSending = sending === req.id;
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
                            {req.status.replace(/_/g, ' ')}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedRequest(req)}>
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>View founder details</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => generateProposal(req)} disabled={isGen}>
                                  {isGen ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Generate AI proposal</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={!req.generated_modules || req.status === 'proposal_sent' || isSending}
                                  onClick={() => setConfirmSendId(req.id)}
                                >
                                  {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 text-green-600" />}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Send proposal to founder</TooltipContent>
                            </Tooltip>
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

      {/* Detail / Edit Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>
              Proposal: {getProfileName(selectedRequest?.user_id || '')}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[65vh]">
            {selectedRequest && (
              <div className="space-y-6 pr-4">
                <div>
                  <h4 className="text-sm font-semibold mb-2">Founder Profile</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-muted-foreground">Startup:</span> {selectedRequest.onboarding_answers?.startupName || '-'}</div>
                    <div><span className="text-muted-foreground">Industry:</span> {selectedRequest.onboarding_answers?.industry || '-'}</div>
                    <div className="col-span-2"><span className="text-muted-foreground">Tagline:</span> {selectedRequest.onboarding_answers?.tagline || '-'}</div>
                  </div>
                </div>

                {(!selectedRequest.generated_modules) && (
                  <div className="text-center py-6 border border-dashed rounded-lg">
                    <p className="text-sm text-muted-foreground mb-3">No proposal generated yet.</p>
                    <Button onClick={() => generateProposal(selectedRequest)} disabled={generating === selectedRequest.id}>
                      {generating === selectedRequest.id ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating…</>
                      ) : (
                        <><Sparkles className="w-4 h-4 mr-2" /> Generate Proposal</>
                      )}
                    </Button>
                  </div>
                )}

                {selectedRequest.generated_modules && (
                  <>
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Executive summary</h4>
                      <Textarea
                        rows={3}
                        value={editedProposal.executive_summary}
                        onChange={(e) => setEditedProposal((p) => ({ ...p, executive_summary: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold">Modules</h4>
                        <Button variant="outline" size="sm" onClick={addModule}>
                          <Plus className="w-3.5 h-3.5 mr-1" /> Add module
                        </Button>
                      </div>
                      {editedProposal.modules.map((m, idx) => (
                        <Card key={idx}>
                          <CardContent className="pt-4 space-y-3">
                            <div className="flex items-center gap-2">
                              <Input
                                value={m.title}
                                placeholder="Module title"
                                onChange={(e) => updateModule(idx, { title: e.target.value })}
                              />
                              <Select value={m.priority} onValueChange={(v) => updateModule(idx, { priority: v as ProposalModule['priority'] })}>
                                <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="high">High</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="low">Low</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button variant="ghost" size="sm" onClick={() => removeModule(idx)}>
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                            <Textarea
                              rows={2}
                              placeholder="Objective"
                              value={m.objective}
                              onChange={(e) => updateModule(idx, { objective: e.target.value })}
                            />
                            <Textarea
                              rows={3}
                              placeholder="Deliverables (one per line)"
                              value={(m.deliverables || []).join('\n')}
                              onChange={(e) => updateModule(idx, { deliverables: e.target.value.split('\n').filter(Boolean) })}
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                placeholder="Timeline"
                                value={m.timeline}
                                onChange={(e) => updateModule(idx, { timeline: e.target.value })}
                              />
                              <Input
                                placeholder="Assigned expert"
                                value={m.assigned_expert_name}
                                onChange={(e) => updateModule(idx, { assigned_expert_name: e.target.value })}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">Total timeline</label>
                        <Input
                          value={editedProposal.total_timeline}
                          onChange={(e) => setEditedProposal((p) => ({ ...p, total_timeline: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">Investment range</label>
                        <Input
                          value={editedProposal.estimated_investment_range}
                          onChange={(e) => setEditedProposal((p) => ({ ...p, estimated_investment_range: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Next steps (one per line)</label>
                      <Textarea
                        rows={3}
                        value={editedProposal.next_steps.join('\n')}
                        onChange={(e) => setEditedProposal((p) => ({ ...p, next_steps: e.target.value.split('\n').filter(Boolean) }))}
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" onClick={() => saveDraft(selectedRequest.id)}>Save draft</Button>
                      <Button
                        onClick={() => setConfirmSendId(selectedRequest.id)}
                        disabled={selectedRequest.status === 'proposal_sent'}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Send to founder
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Confirm send dialog */}
      <Dialog open={!!confirmSendId} onOpenChange={(open) => !open && setConfirmSendId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send proposal?</DialogTitle>
            <DialogDescription>
              Send proposal to {getProfileName(selectedRequest?.user_id || requests.find((r) => r.id === confirmSendId)?.user_id || '')}? This will email them and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmSendId(null)}>Cancel</Button>
            <Button onClick={() => confirmSendId && sendProposal(confirmSendId)} disabled={!!sending}>
              {sending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending…</> : 'Send'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
