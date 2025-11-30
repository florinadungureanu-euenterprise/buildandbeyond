export interface Task {
  id: string;
  title: string;
  completed: boolean;
  category?: 'compliance' | 'product' | 'market' | 'operations';
  isNew?: boolean;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  completed: boolean;
  category: 'product' | 'market' | 'team' | 'funding';
}

export interface Tool {
  id: string;
  name: string;
  category: string;
  commission: number;
  description: string;
  features: string[];
  pricing?: string;
}

export interface Signal {
  id: string;
  type: 'competitor' | 'trend' | 'regulatory';
  title: string;
  message: string;
  suggestedAction: string;
  timestamp: Date;
  priority: 'high' | 'medium' | 'low';
}

export interface ValidationScores {
  marketFit: number;
  problemValidation: number;
  solutionFit: number;
}

export interface Application {
  id: string;
  name: string;
  type: 'accelerator' | 'grant' | 'competition' | 'incubator';
  description: string;
  benefits: string[];
  eligibility: string[];
  deadline: string;
  matchScore: number;
  industry?: string[];
  trlRange?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'hiring' | 'pending';
  startDate?: string;
}

export interface PassportData {
  founderName: string;
  startupName: string;
  tagline: string;
  summary: string;
  validationSummary: string;
  competitorSnapshot: string[];
  marketData: string[];
  roadmapSnapshot: string;
  complianceFlags: string[];
  fundingReadiness: { item: string; status: 'complete' | 'in-progress' | 'pending' }[];
  lastUpdated: Date;
  euCompliant: boolean;
  industry?: string;
  trl?: number;
}

export interface OnboardingMessage {
  id: string;
  role: 'system' | 'user';
  content: string;
  timestamp: Date;
}

export interface OnboardingQuestion {
  id: number;
  question: string;
  templates: string[];
  key: string;
  stage?: 'early' | 'later' | 'all';
}

export interface UploadedDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: Date;
  content?: string;
}
