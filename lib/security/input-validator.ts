/**
 * Input Validation & Sanitization Utilities
 * Following OWASP Input Validation Guidelines
 * 
 * Security Principles:
 * 1. Whitelist validation (allow known good)
 * 2. Reject invalid input (fail securely)
 * 3. Sanitize for output context
 * 4. Validate data type, length, format, and range
 */

// ============================================================================
// UPI ID Validation
// ============================================================================

/**
 * Validates UPI ID format
 * Format: username@bankname
 * 
 * Security: Prevents injection attacks via UPI ID field
 * OWASP: A03:2021 – Injection
 */
export function validateUpiId(upiId: string): boolean {
    if (!upiId || typeof upiId !== 'string') {
        return false;
    }

    // Length validation (3-256 characters)
    if (upiId.length < 3 || upiId.length > 256) {
        return false;
    }

    // Format validation: username@bank
    // Username: alphanumeric, dots, underscores, hyphens (1-64 chars)
    // Bank: alphanumeric, dots (2-64 chars)
    const upiRegex = /^[a-zA-Z0-9._-]{1,64}@[a-zA-Z0-9.]{2,64}$/;

    if (!upiRegex.test(upiId)) {
        return false;
    }

    // Prevent common injection patterns
    const dangerousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+=/i,
        /\.\./,  // Path traversal
        /[;'"]/,  // SQL injection (quotes and semicolon)
        /\bor\b.*\b=\b/i,  // SQL injection
        /\bunion\b/i,      // SQL injection
        /\bdrop\b/i,       // SQL injection
        /\bexec\b/i,       // Command injection
    ];

    for (const pattern of dangerousPatterns) {
        if (pattern.test(upiId)) {
            return false;
        }
    }

    return true;
}

/**
 * Sanitizes UPI ID for safe display
 * Removes any potentially dangerous characters
 */
export function sanitizeUpiId(upiId: string): string {
    if (!upiId) return '';

    // Remove all characters except alphanumeric, @, ., _, -
    return upiId.replace(/[^a-zA-Z0-9@._-]/g, '');
}

// ============================================================================
// Amount Validation
// ============================================================================

/**
 * Validates payment amount
 * 
 * Security: Prevents negative amounts, overflow, and invalid formats
 * OWASP: A04:2021 – Insecure Design
 */
export function validateAmount(amount: string | number): boolean {
    if (amount === null || amount === undefined || amount === '') {
        return false;
    }

    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    // Check if valid number
    if (isNaN(numAmount) || !isFinite(numAmount)) {
        return false;
    }

    // Must be positive
    if (numAmount <= 0) {
        return false;
    }

    // Maximum amount (₹1,00,000 = 100000)
    if (numAmount > 100000) {
        return false;
    }

    // Maximum 2 decimal places
    const decimalPlaces = (numAmount.toString().split('.')[1] || '').length;
    if (decimalPlaces > 2) {
        return false;
    }

    return true;
}

/**
 * Sanitizes amount to safe number format
 */
export function sanitizeAmount(amount: string | number): string {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (isNaN(numAmount) || !isFinite(numAmount)) {
        return '0.00';
    }

    // Round to 2 decimal places
    return Math.abs(numAmount).toFixed(2);
}

// ============================================================================
// Email Validation
// ============================================================================

/**
 * Validates email address (RFC 5322 compliant)
 * 
 * Security: Prevents email injection attacks
 * OWASP: A03:2021 – Injection
 */
export function validateEmail(email: string): boolean {
    if (!email || typeof email !== 'string') {
        return false;
    }

    // Length validation
    if (email.length < 3 || email.length > 254) {
        return false;
    }

    // RFC 5322 compliant regex (simplified)
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    if (!emailRegex.test(email)) {
        return false;
    }

    // Prevent header injection
    if (email.includes('\n') || email.includes('\r')) {
        return false;
    }

    return true;
}

/**
 * Sanitizes email for safe display
 */
export function sanitizeEmail(email: string): string {
    if (!email) return '';

    // Remove whitespace and convert to lowercase
    return email.trim().toLowerCase().replace(/[^\w@.-]/g, '');
}

// ============================================================================
// General String Sanitization
// ============================================================================

/**
 * Sanitizes string to prevent XSS attacks
 * 
 * Security: Escapes HTML special characters
 * OWASP: A03:2021 – Injection (XSS)
 */
