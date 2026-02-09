/**
 * ╔═ JustAChat™ ════════ Est. Jan 22, 2026 · 1:03 PM ═ © Unix ═╗
 * ╚═ Proprietary software. All rights reserved. ══════════════╝
 */

// Spam detection engine for chat messages
// Detects repetitive, junk, and flood messages

export interface SpamCheckResult {
  isSpam: boolean;
  reason: string;
  severity: 'low' | 'medium' | 'high';
}

// Track message history per user for flood detection
const userMessageHistory: Map<string, { messages: string[]; timestamps: number[] }> = new Map();

// Clean up old entries every 5 minutes
setInterval(() => {
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  userMessageHistory.forEach((data, userId) => {
    data.timestamps = data.timestamps.filter(t => t > fiveMinutesAgo);
    data.messages = data.messages.slice(-data.timestamps.length);
    if (data.timestamps.length === 0) {
      userMessageHistory.delete(userId);
    }
  });
}, 5 * 60 * 1000);

/**
 * Check if a message is repetitive junk (e.g., "........", "aaaaaa", "!!!!!!!")
 */
function isRepetitiveJunk(message: string): boolean {
  const cleaned = message.trim();
  if (cleaned.length < 2) return false;

  // Check if message is just one character repeated
  const uniqueChars = new Set(cleaned.replace(/\s/g, '')).size;
  if (uniqueChars <= 2 && cleaned.length >= 3) return true;

  // Check for repeating patterns (e.g., "hahaha", "lololo")
  // Allow "haha" and "lol" as legit
  const legitRepeats = ['ha', 'he', 'lo', 'la', 'ok', 'no', 'ye', 'ya'];
  if (uniqueChars <= 4 && cleaned.length >= 8) {
    const twoChar = cleaned.slice(0, 2).toLowerCase();
    if (!legitRepeats.includes(twoChar)) return true;
  }

  // Check if message is all punctuation/symbols
  const punctOnly = /^[.\-_=+!@#$%^&*()~`<>,?/\\|{}\[\];:'"]+$/;
  if (punctOnly.test(cleaned) && cleaned.length >= 3) return true;

  // Check for keyboard mashing (random chars with no vowels in a long string)
  if (cleaned.length >= 10) {
    const vowelCount = (cleaned.match(/[aeiouAEIOU]/g) || []).length;
    const ratio = vowelCount / cleaned.length;
    if (ratio < 0.05) return true; // Less than 5% vowels = likely mashing
  }

  return false;
}

/**
 * Check if user is flooding (sending too many messages too fast)
 */
function isFlood(userId: string, timestamp: number): boolean {
  const history = userMessageHistory.get(userId);
  if (!history) return false;

  const tenSecondsAgo = timestamp - 10 * 1000;
  const recentCount = history.timestamps.filter(t => t > tenSecondsAgo).length;

  // More than 6 messages in 10 seconds = flood
  return recentCount >= 6;
}

/**
 * Check if user is repeating the same message
 */
function isRepeatMessage(userId: string, message: string): boolean {
  const history = userMessageHistory.get(userId);
  if (!history || history.messages.length < 2) return false;

  const lastFive = history.messages.slice(-5);
  const sameCount = lastFive.filter(m => m === message).length;

  // 3+ identical messages in recent history = repeat spam
  return sameCount >= 3;
}

/**
 * Main spam detection function
 * Returns spam check result with reason and severity
 */
export function detectSpam(userId: string, message: string): SpamCheckResult {
  const now = Date.now();
  const cleaned = message.trim();

  // Skip spam check for commands
  if (cleaned.startsWith('/')) {
    return { isSpam: false, reason: '', severity: 'low' };
  }

  // Skip spam check for image-only messages  
  if (cleaned.startsWith('[img:') && cleaned.endsWith(']')) {
    return { isSpam: false, reason: '', severity: 'low' };
  }

  // Record this message
  if (!userMessageHistory.has(userId)) {
    userMessageHistory.set(userId, { messages: [], timestamps: [] });
  }
  const history = userMessageHistory.get(userId)!;
  history.messages.push(cleaned);
  history.timestamps.push(now);

  // Keep only last 20 messages
  if (history.messages.length > 20) {
    history.messages = history.messages.slice(-20);
    history.timestamps = history.timestamps.slice(-20);
  }

  // Check 1: Repetitive junk (........, !!!!!!, aaaaaaa)
  if (isRepetitiveJunk(cleaned)) {
    return {
      isSpam: true,
      reason: 'Repetitive or junk content detected',
      severity: 'medium'
    };
  }

  // Check 2: Flood detection (too many messages too fast)
  if (isFlood(userId, now)) {
    return {
      isSpam: true,
      reason: 'Sending messages too fast (flood)',
      severity: 'high'
    };
  }

  // Check 3: Repeat message detection
  if (isRepeatMessage(userId, cleaned)) {
    return {
      isSpam: true,
      reason: 'Sending the same message repeatedly',
      severity: 'medium'
    };
  }

  // Check 4: Empty/whitespace-only messages that got through
  if (cleaned.length === 0 || /^\s+$/.test(cleaned)) {
    return {
      isSpam: true,
      reason: 'Empty message',
      severity: 'low'
    };
  }

  return { isSpam: false, reason: '', severity: 'low' };
}

/**
 * Track spam strikes per user for auto-mute
 * Returns the number of strikes (mute after 3)
 */
const spamStrikes: Map<string, { count: number; lastStrike: number }> = new Map();

export function recordSpamStrike(userId: string): number {
  const now = Date.now();
  const existing = spamStrikes.get(userId);

  if (existing) {
    // Reset if last strike was more than 10 minutes ago
    if (now - existing.lastStrike > 10 * 60 * 1000) {
      spamStrikes.set(userId, { count: 1, lastStrike: now });
      return 1;
    }
    existing.count += 1;
    existing.lastStrike = now;
    return existing.count;
  }

  spamStrikes.set(userId, { count: 1, lastStrike: now });
  return 1;
}

export function clearSpamStrikes(userId: string): void {
  spamStrikes.delete(userId);
}
