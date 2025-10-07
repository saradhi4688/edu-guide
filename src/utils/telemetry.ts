export function logEvent(eventName: string, payload: Record<string, any> = {}) {
  try {
    const key = '__EVENT_LOG__';
    const raw = localStorage.getItem(key);
    const arr = raw ? JSON.parse(raw) : [];
    arr.push({ event: eventName, payload, ts: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(arr));
  } catch (e) {
    // noop
    console.warn('Telemetry log failed', e);
  }
}

export function getEvents() {
  try {
    const raw = localStorage.getItem('__EVENT_LOG__');
    return raw ? JSON.parse(raw) : [];
  } catch (e) { return []; }
}
