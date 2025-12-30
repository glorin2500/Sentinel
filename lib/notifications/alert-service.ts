export type AlertType = 'risky_scan' | 'unusual_location' | 'high_amount' | 'frequent_scans';

export interface AlertData {
    title: string;
    body: string;
    icon?: string;
    tag?: string;
    data?: any;
}

/**
 * Request notification permission from the browser
 */
export async function requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
        console.warn('This browser does not support notifications');
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    return false;
}

/**
 * Send a browser notification
 */
export async function sendAlert(type: AlertType, data: AlertData, playSound: boolean = true): Promise<void> {
    // Check if notifications are supported and permitted
    if (!('Notification' in window)) {
        console.warn('Notifications not supported');
        return;
    }

    if (Notification.permission !== 'granted') {
        console.warn('Notification permission not granted');
        return;
    }

    // Play sound if enabled
    if (playSound) {
        playAlertSound(type);
    }

    // Create notification
    const notification = new Notification(data.title, {
        body: data.body,
        icon: data.icon || '/icon-192.png',
        badge: '/icon-192.png',
        tag: data.tag || type,
        requireInteraction: type === 'risky_scan', // Require user action for risky scans
        data: data.data
    });

    // Handle notification click
    notification.onclick = () => {
        window.focus();
        notification.close();

        // Navigate to relevant page based on type
        if (type === 'risky_scan') {
            window.location.href = '/history';
        }
    };

    // Auto-close after 5 seconds (except for risky scans)
    if (type !== 'risky_scan') {
        setTimeout(() => notification.close(), 5000);
    }
}

/**
 * Play alert sound based on type
 */
export function playAlertSound(type: 'warning' | 'danger' | AlertType): void {
    // Create audio context
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Different frequencies for different alert types
    let frequency: number;
    let duration: number;

    switch (type) {
        case 'risky_scan':
        case 'danger':
            frequency = 800; // Lower, more urgent
            duration = 0.3;
            break;
        case 'high_amount':
        case 'unusual_location':
        case 'warning':
            frequency = 1000; // Medium
            duration = 0.2;
            break;
        default:
            frequency = 1200; // Higher, less urgent
            duration = 0.15;
    }

    // Create oscillator for beep sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    // Envelope for smooth sound
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

/**
 * Check if notifications are enabled
 */
export function areNotificationsEnabled(): boolean {
    return 'Notification' in window && Notification.permission === 'granted';
}

/**
 * Get notification permission status
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
    if (!('Notification' in window)) {
        return 'unsupported';
    }
    return Notification.permission;
}

/**
 * Send risky scan alert
 */
export async function sendRiskyScanAlert(
    merchantName: string,
    upiId: string,
    threatType: string,
    playSound: boolean = true
): Promise<void> {
    await sendAlert(
        'risky_scan',
        {
            title: '⚠️ Risky Scan Detected',
            body: `${merchantName || upiId} flagged as ${threatType}. Review before proceeding.`,
            tag: `risky-${upiId}`,
            data: { upiId, merchantName, threatType }
        },
        playSound
    );
}

/**
 * Send high amount alert
 */
export async function sendHighAmountAlert(
    merchantName: string,
    amount: number,
    playSound: boolean = true
): Promise<void> {
    await sendAlert(
        'high_amount',
        {
            title: '💰 High Amount Transaction',
            body: `Transaction of ₹${amount.toLocaleString()} to ${merchantName}. Please verify.`,
            tag: 'high-amount'
        },
        playSound
    );
}

/**
 * Send unusual location alert
 */
export async function sendUnusualLocationAlert(
    location: string,
    playSound: boolean = true
): Promise<void> {
    await sendAlert(
        'unusual_location',
        {
            title: '📍 Unusual Location Detected',
            body: `Scan detected from ${location}. Is this expected?`,
            tag: 'unusual-location'
        },
        playSound
    );
}

/**
 * Send frequent scans alert (potential fraud)
 */
export async function sendFrequentScansAlert(
    count: number,
    playSound: boolean = true
): Promise<void> {
    await sendAlert(
        'frequent_scans',
        {
            title: '🔄 Rapid Scanning Detected',
            body: `${count} scans in quick succession. Ensure this is intentional.`,
            tag: 'frequent-scans'
        },
        playSound
    );
}
