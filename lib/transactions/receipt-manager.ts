// Transaction history and receipt management

export interface Receipt {
    id: string;
    scanId: string;
    merchantName: string;
    upiId: string;
    amount: number;
    timestamp: number;
    status: 'completed' | 'pending' | 'failed' | 'disputed';
    category?: string;
    notes?: string;
    attachments?: ReceiptAttachment[];
    metadata?: {
        transactionId?: string;
        referenceNumber?: string;
        paymentMethod?: string;
        merchantGST?: string;
    };
}

export interface ReceiptAttachment {
    id: string;
    type: 'image' | 'pdf' | 'screenshot';
    url: string;
    filename: string;
    size: number;
    uploadedAt: number;
}

export interface TransactionTimeline {
    date: string;
    transactions: Receipt[];
    totalAmount: number;
    count: number;
}

export interface DisputeTicket {
    id: string;
    receiptId: string;
    reason: string;
    description: string;
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    createdAt: number;
    updatedAt: number;
    resolution?: string;
    attachments?: ReceiptAttachment[];
}

// Create receipt from scan
export function createReceipt(
    scanId: string,
    merchantName: string,
    upiId: string,
    amount: number,
    category?: string
): Receipt {
    return {
        id: `receipt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        scanId,
        merchantName,
        upiId,
        amount,
        timestamp: Date.now(),
        status: 'completed',
        category,
        notes: '',
        attachments: [],
        metadata: {
            transactionId: `TXN${Date.now()}`,
            referenceNumber: `REF${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        }
    };
}

// Group receipts by date
export function groupReceiptsByDate(receipts: Receipt[]): TransactionTimeline[] {
    const grouped = new Map<string, Receipt[]>();

    receipts.forEach(receipt => {
        const date = new Date(receipt.timestamp).toDateString();
        if (!grouped.has(date)) {
            grouped.set(date, []);
        }
        grouped.get(date)!.push(receipt);
    });

    const timelines: TransactionTimeline[] = [];
    grouped.forEach((transactions, date) => {
        const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
        timelines.push({
            date,
            transactions: transactions.sort((a, b) => b.timestamp - a.timestamp),
            totalAmount,
            count: transactions.length
        });
    });

    return timelines.sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );
}

// Search receipts
export function searchReceipts(
    receipts: Receipt[],
    query: string
): Receipt[] {
    const lowerQuery = query.toLowerCase();

    return receipts.filter(receipt => {
        return (
            receipt.merchantName.toLowerCase().includes(lowerQuery) ||
            receipt.upiId.toLowerCase().includes(lowerQuery) ||
            receipt.notes?.toLowerCase().includes(lowerQuery) ||
            receipt.metadata?.transactionId?.toLowerCase().includes(lowerQuery) ||
            receipt.metadata?.referenceNumber?.toLowerCase().includes(lowerQuery) ||
            receipt.amount.toString().includes(query)
        );
    });
}

// Filter receipts
export interface ReceiptFilters {
    dateRange?: {
        start: Date;
        end: Date;
    };
    amountRange?: {
        min: number;
        max: number;
    };
    status?: ('completed' | 'pending' | 'failed' | 'disputed')[];
    categories?: string[];
    merchants?: string[];
}

export function filterReceipts(
    receipts: Receipt[],
    filters: ReceiptFilters
): Receipt[] {
    return receipts.filter(receipt => {
        // Date range
        if (filters.dateRange) {
            const receiptDate = new Date(receipt.timestamp);
            if (receiptDate < filters.dateRange.start || receiptDate > filters.dateRange.end) {
                return false;
            }
        }

        // Amount range
        if (filters.amountRange) {
            if (receipt.amount < filters.amountRange.min || receipt.amount > filters.amountRange.max) {
                return false;
            }
        }

        // Status
        if (filters.status && filters.status.length > 0) {
            if (!filters.status.includes(receipt.status)) {
                return false;
            }
        }

        // Categories
        if (filters.categories && filters.categories.length > 0) {
            if (!receipt.category || !filters.categories.includes(receipt.category)) {
                return false;
            }
        }

        // Merchants
        if (filters.merchants && filters.merchants.length > 0) {
            if (!filters.merchants.includes(receipt.upiId)) {
                return false;
            }
        }

        return true;
    });
}

// Generate payment proof
export function generatePaymentProof(receipt: Receipt): string {
    const proof = `
PAYMENT PROOF
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Transaction ID: ${receipt.metadata?.transactionId || 'N/A'}
Reference No: ${receipt.metadata?.referenceNumber || 'N/A'}

Date: ${new Date(receipt.timestamp).toLocaleString()}
Merchant: ${receipt.merchantName}
UPI ID: ${receipt.upiId}
Amount: ₹${receipt.amount.toLocaleString()}

Status: ${receipt.status.toUpperCase()}
Category: ${receipt.category || 'Uncategorized'}

${receipt.notes ? `Notes: ${receipt.notes}\n` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Generated by Sentinel Dashboard
${new Date().toLocaleString()}
    `.trim();

    return proof;
}

