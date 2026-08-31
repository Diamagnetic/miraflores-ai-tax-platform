import React, { useState, useEffect, useRef } from 'react';
import { CollaborationThread, ActionRequest } from '@/types';
import { usePlatformStore } from '@/store/usePlatformStore';
import { ThreadMessageItem } from './ThreadMessageItem';
import { ThreadAiSummaryWidget } from './ThreadAiSummaryWidget';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  Lock,
  Globe,
  Send,
  X,
  Paperclip,
  Clock,
} from 'lucide-react';

interface ContextualThreadDrawerProps {
  thread: CollaborationThread;
  onClose?: () => void;
  onUploadRequestedFile?: (messageId: string) => void;
  className?: string;
}

export const ContextualThreadDrawer: React.FC<ContextualThreadDrawerProps> = ({
  thread,
  onClose,
  onUploadRequestedFile,
  className = '',
}) => {
  const {
    currentUser,
    addMessageToThread,
    completeActionRequest,
  } = usePlatformStore();

  const isClient = currentUser.role === 'individual_client';

  const [messageText, setMessageText] = useState<string>('');
  const [isInternalNote, setIsInternalNote] = useState<boolean>(!isClient);
  const [includeActionRequest, setIncludeActionRequest] = useState<boolean>(false);
  const [actionReqType, setActionReqType] = useState<'upload_document' | 'clarify_number' | 'confirm_yes_no'>('upload_document');
  const [actionReqDescription, setActionReqDescription] = useState<string>('');

  // Filter messages based on privacy boundary
  const visibleMessages = thread.messages.filter((msg) => {
    if (isClient && msg.isInternalFirmOnly) return false;
    return true;
  });

  const hasPendingRequest = Boolean(
    thread.messages.some((m) => !m.isInternalFirmOnly && m.actionRequest && !m.actionRequest.isCompleted)
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom so latest messages are visible first
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [visibleMessages.length, thread.id]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    let req: ActionRequest | undefined = undefined;
    if (!isClient && !isInternalNote && includeActionRequest && actionReqDescription.trim()) {
      req = {
        type: actionReqType,
        description: actionReqDescription.trim(),
        isCompleted: false,
      };
    }

    addMessageToThread(
      thread.id,
      messageText.trim(),
      isClient ? false : isInternalNote,
      req
    );

    setMessageText('');
    setIncludeActionRequest(false);
    setActionReqDescription('');
  };

  return (
    <div className={`flex flex-col h-full bg-card border-l border-border ${className}`}>
      {/* Drawer Header */}
      <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 bg-primary/10 text-primary shrink-0">
            <MessageSquare className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-foreground truncate" title={thread.contextLabel}>
              {isClient
                ? thread.contextType === 'return'
                  ? 'Discussion with Your CPA Team'
                  : thread.contextLabel
                : thread.contextLabel}
            </h3>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono mt-0.5">
              {isClient ? (
                <Badge variant="outline" className="text-[9px] py-0 px-1.5 font-mono text-emerald-700 dark:text-emerald-400 border-emerald-300">
                  Active Conversation
                </Badge>
              ) : (
                <>
                  <span className="uppercase font-semibold">{thread.contextType} Thread</span>
                  <span>•</span>
                  <Badge variant="outline" className="text-[9px] py-0 px-1 font-mono">
                    {thread.status.replace('_', ' ')}
                  </Badge>
                </>
              )}
            </div>
          </div>
        </div>

        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground shrink-0"
            title="Close discussion drawer"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Messages List Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {visibleMessages.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto opacity-40" />
            <p className="text-xs text-muted-foreground">
              No messages in this discussion yet.
            </p>
          </div>
        ) : (
          visibleMessages.map((msg) => (
            <ThreadMessageItem
              key={msg.id}
              message={msg}
              currentUserRole={currentUser.role}
              onCompleteActionRequest={(msgId, payload) =>
                completeActionRequest(thread.id, msgId, payload)
              }
              onUploadFileForRequest={onUploadRequestedFile}
            />
          ))
        )}

        {/* Dedicated In-Flight Status Row below latest message */}
        {hasPendingRequest && (
          <div className="flex items-center gap-2.5 p-2.5 bg-amber-500/10 border border-amber-500/30 text-xs">
            <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <div className="min-w-0">
              <span className="font-bold text-amber-900 dark:text-amber-200 block text-[11px]">
                {isClient ? 'Action Required from You' : 'Awaiting Client Upload'}
              </span>
              <span className="text-[10px] text-amber-800/90 dark:text-amber-400">
                {isClient
                  ? 'Your CPA team is waiting on your document upload to finalize your return.'
                  : 'Document request dispatched. Waiting for taxpayer to upload in portal.'}
              </span>
            </div>
          </div>
        )}

        {/* Optional Action-Oriented AI Thread Summary & Blocker Auto-Resolver (4) */}
        <ThreadAiSummaryWidget
          thread={thread}
          onScrollToBottom={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
        />

        <div ref={messagesEndRef} />
      </div>

      {/* Compose Message Box */}
      <div className="p-3.5 border-t border-border bg-muted/10 space-y-2.5 shrink-0">
        {/* Privacy Scope Selector (For Firm Staff Only) */}
        {!isClient && (
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsInternalNote(true)}
                className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold transition-all ${
                  isInternalNote
                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border border-amber-300'
                    : 'text-muted-foreground hover:text-foreground border border-transparent'
                }`}
              >
                <Lock className="h-3 w-3" />
                <span>Internal Note</span>
              </button>

              <button
                type="button"
                onClick={() => setIsInternalNote(false)}
                className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold transition-all ${
                  !isInternalNote
                    ? 'bg-sky-100 dark:bg-sky-950 text-sky-900 dark:text-sky-200 border border-sky-300'
                    : 'text-muted-foreground hover:text-foreground border border-transparent'
                }`}
              >
                <Globe className="h-3 w-3 text-sky-600" />
                <span>Client Question</span>
              </button>
            </div>

            {!isInternalNote && (
              <button
                type="button"
                onClick={() => setIncludeActionRequest((prev) => !prev)}
                className={`text-[10px] font-semibold flex items-center gap-1 ${
                  includeActionRequest ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Paperclip className="h-3 w-3" />
                <span>{includeActionRequest ? 'Attached Request' : '+ Request Document/Info'}</span>
              </button>
            )}
          </div>
        )}

        {/* Action Request Creator (if toggled on for client questions) */}
        {!isClient && !isInternalNote && includeActionRequest && (
          <div className="p-2.5 bg-card border border-border space-y-2 text-xs">
            <span className="font-bold text-[10px] uppercase text-muted-foreground block">
              Configure Client Request:
            </span>
            <div className="flex items-center gap-2">
              <select
                aria-label="Select action request type"
                value={actionReqType}
                onChange={(e) => setActionReqType(e.target.value as any)}
                className="h-7 px-2 bg-background border border-border text-[11px] font-semibold text-foreground focus:outline-none"
              >
                <option value="upload_document">Request Document Upload</option>
                <option value="clarify_number">Request Written Clarification</option>
              </select>
              <input
                type="text"
                placeholder="Name requested item (e.g. Form 1099-NEC)..."
                value={actionReqDescription}
                onChange={(e) => setActionReqDescription(e.target.value)}
                className="h-7 px-2 flex-1 bg-background border border-border text-[11px] text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Text Input & Submit Button */}
        <form onSubmit={handleSendMessage} className="space-y-2">
          <textarea
            rows={2}
            placeholder={
              isClient
                ? 'Type your question or response for your CPA...'
                : isInternalNote
                ? 'Add confidential note for CPA team (hidden from client)...'
                : 'Write a question or document request for the client...'
            }
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="w-full p-2 bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />

          <div className="w-full flex items-center justify-end pt-1">
            <Button
              type="submit"
              size="sm"
              disabled={!messageText.trim()}
              className="ml-auto h-7 px-3 text-xs font-semibold gap-1.5 bg-card text-primary border border-primary/40 shadow-xs hover:bg-primary/5 hover:border-primary/70"
            >
              <Send className="h-3 w-3" />
              <span>Send Message</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
