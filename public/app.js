console.log('[APP.JS] Script starting...');

/* =========================================
   1. SUPABASE CONFIG & STATE
   ========================================= */
const supabaseUrl = 'https://haicfgsgimpwnukympab.supabase.co';
const supabaseKey = 'sb_publishable_TlM38PD842aKFHGgUvmrdQ_wWrdhweW';

// Initialize Supabase with retry/fallback
let supabase;

function initSupabase() {
    console.log('[APP.JS] Initializing Supabase...');
    try {
        if (!window.supabase) {
            console.warn("[APP.JS] Supabase client not loaded from CDN yet.");
            return false;
        }
        supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
        console.log('[APP.JS] Supabase initialized successfully.');
        return true;
    } catch (err) {
        console.error("[APP.JS] Supabase Init Failed:", err);
        return false;
    }
}

// Mock backend for fallback
const mockBackend = {
    getUser: async () => {
        if (!supabase) return null;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;
        // Fetch profile
        const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single();
        return profile ? { ...user, ...profile } : user;
    },
    login: async (email, password) => {
        if (!supabase) return { success: false, message: "System offline" };
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { success: false, message: error.message };
        return { success: true, user: data.user };
    },
    signup: async (dataBody) => {
        if (!supabase) return { success: false, message: "System offline" };
        const { email, password, firstName, lastName, team } = dataBody;
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    first_name: firstName,
                    last_name: lastName,
                    team: team
                }
            }
        });

        if (error) return { success: false, message: error.message };
        // Create profile record manually if trigger fails/not present, ensuring data integrity
        const { error: profileError } = await supabase.from('users').insert({
            id: data.user.id,
            email,
            first_name: firstName,
            last_name: lastName,
            team,
            plan: 'trial'
        });

        if (profileError) console.error("Profile creation failed", profileError);

        return { success: true };
    },
    confirmPayment: async (paymentMethod) => {
        if (!supabase) return { success: false };
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from('users').update({ payment_method: paymentMethod }).eq('id', user.id);
        }
        return { success: true };
    },
    verify: async (code) => {
        return { success: true };
    },
    logout: async () => {
        if (supabase) await supabase.auth.signOut();
        window.location.reload();
    }
};

let activityLogs = [];
let currentMode = 'undecided';

// Load Data
async function loadPricing() {
    console.log('[APP.JS] Loading pricing...');
    const container = document.getElementById('pricing-container');
    if (!container) {
        console.error('[APP.JS] Pricing container not found!');
        return;
    }

    // Fallback hardcoded plans if Supabase connection fails
    const fallbackPlans = [
        {
            name: 'Starter Pack',
            price: '$99',
            period: '/mo',
            is_highlighted: false,
            features: JSON.stringify(['Up to 20 Players', 'Basic Automation', 'Email Support'])
        },
        {
            name: 'All Star',
            price: '$199',
            period: '/mo',
            is_highlighted: true,
            features: JSON.stringify(['Up to 50 Players', 'Advanced Analytics', 'Priority Support', 'Custom Branding'])
        },
        {
            name: 'Hall of Fame',
            price: '$249',
            period: '/mo',
            is_highlighted: false,
            features: JSON.stringify(['Unlimited Players', 'Dedicated Acct Manager', 'API Access', 'White Label'])
        }
    ];

    let plans = fallbackPlans;

    try {
        if (supabase && typeof supabase.from === 'function') {
            const { data, error } = await supabase.from('pricing_plans').select('*').order('display_order');
            if (!error && data && data.length > 0) {
                plans = data;
                console.log('[APP.JS] Loaded pricing from Supabase');
            }
        } else {
            console.warn('[APP.JS] Supabase not ready, using fallback pricing.');
        }
    } catch (e) { console.warn("Using offline pricing.", e); }

    if (!plans) {
        container.innerHTML = '<div class="text-red-400">Failed to load pricing.</div>';
        return;
    }

    container.innerHTML = plans.map(plan => {
        let features = [];
        try {
            features = typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features;
        } catch (e) {
            console.error('Failed to parse features for plan', plan.name, e);
            features = ['Features unavailable'];
        }

        return `
        <div class="relative rounded-2xl p-8 flex flex-col border transition-all duration-300 ${plan.is_highlighted ? 'bg-slate-900/80 border-indigo-500 shadow-[0_0_40px_rgba(99,102,241,0.15)] transform md:-translate-y-4' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}">
            ${plan.is_highlighted ? '<div class="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Most Popular</div>' : ''}
            <h3 class="text-lg font-medium text-white mb-2">${plan.name}</h3>
            <div class="flex items-baseline gap-1"><span class="text-4xl font-bold text-white">${plan.price}</span><span class="text-slate-500">${plan.period}</span></div>
            <ul class="space-y-4 my-8 text-sm text-slate-300">
                ${features.map(feat => `
                    <li class="flex items-start gap-3">
                        <svg class="w-5 h-5 ${plan.is_highlighted ? 'text-indigo-400' : 'text-slate-600'}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg> 
                        ${feat}
                    </li>
                `).join('')}
            </ul>
            <button onclick="navigateTo('signup-view')" class="w-full py-2 rounded-full transition-colors ${plan.is_highlighted ? 'bg-white text-slate-900 hover:bg-indigo-50 shadow-glow' : 'bg-transparent border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'}">Start Free Trial</button>
        </div>
    `}).join('');
}

