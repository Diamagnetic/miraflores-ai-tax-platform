import React from 'react';
import { Message, UserRoleType } from '@/types';
import { Badge } from '@/components/ui/badge';
import { ActionRequestCard } from './ActionRequestCard';
import {
  Lock,
  ShieldCheck,
  Briefcase,
} from 'lucide-react';

interface ThreadMessageItemProps {
  message: Message;
  currentUserRole: UserRoleType;
  onCompleteActionRequest?: (messageId: string, responsePayload?: string | number | boolean) => void;
  onUploadFileForRequest?: (messageId: string) => void;
  className?: string;
}

export const ThreadMessageItem: React.FC<ThreadMessageItemProps> = ({
  message,
  currentUserRole,
  onCompleteActionRequest,
  onUploadFileForRequest,
  className = '',
}) => {
  // If message is internal-firm-only and current user is an individual client, do NOT render (strict privacy boundary)
  if (message.isInternalFirmOnly && currentUserRole === 'individual_client') {
    return null;
  }

  const isInternal = message.isInternalFirmOnly;

  const getRoleBadge = (role: UserRoleType) => {
    switch (role) {
      case 'tax_reviewer':
        return (
          <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-mono gap-1 text-emerald-700 dark:text-emerald-300 border-emerald-300">
            <ShieldCheck className="h-2.5 w-2.5" />
            <span>Reviewer</span>
          </Badge>
        );
      case 'tax_preparer':
        return (
          <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-mono gap-1 text-primary border-primary/30">
            <Briefcase className="h-2.5 w-2.5" />
            <span>CPA Preparer</span>
          </Badge>
        );
      case 'individual_client':
      default:
        return null;
    }
  };

  return (
    <div
      className={`p-3.5 border transition-all text-xs space-y-2 ${
        isInternal
          ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/80 shadow-2xs'
          : 'bg-card border-border shadow-2xs'
      } ${className}`}
    >
      {/* Header: Sender, Role, Timestamp, and Privacy Scope Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div
            className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
              isInternal
                ? 'bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100'
                : 'bg-primary/10 text-primary'
            }`}
          >
            {message.senderName.charAt(0)}
          </div>
          <span className="font-bold text-foreground">{message.senderName}</span>
          {getRoleBadge(message.senderRole)}
        </div>

        <div className="flex items-center gap-2">
          {/* Privacy Scope Badge: Only for internal firm notes */}
          {isInternal && (
            <Badge className="bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200 border-amber-300 font-mono text-[9px] gap-1 py-0">
              <Lock className="h-2.5 w-2.5" />
              <span>Internal Firm Note</span>
            </Badge>
          )}

          <span className="text-[10px] text-muted-foreground font-mono">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Message Text Content */}
      <p className="text-foreground leading-relaxed pl-8 font-normal whitespace-pre-wrap">
        {message.content}
      </p>

      {/* Action Request Card (if attached to this message) */}
      {message.actionRequest && (
        <div className="pl-8 pt-1">
          <ActionRequestCard
            actionRequest={message.actionRequest}
            messageId={message.id}
            isClientView={currentUserRole === 'individual_client'}
            onComplete={(payload) => onCompleteActionRequest?.(message.id, payload)}
            onUploadFile={() => onUploadFileForRequest?.(message.id)}
          />
        </div>
      )}
    </div>
  );
};