export function sanitizeHtml(input: string): string {
    if (!input) return '';

    const htmlEscapeMap: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;',
    };

    return input.replace(/[&<>"'/]/g, (char) => htmlEscapeMap[char] || char);
}

/**
 * Validates string length
 */
export function validateLength(
    input: string,
    min: number,
    max: number
): boolean {
    if (!input || typeof input !== 'string') {
        return false;
    }

    return input.length >= min && input.length <= max;
}

/**
 * Validates alphanumeric string
 */
export function validateAlphanumeric(input: string): boolean {
    if (!input || typeof input !== 'string') {
        return false;
    }

    return /^[a-zA-Z0-9]+$/.test(input);
}

// ============================================================================
// URL Validation
// ============================================================================

/**
 * Validates URL and checks against whitelist
 * 
 * Security: Prevents SSRF and open redirect attacks
 * OWASP: A10:2021 – Server-Side Request Forgery
 */
export function validateUrl(url: string, allowedDomains?: string[]): boolean {
    if (!url || typeof url !== 'string') {
        return false;
    }

    try {
        const urlObj = new URL(url);

        // Only allow HTTP/HTTPS
        if (!['http:', 'https:'].includes(urlObj.protocol)) {
            return false;
        }

        // Check against whitelist if provided
        if (allowedDomains && allowedDomains.length > 0) {
            const hostname = urlObj.hostname.toLowerCase();
            const isAllowed = allowedDomains.some(domain =>
                hostname === domain || hostname.endsWith('.' + domain)
            );

            if (!isAllowed) {
                return false;
            }
        }

        return true;
    } catch {
        return false;
    }
}

// ============================================================================
// Phone Number Validation (Indian)
// ============================================================================

/**
 * Validates Indian phone number
 * Format: +91XXXXXXXXXX or 10 digits
 */
export function validatePhoneNumber(phone: string): boolean {
    if (!phone || typeof phone !== 'string') {
        return false;
    }

    // Remove spaces and hyphens
    const cleaned = phone.replace(/[\s-]/g, '');

    // Indian phone number patterns
    const patterns = [
        /^\+91[6-9]\d{9}$/,  // +91XXXXXXXXXX
        /^91[6-9]\d{9}$/,    // 91XXXXXXXXXX
        /^[6-9]\d{9}$/,      // XXXXXXXXXX
    ];

    return patterns.some(pattern => pattern.test(cleaned));
}

// ============================================================================
// QR Code Content Validation
// ============================================================================

/**
 * Validates QR code content
 * 
 * Security: Prevents malicious QR codes
 * OWASP: A03:2021 – Injection
 */
export function validateQrContent(content: string): boolean {
    if (!content || typeof content !== 'string') {
        return false;
    }

    // Length validation (max 4KB)
    if (content.length > 4096) {
        return false;
    }

    // Check for malicious patterns
    const dangerousPatterns = [
        /<script/i,
        /javascript:/i,
        /data:text\/html/i,
        /vbscript:/i,
        /on\w+=/i,
    ];

    for (const pattern of dangerousPatterns) {
        if (pattern.test(content)) {
            return false;
        }
    }

    // If it's a UPI URL, validate the UPI ID
    if (content.startsWith('upi://')) {
        const match = content.match(/pa=([^&]+)/);
        if (match && match[1]) {
            return validateUpiId(decodeURIComponent(match[1]));
        }
    }

    return true;
}

// ============================================================================
// Rate Limiting Helper
// ============================================================================

/**
 * Simple in-memory rate limiter
 * For production, use Redis or similar
 */
class RateLimiter {
    private attempts: Map<string, { count: number; resetAt: number }> = new Map();

    check(key: string, maxAttempts: number, windowMs: number): boolean {
        const now = Date.now();
        const record = this.attempts.get(key);

        // Clean up expired records
        if (record && now > record.resetAt) {
            this.attempts.delete(key);
        }

        const current = this.attempts.get(key);

        if (!current) {
            this.attempts.set(key, { count: 1, resetAt: now + windowMs });
            return true;
        }

        if (current.count >= maxAttempts) {
            return false;
        }

        current.count++;
        return true;
    }

    reset(key: string): void {
        this.attempts.delete(key);
    }
}

export const rateLimiter = new RateLimiter();

// ============================================================================
// Exports
// ============================================================================

export const InputValidator = {
    validateUpiId,
    sanitizeUpiId,
    validateAmount,
    sanitizeAmount,
    validateEmail,
    sanitizeEmail,
    sanitizeHtml,
    validateLength,
    validateAlphanumeric,
    validateUrl,
    validatePhoneNumber,
    validateQrContent,
    rateLimiter,
};

export default InputValidator;
