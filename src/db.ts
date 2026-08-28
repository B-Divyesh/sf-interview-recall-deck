import type { Example, Preferences, Session } from './types';
import { defaultPreferences } from './types';

const REAL_DB_NAME = 'interview-recall-deck';
const DEMO_DB_NAME = 'demo:interview-recall-deck';
const DB_VERSION = 1;

function databaseName(): string {
  const url = new URL(location.href);
  return url.pathname === '/demo' || url.searchParams.get('demo') === '1' ? DEMO_DB_NAME : REAL_DB_NAME;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName(), DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('examples')) db.createObjectStore('examples', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('sessions')) db.createObjectStore('sessions', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('settings')) db.createObjectStore('settings');
    };
    request.onsuccess = () => resolve(request.result);
  });
}

export function clearDemoDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DEMO_DB_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Close other demo tabs, then reset again.'));
  });
}

function requestPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function store(name: string, mode: IDBTransactionMode = 'readonly') {
  const db = await openDb();
  const transaction = db.transaction(name, mode);
  transaction.oncomplete = () => db.close();
  return transaction.objectStore(name);
}

export async function getExamples(): Promise<Example[]> {
  const objectStore = await store('examples');
  const rows = await requestPromise(objectStore.getAll()) as Example[];
  return rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function saveExample(example: Example): Promise<void> {
  await requestPromise((await store('examples', 'readwrite')).put(example));
}

export async function deleteExample(id: string): Promise<void> {
  await requestPromise((await store('examples', 'readwrite')).delete(id));
}

export async function getSessions(): Promise<Session[]> {
  const objectStore = await store('sessions');
  const rows = await requestPromise(objectStore.getAll()) as Session[];
  return rows.sort((a, b) => b.completedAt.localeCompare(a.completedAt));
}

export async function saveSession(session: Session): Promise<void> {
  await requestPromise((await store('sessions', 'readwrite')).put(session));
}

export async function getPreferences(): Promise<Preferences> {
  const saved = await requestPromise((await store('settings')).get('preferences')) as Partial<Preferences> | undefined;
  return { ...defaultPreferences, ...saved };
}

export async function savePreferences(preferences: Preferences): Promise<void> {
  await requestPromise((await store('settings', 'readwrite')).put(preferences, 'preferences'));
}

export async function replaceAll(examples: Example[], sessions: Session[]): Promise<void> {
  const db = await openDb();
  const transaction = db.transaction(['examples', 'sessions'], 'readwrite');
  const examplesStore = transaction.objectStore('examples');
  const sessionsStore = transaction.objectStore('sessions');
  examplesStore.clear(); sessionsStore.clear();
  for (const example of examples) examplesStore.put(example);
  for (const session of sessions) sessionsStore.put(session);
  await new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => { db.close(); resolve(); };
    transaction.onerror = () => { db.close(); reject(transaction.error); };
  });
}
