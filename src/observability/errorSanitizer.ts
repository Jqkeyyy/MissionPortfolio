import type { TelemetryEvent } from './eventSchema';

export const ERROR_MESSAGE_LIMIT = 240;
export const ERROR_STACK_LIMIT = 1_200;

const redactSensitiveText = (value: string) => value
  .replace(/https?:\/\/[^\s)\]}]+/gi, '[redacted-url]')
  .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[redacted-email]')
  .replace(/(?:[A-Z]:\\Users\\|\/Users\/|\/home\/)[^\s)\]}]+/gi, '[redacted-path]')
  .replace(/\b(?:Bearer\s+)?[A-Za-z0-9_-]{24,}\b/g, '[redacted-token]')
  .replace(/\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}\b/g, '[redacted-phone]')
  .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
  .trim();

export const sanitizeErrorText = (value: string, maximumLength: number): string => {
  const redacted = redactSensitiveText(value);
  return redacted.length > maximumLength
    ? `${redacted.slice(0, Math.max(0, maximumLength - 1))}…`
    : redacted;
};

export interface SanitizedError {
  message: string;
  stack?: string;
}

export const sanitizeError = (error: unknown): SanitizedError => {
  const rawMessage = error instanceof Error
    ? error.message
    : typeof error === 'string'
      ? error
      : 'Non-Error exception';
  const message = sanitizeErrorText(rawMessage, ERROR_MESSAGE_LIMIT) || 'Unknown client error';

  if (!(error instanceof Error) || !error.stack) return { message };
  const stack = sanitizeErrorText(error.stack, ERROR_STACK_LIMIT);
  return stack ? { message, stack } : { message };
};

export const sanitizeClientErrorEvent = (
  event: Extract<TelemetryEvent, { type: 'client_error' }>,
): Extract<TelemetryEvent, { type: 'client_error' }> => {
  const message = sanitizeErrorText(event.message, ERROR_MESSAGE_LIMIT) || 'Unknown client error';
  const stack = event.stack ? sanitizeErrorText(event.stack, ERROR_STACK_LIMIT) : undefined;
  return {
    type: 'client_error',
    source: event.source,
    message,
    ...(stack ? { stack } : {}),
  };
};
