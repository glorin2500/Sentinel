// Emergency features for fraud response

export interface EmergencyContact {
    id: string;
    name: string;
    phone: string;
    email?: string;
    relationship: string;
    notifyOnFraud: boolean;
}

export interface FraudReport {
    id: string;
    scanId: string;
    merchantName: string;
    upiId: string;
    amount?: number;
    reportType: 'fraud' | 'scam' | 'phishing' | 'unauthorized' | 'other';
    description: string;
    evidence: FraudEvidence[];
    status: 'submitted' | 'under_review' | 'resolved' | 'rejected';
    submittedAt: number;
    updatedAt: number;
    referenceNumber: string;
}

export interface FraudEvidence {
    id: string;
    type: 'screenshot' | 'photo' | 'document' | 'chat_log';
    url: string;
    filename: string;
    uploadedAt: number;
}

export interface QuickAction {
    id: string;
    label: string;
    icon: string;
    action: () => void;
    color: string;
    urgent?: boolean;
}

// Bank/Authority contacts
export const EMERGENCY_CONTACTS = {
    cyberCrime: {
        name: 'Cyber Crime Helpline',
        phone: '1930',
        description: 'Report cyber fraud and financial crimes'
    },
    bankingOmbudsman: {
        name: 'Banking Ombudsman',
        phone: '14448',
        description: 'Banking complaints and disputes'
    },
    consumerHelpline: {
        name: 'Consumer Helpline',
        phone: '1915',
        description: 'Consumer complaints'
    },
    upiSupport: {
        name: 'NPCI UPI Support',
        phone: '18001201740',
        description: 'UPI transaction issues'
    }
};

// Create fraud report
export function createFraudReport(
    scanId: string,
    merchantName: string,
    upiId: string,
    reportType: FraudReport['reportType'],
    description: string,
    amount?: number
): FraudReport {
    return {
        id: `fraud-${Date.now()}`,
        scanId,
        merchantName,
        upiId,
        amount,
        reportType,
        description,
        evidence: [],
        status: 'submitted',
        submittedAt: Date.now(),
        updatedAt: Date.now(),
        referenceNumber: `FR${Date.now().toString().slice(-8)}`
    };
}

// Quick fraud report to authorities
export async function reportToAuthorities(
    report: FraudReport
): Promise<{ success: boolean; message: string }> {
    // In production, this would call actual API
    // For now, simulate submission

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                message: `Report ${report.referenceNumber} submitted successfully. You will receive updates via email/SMS.`
            });
        }, 1000);
    });
}

// Notify emergency contacts
export async function notifyEmergencyContacts(
    contacts: EmergencyContact[],
    report: FraudReport
): Promise<void> {
    const message = `
FRAUD ALERT - Sentinel Dashboard

A fraud incident has been reported:
Merchant: ${report.merchantName}
UPI ID: ${report.upiId}
${report.amount ? `Amount: ₹${report.amount}` : ''}
Type: ${report.reportType}

Reference: ${report.referenceNumber}
Time: ${new Date(report.submittedAt).toLocaleString()}

This is an automated alert from Sentinel Dashboard.
    `.trim();

    // In production, send actual SMS/Email
    console.log('Notifying contacts:', contacts.map(c => c.name));
    console.log('Message:', message);
}

// Request transaction freeze
export async function requestTransactionFreeze(
    upiId: string,
    transactionId?: string
): Promise<{ success: boolean; message: string }> {
    // In production, integrate with bank API
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                message: 'Freeze request submitted. Please contact your bank immediately at their customer care number.'
            });
        }, 500);
    });
}

