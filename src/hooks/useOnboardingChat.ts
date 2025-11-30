import { useState, useEffect } from 'react';
import { OnboardingMessage, OnboardingQuestion, UploadedDocument } from '@/types';
import { useStore } from '@/store';

const N8N_WEBHOOK_URL = 'https://springervc.app.n8n.cloud/webhook/4ce2573e-4415-4cba-aa4e-65a97223ce43';

const onboardingQuestions: OnboardingQuestion[] = [
  {
    id: 0,
    question: 'What stage is your startup at?',
    templates: [
      'Pre-seed / Idea stage - just getting started',
      'Early stage - have MVP or initial traction',
      'Growth stage - have product-market fit and scaling'
    ],
    key: 'stage',
    stage: 'all'
  },
  {
    id: 1,
    question: 'What problem are you solving?',
    templates: [
      'Companies struggle with [problem] because [reason]. This causes [impact].',
      'Current solutions fail at [gap] leading to [outcome].'
    ],
    key: 'problem',
    stage: 'early'
  },
  {
    id: 2,
    question: 'Who is your target customer?',
    templates: [
      'Mid-sized [industry] companies with [characteristic].',
      '[Role] at [company size] who need [capability].'
    ],
    key: 'customer',
    stage: 'early'
  },
  {
    id: 3,
    question: 'What is your value proposition?',
    templates: [
      'We help [customer] achieve [outcome] through [approach].',
      'Unlike alternatives, we provide [differentiator] to deliver [benefit].'
    ],
    key: 'value',
    stage: 'early'
  },
  {
    id: 4,
    question: 'What is your business model?',
    templates: [
      'SaaS subscription at $[price]/month with [pricing model].',
      '[Revenue model] with [payment structure] and [unit economics].'
    ],
    key: 'business_model',
    stage: 'all'
  },
  {
    id: 5,
    question: 'How large is your addressable market?',
    templates: [
      'TAM of $[amount]B with [growth rate]% annual growth.',
      '[Number] potential customers spending $[amount] annually.'
    ],
    key: 'market_size',
    stage: 'all'
  },
  {
    id: 6,
    question: 'Who are your main competitors?',
    templates: [
      '[Competitor A] focuses on [approach], [Competitor B] targets [segment].',
      'Direct competitors: [names]. Indirect: [alternatives].'
    ],
    key: 'competitors',
    stage: 'all'
  },
  {
    id: 7,
    question: 'What is your competitive advantage?',
    templates: [
      'We differentiate through [technology/approach] providing [specific benefit].',
      'Our unique insight is [knowledge] enabling [capability].'
    ],
    key: 'advantage',
    stage: 'all'
  },
  {
    id: 8,
    question: 'What traction have you achieved?',
    templates: [
      '[Number] users/customers, $[revenue] MRR, [growth]% month-over-month.',
      '[Metric]: [number]. Key achievement: [milestone].'
    ],
    key: 'traction',
    stage: 'all'
  },
  {
    id: 9,
    question: 'What are your key metrics?',
    templates: [
      'CAC: $[amount], LTV: $[amount], Churn: [%], NPS: [score].',
      'Monthly active: [number], Conversion: [%], Retention: [%].'
    ],
    key: 'metrics',
    stage: 'later'
  },
  {
    id: 10,
    question: 'What is your go-to-market strategy?',
    templates: [
      'Start with [channel] targeting [segment], then expand to [next].',
      '[Primary channel] with [tactics], supported by [secondary approach].'
    ],
    key: 'gtm',
    stage: 'all'
  },
  {
    id: 11,
    question: 'What are your funding needs?',
    templates: [
      'Raising $[amount] for [use case] to achieve [milestone].',
      '$[amount] seed/Series [A/B] to [specific goal] over [timeframe].'
    ],
    key: 'funding',
    stage: 'all'
  },
  {
    id: 12,
    question: 'What is your 12-month vision?',
    templates: [
      'Reach [metric] by [date], launch [feature], expand to [market].',
      'Achieve [milestone], grow team to [size], reach [revenue target].'
    ],
    key: 'vision',
    stage: 'all'
  }
];

