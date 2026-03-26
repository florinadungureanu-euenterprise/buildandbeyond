import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, ExternalLink, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: 'available' | 'coming_soon';
  category: 'productivity' | 'data' | 'communication' | 'development';
}

const integrations: Integration[] = [
  {
    id: 'google-drive',
    name: 'Google Drive',
    description: 'Import pitch decks, business plans, and other documents directly from your Drive',
    icon: '📁',
    status: 'coming_soon',
    category: 'productivity',
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Get notifications about new opportunities, signals, and community updates in your Slack workspace',
    icon: '💬',
    status: 'available',
    category: 'communication',
  },
  {
    id: 'dealroom',
    name: 'Dealroom',
    description: 'Enrich your startup profile with Dealroom data for better matching with investors',
    icon: '📊',
    status: 'coming_soon',
    category: 'data',
  },
  {
    id: 'crunchbase',
    name: 'Crunchbase',
    description: 'Pull company data, funding history, and market intelligence from Crunchbase',
    icon: '🏢',
    status: 'coming_soon',
    category: 'data',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'Import your professional profile and network data to enhance your passport',
    icon: '💼',
    status: 'coming_soon',
    category: 'productivity',
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Sync your roadmap and documentation with Notion workspaces',
    icon: '📝',
    status: 'coming_soon',
    category: 'productivity',
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Track development progress and link repositories to your roadmap milestones',
    icon: '🐙',
    status: 'coming_soon',
    category: 'development',
  },
  {
    id: 'zapier',
    name: 'Zapier / n8n',
    description: 'Connect Build & Beyond to 5,000+ apps via automation workflows',
    icon: '⚡',
    status: 'coming_soon',
    category: 'development',
  },
];

interface IntegrationsPanelProps {
  onComplete: () => void;
}

export function IntegrationsPanel({ onComplete }: IntegrationsPanelProps) {
  const [connected, setConnected] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const handleConnect = (integration: Integration) => {
    if (integration.status === 'coming_soon') {
      toast({
        title: 'Coming soon',
        description: `${integration.name} integration will be available shortly. We'll notify you when it's ready.`,
      });
      return;
    }

    // For available integrations
    setConnected((prev) => new Set(prev).add(integration.id));
    toast({
      title: `${integration.name} connected`,
      description: `You'll receive notifications and updates via ${integration.name}.`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">Connect Your Tools</h3>
        <p className="text-sm text-muted-foreground">
          Link your existing tools to enrich your profile and get smarter recommendations. You can always connect these later in Settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {integrations.map((integration) => {
          const isConnected = connected.has(integration.id);
          const isComingSoon = integration.status === 'coming_soon';

          return (
            <Card
              key={integration.id}
              className={cn(
                'p-4 transition-all',
                isConnected && 'border-primary/50 bg-primary/5',
                isComingSoon && 'opacity-70'
              )}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{integration.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-foreground">{integration.name}</span>
                    {isComingSoon && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        <Clock className="w-2.5 h-2.5 mr-0.5" />
                        Soon
                      </Badge>
                    )}
                    {isConnected && (
                      <Badge className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0">
                        <Check className="w-2.5 h-2.5 mr-0.5" />
                        Connected
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{integration.description}</p>
                  <Button
                    variant={isConnected ? 'outline' : isComingSoon ? 'ghost' : 'default'}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => handleConnect(integration)}
                    disabled={isConnected}
                  >
                    {isConnected ? 'Connected' : isComingSoon ? 'Notify Me' : 'Connect'}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          {connected.size > 0
            ? `${connected.size} integration${connected.size > 1 ? 's' : ''} connected`
            : 'You can skip this step and connect later'}
        </p>
        <Button onClick={onComplete}>
          {connected.size > 0 ? 'Continue' : 'Skip for now'}
        </Button>
      </div>
    </div>
  );
}
