// Educational features for fraud awareness

export interface EducationalTip {
    id: string;
    title: string;
    description: string;
    category: 'security' | 'fraud_prevention' | 'best_practices' | 'upi_basics';
    icon: string;
    priority: 'high' | 'medium' | 'low';
    readTime: number; // in minutes
    content: string;
    examples?: string[];
    dosDonts?: {
        dos: string[];
        donts: string[];
    };
}

export interface FraudPattern {
    id: string;
    name: string;
    description: string;
    howItWorks: string;
    warningSign: string[];
    realExample?: string;
    prevention: string[];
    severity: 'critical' | 'high' | 'medium' | 'low';
}

export interface SafetyQuiz {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    category: string;
    difficulty: 'easy' | 'medium' | 'hard';
    xpReward: number;
}

export interface Tutorial {
    id: string;
    title: string;
    description: string;
    steps: TutorialStep[];
    estimatedTime: number;
    category: string;
    completed: boolean;
}

export interface TutorialStep {
    id: string;
    title: string;
    content: string;
    image?: string;
    action?: string;
    completed: boolean;
}

// Educational tips database
export const EDUCATIONAL_TIPS: EducationalTip[] = [
    {
        id: 'tip-verify-merchant',
        title: 'Always Verify Merchant Details',
        description: 'Check merchant name, UPI ID, and business registration before payment',
        category: 'fraud_prevention',
        icon: '🔍',
        priority: 'high',
        readTime: 2,
        content: `
Before making any UPI payment:

1. **Verify the merchant name** matches the business
2. **Check the UPI ID** format (should be business-like)
3. **Look for verification badges** on the payment app
4. **Confirm the amount** before authorizing
5. **Save receipts** for all transactions

Remember: Legitimate businesses have consistent, professional UPI IDs.
        `.trim(),
        dosDonts: {
            dos: [
                'Verify merchant details before payment',
                'Use official payment apps',
                'Keep transaction records',
                'Report suspicious merchants'
            ],
            donts: [
                'Pay to personal-looking UPI IDs for business',
                'Share your UPI PIN with anyone',
                'Click on unknown payment links',
                'Ignore verification warnings'
            ]
        }
    },
    {
        id: 'tip-upi-pin-security',
        title: 'Protect Your UPI PIN',
        description: 'Your UPI PIN is like your ATM PIN - never share it',
        category: 'security',
        icon: '🔐',
        priority: 'high',
        readTime: 1,
        content: `
UPI PIN Security Rules:

1. **Never share** your UPI PIN with anyone
2. **Don't write it down** or save it digitally
3. **Change it regularly** (every 3-6 months)
4. **Use unique PIN** (not birthdate or 1234)
5. **Cover keypad** when entering PIN

⚠️ No legitimate service will EVER ask for your UPI PIN!
        `.trim(),
        examples: [
            'Bank will never call asking for PIN',
            'Customer support cannot see your PIN',
            'No app needs your PIN to verify'
        ]
    },
    {
        id: 'tip-phishing-awareness',
        title: 'Recognize Phishing Attempts',
        description: 'Learn to identify fake payment requests and scam messages',
        category: 'fraud_prevention',
        icon: '🎣',
        priority: 'high',
        readTime: 3,
        content: `
Common Phishing Red Flags:

1. **Urgent language** ("Act now or account will be blocked!")
2. **Suspicious links** (shortened URLs, misspelled domains)
3. **Requests for sensitive info** (PIN, OTP, password)
4. **Too good to be true** offers
5. **Poor grammar** and spelling errors

Always verify through official channels before clicking any link.
        `.trim(),
        dosDonts: {
            dos: [
                'Verify sender identity',
                'Check URL carefully',
                'Contact company directly',
                'Report phishing attempts'
            ],
            donts: [
                'Click suspicious links',
                'Share OTP or PIN',
                'Download unknown apps',
                'Trust caller ID alone'
            ]
        }
    },
    {
        id: 'tip-qr-code-safety',
        title: 'QR Code Safety',
        description: 'Scan QR codes safely and avoid malicious codes',
        category: 'best_practices',
        icon: '📱',
        priority: 'medium',
        readTime: 2,
        content: `
QR Code Best Practices:

1. **Preview before paying** - Check merchant details
2. **Verify amount** shown in the app
3. **Avoid unknown QR codes** from strangers
4. **Don't scan** QR codes from emails/messages
5. **Use trusted apps** for scanning

Malicious QR codes can redirect to fake payment pages!
        `.trim()
    },
    {
        id: 'tip-transaction-limits',
        title: 'Set Transaction Limits',
        description: 'Protect yourself by setting daily transaction limits',
        category: 'security',
        icon: '💰',
        priority: 'medium',
        readTime: 1,
        content: `
Set Smart Limits:

1. **Daily limit** based on your needs
2. **Per-transaction limit** for safety
3. **Review limits** monthly
4. **Increase temporarily** only when needed

Lower limits = Lower risk if compromised!
        `.trim()
    }
];

