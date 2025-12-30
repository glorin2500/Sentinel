import { ScanResult } from './store';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

/**
 * Generate CSV content from scan results
 */
export function generateCSV(scans: ScanResult[]): string {
    const headers = ['Date', 'Time', 'Merchant', 'UPI ID', 'Status', 'Threat Type', 'Location'];
    const rows = scans.map(scan => [
        format(scan.timestamp, 'yyyy-MM-dd'),
        format(scan.timestamp, 'HH:mm:ss'),
        scan.merchantName || 'Unknown',
        scan.upiId,
        scan.status.toUpperCase(),
        scan.threatType || 'None',
        scan.location ? `${scan.location.city || ''}, ${scan.location.region || ''}`.trim() : 'Not recorded'
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
}

/**
 * Generate PDF report from scan results
 */
export function generatePDF(scans: ScanResult[], stats: {
    safetyScore: number;
    totalScans: number;
    safeScans: number;
    riskyScans: number;
}): jsPDF {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(24);
    doc.setTextColor(124, 255, 178); // Primary color
    doc.text('Sentinel', 20, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('UPI Security Scan Report', 20, 28);
    doc.text(`Generated: ${format(Date.now(), 'PPpp')}`, 20, 34);

    // Summary Stats
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Summary', 20, 50);

    doc.setFontSize(10);
    doc.text(`Safety Score: ${stats.safetyScore.toFixed(1)}%`, 20, 60);
    doc.text(`Total Scans: ${stats.totalScans}`, 20, 67);
    doc.text(`Safe Scans: ${stats.safeScans}`, 20, 74);
    doc.text(`Risky Scans: ${stats.riskyScans}`, 20, 81);

    // Scan History Table
    const tableData = scans.map(scan => [
        format(scan.timestamp, 'yyyy-MM-dd HH:mm'),
        scan.merchantName || 'Unknown',
        scan.upiId,
        scan.status.toUpperCase(),
        scan.threatType || '-'
    ]);

    autoTable(doc, {
        startY: 95,
        head: [['Date & Time', 'Merchant', 'UPI ID', 'Status', 'Threat']],
        body: tableData,
        theme: 'grid',
        headStyles: {
            fillColor: [124, 255, 178],
            textColor: [0, 0, 0],
            fontStyle: 'bold'
        },
        bodyStyles: {
            fontSize: 9
        },
        columnStyles: {
            0: { cellWidth: 35 },
            1: { cellWidth: 40 },
            2: { cellWidth: 45 },
            3: { cellWidth: 25 },
            4: { cellWidth: 35 }
        },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 3) {
                const status = data.cell.text[0];
                if (status === 'RISKY') {
                    data.cell.styles.textColor = [255, 107, 107];
                    data.cell.styles.fontStyle = 'bold';
                } else if (status === 'SAFE') {
                    data.cell.styles.textColor = [124, 255, 178];
                    data.cell.styles.fontStyle = 'bold';
                }
            }
        }
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
            `Page ${i} of ${pageCount} | Sentinel Security Report`,
            doc.internal.pageSize.getWidth() / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
        );
    }

    return doc;
}

/**
 * Format scan result for sharing
 */
export function formatShareText(scan: ScanResult): string {
    const statusEmoji = scan.status === 'safe' ? '✅' : '⚠️';
    const date = format(scan.timestamp, 'PPpp');

    let text = `${statusEmoji} Sentinel Scan Result\n\n`;
    text += `Merchant: ${scan.merchantName || 'Unknown'}\n`;
    text += `UPI ID: ${scan.upiId}\n`;
    text += `Status: ${scan.status.toUpperCase()}\n`;
    if (scan.threatType) {
        text += `Threat: ${scan.threatType}\n`;
    }
    text += `Date: ${date}\n`;
    text += `\nScanned with Sentinel - UPI Security Scanner`;

    return text;
}

/**
 * Download file to user's device
 */
export function downloadFile(content: string | Blob, filename: string, mimeType: string) {
    const blob = typeof content === 'string'
        ? new Blob([content], { type: mimeType })
        : content;

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Share using Web Share API or fallback to clipboard
 */
export async function shareContent(text: string, title: string = 'Sentinel Scan'): Promise<boolean> {
    // Try Web Share API first
    if (navigator.share) {
        try {
            await navigator.share({
                title,
                text
            });
            return true;
        } catch (error) {
            // User cancelled or error occurred
            console.log('Share cancelled or failed:', error);
        }
    }

    // Fallback to clipboard
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        return false;
    }
}