async function fetchActivityLogs() {
    if (!supabase) return;
    const { data, error } = await supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(20);
    if (data) {
        activityLogs = data.map(log => ({
            ...log,
            time: new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
        renderActivityLog();
    }
}

// Initialize Logic
window.initPricingAndLogs = function () {
    console.log('[APP.JS] initPricingAndLogs called');
    if (!initSupabase()) {
        // Retry a few times if script not loaded
        let retries = 0;
        const retryInterval = setInterval(() => {
            retries++;
            console.log(`[APP.JS] Retrying Supabase init (${retries})...`);
            if (initSupabase() || retries > 5) {
                clearInterval(retryInterval);
                loadPricing(); // Load even if Supabase fails (fallback)
                fetchActivityLogs();
                setInterval(fetchActivityLogs, 30000);
            }
        }, 500);
    } else {
        loadPricing();
        fetchActivityLogs();
        setInterval(fetchActivityLogs, 30000);
    }
}

/* =========================================
   2. NAVIGATION & UI LOGIC
   ========================================= */

window.navigateTo = (viewId) => {
    console.log('[APP.JS] navigateTo:', viewId);
    // Hide all views
    document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden'));
    const target = document.getElementById(viewId);
    if (target) target.classList.remove('hidden');
    window.scrollTo({ top: 0 });

    const user = mockBackend.getUser(); // Promise? No, mockBackend.getUser is async but we need sync user for UI? 
    // Wait, mockBackend.getUser IS async. We should await it or handle promise.
    // The original code treated it as sync in some places? No, let's fix this.

    // Quick fix: Just check local storage or similar if we want synchronous, 
    // OR make navigateTo async. But onclick handlers expect sync mostly.
    // Let's assume for now we just handle UI updates.

    updateNavbar(viewId);
};

async function updateNavbar(viewId) {
    const user = await mockBackend.getUser();
    const guestNav = document.getElementById('auth-buttons-guest');
    const userNav = document.getElementById('auth-buttons-user');
    const navbar = document.getElementById('navbar');

    if (!guestNav || !userNav || !navbar) return;

    // Navbar Logic: Hide main navbar when in dashboard
    if (viewId === 'dashboard-view') {
        navbar.classList.add('hidden');
    } else {
        navbar.classList.remove('hidden');
    }

    if (user) {
        guestNav.classList.add('hidden');
        userNav.classList.remove('hidden');
        if (viewId === 'dashboard-view') {
            const nameEl = document.getElementById('user-name-display');
            if (nameEl) nameEl.innerText = user.first_name + ' ' + user.last_name;
            const teamEl = document.getElementById('user-team-display');
            if (teamEl) teamEl.innerText = user.team;
            const avatarEl = document.getElementById('user-avatar');
            if (avatarEl) avatarEl.innerText = user.first_name ? user.first_name.charAt(0) : 'U';

            // Show Onboarding Modal if state not set
            if (currentMode === 'undecided') {
                const modal = document.getElementById('onboarding-modal');
                if (modal) modal.classList.remove('hidden');
            }
        }
    } else {
        guestNav.classList.remove('hidden');
        userNav.classList.add('hidden');
        if (viewId === 'dashboard-view') window.navigateTo('login-view');
    }
}

window.setSetupMode = (mode) => {
    currentMode = mode;
    const modal = document.getElementById('onboarding-modal');
    if (modal) modal.classList.add('hidden');

    const demoGuides = ['demo-guide-activity', 'demo-guide-upload', 'demo-guide-broadcast'];
    const demoIndicator = document.getElementById('demo-mode-indicator');

    if (mode === 'demo') {
        activityLogs = [
            { id: 1, time: '2m ago', user: 'Mike J.', query: 'Bus departure time?', status: 'Answered' },
            { id: 2, time: '15m ago', user: 'Sarah T.', query: 'What is the dress code?', status: 'Answered' },
            { id: 3, time: '1h ago', user: 'Tom B.', query: 'Gym location', status: 'Answered' },
            { id: 4, time: '2h ago', user: 'System', query: 'Syncing Flight AA123...', status: 'Processed' },
        ];
        document.getElementById('stat-queries').innerText = '24';
        document.getElementById('stat-players').innerText = '18';
        document.getElementById('stat-time').innerText = '1.5 hrs';

        demoGuides.forEach(id => document.getElementById(id)?.classList.remove('hidden'));
        if (demoIndicator) demoIndicator.classList.remove('hidden');
    } else {
        activityLogs = [];
        document.getElementById('stat-queries').innerText = '0';
        document.getElementById('stat-players').innerText = '0';
        document.getElementById('stat-time').innerText = '0 hrs';

        demoGuides.forEach(id => document.getElementById(id)?.classList.add('hidden'));
        if (demoIndicator) demoIndicator.classList.add('hidden');
    }
    renderActivityLog();
};

window.scrollToId = (id) => {
    window.navigateTo('home-view');
    setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
            const y = el.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    }, 100);
};

window.switchDashTab = (tabName) => {
    document.querySelectorAll('.dash-tab').forEach(el => el.classList.add('hidden'));
    const target = document.getElementById(`dash-${tabName}`);
    if (target) target.classList.remove('hidden');
};

window.goToStep = (stepId) => {
    document.getElementById('signup-step-1')?.classList.add('hidden');
    document.getElementById('signup-step-payment')?.classList.add('hidden');
    document.getElementById('signup-step-verify')?.classList.add('hidden');
    document.getElementById(stepId)?.classList.remove('hidden');
};

/* =========================================
   3. ROI CALCULATOR LOGIC
   ========================================= */

window.ROI = {
    users: 15,
    msgs: 10,
    hourlyRate: 40,
    minsPerMsg: 2,

    init: function () {
        console.log('[APP.JS] ROI init');
        const userSlider = document.getElementById('roi-users');
        const msgSlider = document.getElementById('roi-msgs');

        if (!userSlider || !msgSlider) {
            console.warn('[APP.JS] ROI sliders not found');
            return;
        }

        userSlider.addEventListener('input', (e) => {
            this.users = parseInt(e.target.value);
            this.calculate();
        });

        msgSlider.addEventListener('input', (e) => {
            this.msgs = parseInt(e.target.value);
            this.calculate();
        });

        this.calculate();
    },

    calculate: function () {
        // Calculations
        const totalMessagesPerWeek = this.users * this.msgs;
        const minutesSavedPerWeek = totalMessagesPerWeek * this.minsPerMsg;
        const hoursSavedPerWeek = minutesSavedPerWeek / 60;
        const hoursSavedPerMonth = hoursSavedPerWeek * 4;
        const grossValueSaved = hoursSavedPerMonth * this.hourlyRate;

        // Plan Logic
        let planName = 'Starter Pack';
        let planCost = 99;

        if (this.users > 8 && this.users <= 20) {
            planName = 'All Star';
            planCost = 199;
        } else if (this.users > 20 && this.users <= 30) {
            planName = 'Hall of Fame';
            planCost = 249;
        } else if (this.users > 30) {
            planName = 'Enterprise';
            planCost = 0; // Custom
        }

        const netSavings = planCost > 0 ? grossValueSaved - planCost : grossValueSaved;

        // DOM Updates
        const elUsers = document.getElementById('roi-users-val');
        if (elUsers) elUsers.innerText = `${this.users} Users`;

        const elMsgs = document.getElementById('roi-msgs-val');
        if (elMsgs) elMsgs.innerText = `${this.msgs} msgs`;

        const elTime = document.getElementById('roi-time-saved');
        if (elTime) elTime.innerText = hoursSavedPerMonth.toFixed(1);

        const elValue = document.getElementById('roi-value-saved');
        if (elValue) elValue.innerText = Math.floor(grossValueSaved).toLocaleString();

        const elPlan = document.getElementById('roi-plan-name');
        if (elPlan) elPlan.innerText = planName;

        if (planCost > 0) {
            const elCost = document.getElementById('roi-plan-cost');
            if (elCost) elCost.innerText = `$${planCost}`;

            const elPeriod = document.getElementById('roi-plan-period');
            if (elPeriod) elPeriod.innerText = '/mo';

            const elNet = document.getElementById('roi-net-savings');
            if (elNet) elNet.innerText = Math.floor(netSavings).toLocaleString();
        } else {
            const elCost = document.getElementById('roi-plan-cost');
            if (elCost) elCost.innerText = 'Contact Sales';

            const elPeriod = document.getElementById('roi-plan-period');
            if (elPeriod) elPeriod.innerText = '';

            const elNet = document.getElementById('roi-net-savings');
            if (elNet) elNet.innerText = Math.floor(grossValueSaved).toLocaleString() + '*';
        }

        // Highlight Pricing Card based on users
        this.highlightPricingCard(planName);
    },

    highlightPricingCard: function (planName) {
        // Reset classes
        const starter = document.getElementById('price-card-starter');
        const allstar = document.getElementById('price-card-allstar');
        const hof = document.getElementById('price-card-hof');

        const cards = [starter, allstar, hof];

        cards.forEach(card => {
            if (!card) return;
            card.classList.remove('border-indigo-500', 'bg-slate-900', 'scale-105');
            card.classList.add('border-slate-800', 'bg-slate-950');
        });

        if (planName === 'Starter Pack' && starter) {
            starter.classList.add('border-indigo-500', 'bg-slate-900', 'scale-105');
            starter.classList.remove('border-slate-800', 'bg-slate-950');
        } else if (planName === 'All Star' && allstar) {
            allstar.classList.add('border-indigo-500', 'bg-slate-900', 'scale-105');
            allstar.classList.remove('border-slate-800', 'bg-slate-950');
        } else if (planName === 'Hall of Fame' && hof) {
            hof.classList.add('border-indigo-500', 'bg-slate-900', 'scale-105');
            hof.classList.remove('border-slate-800', 'bg-slate-950');
        }
    }
};


/* =========================================
   4. FILE UPLOAD LOGIC
   ========================================= */

window.setupFileUpload = (input) => {
    if (input.files && input.files[0]) {
        simulateFileUpload(input.files[0].name);
    }
};

window.simulateFileUpload = (fileName) => {
    const progress = document.getElementById('upload-progress');
    const bar = progress.firstElementChild;
    const dropZone = document.getElementById('drop-zone');

    // Show progress
    progress.classList.remove('hidden');

    let width = 0;
    const interval = setInterval(() => {
        if (width >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                activityLogs.unshift({
                    id: Date.now(),
                    time: 'Just now',
                    user: 'System',
                    query: `Agent Reading: "${fileName}"...`,
                    status: 'Processing'
                });
                renderActivityLog();

                // Second phase: Agent finished reading
                setTimeout(() => {
                    activityLogs.unshift({
                        id: Date.now(),
                        time: 'Just now',
                        user: 'System',
                        query: `Knowledge Base Updated: "${fileName}"`,
                        status: 'Active'
                    });
                    renderActivityLog();
                    progress.classList.add('hidden');
                    width = 0;
                    bar.style.width = '0%';
                    alert("File uploaded. Agent has read the document and updated the team knowledge base.");
                }, 1500);

            }, 500);
        } else {
            width += 10;
            bar.style.width = width + '%';
        }
    }, 100);
};