// Fraud patterns database
export const FRAUD_PATTERNS: FraudPattern[] = [
    {
        id: 'pattern-fake-customer-support',
        name: 'Fake Customer Support',
        description: 'Scammers impersonate bank/UPI app customer support',
        howItWorks: 'Fraudsters call pretending to be from your bank or payment app, claiming there\'s an issue with your account. They ask for OTP, PIN, or remote access to "fix" the problem.',
        warningSign: [
            'Unsolicited calls about account issues',
            'Requests for OTP or PIN',
            'Pressure to act immediately',
            'Asks to install remote access apps',
            'Threatens account suspension'
        ],
        prevention: [
            'Never share OTP or PIN with anyone',
            'Hang up and call official number',
            'Banks never ask for PIN/OTP',
            'Don\'t install apps on request',
            'Verify caller independently'
        ],
        severity: 'critical',
        realExample: 'Caller claims to be from bank, says account will be blocked unless you verify OTP immediately.'
    },
    {
        id: 'pattern-refund-scam',
        name: 'Fake Refund Scam',
        description: 'Scammers send fake refund requests to steal money',
        howItWorks: 'You receive a payment request disguised as a refund. Accepting it actually sends money FROM your account instead of receiving it.',
        warningSign: [
            'Unexpected refund notifications',
            'Request to "accept" refund',
            'Asks to enter UPI PIN for refund',
            'Suspicious merchant names',
            'Urgency to claim refund'
        ],
        prevention: [
            'Refunds are automatic, no action needed',
            'Never enter PIN to receive money',
            'Verify with merchant directly',
            'Check transaction type carefully',
            'Report suspicious requests'
        ],
        severity: 'high'
    },
    {
        id: 'pattern-lottery-prize',
        name: 'Lottery/Prize Scam',
        description: 'Fake lottery winnings requiring payment to claim',
        howItWorks: 'You\'re told you won a lottery/prize but need to pay "processing fees" or "taxes" via UPI to claim it.',
        warningSign: [
            'Unexpected lottery win notification',
            'Asks for payment to claim prize',
            'Pressure to pay quickly',
            'Can\'t verify lottery legitimately',
            'Requests personal information'
        ],
        prevention: [
            'Legitimate lotteries don\'t require payment',
            'Verify lottery independently',
            'Don\'t pay fees to claim prizes',
            'Be skeptical of unexpected wins',
            'Report to authorities'
        ],
        severity: 'medium'
    }
];

