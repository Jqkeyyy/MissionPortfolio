import { beforeEach, describe, expect, it } from 'vitest';
import { ANOMALY_PROGRESS_STORAGE_KEY, getAnomalyStatus, useAnomalyProgress } from './anomalyProgress';

describe('anomaly progression', () => {
  beforeEach(() => {
    window.localStorage.removeItem(ANOMALY_PROGRESS_STORAGE_KEY);
    useAnomalyProgress.setState({ events: [], freeExplore: false });
  });

  it('starts with four experiments and keeps the deeper secrets off the manifest', () => {
    expect(getAnomalyStatus('developer-moon', [])).toBe('available');
    expect(getAnomalyStatus('chaos', [])).toBe('available');
    expect(getAnomalyStatus('alien-signal', [])).toBe('available');
    expect(getAnomalyStatus('orbit-replay', [])).toBe('available');
    expect(getAnomalyStatus('gravity-gun', [])).toBe('locked');
    expect(getAnomalyStatus('hab-terminal', [])).toBe('hidden');
  });

  it('unlocks clues in sequence and persists discoveries', () => {
    const progress = useAnomalyProgress.getState();
    expect(progress.record('chaos-enabled')).toEqual(['gravity-gun']);
    expect(progress.record('gravity-fired')).toEqual(['planet-fusion']);
    expect(progress.record('moon-clue')).toEqual(['hab-terminal']);
    expect(progress.record('moon-complete')).toEqual(['cosmic-architect']);
    expect(progress.record('terminal-coffee')).toEqual(['space-pet']);
    expect(progress.record('signal-decoded')).toEqual(['rogue-planet']);
    expect(progress.record('orbit-replay-complete')).toEqual(['event-horizon']);
    expect(progress.record('event-horizon-crossed')).toEqual([]);
    expect(progress.record('rogue-captured')).toEqual(['supernova']);
    expect(progress.record('impossible-started')).toEqual(['impossible-achievement']);
    expect(progress.record('chaos-enabled')).toEqual([]);
    const stored = JSON.parse(window.localStorage.getItem(ANOMALY_PROGRESS_STORAGE_KEY) ?? '{}');
    expect(stored.events).toContain('rogue-captured');
  });

  it('reveals everything temporarily without altering earned events', () => {
    useAnomalyProgress.getState().setFreeExplore(true);
    expect(getAnomalyStatus('supernova', [], useAnomalyProgress.getState().freeExplore)).toBe('available');
    useAnomalyProgress.getState().setFreeExplore(false);
    expect(useAnomalyProgress.getState().events).toEqual([]);
    expect(getAnomalyStatus('supernova', [])).toBe('hidden');
  });
});
