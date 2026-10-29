import type { Viewport } from 'next';
import ChatApp from '@/components/chat/ChatApp';

// The screen resizes when the keyboard opens, so the input stays above it.
export const viewport: Viewport = { interactiveWidget: 'resizes-content' };

export default function MessagesPage() {
  return <ChatApp />;
}
