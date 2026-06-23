/**
 * Chat threading helpers. A conversation is keyed by the two participants'
 * names (sorted), so the donor↔volunteer thread is the same object whichever
 * role opens it — that's how a message "sent from one account" shows up on the
 * other account when you switch roles.
 */
import type { ChatMessage } from '@/data/types';

export type Threads = Record<string, ChatMessage[]>;
/** threadId → { participantName → last-read epoch ms } */
export type ThreadReads = Record<string, Record<string, number>>;

/** Stable id for the conversation between two people. */
export function threadId(a: string, b: string): string {
  return [a.trim(), b.trim()].sort().join(' | ');
}

export interface Conversation {
  other: string;
  messages: ChatMessage[];
  lastMessage: ChatMessage | null;
  unread: number;
}

function unreadIn(messages: ChatMessage[], me: string, lastRead: number): number {
  return messages.filter((m) => m.from !== me && m.at > lastRead).length;
}

/** All conversations involving `me`, newest activity first. */
export function conversationsFor(me: string, threads: Threads, reads: ThreadReads): Conversation[] {
  const out: Conversation[] = [];
  for (const id of Object.keys(threads)) {
    const parts = id.split(' | ');
    if (!parts.includes(me)) continue;
    const other = parts[0] === me ? parts[1] : parts[0];
    const messages = threads[id];
    if (!messages.length) continue;
    out.push({
      other,
      messages,
      lastMessage: messages[messages.length - 1],
      unread: unreadIn(messages, me, reads[id]?.[me] ?? 0),
    });
  }
  return out.sort((a, b) => (b.lastMessage?.at ?? 0) - (a.lastMessage?.at ?? 0));
}

/** Total unread messages across all of `me`'s conversations. */
export function totalUnread(me: string, threads: Threads, reads: ThreadReads): number {
  return conversationsFor(me, threads, reads).reduce((sum, c) => sum + c.unread, 0);
}
