import { ScanResult } from '../store';

// Advanced filtering
export interface ScanFilters {
    dateRange?: {
        start: Date;
        end: Date;
    };
    amountRange?: {
        min: number;
        max: number;
    };
    status?: ('safe' | 'warning' | 'risky')[];
    merchants?: string[];
    categories?: string[];
    tags?: string[];
    searchQuery?: string;
}

export function filterScans(scans: ScanResult[], filters: ScanFilters): ScanResult[] {
    return scans.filter(scan => {
        // Date range filter
        if (filters.dateRange) {
            const scanDate = new Date(scan.timestamp);
            if (scanDate < filters.dateRange.start || scanDate > filters.dateRange.end) {
                return false;
            }
        }

        // Amount range filter
        if (filters.amountRange && scan.amount) {
            if (scan.amount < filters.amountRange.min || scan.amount > filters.amountRange.max) {
                return false;
            }
        }

        // Status filter
        if (filters.status && filters.status.length > 0) {
            if (!filters.status.includes(scan.status)) {
                return false;
            }
        }

        // Merchant filter
        if (filters.merchants && filters.merchants.length > 0) {
            if (!filters.merchants.includes(scan.upiId)) {
                return false;
            }
        }

        // Search query
        if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            const searchableText = `${scan.upiId} ${scan.merchantName || ''} ${scan.threatType || ''}`.toLowerCase();
            if (!searchableText.includes(query)) {
                return false;
            }
        }

        return true;
    });
}

// Search functionality
export interface SearchResult {
    scan: ScanResult;
    relevance: number;
    matchedFields: string[];
}

export function searchScans(scans: ScanResult[], query: string): SearchResult[] {
    if (!query.trim()) return [];

    const lowerQuery = query.toLowerCase();
    const results: SearchResult[] = [];

    scans.forEach(scan => {
        let relevance = 0;
        const matchedFields: string[] = [];

        // Check UPI ID (highest relevance)
        if (scan.upiId.toLowerCase().includes(lowerQuery)) {
            relevance += 10;
            matchedFields.push('UPI ID');
        }

        // Check merchant name
        if (scan.merchantName?.toLowerCase().includes(lowerQuery)) {
            relevance += 8;
            matchedFields.push('Merchant Name');
        }

        // Check threat type
        if (scan.threatType?.toLowerCase().includes(lowerQuery)) {
            relevance += 5;
            matchedFields.push('Threat Type');
        }

        // Check notes
        if (scan.notes?.toLowerCase().includes(lowerQuery)) {
            relevance += 3;
            matchedFields.push('Notes');
        }

        // Check amount (exact match)
        if (scan.amount && query.match(/^\d+$/)) {
            const queryAmount = parseInt(query);
            if (scan.amount === queryAmount) {
                relevance += 7;
                matchedFields.push('Amount');
            }
        }

        if (relevance > 0) {
            results.push({ scan, relevance, matchedFields });
        }
    });

    // Sort by relevance
    return results.sort((a, b) => b.relevance - a.relevance);
}

// Batch operations
export interface BatchOperation {
    type: 'delete' | 'export' | 'tag' | 'favorite' | 'unfavorite';
    scanIds: string[];
    metadata?: any;
}

export function executeBatchOperation(
    scans: ScanResult[],
    operation: BatchOperation,
    callbacks: {
        onDelete?: (ids: string[]) => void;
        onExport?: (scans: ScanResult[]) => void;
        onTag?: (ids: string[], tag: string) => void;
        onFavorite?: (upiIds: string[]) => void;
        onUnfavorite?: (upiIds: string[]) => void;
    }
): void {
    const selectedScans = scans.filter(scan => operation.scanIds.includes(scan.id));

    switch (operation.type) {
        case 'delete':
            callbacks.onDelete?.(operation.scanIds);
            break;

        case 'export':
            callbacks.onExport?.(selectedScans);
            break;

        case 'tag':
            if (operation.metadata?.tag) {
                callbacks.onTag?.(operation.scanIds, operation.metadata.tag);
            }
            break;

        case 'favorite':
            const upiIdsToFavorite = selectedScans.map(s => s.upiId);
            callbacks.onFavorite?.(upiIdsToFavorite);
            break;

        case 'unfavorite':
            const upiIdsToUnfavorite = selectedScans.map(s => s.upiId);
            callbacks.onUnfavorite?.(upiIdsToUnfavorite);
            break;
    }
}