export function useOnboardingChat() {
  const [messages, setMessages] = useState<OnboardingMessage[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [hasSentToN8n, setHasSentToN8n] = useState(false);
  const [startupStage, setStartupStage] = useState<'early' | 'later' | null>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  
  const validation = useStore((state) => state.validation);
  const tools = useStore((state) => state.tools);
  const signals = useStore((state) => state.signals);
  const milestones = useStore((state) => state.twelveMonthMilestones);
  const passport = useStore((state) => state.passport);
  const userInputs = useStore((state) => state.userInputs);
  const toolActivationCount = useStore((state) => state.toolActivationCount);

  // Filter questions based on stage
  const filteredQuestions = onboardingQuestions.filter((q) => {
    if (!startupStage) return q.id === 0; // Only show stage question first
    if (q.stage === 'all') return true;
    return q.stage === startupStage;
  });

  const currentQuestion =
    currentQuestionIndex < filteredQuestions.length
      ? filteredQuestions[currentQuestionIndex]
      : null;

  const progress =
    filteredQuestions.length > 0 ? (currentQuestionIndex / filteredQuestions.length) * 100 : 0;
  const isComplete = currentQuestionIndex >= filteredQuestions.length;

  useEffect(() => {
    if (messages.length === 0 && filteredQuestions.length > 0) {
      const firstMessage: OnboardingMessage = {
        id: Date.now().toString(),
        role: 'system',
        content: filteredQuestions[0].question,
        timestamp: new Date()
      };
      setMessages([firstMessage]);
    }
  }, [filteredQuestions]);

  const sendMessage = (content: string) => {
    // Add user message
    const userMessage: OnboardingMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, userMessage]);

    // Handle stage selection
    if (currentQuestion?.id === 0) {
      const stageLower = content.toLowerCase();
      if (stageLower.includes('early') || stageLower.includes('pre-seed') || stageLower.includes('idea')) {
        setStartupStage('early');
      } else if (stageLower.includes('growth') || stageLower.includes('scaling')) {
        setStartupStage('later');
      } else {
        setStartupStage('early'); // Default to early
      }
    }

    // Move to next question
    const nextIndex = currentQuestionIndex + 1;
    setCurrentQuestionIndex(nextIndex);

    // Add next question if not complete
    if (nextIndex < filteredQuestions.length) {
      setTimeout(() => {
        const systemMessage: OnboardingMessage = {
          id: (Date.now() + 1).toString(),
          role: 'system',
          content: filteredQuestions[nextIndex].question,
          timestamp: new Date()
        };
        setMessages((prev) => [...prev, systemMessage]);
      }, 300);
    }
  };

  const useTemplate = (template: string) => {
    sendMessage(template);
  };

  const uploadDocument = async (file: File): Promise<UploadedDocument> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const doc: UploadedDocument = {
          id: Date.now().toString(),
          name: file.name,
          type: file.type,
          size: file.size,
          uploadedAt: new Date(),
          content: e.target?.result as string
        };
        
        setUploadedDocuments((prev) => [...prev, doc]);
        
        // Add system message about upload
        const uploadMessage: OnboardingMessage = {
          id: (Date.now() + 1).toString(),
          role: 'system',
          content: `✓ Document uploaded: ${file.name}. I'll use this information to help fill in your profile.`,
          timestamp: new Date()
        };
        setMessages((prev) => [...prev, uploadMessage]);
        
        resolve(doc);
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file);
    });
  };

  const removeDocument = (docId: string) => {
    setUploadedDocuments((prev) => prev.filter((d) => d.id !== docId));
  };

  // Send data to n8n when onboarding is complete
  useEffect(() => {
    if (isComplete && !hasSentToN8n) {
      const sendToN8n = async () => {
        try {
          const payload = {
            timestamp: new Date().toISOString(),
            onboarding_completed: true,
            startup_stage: startupStage,
            validation_scores: validation,
            startup_profile: {
              founder_name: passport.founderName,
              startup_name: passport.startupName,
              tagline: passport.tagline,
              summary: passport.summary,
              validation_summary: passport.validationSummary,
              competitor_snapshot: passport.competitorSnapshot,
              market_data: passport.marketData,
              roadmap_snapshot: passport.roadmapSnapshot,
              compliance_flags: passport.complianceFlags,
              funding_readiness: passport.fundingReadiness,
              eu_compliant: passport.euCompliant,
              last_updated: passport.lastUpdated
            },
            onboarding_responses: userInputs,
            user_activity: {
              completed_milestones: milestones.filter(m => m.completed).length,
              total_milestones: milestones.length,
              tools_activated: toolActivationCount,
              milestones: milestones
            },
            market_signals: signals.map(signal => ({
              type: signal.type,
              title: signal.title,
              message: signal.message,
              suggested_action: signal.suggestedAction,
              priority: signal.priority,
              timestamp: signal.timestamp
            })),
            tools: tools.map(tool => ({
              name: tool.name,
              category: tool.category,
              commission: tool.commission,
              description: tool.description,
              pricing: tool.pricing
            })),
            uploaded_documents: uploadedDocuments.map(doc => ({
              name: doc.name,
              type: doc.type,
              size: doc.size,
              uploaded_at: doc.uploadedAt
            }))
          };

          console.log('Sending data to n8n webhook:', payload);
          
          await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            mode: 'no-cors',
            body: JSON.stringify(payload),
          });
          
          console.log('Successfully sent data to n8n');
          setHasSentToN8n(true);
        } catch (error) {
          console.error('Error sending data to n8n:', error);
        }
      };

      sendToN8n();
    }
  }, [isComplete, hasSentToN8n, startupStage, validation, passport, userInputs, milestones, signals, tools, toolActivationCount, uploadedDocuments]);

  return {
    messages,
    currentQuestion,
    progress,
    isComplete,
    sendMessage,
    useTemplate,
    uploadDocument,
    removeDocument,
    uploadedDocuments,
    startupStage
  };
}