// Generate evidence package
export function generateEvidencePackage(report: FraudReport): string {
    const evidence = `
FRAUD EVIDENCE PACKAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Reference Number: ${report.referenceNumber}
Report Date: ${new Date(report.submittedAt).toLocaleString()}

INCIDENT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Type: ${report.reportType.toUpperCase()}
Merchant Name: ${report.merchantName}
UPI ID: ${report.upiId}
${report.amount ? `Amount: ₹${report.amount.toLocaleString()}` : ''}

DESCRIPTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${report.description}

EVIDENCE FILES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${report.evidence.length > 0
            ? report.evidence.map((e, i) => `${i + 1}. ${e.filename} (${e.type})`).join('\n')
            : 'No evidence files attached'}

STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Current Status: ${report.status.toUpperCase()}
Last Updated: ${new Date(report.updatedAt).toLocaleString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Generated by Sentinel Dashboard
${new Date().toLocaleString()}
    `.trim();

    return evidence;
}

// Screenshot capture for evidence
export async function captureScreenshot(): Promise<string | null> {
    try {
        // Use HTML2Canvas or similar in production
        // For now, return placeholder
        return 'data:image/png;base64,placeholder';
    } catch (error) {
        console.error('Screenshot failed:', error);
        return null;
    }
}

// Quick actions for emergency
export function getQuickActions(
    onReportFraud: () => void,
    onContactBank: () => void,
    onFreezeTransaction: () => void,
    onNotifyContacts: () => void
): QuickAction[] {
    return [
        {
            id: 'report-fraud',
            label: 'Report Fraud',
            icon: '🚨',
            action: onReportFraud,
            color: '#FF6B6B',
            urgent: true
        },
        {
            id: 'contact-bank',
            label: 'Contact Bank',
            icon: '📞',
            action: onContactBank,
            color: '#4ECDC4',
            urgent: true
        },
        {
            id: 'freeze-transaction',
            label: 'Freeze Transaction',
            icon: '❄️',
            action: onFreezeTransaction,
            color: '#95E1D3',
            urgent: true
        },
        {
            id: 'notify-contacts',
            label: 'Notify Contacts',
            icon: '📧',
            action: onNotifyContacts,
            color: '#F38181'
        }
    ];
}

// Emergency checklist
export interface EmergencyStep {
    id: string;
    title: string;
    description: string;
    completed: boolean;
    urgent: boolean;
    action?: () => void;
}

export function getEmergencyChecklist(
    reportSubmitted: boolean = false,
    bankContacted: boolean = false,
    evidenceCollected: boolean = false
): EmergencyStep[] {
    return [
        {
            id: 'stop-transaction',
            title: 'Stop Further Transactions',
            description: 'Do not make any more payments to this merchant',
            completed: true,
            urgent: true
        },
        {
            id: 'collect-evidence',
            title: 'Collect Evidence',
            description: 'Take screenshots, save messages, note transaction details',
            completed: evidenceCollected,
            urgent: true
        },
        {
            id: 'report-fraud',
            title: 'Report to Authorities',
            description: 'File a fraud report with cyber crime cell',
            completed: reportSubmitted,
            urgent: true
        },
        {
            id: 'contact-bank',
            title: 'Contact Your Bank',
            description: 'Inform your bank immediately about the fraud',
            completed: bankContacted,
            urgent: true
        },
        {
            id: 'change-credentials',
            title: 'Change Credentials',
            description: 'Update UPI PIN, passwords, and security questions',
            completed: false,
            urgent: false
        },
        {
            id: 'monitor-account',
            title: 'Monitor Account',
            description: 'Check for unauthorized transactions regularly',
            completed: false,
            urgent: false
        }
    ];
}

// Panic button action
export function triggerPanicMode(
    onClearData: () => void,
    onLockApp: () => void,
    onNotifyContacts: () => void
): void {
    const confirmed = confirm(
        'PANIC MODE\n\n' +
        'This will:\n' +
        '• Lock the app immediately\n' +
        '• Notify emergency contacts\n' +
        '• Clear sensitive data (optional)\n\n' +
        'Continue?'
    );

    if (confirmed) {
        onLockApp();
        onNotifyContacts();

        const clearData = confirm('Also clear all app data? This cannot be undone.');
        if (clearData) {
            onClearData();
        }
    }
}
