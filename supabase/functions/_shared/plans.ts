
export const PLAN_CONFIG = {
    'Starter': {
        name: 'Starter Pack',
        amount: 9900,
        features: [
            'Up to 8 Users',
            'WhatsApp Native Interface',
            'Instant Schedule Answers',
            'Standard Email Support',
            'Basic Itinerary Parsing'
        ]
    },
    'All Star': {
        name: 'All Star',
        amount: 19900,
        features: [
            'Up to 20 Users',
            'Everything in Starter',
            'Priority Support',
            'Travel Logistics Module',
            'Multi-admin access'
        ]
    },
    'Hall of Fame': {
        name: 'Hall of Fame',
        amount: 24900,
        features: [
            'Up to 30 Users',
            'Everything in All Star',
            '24/7 AI Troubleshoot Support',
            'Advanced Analytics Dashboard',
            'Custom Hotel & Bus Integrations'
        ]
    }
};

export type PlanName = keyof typeof PLAN_CONFIG;

export const getPlanDetails = (planName: string) => {
    const normalized = planName as PlanName;
    return PLAN_CONFIG[normalized] || PLAN_CONFIG['Starter']; // Default
};
