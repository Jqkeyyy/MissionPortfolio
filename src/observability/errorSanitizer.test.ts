import { describe, expect, it } from 'vitest';
import { ERROR_MESSAGE_LIMIT, ERROR_STACK_LIMIT, sanitizeError, sanitizeErrorText } from './errorSanitizer';

describe('client error sanitization', () => {
  it('redacts URLs, contact information, local paths, and token-like values', () => {
    const text = sanitizeErrorText(
      'Failed https://example.com/a?email=jake@example.com at C:\\Users\\jake\\secret.ts call 608-555-1212 abcdefghijklmnopqrstuvwxyz1234',
      1_000,
    );

    expect(text).toContain('[redacted-url]');
    expect(text).toContain('[redacted-path]');
    expect(text).toContain('[redacted-phone]');
    expect(text).toContain('[redacted-token]');
    expect(text).not.toContain('example.com');
    expect(text).not.toContain('secret.ts');
  });

  it('truncates messages and stacks to fixed limits', () => {
    const error = new Error('x'.repeat(1_000));
    error.stack = 's'.repeat(5_000);
    const sanitized = sanitizeError(error);
    expect(sanitized.message.length).toBe(ERROR_MESSAGE_LIMIT);
    expect(sanitized.stack?.length).toBe(ERROR_STACK_LIMIT);
  });

  it('does not serialize arbitrary rejected objects', () => {
    expect(sanitizeError({ email: 'person@example.com', token: 'secret' })).toEqual({
      message: 'Non-Error exception',
    });
  });
});
