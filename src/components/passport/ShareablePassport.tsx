import { useState } from 'react';
import { useStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Download, Share2, Copy, CheckCircle2, Link2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/lib/utils';

export function ShareablePassport() {
  const passport = useStore((s) => s.passport);
  const { toast } = useToast();
  const [shareUrl, setShareUrl] = useState('');
  const [generating, setGenerating] = useState(false);

  const generateShareUrl = () => {
    // Encode passport data as base64 URL param for stateless sharing
    const shareData = {
      sn: passport.startupName,
      fn: passport.founderName,
      tl: passport.tagline,
      sm: passport.summary,
      vs: passport.validationSummary,
      cs: passport.competitorSnapshot,
      md: passport.marketData,
      rs: passport.roadmapSnapshot,
      cf: passport.complianceFlags,
      fr: passport.fundingReadiness,
      eu: passport.euCompliant,
    };
    const encoded = btoa(encodeURIComponent(JSON.stringify(shareData)));
    const url = `${window.location.origin}/passport/share?d=${encoded}`;
    setShareUrl(url);
    return url;
  };

  const handleCopyLink = () => {
    const url = shareUrl || generateShareUrl();
    navigator.clipboard.writeText(url);
    toast({ title: 'Link copied!', description: 'Share this link with investors and partners.' });
  };

  const handleExportPDF = async () => {
    setGenerating(true);
    try {
      // Build a printable HTML document and use browser print
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast({ title: 'Pop-up blocked', description: 'Please allow pop-ups to export PDF.', variant: 'destructive' });
        return;
      }

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${passport.startupName} - Startup Passport</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 40px; color: #1a1a2e; max-width: 800px; margin: 0 auto; }
            .header { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; padding-bottom: 16px; border-bottom: 3px solid #2563eb; }
            .eu-badge { width: 48px; height: 48px; background: #1e40af; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fbbf24; font-size: 14px; }
            h1 { font-size: 24px; color: #1a1a2e; }
            .subtitle { font-size: 12px; color: #6b7280; }
            .badges { display: flex; gap: 8px; margin-top: 8px; }
            .badge { padding: 2px 10px; border-radius: 12px; font-size: 11px; background: #e0f2fe; color: #0369a1; }
            .section { margin-bottom: 24px; }
            .section-title { font-size: 16px; font-weight: 600; margin-bottom: 8px; color: #1e40af; }
            .startup-name { font-size: 28px; font-weight: 700; }
            .tagline { font-style: italic; color: #6b7280; margin-bottom: 8px; }
            p, li { font-size: 13px; line-height: 1.6; color: #374151; }
            ul { padding-left: 20px; }
            li { margin-bottom: 4px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
            .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; }
            .readiness-item { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; }
            .status { padding: 2px 8px; border-radius: 8px; font-size: 11px; }
            .status-complete { background: #dcfce7; color: #166534; }
            .status-in-progress { background: #dbeafe; color: #1e40af; }
            .status-pending { background: #f3f4f6; color: #6b7280; }
            .footer { text-align: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="eu-badge">&#9733;&#9733;&#9733;</div>
            <div>
              <h1>European Startup Passport</h1>
              <div class="subtitle">Build & Beyond</div>
              <div class="badges">
                <span class="badge">Regulation-Ready</span>
                <span class="badge">AI-Summarized</span>
                <span class="badge">Source-Linked</span>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="startup-name">${passport.startupName}</div>
            <div class="tagline">${passport.tagline}</div>
            <p><strong>Founder:</strong> ${passport.founderName}</p>
            ${passport.summary ? `<p style="margin-top: 8px;">${passport.summary}</p>` : ''}
          </div>

          ${passport.validationSummary ? `
          <div class="section">
            <div class="section-title">Validation Summary</div>
            <p>${passport.validationSummary}</p>
          </div>` : ''}

          ${passport.competitorSnapshot.length > 0 ? `
          <div class="section">
            <div class="section-title">Competitor Landscape</div>
            <ul>${passport.competitorSnapshot.map(c => `<li>${c}</li>`).join('')}</ul>
          </div>` : ''}

          ${passport.marketData.length > 0 ? `
          <div class="section">
            <div class="section-title">Market Data</div>
            <ul>${passport.marketData.map(m => `<li>${m}</li>`).join('')}</ul>
          </div>` : ''}

          ${passport.roadmapSnapshot ? `
          <div class="section">
            <div class="section-title">Roadmap Snapshot</div>
            <p>${passport.roadmapSnapshot}</p>
          </div>` : ''}

          <div class="grid">
            ${passport.complianceFlags.length > 0 ? `
            <div class="card">
              <div class="section-title">Compliance</div>
              <ul>${passport.complianceFlags.map(f => `<li>${f}</li>`).join('')}</ul>
            </div>` : ''}

            ${passport.fundingReadiness.length > 0 ? `
            <div class="card">
              <div class="section-title">Funding Readiness</div>
              ${passport.fundingReadiness.map(f => `
                <div class="readiness-item">
                  <span>${f.item}</span>
                  <span class="status status-${f.status}">${f.status}</span>
                </div>
              `).join('')}
            </div>` : ''}
          </div>

          <div class="footer">
            Generated on ${formatDate(new Date())} &bull; European Startup Passport Initiative &bull; Build & Beyond
          </div>
        </body>
        </html>
      `;

      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };

      toast({ title: 'PDF ready', description: 'Use your browser\'s print dialog to save as PDF.' });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card className="p-4 space-y-3">
      <h4 className="font-semibold text-sm text-foreground">Share Passport</h4>
      
      <Button onClick={handleExportPDF} disabled={generating} variant="default" className="w-full justify-start">
        <Download className="w-4 h-4 mr-2" />
        {generating ? 'Generating...' : 'Export as PDF'}
      </Button>

      <Button onClick={handleCopyLink} variant="secondary" className="w-full justify-start">
        <Link2 className="w-4 h-4 mr-2" />
        Copy shareable link
      </Button>

      {shareUrl && (
        <div className="flex gap-2">
          <Input value={shareUrl} readOnly className="text-xs" />
          <Button size="icon" variant="ghost" onClick={handleCopyLink}>
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      )}
    </Card>
  );
}
