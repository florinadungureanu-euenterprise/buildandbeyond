import { FounderProfileModal } from '@/components/onboarding/FounderProfileModal';
import { useStore } from '@/store';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { timeAgo, formatDate } from '@/lib/utils';
import { CheckCircle2, FileText, Save, TrendingUp, UserPlus } from 'lucide-react';
import { useState, useEffect } from 'react';

export function PassportView() {
  const passport = useStore((state) => state.passport);
  const [showFounderModal, setShowFounderModal] = useState(false);

  const dataLoaded = useStore((state) => state.dataLoaded);

  // Only show founder modal if data has loaded and founderName is still empty
  useEffect(() => {
    if (!dataLoaded) return;
    if (!passport.founderName || passport.founderName === 'Alex Morgan') {
      setShowFounderModal(true);
    }
  }, [passport.founderName, dataLoaded]);

  // Check if data is demo/placeholder data
  const isDemoData = (field: string) => {
    if (!field || field.trim() === '') return true;
    // Check for common demo content - only TechVenture summary is hardcoded demo
    if (field === 'TechVenture is a SaaS platform that reimagines team collaboration by combining AI-powered insights with intuitive project management. We serve mid-sized companies looking to improve productivity and reduce operational overhead.') return true;
    return false;
  };

  const hasRealData = !isDemoData(passport.summary);
  const showSummaryPending = !hasRealData || passport.summary.includes('TechVenture is a SaaS platform');

  return (
    <div className="h-full flex">
      <FounderProfileModal open={showFounderModal} onOpenChange={setShowFounderModal} />
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8">
          {/* Header with EU Emblem */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                <div className="text-yellow-300 text-xs">★★★</div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  European Startup Passport
                </h1>
                <p className="text-sm text-gray-500">Preview Version</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                Regulation-Ready
              </Badge>
              <Badge variant="secondary">AI-summarized</Badge>
              <Badge variant="secondary">Source-linked</Badge>
              <span className="text-xs text-gray-500 ml-auto">
                Last updated {timeAgo(passport.lastUpdated)}
              </span>
            </div>
          </div>

          {/* Summary Section */}
          <Card className="p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Summary</h2>
            </div>
            <div className="space-y-3">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{passport.startupName}</h3>
                <p className="text-gray-600 italic">{passport.tagline}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Founder: </span>
                <span className="text-sm text-gray-600">{passport.founderName}</span>
              </div>
              {showSummaryPending ? (
                <div className="text-center py-4">
                  <Badge variant="outline" className="text-sm">Pending</Badge>
                  <p className="text-xs text-gray-500 mt-2">Complete the Entrepreneur Whisperer chat to generate your startup description</p>
                </div>
              ) : (
                <p className="text-sm text-gray-700 leading-relaxed">{passport.summary}</p>
              )}
            </div>
          </Card>

          {/* Validation Section */}
          <Card className="p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">Validation Summary</h2>
            </div>
            {hasRealData ? (
              <p className="text-sm text-gray-700 leading-relaxed">{passport.validationSummary}</p>
            ) : (
              <div className="text-center py-4">
                <Badge variant="outline" className="text-sm">Pending Analysis</Badge>
                <p className="text-xs text-gray-500 mt-2">Complete onboarding to generate validation insights</p>
              </div>
            )}
          </Card>

          {/* Competitor Map */}
          <Card className="p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900">Competitor Landscape</h2>
            </div>
            {hasRealData && passport.competitorSnapshot.length > 0 ? (
              <ul className="space-y-2">
                {passport.competitorSnapshot.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-4">
                <Badge variant="outline" className="text-sm">Pending Analysis</Badge>
                <p className="text-xs text-gray-500 mt-2">We'll analyze your competitive landscape after onboarding</p>
              </div>
            )}
          </Card>

          {/* Market Data */}
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Market Data</h2>
            {hasRealData && passport.marketData.length > 0 ? (
              <ul className="space-y-2">
                {passport.marketData.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-green-600 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-4">
                <Badge variant="outline" className="text-sm">Pending Analysis</Badge>
                <p className="text-xs text-gray-500 mt-2">Market intelligence will be gathered during onboarding</p>
              </div>
            )}
          </Card>

          {/* Roadmap Snapshot */}
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Roadmap Snapshot</h2>
            <p className="text-sm text-gray-700 leading-relaxed">{passport.roadmapSnapshot}</p>
          </Card>

          {/* Compliance & Funding Readiness */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Compliance</h2>
              <ul className="space-y-2">
                {passport.complianceFlags.map((flag, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Funding Readiness</h2>
              <ul className="space-y-2">
                {passport.fundingReadiness.map((item, idx) => (
                  <li key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{item.item}</span>
                    <Badge
                      variant={
                        item.status === 'complete'
                          ? 'default'
                          : item.status === 'in-progress'
                          ? 'secondary'
                          : 'outline'
                      }
                      className={
                        item.status === 'complete'
                          ? 'bg-green-100 text-green-700'
                          : item.status === 'in-progress'
                          ? 'bg-blue-100 text-blue-700'
                          : ''
                      }
                    >
                      {item.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Footer */}
          <div className="text-center py-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Generated on {formatDate(new Date())} • European Startup Passport Initiative
            </p>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Provider CTAs */}
      <div className="w-80 bg-white border-l border-gray-200 p-6 flex flex-col">
        <h4 className="font-semibold text-gray-900 text-sm mb-4">Provider Actions</h4>
        <div className="space-y-3">
          <Button className="w-full justify-start" variant="default">
            <Save className="w-4 h-4 mr-2" />
            Save to Profile
          </Button>
          <Button className="w-full justify-start" variant="secondary">
            <TrendingUp className="w-4 h-4 mr-2" />
            Track Changes
          </Button>
          <Button className="w-full justify-start" variant="outline">
            <UserPlus className="w-4 h-4 mr-2" />
            Request Intro
          </Button>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <h5 className="font-semibold text-sm text-blue-900 mb-2">About This Passport</h5>
          <p className="text-xs text-blue-800 leading-relaxed">
            This standardized format helps investors, accelerators, and partners quickly assess
            your startup's readiness and fit.
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h5 className="font-semibold text-sm text-gray-900 mb-3">Sections Included</h5>
          <ul className="space-y-2 text-xs text-gray-600">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              Summary
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              Validation
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              Competitor Map
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              Market Data
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              Roadmap
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              Compliance
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