// Drag and Drop Event Listeners
window.initROIAndDropZone = function () {
    window.ROI.init(); // Initialize ROI Calculator

    const dropZone = document.getElementById('drop-zone');
    if (dropZone) {
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-active');
        });

        dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-active');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-active');
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                const file = e.dataTransfer.files[0];
                simulateFileUpload(file.name);
            }
        });
    }
}


/* =========================================
   5. FORM HANDLERS & AUTH
   ========================================= */

// Init Handlers executed immediately if DOM ready
function initForms() {
    console.log('[APP.JS] Initializing forms...');
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.removeEventListener('submit', handleLogin); // Prevent duplicates
        loginForm.addEventListener('submit', handleLogin);
    }

    const signupDetails = document.getElementById('signup-form-details');
    if (signupDetails) {
        signupDetails.addEventListener('submit', handleSignupDetails);
    }

    const signupPayment = document.getElementById('signup-form-payment');
    if (signupPayment) {
        signupPayment.addEventListener('submit', handleSignupPayment);
    }

    const verifyForm = document.getElementById('verify-form');
    if (verifyForm) {
        verifyForm.addEventListener('submit', handleVerify);
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const originalText = btn.innerText;
    btn.innerText = "Signing in...";

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const res = await mockBackend.login(email, password);
    if (res.success) {
        window.navigateTo('dashboard-view');
    } else {
        document.getElementById('login-error').classList.remove('hidden');
        btn.innerText = originalText;
    }
}

