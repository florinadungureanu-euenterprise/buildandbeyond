import { describe, expect, test } from 'bun:test';
import { filterEvents, isPastEvent } from './events';
import { eventCatalog } from './event-catalog';

const bits = { id: 'bits', title: 'Bits & Pretzels 2026', description: '', startDate: '2026-09-28', endDate: '2026-09-30', country: 'Germany', location: 'Munich', format: 'In-person', topics: ['Startups'], url: 'https://www.bitsandpretzels.com', popular: true };
const quantum = { id: 'quantum', title: 'Quantum Foundations Conference', description: '', startDate: '2026-11-24', endDate: '2026-11-27', country: 'Austria', location: 'Vienna', format: 'In-person', topics: ['Quantum'], url: 'https://www.oeaw.ac.at' };
const now = new Date('2026-10-20T20:17:00Z');
const defaults = { view: 'Upcoming', country: 'all', format: 'all', topic: 'all' };

describe('event browsing rules', () => {
  test('ERDERA retains the requested October 21 date and 17:30 CEST ending', () => {
    const event = eventCatalog.find(e => e.id === 'erdera-2026');
    expect([event?.startDate, event?.endsAt]).toEqual(['2026-10-21', '2026-10-21T17:30:00+02:00']);
  });
  test('TEDAI retains the requested October 28–30 dates', () => {
    const event = eventCatalog.find(e => e.id === 'tedai-2026');
    expect([event?.startDate, event?.endDate]).toEqual(['2026-10-28', '2026-10-30']);
  });
  test('invest.austria retains the requested November 4 date', () => {
    expect(eventCatalog.find(e => e.id === 'invest-austria-2026')?.startDate).toBe('2026-11-04');
  });
  test('Quantum Foundations retains the requested November 24–27 dates', () => {
    const event = eventCatalog.find(e => e.id === 'quantum-foundations-2026');
    expect([event?.startDate, event?.endDate]).toEqual(['2026-11-24', '2026-11-27']);
  });
  test('Quantum Ideation Days retains the requested November 25–26 dates', () => {
    const event = eventCatalog.find(e => e.id === 'quantum-ideation-2026');
    expect([event?.startDate, event?.endDate]).toEqual(['2026-11-25', '2026-11-26']);
  });
  test('Bits & Pretzels belongs in Past on October 20, 2026', () => {
    expect(filterEvents([bits, quantum], { ...defaults, view: 'Past' }, now).map(e => e.id)).toEqual(['bits']);
  });
  test('Upcoming excludes finished events', () => {
    expect(filterEvents([bits, quantum], defaults, now).map(e => e.id)).toEqual(['quantum']);
  });
  test('Popular excludes finished events even if highlighted', () => {
    expect(filterEvents([bits, { ...quantum, popular: true }], { ...defaults, view: 'Popular' }, now).map(e => e.id)).toEqual(['quantum']);
  });
  test('multi-day events remain upcoming through their final day', () => {
    expect(isPastEvent(quantum, new Date('2026-11-27T20:00:00Z'))).toBe(false);
    expect(isPastEvent(quantum, new Date('2026-11-28T00:00:00Z'))).toBe(true);
  });
  test('EU country filter matches the event country', () => {
    expect(filterEvents([quantum], { ...defaults, country: 'Poland' }, now)).toEqual([]);
    expect(filterEvents([quantum], { ...defaults, country: 'Austria' }, now)).toHaveLength(1);
  });
  test('Types filter matches In-person, Online and Hybrid', () => {
    const events = [quantum, { ...quantum, id: 'online', format: 'Online' }, { ...quantum, id: 'hybrid', format: 'Hybrid' }];
    for (const format of ['In-person', 'Online', 'Hybrid']) {
      expect(filterEvents(events, { ...defaults, format }, now).map(e => e.format)).toEqual([format]);
    }
  });
  test('topic filter uses event industries', () => {
    expect(filterEvents([quantum], { ...defaults, topic: 'Quantum' }, now)).toHaveLength(1);
    expect(filterEvents([quantum], { ...defaults, topic: 'Biotech' }, now)).toEqual([]);
  });
  test('a timed session moves to Past only after its stated ending', () => {
    const session = { ...quantum, startDate: '2026-10-21', endDate: '2026-10-21', endsAt: '2026-10-21T17:30:00+02:00' };
    expect(isPastEvent(session, new Date('2026-10-21T15:29:00Z'))).toBe(false);
    expect(isPastEvent(session, new Date('2026-10-21T15:31:00Z'))).toBe(true);
  });
});