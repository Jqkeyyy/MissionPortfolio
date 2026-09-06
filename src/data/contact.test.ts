import { describe, expect, it } from 'vitest';
import {
  CONTACT_ACTION_KINDS,
  contactActions,
  liveProjectActions,
  primaryContactActions,
} from './contact';

describe('contactActions', () => {
  it('provides every supported action kind and keeps identifiers unique', () => {
    const kinds = new Set(contactActions.map((action) => action.kind));
    const ids = contactActions.map((action) => action.id);

    expect(kinds).toEqual(new Set(CONTACT_ACTION_KINDS));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('uses only prepared email, same-origin resume, and secure web destinations', () => {
    for (const action of contactActions) {
      if (action.kind === 'email') {
        expect(action.href).toBe(
          'mailto:jacobwork1129@gmail.com?subject=Portfolio%20inquiry',
        );
        expect(action.external).toBe(false);
      } else if (action.kind === 'resume') {
        expect(action.href).toBe('/Jacob-Sass-Resume.pdf');
        expect(action.download).toBe('Jacob-Sass-Resume.pdf');
        expect(action.external).toBe(false);
      } else {
        const url = new URL(action.href);
        expect(url.protocol).toBe('https:');
        expect(action.external).toBe(true);
      }
    }
  });

  it('provides descriptive labels and omits phone data', () => {
    for (const action of contactActions) {
      expect(action.label.trim()).not.toBe('');
      expect(action.accessibleLabel.trim()).not.toBe('');
    }

    const publicContactData = JSON.stringify(contactActions);
    expect(publicContactData).not.toMatch(/(?:tel:|phone)/i);
    expect(publicContactData).not.toMatch(/\+?1?[\s.(-]*\d{3}[\s.)-]*\d{3}[\s.-]*\d{4}/);
  });

  it('separates primary contact actions from verified live projects', () => {
    expect(primaryContactActions).toHaveLength(5);
    expect(primaryContactActions.every((action) => action.group === 'contact')).toBe(true);
    expect(liveProjectActions).toHaveLength(3);
    expect(liveProjectActions.every((action) => action.kind === 'live-project')).toBe(true);
  });
});