async function handleSignupDetails(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.innerText = "Processing...";
    const data = {
        firstName: document.getElementById('signup-fname').value,
        lastName: document.getElementById('signup-lname').value,
        team: document.getElementById('signup-team').value,
        email: document.getElementById('signup-email').value,
        password: document.getElementById('signup-password').value,
    };
    await mockBackend.signup(data);
    window.goToStep('signup-step-payment');
    btn.innerText = "Continue";
}

async function handleSignupPayment(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.innerText = "Setting up...";
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    await mockBackend.confirmPayment(paymentMethod);
    window.goToStep('signup-step-verify');
    btn.innerText = "Confirm & Start";
}

async function handleVerify(e) {
    e.preventDefault();
    const res = await mockBackend.verify(document.getElementById('verify-code').value);
    if (res.success) window.navigateTo('dashboard-view');
    else document.getElementById('verify-error').classList.remove('hidden');
}


window.logout = () => mockBackend.logout();
window.handleGoogleAuth = () => {
    alert("Simulating Google Auth provider...");
    setTimeout(() => {
        const mockUser = { firstName: 'Alex', lastName: 'Google', team: 'Pilot Team', email: 'alex@gmail.com' };
        // Sync logic is hard without backend, but here we can just reload
        window.location.reload();
    }, 1000);
};

