
export const PLAN_CONFIG = {
    'Starter': {
        name: 'Starter Pack',
        amount: 9900, // $99.00
        // In a real app with Price IDs: priceId: 'price_...'
    },
    'All Star': {
        name: 'All Star',
        amount: 19900, // $199.00
    },
    'Hall of Fame': {
        name: 'Hall of Fame',
        amount: 24900, // $249.00
    }
};

export type PlanName = keyof typeof PLAN_CONFIG;

export const getPlanDetails = (planName: string) => {
    const normalized = planName as PlanName;
    return PLAN_CONFIG[normalized] || PLAN_CONFIG['Starter']; // Default
};