// Bulk delete with confirmation
export function confirmBulkDelete(count: number): boolean {
    return confirm(`Are you sure you want to delete ${count} scan${count > 1 ? 's' : ''}? This action cannot be undone.`);
}

// Tags management
export interface Tag {
    id: string;
    name: string;
    color: string;
    icon?: string;
}

export const DEFAULT_TAGS: Tag[] = [
    { id: 'trusted', name: 'Trusted', color: '#7CFFB2', icon: '✓' },
    { id: 'suspicious', name: 'Suspicious', color: '#FF6B6B', icon: '⚠' },
    { id: 'frequent', name: 'Frequent', color: '#4ECDC4', icon: '🔄' },
    { id: 'high-value', name: 'High Value', color: '#FFD700', icon: '💎' },
    { id: 'personal', name: 'Personal', color: '#9B59B6', icon: '👤' },
    { id: 'business', name: 'Business', color: '#3498DB', icon: '💼' }
];

export function createCustomTag(name: string, color: string, icon?: string): Tag {
    return {
        id: `custom-${Date.now()}`,
        name,
        color,
        icon
    };
}

// Sorting options
export type SortField = 'timestamp' | 'merchantName' | 'amount' | 'status';
export type SortDirection = 'asc' | 'desc';

export function sortScans(
    scans: ScanResult[],
    field: SortField,
    direction: SortDirection = 'desc'
): ScanResult[] {
    const sorted = [...scans].sort((a, b) => {
        let comparison = 0;

        switch (field) {
            case 'timestamp':
                comparison = a.timestamp - b.timestamp;
                break;

            case 'merchantName':
                const nameA = (a.merchantName || a.upiId).toLowerCase();
                const nameB = (b.merchantName || b.upiId).toLowerCase();
                comparison = nameA.localeCompare(nameB);
                break;

            case 'amount':
                const amountA = a.amount || 0;
                const amountB = b.amount || 0;
                comparison = amountA - amountB;
                break;

            case 'status':
                const statusOrder = { safe: 0, warning: 1, risky: 2 };
                comparison = statusOrder[a.status] - statusOrder[b.status];
                break;
        }

        return direction === 'asc' ? comparison : -comparison;
    });

    return sorted;
}

// Group scans by various criteria
export function groupScansByMerchant(scans: ScanResult[]): Map<string, ScanResult[]> {
    const groups = new Map<string, ScanResult[]>();

    scans.forEach(scan => {
        const key = scan.upiId;
        if (!groups.has(key)) {
            groups.set(key, []);
        }
        groups.get(key)!.push(scan);
    });

    return groups;
}

export function groupScansByDate(scans: ScanResult[]): Map<string, ScanResult[]> {
    const groups = new Map<string, ScanResult[]>();

    scans.forEach(scan => {
        const date = new Date(scan.timestamp).toDateString();
        if (!groups.has(date)) {
            groups.set(date, []);
        }
        groups.get(date)!.push(scan);
    });

    return groups;
}

export function groupScansByMonth(scans: ScanResult[]): Map<string, ScanResult[]> {
    const groups = new Map<string, ScanResult[]>();

    scans.forEach(scan => {
        const date = new Date(scan.timestamp);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!groups.has(key)) {
            groups.set(key, []);
        }
        groups.get(key)!.push(scan);
    });

    return groups;
}

// Export utilities for batch export
export async function batchExportToCSV(scans: ScanResult[]): Promise<string> {
    const headers = ['Date', 'Time', 'UPI ID', 'Merchant', 'Status', 'Amount', 'Threat Type', 'Notes'];
    const rows = scans.map(scan => {
        const date = new Date(scan.timestamp);
        return [
            date.toLocaleDateString(),
            date.toLocaleTimeString(),
            scan.upiId,
            scan.merchantName || 'Unknown',
            scan.status,
            scan.amount ? `₹${scan.amount}` : '',
            scan.threatType || '',
            scan.notes || ''
        ];
    });

    const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csv;
}

export async function batchExportToPDF(scans: ScanResult[]): Promise<Blob> {
    // This would use jsPDF like the existing export
    // For now, return a placeholder
    throw new Error('PDF batch export not yet implemented');
}
