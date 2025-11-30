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
  probe_questions?: string[];
  context?: string;
}

export interface EmpathyMap {
  says: string;
  thinks: string;
  does: string;
  feels: string;
}

export interface OnboardingProfile {
  stage_detected: string;
  customer: string;
  empathy_map: EmpathyMap;
  problem: string;
  consequences_of_problem: string;
  existing_alternatives: string;
  jobs_to_be_done: string;
  solution: string;
  unique_value_proposition: string;
  unfair_advantage: string;
  riskiest_assumption: string;
  method_and_success_criterion: string;
  industry: string;
  region: string;
  business_model: string;
  channels: string;
  revenue_streams: string;
  cost_structure: string;
  key_metrics: string;
  twelve_week_goal: string;
  risks: string;
  fundraising_type: string;
  fundraising_amount: string;
  later_stage_priorities: string;
  later_stage_bottlenecks: string;
  later_stage_goals: string;
  later_stage_tools: string;
  later_stage_process_gaps: string;
  later_stage_metrics: string;
  later_stage_risks: string;
  later_stage_vision: string;
  document_insights: string[];
}

export interface UploadedDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: Date;
  content?: string;
}