/* =========================================
   6. DASHBOARD ACTIONS
   ========================================= */

function renderActivityLog() {
    const container = document.getElementById('activity-log-container');
    if (!container) return;
    container.innerHTML = '';

    if (activityLogs.length === 0) {
        container.innerHTML = '<div class="p-8 text-center text-slate-500">No activity yet. Upload a schedule or click \'Start From Scratch\' to begin.</div>';
        return;
    }

    activityLogs.forEach(log => {
        const div = document.createElement('div');
        div.className = "p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors animate-fade-in";
        div.innerHTML = `
                <div class="flex items-center gap-4">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-slate-800 text-slate-400">
                    ${log.user.charAt(0)}
                </div>
                <div>
                    <div class="text-sm text-white font-medium">${log.query}</div>
                    <div class="text-xs text-slate-500">${log.user} • ${log.time}</div>
                </div>
                </div>
                <div class="flex items-center gap-2">
                <span class="text-xs font-medium text-green-400">${log.status}</span>
                </div>
        `;
        container.appendChild(div);
    });
}

window.showBroadcastModal = () => document.getElementById('broadcast-modal').classList.remove('hidden');
window.sendBroadcast = () => {
    const txt = document.getElementById('broadcast-text').value;
    if (!txt) return;
    document.getElementById('broadcast-modal').classList.add('hidden');
    activityLogs.unshift({ id: Date.now(), time: 'Just now', user: 'Admin', query: `Broadcast: "${txt}"`, status: 'Sent' });
    renderActivityLog();
    document.getElementById('broadcast-text').value = '';
};

window.generateMagicLink = () => {
    const toast = document.getElementById('magic-link-toast');
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 2000);
};

window.triggerCrisisMode = () => {
    if (confirm("ACTIVATE CRISIS MODE? This will send an immediate alert to all players bypassing normal AI filters.")) {
        alert("CRISIS ALERT SENT: 'Check phones immediately for admin instructions.'");
        activityLogs.unshift({ id: Date.now(), time: 'Just now', user: 'ADMIN', query: 'CRISIS ALERT BROADCAST', status: 'URGENT' });
        renderActivityLog();
    }
};

// Scroll Animations
function initScrollObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.querySelectorAll('.transition-element').forEach(el => el.classList.add('visible'));
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.scroll-trigger').forEach(el => observer.observe(el));
}

// Master Init
function masterInit() {
    console.log('[APP.JS] Master Init Triggered');
    window.initPricingAndLogs();
    window.initROIAndDropZone();
    initForms();
    initScrollObserver();

    // Initial Navigation Check
    (async () => {
        const user = await mockBackend.getUser();
        if (user) {
            window.navigateTo('dashboard-view');
        } else {
            window.navigateTo('home-view');
        }
    })();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', masterInit);
} else {
    masterInit();
}
