import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Rocket } from 'lucide-react';

interface EmptyStateCardProps {
  title: string;
  message: string;
  actionLabel?: string;
  actionPath?: string;
  icon?: React.ReactNode;
}

export function EmptyStateCard({ title, message, actionLabel, actionPath, icon }: EmptyStateCardProps) {
  const navigate = useNavigate();

  return (
    <Card className="p-6 shadow-sm">
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="mb-4 text-muted-foreground">
          {icon || <Rocket className="w-10 h-10" />}
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-xs mb-4">{message}</p>
        {actionLabel && actionPath && (
          <Button onClick={() => navigate(actionPath)} size="sm">
            {actionLabel}
          </Button>
        )}
      </div>
    </Card>
  );
}