// Create dispute ticket
export function createDispute(
    receiptId: string,
    reason: string,
    description: string
): DisputeTicket {
    return {
        id: `dispute-${Date.now()}`,
        receiptId,
        reason,
        description,
        status: 'open',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        attachments: []
    };
}

// Add attachment to receipt
export function addAttachment(
    receipt: Receipt,
    file: File
): Promise<ReceiptAttachment> {
    return new Promise((resolve) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const attachment: ReceiptAttachment = {
                id: `attach-${Date.now()}`,
                type: file.type.startsWith('image/') ? 'image' : 'pdf',
                url: e.target?.result as string,
                filename: file.name,
                size: file.size,
                uploadedAt: Date.now()
            };

            resolve(attachment);
        };

        reader.readAsDataURL(file);
    });
}

// Calculate statistics
export function getReceiptStatistics(receipts: Receipt[]): {
    total: number;
    totalAmount: number;
    averageAmount: number;
    byStatus: Record<string, number>;
    byCategory: Record<string, number>;
    topMerchants: Array<{ merchant: string; amount: number; count: number }>;
} {
    const byStatus: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    const merchantMap = new Map<string, { amount: number; count: number }>();

    let totalAmount = 0;

    receipts.forEach(receipt => {
        totalAmount += receipt.amount;

        // By status
        byStatus[receipt.status] = (byStatus[receipt.status] || 0) + 1;

        // By category
        const category = receipt.category || 'Uncategorized';
        byCategory[category] = (byCategory[category] || 0) + 1;

        // By merchant
        const existing = merchantMap.get(receipt.upiId);
        if (existing) {
            existing.amount += receipt.amount;
            existing.count += 1;
        } else {
            merchantMap.set(receipt.upiId, {
                amount: receipt.amount,
                count: 1
            });
        }
    });

    const topMerchants = Array.from(merchantMap.entries())
        .map(([merchant, data]) => ({ merchant, ...data }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 10);

    return {
        total: receipts.length,
        totalAmount,
        averageAmount: receipts.length > 0 ? totalAmount / receipts.length : 0,
        byStatus,
        byCategory,
        topMerchants
    };
}

// Export receipts to CSV
export function exportReceiptsToCSV(receipts: Receipt[]): string {
    const headers = [
        'Date',
        'Time',
        'Transaction ID',
        'Merchant',
        'UPI ID',
        'Amount',
        'Status',
        'Category',
        'Notes'
    ];

    const rows = receipts.map(receipt => {
        const date = new Date(receipt.timestamp);
        return [
            date.toLocaleDateString(),
            date.toLocaleTimeString(),
            receipt.metadata?.transactionId || '',
            receipt.merchantName,
            receipt.upiId,
            receipt.amount.toString(),
            receipt.status,
            receipt.category || '',
            receipt.notes || ''
        ];
    });

    const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csv;
}

// Monthly summary
export function getMonthlySummary(receipts: Receipt[], month: number, year: number): {
    totalTransactions: number;
    totalAmount: number;
    averageTransaction: number;
    largestTransaction: Receipt | null;
    smallestTransaction: Receipt | null;
    byCategory: Record<string, { count: number; amount: number }>;
} {
    const monthReceipts = receipts.filter(receipt => {
        const date = new Date(receipt.timestamp);
        return date.getMonth() === month && date.getFullYear() === year;
    });

    if (monthReceipts.length === 0) {
        return {
            totalTransactions: 0,
            totalAmount: 0,
            averageTransaction: 0,
            largestTransaction: null,
            smallestTransaction: null,
            byCategory: {}
        };
    }

    const totalAmount = monthReceipts.reduce((sum, r) => sum + r.amount, 0);
    const byCategory: Record<string, { count: number; amount: number }> = {};

    monthReceipts.forEach(receipt => {
        const category = receipt.category || 'Uncategorized';
        if (!byCategory[category]) {
            byCategory[category] = { count: 0, amount: 0 };
        }
        byCategory[category].count++;
        byCategory[category].amount += receipt.amount;
    });

    const sorted = [...monthReceipts].sort((a, b) => b.amount - a.amount);

    return {
        totalTransactions: monthReceipts.length,
        totalAmount,
        averageTransaction: totalAmount / monthReceipts.length,
        largestTransaction: sorted[0],
        smallestTransaction: sorted[sorted.length - 1],
        byCategory
    };
}
