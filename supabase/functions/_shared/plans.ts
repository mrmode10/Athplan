
export const PLAN_CONFIG = {
    'Starter': {
        name: 'Starter Pack',
        amount: 9900,
        features: [
            'Up to 50 active players',
            'Basic AI Auto-Replies',
            'PDF/Excel Schedule Upload',
            'Email Support'
        ]
    },
    'All Star': {
        name: 'All Star',
        amount: 19900,
        features: [
            'Unlimited players',
            'Advanced AI Reasoning',
            'Calendar & Flight Sync',
            'Priority Support',
            'Usage Analytics'
        ]
    },
    'Hall of Fame': {
        name: 'Hall of Fame',
        amount: 24900,
        features: [
            'Everything in All Star',
            'Custom Integrations',
            'Dedicated Account Manager',
            'White-glove Onboarding',
            'SLA Guarantee'
        ]
    }
};

export type PlanName = keyof typeof PLAN_CONFIG;

export const getPlanDetails = (planName: string) => {
    const normalized = planName as PlanName;
    return PLAN_CONFIG[normalized] || PLAN_CONFIG['Starter']; // Default
};
