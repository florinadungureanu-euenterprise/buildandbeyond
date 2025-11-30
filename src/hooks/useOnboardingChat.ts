import { useState, useEffect } from 'react';
import { OnboardingMessage, OnboardingQuestion } from '@/types';
import { useStore } from '@/store';

const N8N_WEBHOOK_URL = 'https://springervc.app.n8n.cloud/webhook/4ce2573e-4415-4cba-aa4e-65a97223ce43';

const onboardingQuestions: OnboardingQuestion[] = [
  {
    id: 1,
    question: 'What problem are you solving?',
    templates: [
      'Companies struggle with [problem] because [reason]. This causes [impact].',
      'Current solutions fail at [gap] leading to [outcome].'
    ],
    key: 'problem'
  },
  {
    id: 2,
    question: 'Who is your target customer?',
    templates: [
      'Mid-sized [industry] companies with [characteristic].',
      '[Role] at [company size] who need [capability].'
    ],
    key: 'customer'
  },
  {
    id: 3,
    question: 'What is your value proposition?',
    templates: [
      'We help [customer] achieve [outcome] through [approach].',
      'Unlike alternatives, we provide [differentiator] to deliver [benefit].'
    ],
    key: 'value'
  },
  {
    id: 4,
    question: 'What is your business model?',
    templates: [
      'SaaS subscription at $[price]/month with [pricing model].',
      '[Revenue model] with [payment structure] and [unit economics].'
    ],
    key: 'business_model'
  },
  {
    id: 5,
    question: 'How large is your addressable market?',
    templates: [
      'TAM of $[amount]B with [growth rate]% annual growth.',
      '[Number] potential customers spending $[amount] annually.'
    ],
    key: 'market_size'
  },
  {
    id: 6,
    question: 'Who are your main competitors?',
    templates: [
      '[Competitor A] focuses on [segment], [Competitor B] targets [different segment].',
      'Established players include [names]. New entrants are [names].'
    ],
    key: 'competitors'
  },
  {
    id: 7,
    question: 'What is your competitive advantage?',
    templates: [
      'Our [technology/approach] enables [capability] that others cannot match.',
      'We uniquely combine [factor 1] with [factor 2] to deliver [outcome].'
    ],
    key: 'advantage'
  },
  {
    id: 8,
    question: 'What traction have you achieved?',
    templates: [
      '[Number] customers generating $[revenue] MRR with [growth]% month-over-month.',
      '[Milestone] completed with [metric] proving [validation].'
    ],
    key: 'traction'
  },
  {
    id: 9,
    question: 'What are your key metrics?',
    templates: [
      'CAC: $[amount], LTV: $[amount], retention: [percent]%.',
      '[Metric 1]: [value], [Metric 2]: [value], improving [percent]% monthly.'
    ],
    key: 'metrics'
  },
  {
    id: 10,
    question: 'What is your go-to-market strategy?',
    templates: [
      'Direct sales to [segment] via [channel] with [conversion] conversion rate.',
      'Product-led growth through [tactic] supported by [marketing approach].'
    ],
    key: 'gtm'
  },
  {
    id: 11,
    question: 'What are your funding needs?',
    templates: [
      'Raising $[amount] to [goal] over [timeline].',
      'Seeking $[amount] for [use case 1], [use case 2], and [use case 3].'
    ],
    key: 'funding'
  },
  {
    id: 12,
    question: 'Where do you see the company in 12 months?',
    templates: [
      '[Revenue target] with [customer count] customers and [team size] team members.',
      'Achieve [milestone] enabling [next phase] with [metric] validation.'
    ],
    key: 'vision'
  }
];

export function useOnboardingChat() {
  const [messages, setMessages] = useState<OnboardingMessage[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [hasSentToN8n, setHasSentToN8n] = useState(false);
  
  const validation = useStore((state) => state.validation);
  const tools = useStore((state) => state.tools);
  const signals = useStore((state) => state.signals);
  const milestones = useStore((state) => state.twelveMonthMilestones);
  const passport = useStore((state) => state.passport);
  const userInputs = useStore((state) => state.userInputs);
  const toolActivationCount = useStore((state) => state.toolActivationCount);

  const currentQuestion =
    currentQuestionIndex < onboardingQuestions.length
      ? onboardingQuestions[currentQuestionIndex]
      : null;

  const progress = (currentQuestionIndex / onboardingQuestions.length) * 100;
  const isComplete = currentQuestionIndex >= onboardingQuestions.length;

  useEffect(() => {
    if (messages.length === 0 && currentQuestion) {
      setMessages([
        {
          id: '1',
          role: 'system',
          content: currentQuestion.question,
          timestamp: new Date()
        }
      ]);
    }
  }, []);

  const sendMessage = (content: string) => {
    const userMessage: OnboardingMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setCurrentQuestionIndex((prev) => prev + 1);

    setTimeout(() => {
      if (currentQuestionIndex + 1 < onboardingQuestions.length) {
        const nextQuestion = onboardingQuestions[currentQuestionIndex + 1];
        const systemMessage: OnboardingMessage = {
          id: (Date.now() + 1).toString(),
          role: 'system',
          content: nextQuestion.question,
          timestamp: new Date()
        };
        setMessages((prev) => [...prev, systemMessage]);
      }
    }, 300);
  };

  const useTemplate = (template: string) => {
    sendMessage(template);
  };

  // Send data to n8n when onboarding is complete
  useEffect(() => {
    if (isComplete && !hasSentToN8n) {
      const sendToN8n = async () => {
        try {
          const payload = {
            timestamp: new Date().toISOString(),
            onboarding_completed: true,
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
  }, [isComplete, hasSentToN8n, validation, passport, userInputs, milestones, signals, tools, toolActivationCount]);

  return {
    messages,
    currentQuestion,
    progress,
    isComplete,
    sendMessage,
    useTemplate
  };
}
