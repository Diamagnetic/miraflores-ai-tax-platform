import React from 'react';
import { CollaborationThread, Message } from '@/types';
import { usePlatformStore } from '@/store/usePlatformStore';
import { ActionRequestCard } from './ActionRequestCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  CheckCircle2,
} from 'lucide-react';

interface ClientRequestsWidgetProps {
  returnId: string;
  onOpenUploadForMessage?: (messageId: string) => void;
  className?: string;
}

export const ClientRequestsWidget: React.FC<ClientRequestsWidgetProps> = ({
  returnId,
  onOpenUploadForMessage,
  className = '',
}) => {
  const { threads, completeActionRequest } = usePlatformStore();

  // Extract all client-facing messages with action requests for this return
  const returnThreads = threads.filter((t) => t.returnId === returnId);

  const actionItems: { thread: CollaborationThread; message: Message }[] = [];
  returnThreads.forEach((thread) => {
    thread.messages.forEach((msg) => {
      if (!msg.isInternalFirmOnly && msg.actionRequest) {
        actionItems.push({ thread, message: msg });
      }
    });
  });

  const pendingItems = actionItems.filter((item) => !item.message.actionRequest?.isCompleted);
  const completedItems = actionItems.filter((item) => item.message.actionRequest?.isCompleted);

  if (actionItems.length === 0) {
    return null;
  }

  return (
    <Card className={`border border-border bg-card shadow-xs ${className}`}>
      <CardHeader className="p-4 border-b border-border bg-muted/20 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-bold text-foreground">
            CPA Inquiries & Action Requests
          </CardTitle>
        </div>
        <div className="flex items-center gap-2">
          {pendingItems.length > 0 ? (
            <Badge
              variant="outline"
              className="bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-200 border-sky-300 font-mono text-xs hover:bg-sky-100 hover:text-sky-900"
            >
              {pendingItems.length} Pending
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200 border-emerald-300 font-mono text-xs hover:bg-emerald-100 hover:text-emerald-800"
            >
              All Inquiries Resolved
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Pending Requests */}
        {pendingItems.length > 0 ? (
          <div className="space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
              Needs Your Response ({pendingItems.length})
            </span>
            <div className="space-y-3">
              {pendingItems.map(({ thread, message }) => (
                <div key={message.id} className="p-3.5 border border-border bg-card space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                    <span className="font-semibold text-foreground">From: {message.senderName}</span>
                    <span>Context: {thread.contextLabel}</span>
                  </div>
                  <p className="text-xs text-foreground font-medium">
                    "{message.content}"
                  </p>
                  {message.actionRequest && (
                    <ActionRequestCard
                      actionRequest={message.actionRequest}
                      messageId={message.id}
                      isClientView={true}
                      onComplete={(payload) =>
                        completeActionRequest(thread.id, message.id, payload)
                      }
                      onUploadFile={() => onOpenUploadForMessage?.(message.id)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 text-xs flex items-center gap-2.5 text-emerald-950 dark:text-emerald-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>All inquiries from your CPA team have been answered. No outstanding action items!</span>
          </div>
        )}

        {/* Resolved Requests */}
        {completedItems.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
              Resolved Inquiries ({completedItems.length})
            </span>
            <div className="space-y-2">
              {completedItems.map(({ thread, message }) => (
                <div
                  key={message.id}
                  className="p-2.5 bg-muted/20 border border-border flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate">
                      {message.actionRequest?.description}
                    </p>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {thread.contextLabel}
                    </span>
                  </div>
                  <Badge variant="outline" className="font-mono text-[9px] text-emerald-700 dark:text-emerald-300 border-emerald-300 shrink-0">
                    Resolved
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
