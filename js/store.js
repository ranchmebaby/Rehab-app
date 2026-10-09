// Local-first persistence. Everything lives on the device in localStorage.

import { dayKey } from './engine.js';

const KEY = 'footing.v1';

const DEFAULTS = () => ({
  version: 1,
  profile: { name: '', sports: ['run'] },
  plan: null,
  settings: { sound: true, voice: true, haptics: true, theme: 'auto' },
  sessions: [],
  checkins: [],
  activities: [],
  tests: [],
});

let state = load();
const listeners = new Set();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS();
    const data = JSON.parse(raw);
    const d = DEFAULTS();
    return { ...d, ...data, settings: { ...d.settings, ...data.settings }, profile: { ...d.profile, ...data.profile } };
  } catch {
    return DEFAULTS();
  }
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage full or blocked — the app keeps working in memory */
  }
  listeners.forEach((fn) => fn(state));
}

export const store = {
  get: () => state,
  subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  update(mutator) { mutator(state); persist(); },

  setPlan(plan) { this.update((s) => { s.plan = plan; }); },

  addSession(session) {
    this.update((s) => { s.sessions.push({ id: crypto.randomUUID?.() ?? String(Date.now()), ...session }); });
  },

  setCheckin(pain, note = '') {
    const date = dayKey();
    this.update((s) => {
      s.checkins = s.checkins.filter((c) => c.date !== date);
      s.checkins.push({ date, pain, note });
      s.checkins.sort((a, b) => a.date.localeCompare(b.date));
    });
  },

  addActivity(a) {
    this.update((s) => {
      s.activities.push({ id: String(Date.now()), ...a });
      s.activities.sort((x, y) => x.date.localeCompare(y.date));
    });
  },
  removeActivity(id) { this.update((s) => { s.activities = s.activities.filter((a) => a.id !== id); }); },

  addTest(t) {
    this.update((s) => {
      s.tests.push({ id: String(Date.now()), ...t });
      s.tests.sort((x, y) => x.date.localeCompare(y.date));
    });
  },
  removeTest(id) { this.update((s) => { s.tests = s.tests.filter((t) => t.id !== id); }); },

  export() { return JSON.stringify(state, null, 2); },
  import(json) {
    const data = JSON.parse(json);
    if (typeof data !== 'object' || !Array.isArray(data.sessions)) throw new Error('Not a Footing backup file');
    state = { ...DEFAULTS(), ...data };
    persist();
  },
  reset() { state = DEFAULTS(); persist(); },
};
