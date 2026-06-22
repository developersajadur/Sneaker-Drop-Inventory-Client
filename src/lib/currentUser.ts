const STORAGE_KEY_ID = 'sneaker_user_id';
const STORAGE_KEY_NAME = 'sneaker_user_name';

function generateUUID(): string {
  // crypto.randomUUID with fallback
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback: RFC4122 v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getPersistentId(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_ID);
    if (stored) return stored;

    const id = generateUUID();
    localStorage.setItem(STORAGE_KEY_ID, id);
    return id;
  } catch {
    // localStorage unavailable (private browsing, etc.) — fallback to session-only
    const sessionKey = `sneaker_session_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    return sessionKey;
  }
}

function getPersistentName(): string {
  try {
    return localStorage.getItem(STORAGE_KEY_NAME) ?? '';
  } catch {
    return '';
  }
}

function setPersistentName(name: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_NAME, name);
  } catch {
    // ignore
  }
}

const currentUserId: string = getPersistentId();
const currentUserName: string = getPersistentName();

export { currentUserName, setPersistentName };
export default currentUserId;
