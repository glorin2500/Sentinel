import { triggerHaptic } from '@/lib/ui/visual-effects';

/**
 * Custom hook for haptic feedback on user interactions
 */
export function useHapticFeedback() {
    const onSuccess = () => triggerHaptic('success');
    const onError = () => triggerHaptic('error');
    const onWarning = () => triggerHaptic('warning');
    const onClick = () => triggerHaptic('light');
    const onHeavyClick = () => triggerHaptic('heavy');
    const onSelection = () => triggerHaptic('selection');

    return {
        onSuccess,
        onError,
        onWarning,
        onClick,
        onHeavyClick,
        onSelection,
        trigger: triggerHaptic
    };
}
