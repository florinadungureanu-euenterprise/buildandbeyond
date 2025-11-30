import { useState, useEffect } from 'react';
import { OnboardingMessage, OnboardingQuestion, UploadedDocument, OnboardingProfile } from '@/types';
import { useStore } from '@/store';

const N8N_WEBHOOK_URL = 'https://springervc.app.n8n.cloud/webhook/4ce2573e-4415-4cba-aa4e-65a97223ce43';
const N8N_DOCUMENT_UPLOAD_URL = 'https://springervc.app.n8n.cloud/webhook/document-upload';

// Generate a unique session ID
const generateSessionId = () => {
  return `session-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
};

// Early-stage flow questions (idea → MVP → early customers)
const earlyStageQuestions: OnboardingQuestion[] = [
  {
    id: 1,
    question: 'Who is your customer? Be as specific as possible.',
    templates: [
      '[Job title] at [company type] who [characteristic/behavior]',
      '[Demographic] who struggles with [specific problem]'
    ],
    key: 'customer',
    stage: 'early',
    context: 'I can help you create a customer persona using an empathy map (Says / Thinks / Does / Feels) if that would be helpful.'
  },
  {
    id: 2,
    question: 'What problem does your customer have? Can you describe the last time this happened to them?',
    templates: [
      'Customers struggle with [problem] because [reason], which leads to [consequence]',
      'The problem happens when [situation], causing [impact]'
    ],
    key: 'problem',
    stage: 'early',
    probe_questions: [
      'How painful is this problem for them?',
      'What did they try instead?',
      'How are they handling this today?'
    ]
  },
  {
    id: 3,
    question: 'What are the consequences if this problem goes unsolved?',
    templates: [
      'If unsolved, this leads to [loss/cost/pain] for [customer]',
      'The consequences include [impact 1], [impact 2], and [impact 3]'
    ],
    key: 'consequences_of_problem',
    stage: 'early'
  },
  {
    id: 4,
    question: 'How do they currently solve this? What alternatives exist?',
    templates: [
      'They currently use [solution A] and [solution B], but these fail because [reason]',
      'Existing alternatives include [options], which don\'t work well because [gaps]'
    ],
    key: 'existing_alternatives',
    stage: 'early'
  },
  {
    id: 5,
    question: 'What job is the customer trying to get done? (functional, emotional, and social)',
    templates: [
      'Functional: [task]. Emotional: [feeling]. Social: [perception]',
      'They need to [accomplish] while feeling [emotion] and being seen as [social aspect]'
    ],
    key: 'jobs_to_be_done',
    stage: 'early'
  },
  {
    id: 6,
    question: 'What is your proposed solution?',
    templates: [
      'Our solution helps [customer] achieve [outcome] by [approach]',
      'We [action] so that [customer] can [benefit]'
    ],
    key: 'solution',
    stage: 'early'
  },
  {
    id: 7,
    question: 'What makes your solution uniquely valuable?',
    templates: [
      'Unlike alternatives, we [differentiator] to deliver [benefit]',
      'Our unique approach is [what] which enables [outcome]'
    ],
    key: 'unique_value_proposition',
    stage: 'early'
  },
  {
    id: 8,
    question: 'What is your unfair advantage that others cannot easily copy?',
    templates: [
      'Our unfair advantage is [data/network/technology/insight] because [reason]',
      'We have [unique asset] that creates [barrier to competition]'
    ],
    key: 'unfair_advantage',
    stage: 'early'
  },
  {
    id: 9,
    question: 'What is your riskiest assumption? (The assumption with the least data that is core to your hypothesis)',
    templates: [
      'My idea only works if [assumption] is true',
      'The biggest unknown is whether [assumption]'
    ],
    key: 'riskiest_assumption',
    stage: 'early'
  },
  {
    id: 10,
    question: 'What is the cheapest/fastest way to test your riskiest assumption? What result would give you confidence?',
    templates: [
      'Test by [method] with success defined as [metric/outcome]',
      'Run [experiment] and measure [indicator]. Success means [threshold]'
    ],
    key: 'method_and_success_criterion',
    stage: 'early'
  },
  {
    id: 11,
    question: 'What is your business model? (How will you make money?)',
    templates: [
      'SaaS subscription at $[price]/[period] with [pricing structure]',
      '[Revenue model] with [unit economics]: CAC $[amount], LTV $[amount]'
    ],
    key: 'business_model',
    stage: 'early'
  },
  {
    id: 12,
    question: 'What are your distribution channels and how will you reach customers?',
    templates: [
      'Primary: [channel A]. Secondary: [channel B]. Growth loop: [mechanism]',
      'Acquire through [method], activate via [touchpoint], retain with [strategy]'
    ],
    key: 'channels',
    stage: 'early'
  },
  {
    id: 13,
    question: 'What are your key metrics to track?',
    templates: [
      'North star: [metric]. Supporting: [metric 1], [metric 2], [metric 3]',
      'Track [leading indicator] and [lagging indicator] weekly/monthly'
    ],
    key: 'key_metrics',
    stage: 'early'
  },
  {
    id: 14,
    question: 'What is your 12-week goal?',
    templates: [
      'Validate [assumption] by achieving [metric] through [method]',
      'Reach [milestone] by [approach], proving [hypothesis]'
    ],
    key: 'twelve_week_goal',
    stage: 'early'
  },
  {
    id: 15,
    question: 'What are your biggest risks? (technical, market, adoption, cost)',
    templates: [
      'Technical: [risk]. Market: [risk]. Adoption: [risk]',
      'Main risks: [list], with [specific risk] being most critical'
    ],
    key: 'risks',
    stage: 'early'
  },
  {
    id: 16,
    question: 'Are you looking for fundraising? If yes, what type? (Angel investment, VC, EU grants, private/public funding)',
    templates: [
      'Looking to raise $[amount] via [funding type] for [purpose]',
      'Not fundraising currently / Bootstrapped',
      'Interested in [angel/VC/grants]: $[target amount]'
    ],
    key: 'fundraising_type',
    stage: 'early'
  },
  {
    id: 17,
    question: 'If fundraising: How much are you looking to raise and for what specific purpose?',
    templates: [
      'Raising $[amount] for [product development/hiring/marketing/expansion]',
      'Target: $[amount] to achieve [milestone]',
      'N/A - bootstrapping'
    ],
    key: 'fundraising_amount',
    stage: 'early'
  }
];

// Later-stage flow questions (growing startup → scale-up → established)
const laterStageQuestions: OnboardingQuestion[] = [
  {
    id: 1,
    question: 'What is your organization\'s main focus right now?',
    templates: [
      'Scaling [area] to [target] while improving [metric]',
      'Focus on [initiative] to achieve [outcome] by [timeline]'
    ],
    key: 'later_stage_priorities',
    stage: 'later'
  },
  {
    id: 2,
    question: 'What are your biggest bottlenecks or challenges?',
    templates: [
      'Limited by [constraint] causing [impact] on [outcome]',
      'Bottlenecks in [area 1] and [area 2] preventing [goal]'
    ],
    key: 'later_stage_bottlenecks',
    stage: 'later'
  },
  {
    id: 3,
    question: 'What goals are you aiming to achieve next quarter or next year?',
    templates: [
      'Q[X]: [goal]. Year: [annual goal]. Long-term: [vision]',
      'Near-term: [quarterly target]. Annual: [yearly objective]'
    ],
    key: 'later_stage_goals',
    stage: 'later'
  },
  {
    id: 4,
    question: 'What systems, tools, or infrastructure do you currently use?',
    templates: [
      'Tech stack: [tools]. Processes: [systems]. Gaps: [missing]',
      'Using [tool A] for [function], [tool B] for [function], need [missing capability]'
    ],
    key: 'later_stage_tools',
    stage: 'later'
  },
  {
    id: 5,
    question: 'Which processes need improvement or automation?',
    templates: [
      '[Process A] is manual and slow. [Process B] has [issue]',
      'Need to automate [workflow] and improve [inefficient process]'
    ],
    key: 'later_stage_process_gaps',
    stage: 'later'
  },
  {
    id: 6,
    question: 'What metrics do you track today and what are your current numbers?',
    templates: [
      'Revenue: $[amount]. Growth: [%]. Churn: [%]. CAC/LTV: [ratio]',
      'Key metrics: [metric 1]: [value], [metric 2]: [value], target: [goal]'
    ],
    key: 'later_stage_metrics',
    stage: 'later'
  },
  {
    id: 7,
    question: 'Do you have any known risks, blockers, or compliance requirements?',
    templates: [
      'Risks: [operational/market/technical]. Compliance: [requirements]',
      'Current blockers: [issue 1], [issue 2]. Regulatory: [needs]'
    ],
    key: 'later_stage_risks',
    stage: 'later'
  },
  {
    id: 8,
    question: 'What is your longer-term vision for the organization or product?',
    templates: [
      'Vision: [outcome] serving [market] with [capability]',
      '3-year goal: [target]. 5-year vision: [transformation]'
    ],
    key: 'later_stage_vision',
    stage: 'later'
  },
  {
    id: 9,
    question: 'Are you currently fundraising or planning to raise funds? What type? (Angel, VC, EU grants, private/public funding)',
    templates: [
      'Currently raising Series [A/B/C]: $[amount]',
      'Planning to raise $[amount] via [funding type]',
      'Not fundraising / Already funded / Bootstrapped'
    ],
    key: 'fundraising_type',
    stage: 'later'
  },
  {
    id: 10,
    question: 'If fundraising: What is your target amount and what will the funds be used for?',
    templates: [
      'Target: $[amount] for [scaling/hiring/expansion/R&D]',
      'Raising $[amount] to [specific goals and milestones]',
      'N/A'
    ],
    key: 'fundraising_amount',
    stage: 'later'
  }
];

// Condensed questions for later-stage to fill foundational gaps
const laterStageFoundationalQuestions: OnboardingQuestion[] = [
  {
    id: 1,
    question: 'Briefly, who is your target customer and what core problem do you solve for them?',
    templates: [
      'We serve [customer segment] who struggle with [problem]',
      'Target: [customer]. Problem: [pain point]. Solution: [what we do]'
    ],
    key: 'customer_and_problem',
    stage: 'later'
  },
  {
    id: 2,
    question: 'What is your unique value proposition and unfair advantage?',
    templates: [
      'UVP: [what makes us different]. Advantage: [why we win]',
      'We uniquely [capability] because [unfair advantage]'
    ],
    key: 'uvp_and_advantage',
    stage: 'later'
  },
  {
    id: 3,
    question: 'What are your revenue streams and current business model?',
    templates: [
      'Revenue: [model] at [price point]. Channels: [distribution]',
      'Monetize via [approach]. Currently: $[revenue] with [growth]'
    ],
    key: 'revenue_and_model',
    stage: 'later'
  }
];

// Basic questions asked for both flows
const universalQuestions: OnboardingQuestion[] = [
  {
    id: 0,
    question: 'What industry are you in?',
    templates: [
      'SaaS / Healthcare / Fintech / E-commerce / Education',
      'B2B Software / Consumer Tech / Enterprise'
    ],
    key: 'industry',
    stage: 'all'
  },
  {
    id: 1,
    question: 'What region do you primarily operate in?',
    templates: [
      'North America / Europe / Asia / Global',
      'Specific country or multi-region'
    ],
    key: 'region',
    stage: 'all'
  }
];

export function useOnboardingChat() {
  const [messages, setMessages] = useState<OnboardingMessage[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1); // Start at -1 for stage detection
  const [hasSentToN8n, setHasSentToN8n] = useState(false);
  const [startupStage, setStartupStage] = useState<'early' | 'later' | null>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [onboardingProfile, setOnboardingProfile] = useState<Partial<OnboardingProfile>>({
    document_insights: []
  });
  const [isInFoundationalPhase, setIsInFoundationalPhase] = useState(false);
  const [sessionId] = useState(() => generateSessionId());
  
  const validation = useStore((state) => state.validation);
  const tools = useStore((state) => state.tools);
  const signals = useStore((state) => state.signals);
  const milestones = useStore((state) => state.twelveMonthMilestones);
  const passport = useStore((state) => state.passport);
  const userInputs = useStore((state) => state.userInputs);
  const toolActivationCount = useStore((state) => state.toolActivationCount);

  // Determine which questions to show
  const getQuestionFlow = () => {
    if (!startupStage) return [];
    
    if (startupStage === 'early') {
      return [...earlyStageQuestions, ...universalQuestions];
    } else {
      // Later stage: operational questions + condensed foundational + universal
      if (!isInFoundationalPhase) {
        return laterStageQuestions;
      } else {
        return [...laterStageFoundationalQuestions, ...universalQuestions];
      }
    }
  };

  const filteredQuestions = getQuestionFlow();

  const currentQuestion =
    currentQuestionIndex >= 0 && currentQuestionIndex < filteredQuestions.length
      ? filteredQuestions[currentQuestionIndex]
      : null;

  const getTotalQuestions = () => {
    if (!startupStage) return 1;
    if (startupStage === 'early') {
      return earlyStageQuestions.length + universalQuestions.length + 1; // +1 for stage
    } else {
      return laterStageQuestions.length + laterStageFoundationalQuestions.length + universalQuestions.length + 1;
    }
  };

  const getCurrentProgress = () => {
    if (!startupStage) return 0;
    
    const userAnswers = messages.filter(m => m.role === 'user').length;
    const total = getTotalQuestions();
    return (userAnswers / total) * 100;
  };

  const progress = getCurrentProgress();
  const isComplete = startupStage !== null && currentQuestionIndex >= filteredQuestions.length && 
                     (startupStage === 'early' || isInFoundationalPhase);

  // Initial stage detection message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: OnboardingMessage = {
        id: Date.now().toString(),
        role: 'system',
        content: "Hey there! 👋 Welcome to Build & Beyond, where we take you from idea to unicorn and beyond.\n\nI'm going to help you build a clear, actionable roadmap – no matter where you're starting from. But first, let me understand where you are right now.\n\n**Which stage sounds most like you?**\n\n- **Idea stage** – \"I have a concept, but nothing built yet\"\n- **Prototype** – \"I've made a rough version to test the concept\"\n- **MVP** – \"I have a working product, ready for real users\"\n- **Early Customers** – \"I have my first customers using my product\"\n- **Growing Startup** – \"We're scaling and things are working\"\n- **Scale-up** – \"We're in fast growth mode\"\n- **Established** – \"We're a mature company launching something new\"\n\n**🤔 Not quite sure?** That's totally normal! Just describe what you've done so far (even if it's just an idea in your head), and I'll help you figure out exactly where you are – and what your next steps should be.",
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  const sendMessage = (content: string) => {
    // Add user message
    const userMessage: OnboardingMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, userMessage]);

    // Handle stage detection (first response)
    if (currentQuestionIndex === -1) {
      const stageLower = content.toLowerCase();
      let detectedStage: 'early' | 'later';
      let stageLabel: string;

      if (stageLower.includes('idea') || stageLower.includes('prototype') || 
          stageLower.includes('mvp') || stageLower.includes('early customer')) {
        detectedStage = 'early';
        stageLabel = stageLower.includes('idea') ? 'Idea' : 
                     stageLower.includes('prototype') ? 'Prototype' :
                     stageLower.includes('mvp') ? 'MVP' : 'Early Customers';
      } else {
        detectedStage = 'later';
        stageLabel = stageLower.includes('growing') ? 'Growing Startup' :
                     stageLower.includes('scale') ? 'Scale-up' : 'Established Organization';
      }

      setStartupStage(detectedStage);
      setOnboardingProfile(prev => ({ ...prev, stage_detected: stageLabel }));

      // For later stage, encourage document upload first
      if (detectedStage === 'later') {
        const laterStageIntro: OnboardingMessage = {
          id: (Date.now() + 1).toString(),
          role: 'system',
          content: "Great! Since you're at a growth stage, I'll focus on your current operations and strategic challenges.\n\n**Before we start:** If you have a pitch deck, business plan, or company overview document, please upload it now. This will help me automatically extract your foundational information (customer, problem, solution, etc.) so we can focus the questions on what matters most.\n\n(You can upload documents using the upload button below, or we can proceed directly to the questions.)",
          timestamp: new Date()
        };
        setMessages((prev) => [...prev, laterStageIntro]);
        
        // Wait a moment then start with first operational question
        setTimeout(() => {
          setCurrentQuestionIndex(0);
          const firstQuestion: OnboardingMessage = {
            id: (Date.now() + 2).toString(),
            role: 'system',
            content: laterStageQuestions[0].question + (laterStageQuestions[0].context ? `\n\n${laterStageQuestions[0].context}` : ''),
            timestamp: new Date()
          };
          setMessages((prev) => [...prev, firstQuestion]);
        }, 1000);
        return;
      }

      // For early stage, proceed normally
      setCurrentQuestionIndex(0);
      setTimeout(() => {
        const firstQuestion: OnboardingMessage = {
          id: (Date.now() + 1).toString(),
          role: 'system',
          content: earlyStageQuestions[0].question + (earlyStageQuestions[0].context ? `\n\n${earlyStageQuestions[0].context}` : ''),
          timestamp: new Date()
        };
        setMessages((prev) => [...prev, firstQuestion]);
      }, 300);
      return;
    }

    // Store answer in profile
    if (currentQuestion) {
      // Handle consolidated later-stage questions
      if (currentQuestion.key === 'customer_and_problem') {
        // Parse and split the combined answer
        setOnboardingProfile(prev => ({
          ...prev,
          customer: content,
          problem: content
        }));
      } else if (currentQuestion.key === 'uvp_and_advantage') {
        setOnboardingProfile(prev => ({
          ...prev,
          unique_value_proposition: content,
          unfair_advantage: content
        }));
      } else if (currentQuestion.key === 'revenue_and_model') {
        setOnboardingProfile(prev => ({
          ...prev,
          business_model: content,
          revenue_streams: content
        }));
      } else {
        setOnboardingProfile(prev => ({
          ...prev,
          [currentQuestion.key]: content
        }));
      }
    }

    // Move to next question
    const nextIndex = currentQuestionIndex + 1;
    setCurrentQuestionIndex(nextIndex);

    // Check if we need to transition to foundational questions (later stage only)
    if (startupStage === 'later' && !isInFoundationalPhase && nextIndex >= laterStageQuestions.length) {
      setIsInFoundationalPhase(true);
      setCurrentQuestionIndex(0);
      
      setTimeout(() => {
        const transitionMessage: OnboardingMessage = {
          id: (Date.now() + 1).toString(),
          role: 'system',
          content: "Perfect! Now I need to collect some foundational information about your business. If you've uploaded documents, some of this may be auto-filled later. Otherwise, please provide brief answers to these final questions:",
          timestamp: new Date()
        };
        setMessages((prev) => [...prev, transitionMessage]);
        
        setTimeout(() => {
          const nextQ = laterStageFoundationalQuestions[0];
          const systemMessage: OnboardingMessage = {
            id: (Date.now() + 2).toString(),
            role: 'system',
            content: nextQ.question + (nextQ.context ? `\n\n${nextQ.context}` : ''),
            timestamp: new Date()
          };
          setMessages((prev) => [...prev, systemMessage]);
        }, 500);
      }, 300);
      return;
    }

    // Add next question if not complete
    if (nextIndex < filteredQuestions.length) {
      setTimeout(() => {
        const nextQ = filteredQuestions[nextIndex];
        const systemMessage: OnboardingMessage = {
          id: (Date.now() + 1).toString(),
          role: 'system',
          content: nextQ.question + (nextQ.context ? `\n\n${nextQ.context}` : ''),
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
      
      reader.onload = async (e) => {
        try {
          // Get base64 content (remove data:mime;base64, prefix)
          const result = e.target?.result as string;
          const base64Content = result.includes(',') ? result.split(',')[1] : result;
          
          const doc: UploadedDocument = {
            id: Date.now().toString(),
            name: file.name,
            type: file.type,
            size: file.size,
            uploadedAt: new Date(),
            content: base64Content
          };
          
          setUploadedDocuments((prev) => [...prev, doc]);
          
          // Send immediately to n8n document upload webhook
          try {
            const uploadPayload = {
              session_id: sessionId,
              startup_profile: {
                stage_detected: onboardingProfile.stage_detected || startupStage
              },
              uploaded_documents: [{
                name: file.name,
                type: file.type,
                size: file.size,
                uploaded_at: new Date().toISOString(),
                content: base64Content
              }]
            };
            
            console.log('Sending document to n8n for parsing:', file.name);
            
            const response = await fetch(N8N_DOCUMENT_UPLOAD_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(uploadPayload)
            });
            
            if (response.ok) {
              const result = await response.json();
              console.log('Document processed by n8n:', result);
              
              // Store document insights
              setOnboardingProfile(prev => ({
                ...prev,
                document_insights: [
                  ...(prev.document_insights || []),
                  `Uploaded ${file.name} - Extracted ${result.fields_extracted || 0} fields via n8n`
                ]
              }));
              
              // Add system message about successful parsing
              const uploadMessage: OnboardingMessage = {
                id: (Date.now() + 1).toString(),
                role: 'system',
                content: `✓ Document processed: ${file.name}. Extracted ${result.fields_extracted || 0} fields automatically. This will help pre-fill your foundational information.`,
                timestamp: new Date()
              };
              setMessages((prev) => [...prev, uploadMessage]);
            } else {
              console.error('Document upload failed:', response.status);
              // Still add basic message
              const uploadMessage: OnboardingMessage = {
                id: (Date.now() + 1).toString(),
                role: 'system',
                content: `✓ Document uploaded: ${file.name}. Processing in background...`,
                timestamp: new Date()
              };
              setMessages((prev) => [...prev, uploadMessage]);
            }
          } catch (uploadError) {
            console.error('Error sending document to n8n:', uploadError);
            // Still show upload success to user
            const uploadMessage: OnboardingMessage = {
              id: (Date.now() + 1).toString(),
              role: 'system',
              content: `✓ Document uploaded: ${file.name}. Processing in background...`,
              timestamp: new Date()
            };
            setMessages((prev) => [...prev, uploadMessage]);
          }
          
          resolve(doc);
        } catch (error) {
          console.error('Error processing file:', error);
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsDataURL(file); // Changed to readAsDataURL for base64
    });
  };

  const removeDocument = (docId: string) => {
    const doc = uploadedDocuments.find(d => d.id === docId);
    if (doc) {
      setUploadedDocuments((prev) => prev.filter((d) => d.id !== docId));
      setOnboardingProfile(prev => ({
        ...prev,
        document_insights: (prev.document_insights || []).filter(
          insight => !insight.includes(doc.name)
        )
      }));
    }
  };

  // Send data to n8n when onboarding is complete
  useEffect(() => {
    if (isComplete && !hasSentToN8n) {
      const sendToN8n = async () => {
        try {
          const payload = {
            status: 'onboarding_complete',
            timestamp: new Date().toISOString(),
            session_id: sessionId,
            startup_profile: {
              // All fields - will be populated based on stage and documents
              stage_detected: onboardingProfile.stage_detected,
              
              // Early-stage foundational fields (REQUIRED for both stages)
              customer: onboardingProfile.customer || '',
              empathy_map: {
                says: onboardingProfile.problem || '',
                thinks: onboardingProfile.consequences_of_problem || '',
                does: onboardingProfile.existing_alternatives || '',
                feels: onboardingProfile.jobs_to_be_done || ''
              },
              problem: onboardingProfile.problem || '',
              consequences_of_problem: onboardingProfile.consequences_of_problem || '',
              existing_alternatives: onboardingProfile.existing_alternatives || '',
              jobs_to_be_done: onboardingProfile.jobs_to_be_done || '',
              solution: onboardingProfile.solution || '',
              unique_value_proposition: onboardingProfile.unique_value_proposition || '',
              unfair_advantage: onboardingProfile.unfair_advantage || '',
              riskiest_assumption: onboardingProfile.riskiest_assumption || '',
              method_and_success_criterion: onboardingProfile.method_and_success_criterion || '',
              business_model: onboardingProfile.business_model || '',
              channels: onboardingProfile.channels || '',
              revenue_streams: onboardingProfile.revenue_streams || '',
              cost_structure: onboardingProfile.cost_structure || '',
              key_metrics: onboardingProfile.key_metrics || '',
              twelve_week_goal: onboardingProfile.twelve_week_goal || '',
              risks: onboardingProfile.risks || '',
              fundraising_type: onboardingProfile.fundraising_type || '',
              fundraising_amount: onboardingProfile.fundraising_amount || '',
              
              // Later-stage operational fields (populated only for later stage)
              later_stage_priorities: onboardingProfile.later_stage_priorities || '',
              later_stage_bottlenecks: onboardingProfile.later_stage_bottlenecks || '',
              later_stage_goals: onboardingProfile.later_stage_goals || '',
              later_stage_tools: onboardingProfile.later_stage_tools || '',
              later_stage_process_gaps: onboardingProfile.later_stage_process_gaps || '',
              later_stage_metrics: onboardingProfile.later_stage_metrics || '',
              later_stage_risks: onboardingProfile.later_stage_risks || '',
              later_stage_vision: onboardingProfile.later_stage_vision || '',
              
              // Universal fields
              industry: onboardingProfile.industry || '',
              region: onboardingProfile.region || '',
              
              // Document tracking
              document_insights: onboardingProfile.document_insights || []
            },
            // Raw uploaded documents for n8n to parse
            uploaded_documents: uploadedDocuments.map(doc => ({
              name: doc.name,
              type: doc.type,
              size: doc.size,
              uploaded_at: doc.uploadedAt,
              content: doc.content // Full content for parsing
            })),
            // Metadata
            requires_document_parsing: startupStage === 'later' && uploadedDocuments.length > 0,
            manual_answers_provided: startupStage === 'early',
            // Legacy fields for backward compatibility
            validation_scores: validation,
            user_activity: {
              completed_milestones: milestones.filter(m => m.completed).length,
              total_milestones: milestones.length,
              tools_activated: toolActivationCount
            },
            market_signals: signals.map(signal => ({
              type: signal.type,
              title: signal.title,
              message: signal.message,
              priority: signal.priority
            }))
          };

          console.log('Sending structured onboarding data to n8n:', payload);
          
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
  }, [isComplete, hasSentToN8n, onboardingProfile, startupStage, uploadedDocuments, validation, milestones, signals, toolActivationCount]);

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
    startupStage,
    totalQuestions: getTotalQuestions()
  };
}
