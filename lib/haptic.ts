// Haptic Feedback Utility
// Provides tactile feedback for user interactions

export type HapticPattern =
    | 'light'      // Subtle feedback for selections
    | 'medium'     // Standard feedback for buttons
    | 'heavy'      // Strong feedback for important actions
    | 'success'    // Feedback for successful operations
    | 'warning'    // Feedback for warnings
    | 'error'      // Feedback for errors
    | 'selection'; // Feedback for selections in lists

/**
 * Trigger haptic feedback
 * Works on devices that support the Vibration API
 */
export function triggerHaptic(pattern: HapticPattern = 'medium'): void {
    // Check if vibration API is supported
    if (!navigator.vibrate) {
        return;
    }

    const patterns: Record<HapticPattern, number | number[]> = {
        light: 10,
        medium: 20,
        heavy: 30,
        success: [10, 50, 10],
        warning: [20, 100, 20],
        error: [30, 100, 30, 100, 30],
        selection: 5,
    };

    const vibrationPattern = patterns[pattern];

    try {
        navigator.vibrate(vibrationPattern);
    } catch (error) {
        // Silently fail if vibration is not supported
        console.debug('Haptic feedback not supported:', error);
    }
}

/**
 * Trigger haptic feedback for button clicks
 */
export function hapticClick(): void {
    triggerHaptic('medium');
}

/**
 * Trigger haptic feedback for successful actions
 */
export function hapticSuccess(): void {
    triggerHaptic('success');
}

/**
 * Trigger haptic feedback for errors
 */
export function hapticError(): void {
    triggerHaptic('error');
}

/**
 * Trigger haptic feedback for warnings
 */
export function hapticWarning(): void {
    triggerHaptic('warning');
}

/**
 * Trigger haptic feedback for selections
 */
export function hapticSelection(): void {
    triggerHaptic('selection');
}

/**
 * Trigger haptic feedback for light interactions
 */
export function hapticLight(): void {
    triggerHaptic('light');
}

/**
 * Trigger haptic feedback for heavy interactions
 */
export function hapticHeavy(): void {
    triggerHaptic('heavy');
}

/**
 * Create a haptic-enabled click handler
 */
export function withHaptic<T extends (...args: any[]) => any>(
    handler: T,
    pattern: HapticPattern = 'medium'
): T {
    return ((...args: any[]) => {
        triggerHaptic(pattern);
        return handler(...args);
    }) as T;
}
