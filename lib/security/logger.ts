/**
 * Secure Logger - Production-Safe Logging
 * 
 * Security Principles:
 * 1. No sensitive data in production logs
 * 2. Mask PII (Personally Identifiable Information)
 * 3. Environment-aware logging
 * 4. Structured logging format
 * 
 * OWASP: A09:2021 – Security Logging and Monitoring Failures
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    data?: any;
    context?: string;
}

class SecureLogger {
    private isDevelopment: boolean;

    constructor() {
        this.isDevelopment = process.env.NODE_ENV === 'development';
    }

    /**
     * Masks sensitive data in objects
     * Redacts: UPI IDs, emails, tokens, passwords, phone numbers
     */
    private maskSensitiveData(data: any): any {
        if (!data) return data;

        // Handle primitives
        if (typeof data !== 'object') {
            return this.maskString(String(data));
        }

        // Handle arrays
        if (Array.isArray(data)) {
            return data.map(item => this.maskSensitiveData(item));
        }

        // Handle objects
        const masked: any = {};
        const sensitiveKeys = [
            'password',
            'token',
            'apiKey',
            'secret',
            'authorization',
            'cookie',
            'session',
            'upiId',
            'email',
            'phone',
            'phoneNumber',
            'creditCard',
            'ssn',
            'pan',
            'aadhar',
        ];

        for (const [key, value] of Object.entries(data)) {
            const lowerKey = key.toLowerCase();

            // Check if key contains sensitive information
            const isSensitive = sensitiveKeys.some(sensitive =>
                lowerKey.includes(sensitive)
            );

            if (isSensitive) {
                masked[key] = '[REDACTED]';
            } else if (typeof value === 'object' && value !== null) {
                masked[key] = this.maskSensitiveData(value);
            } else {
                masked[key] = value;
            }
        }

        return masked;
    }

    /**
     * Masks sensitive patterns in strings
     */
    private maskString(str: string): string {
        if (!str) return str;

        // Mask UPI IDs (username@bank)
        str = str.replace(/\b[\w.-]+@[\w.-]+\b/g, (match) => {
            if (match.includes('@')) {
                const [user, domain] = match.split('@');
                return `${user.substring(0, 2)}***@${domain}`;
            }
            return match;
        });

        // Mask email addresses
        str = str.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, (match) => {
            const [user, domain] = match.split('@');
            return `${user.substring(0, 2)}***@${domain}`;
        });

        // Mask phone numbers (10 digits)
        str = str.replace(/\b\d{10}\b/g, (match) => {
            return `${match.substring(0, 2)}******${match.substring(8)}`;
        });

        // Mask tokens (long alphanumeric strings)
        str = str.replace(/\b[A-Za-z0-9]{32,}\b/g, '[TOKEN_REDACTED]');

        return str;
    }

    /**
     * Formats log entry
     */
    private formatLog(level: LogLevel, message: string, data?: any, context?: string): LogEntry {
        return {
            timestamp: new Date().toISOString(),
            level,
            message: this.isDevelopment ? message : this.maskString(message),
            data: this.isDevelopment ? data : this.maskSensitiveData(data),
            context,
        };
    }

    /**
     * Outputs log to console (development) or structured format (production)
     */
    private output(entry: LogEntry): void {
        if (this.isDevelopment) {
            // Development: Pretty print with colors
            const colors = {
                debug: '\x1b[36m', // Cyan
                info: '\x1b[32m',  // Green
                warn: '\x1b[33m',  // Yellow
                error: '\x1b[31m', // Red
            };
            const reset = '\x1b[0m';
            const color = colors[entry.level];

            console.log(
                `${color}[${entry.level.toUpperCase()}]${reset} ${entry.timestamp} ${entry.message}`,
                entry.data || ''
            );
        } else {
            // Production: Structured JSON (for log aggregation)
            // In production, you'd send this to a logging service
            // For now, we'll just use console.log with JSON
            const logString = JSON.stringify(entry);

            switch (entry.level) {
                case 'error':
                    console.error(logString);
                    break;
                case 'warn':
                    console.warn(logString);
                    break;
                // In production, suppress debug and info logs
            }
        }
    }

    /**
     * Debug level logging (development only)
     */
    debug(message: string, data?: any, context?: string): void {
        if (this.isDevelopment) {
            const entry = this.formatLog('debug', message, data, context);
            this.output(entry);
        }
    }

    /**
     * Info level logging
     */
    info(message: string, data?: any, context?: string): void {
        const entry = this.formatLog('info', message, data, context);
        this.output(entry);
    }

    /**
     * Warning level logging
     */
    warn(message: string, data?: any, context?: string): void {
        const entry = this.formatLog('warn', message, data, context);
        this.output(entry);
    }

    /**
     * Error level logging
     */
    error(message: string, error?: Error | any, context?: string): void {
        const errorData = error instanceof Error ? {
            name: error.name,
            message: error.message,
            stack: this.isDevelopment ? error.stack : undefined,
        } : error;

        const entry = this.formatLog('error', message, errorData, context);
        this.output(entry);
    }

    /**
     * Log security events (always logged, even in production)
     */
    security(message: string, data?: any): void {
        const entry = this.formatLog('warn', `[SECURITY] ${message}`, data, 'security');
        // Always output security logs
        console.warn(JSON.stringify(entry));
    }
}

// Export singleton instance
export const logger = new SecureLogger();

// Export class for testing
export { SecureLogger };

// Convenience exports
export default logger;
