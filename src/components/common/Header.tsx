import React from 'react';
import { usePlatformStore } from '@/store/usePlatformStore';
import { Button } from '@/components/ui/button';
import { UserAccountMenu } from './UserAccountMenu';
import {
  Sparkles,
  MessageSquare,
} from 'lucide-react';

interface HeaderProps {
  onOpenClientMessages?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenClientMessages,
}) => {
  const {
    currentUser,
    returns,
    threads,
    selectedReturnId,
  } = usePlatformStore();

  const activeReturn =
    returns.find((r) => r.id === selectedReturnId) || returns[0];

  const isClient = currentUser.role === 'individual_client';

  // Calculate unresolved actionable inquiries count for client return
  const clientReturnThreads = threads.filter((t) => t.returnId === activeReturn?.id);
  const pendingInquiriesCount = clientReturnThreads.reduce((total, thread) => {
    return (
      total +
      thread.messages.filter(
        (m) =>
          !m.isInternalFirmOnly &&
          m.actionRequest &&
          !m.actionRequest.isCompleted
      ).length
    );
  }, 0);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background shadow-2xs">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6">
        {/* Left: Brand */}
        <div className="flex items-center gap-2 font-bold tracking-tight text-foreground">
          <div className="flex h-7 w-7 items-center justify-center bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-base tracking-tight font-semibold">MiraFlores AI</span>
        </div>

        {/* Right: Client Messages Trigger & User Account Menu */}
        <div className="flex items-center gap-3">
          {isClient && onOpenClientMessages && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenClientMessages}
              className="h-8 px-3 text-xs font-semibold gap-1.5 border-border shadow-2xs hover:bg-muted"
            >
              <MessageSquare className="h-3.5 w-3.5 text-primary" />
              <span>
                CPA Inquiries{pendingInquiriesCount > 0 ? ` (${pendingInquiriesCount})` : ''}
              </span>
            </Button>
          )}

          {/* User Account Menu with Avatar, Personal Return Switcher & Sign Out */}
          <UserAccountMenu />
        </div>
      </div>
    </header>
  );
};
