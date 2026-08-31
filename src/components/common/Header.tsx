import React from 'react';
import { usePlatformStore } from '@/store/usePlatformStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserAccountMenu } from './UserAccountMenu';
import {
  Sparkles,
  User,
  AlertTriangle,
  MessageSquare,
} from 'lucide-react';

interface HeaderProps {
  isWorkbench?: boolean;
  onOpenClientMessages?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isWorkbench = false,
  onOpenClientMessages,
}) => {
  const {
    currentUser,
    returns,
    threads,
    selectedReturnId,
    selectReturn,
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
        {/* Left: Brand & Return Context */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 font-bold tracking-tight text-foreground">
            <div className="flex h-7 w-7 items-center justify-center bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-base tracking-tight font-semibold">MiraFlores AI</span>
          </div>

          <div className="hidden md:flex items-center gap-2 border-l border-border pl-4 text-xs">
            <span className="text-muted-foreground font-medium">Active Return:</span>
            {currentUser.role === 'individual_client' ? (
              <Badge variant="outline" className="font-mono gap-1.5 py-0.5">
                <User className="h-3 w-3 text-primary" />
                {currentUser.name} (Form 1040)
              </Badge>
            ) : (
              <select
                aria-label="Select active tax return"
                value={selectedReturnId || ''}
                onChange={(e) => selectReturn(e.target.value)}
                className="h-8 bg-card border border-border px-2 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
              >
                {returns.map((ret) => (
                  <option key={ret.id} value={ret.id}>
                    {ret.taxpayerName} ({ret.returnType} - {ret.taxYear})
                  </option>
                ))}
              </select>
            )}

            {/* Blocked Badge shown in navbar ONLY when in the workbench and the return is genuinely blocked */}
            {isWorkbench && activeReturn?.isBlocked && (
              <Badge
                variant="destructive"
                className="text-[11px] gap-1 font-mono font-medium py-0.5 px-2 animate-pulse"
              >
                <AlertTriangle className="h-3 w-3 shrink-0" />
                <span>Blocked</span>
              </Badge>
            )}
          </div>
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