// Safety quiz questions
export const SAFETY_QUIZ: SafetyQuiz[] = [
    {
        id: 'quiz-pin-sharing',
        question: 'Your bank calls saying they need to verify your account. They ask for your UPI PIN. What should you do?',
        options: [
            'Share the PIN to verify',
            'Hang up immediately and call official number',
            'Ask them to call back later',
            'Share half of the PIN only'
        ],
        correctAnswer: 1,
        explanation: 'Banks NEVER ask for your UPI PIN. This is a scam. Always hang up and call the official number to verify.',
        category: 'security',
        difficulty: 'easy',
        xpReward: 10
    },
    {
        id: 'quiz-qr-code',
        question: 'You receive a QR code via WhatsApp from an unknown number claiming you won a prize. What should you do?',
        options: [
            'Scan it to claim the prize',
            'Forward to friends',
            'Delete and block the sender',
            'Scan but don\'t pay'
        ],
        correctAnswer: 2,
        explanation: 'Never scan QR codes from unknown sources. They could be malicious and redirect to fake payment pages.',
        category: 'fraud_prevention',
        difficulty: 'easy',
        xpReward: 10
    },
    {
        id: 'quiz-refund',
        question: 'You get a payment request labeled "REFUND" from a merchant. To receive it, you need to:',
        options: [
            'Accept and enter UPI PIN',
            'Do nothing - real refunds are automatic',
            'Call the merchant first',
            'Share with customer support'
        ],
        correctAnswer: 1,
        explanation: 'Real refunds are automatic and don\'t require any action. This is a scam to make you send money.',
        category: 'fraud_prevention',
        difficulty: 'medium',
        xpReward: 15
    },
    {
        id: 'quiz-transaction-limit',
        question: 'What\'s the best practice for UPI transaction limits?',
        options: [
            'Set maximum limit for convenience',
            'No limit needed',
            'Set based on daily needs',
            'Change limit for each transaction'
        ],
        correctAnswer: 2,
        explanation: 'Setting limits based on your actual daily needs provides security while maintaining convenience.',
        category: 'best_practices',
        difficulty: 'medium',
        xpReward: 15
    }
];

// Interactive tutorials
export const TUTORIALS: Tutorial[] = [
    {
        id: 'tutorial-first-scan',
        title: 'Your First Safe Scan',
        description: 'Learn how to scan a QR code safely',
        estimatedTime: 3,
        category: 'basics',
        completed: false,
        steps: [
            {
                id: 'step-1',
                title: 'Open Scanner',
                content: 'Tap the scan button to open the QR code scanner',
                action: 'Open scanner',
                completed: false
            },
            {
                id: 'step-2',
                title: 'Position QR Code',
                content: 'Point your camera at the QR code and wait for it to focus',
                completed: false
            },
            {
                id: 'step-3',
                title: 'Review Details',
                content: 'Check the merchant name, UPI ID, and amount carefully',
                completed: false
            },
            {
                id: 'step-4',
                title: 'Check AI Prediction',
                content: 'Review the AI safety prediction and risk factors',
                completed: false
            },
            {
                id: 'step-5',
                title: 'Complete Scan',
                content: 'If everything looks good, proceed with the transaction',
                completed: false
            }
        ]
    }
];

// Get tip of the day
export function getTipOfTheDay(): EducationalTip {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const index = dayOfYear % EDUCATIONAL_TIPS.length;
    return EDUCATIONAL_TIPS[index];
}

// Get relevant tips based on scan result
export function getRelevantTips(scanStatus: 'safe' | 'warning' | 'risky'): EducationalTip[] {
    if (scanStatus === 'risky') {
        return EDUCATIONAL_TIPS.filter(tip =>
            tip.priority === 'high' && tip.category === 'fraud_prevention'
        );
    } else if (scanStatus === 'warning') {
        return EDUCATIONAL_TIPS.filter(tip =>
            tip.category === 'best_practices' || tip.category === 'security'
        );
    }
    return EDUCATIONAL_TIPS.filter(tip => tip.category === 'upi_basics').slice(0, 1);
}

// Calculate user safety knowledge score
export function calculateKnowledgeScore(
    quizResults: Array<{ quizId: string; correct: boolean }>,
    tipsRead: string[],
    tutorialsCompleted: string[]
): number {
    const quizScore = quizResults.filter(r => r.correct).length * 10;
    const tipsScore = tipsRead.length * 5;
    const tutorialScore = tutorialsCompleted.length * 20;

    const total = quizScore + tipsScore + tutorialScore;
    return Math.min(100, total);
}
