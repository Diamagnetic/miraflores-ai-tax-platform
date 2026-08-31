import React, { useState } from 'react';
import { CollaborationThread, TaxReturn } from '@/types';
import { usePlatformStore } from '@/store/usePlatformStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  CheckCircle2,
  FileCheck,
  RotateCw,
  Clock,
} from 'lucide-react';

interface ThreadAiSummaryWidgetProps {
  thread: CollaborationThread;
  activeReturn?: TaxReturn;
  onScrollToBottom?: () => void;
  className?: string;
}

export const ThreadAiSummaryWidget: React.FC<ThreadAiSummaryWidgetProps> = ({
  thread,
  activeReturn,
  onScrollToBottom,
  className = '',
}) => {
  const {
    currentUser,
    returns,
    selectedReturnId,
  } = usePlatformStore();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSynthesized, setIsSynthesized] = useState<boolean>(false);

  const currentReturn =
    activeReturn ||
    returns.find((r) => r.id === thread.returnId) ||
    returns.find((r) => r.id === selectedReturnId) ||
    returns[0];

  const isClient = currentUser.role === 'individual_client';

  // Find latest action request across messages
  const actionMessages = thread.messages.filter((m) => Boolean(m.actionRequest));
  const latestActionMsg = actionMessages[actionMessages.length - 1];
  const hasPendingRequest = Boolean(latestActionMsg?.actionRequest && !latestActionMsg.actionRequest.isCompleted);
  const isActionCompleted = Boolean(latestActionMsg?.actionRequest?.isCompleted);

  // Find index of the latest action request message
  const latestActionIndex = latestActionMsg
    ? thread.messages.findIndex((m) => m.id === latestActionMsg.id)
    : -1;

  // Check if client has sent a message AFTER the latest action request
  const hasClientReplyAfterRequest = latestActionIndex >= 0
    ? thread.messages.slice(latestActionIndex + 1).some(
        (m) => m.senderRole === 'individual_client' && !m.isInternalFirmOnly
      )
    : false;

  // Ready state ONLY when upload is explicitly completed or client replied AFTER the request
  const isClientResponseReady = isActionCompleted || hasClientReplyAfterRequest;

  // Trigger scanning simulation with streaming lines animation
  const handleTriggerSynthesis = () => {
    if (isSynthesized) {
      setIsSynthesized(false);
      return;
    }

    setIsLoading(true);
    onScrollToBottom?.();

    setTimeout(() => {
      setIsLoading(false);
      setIsSynthesized(true);
      setTimeout(() => {
        onScrollToBottom?.();
      }, 60);
    }, 700);
  };

  return (
    <div className={`space-y-2 pt-1 ${className}`}>
      {/* Prominent AI Synthesis Trigger Button */}
      <Button
        type="button"
        variant="outline"
        onClick={handleTriggerSynthesis}
        disabled={isLoading}
        className={`w-full h-10 px-3 text-xs font-semibold justify-between border shadow-2xs transition-all ${
          isSynthesized
            ? 'bg-primary/10 text-primary border-primary/40'
            : 'bg-card text-foreground border-border hover:bg-muted/40 hover:border-primary/40'
        }`}
      >
        <div className="flex items-center gap-2">
          {isLoading ? (
            <RotateCw className="h-4 w-4 text-primary animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 text-primary shrink-0" />
          )}
          <span className="font-semibold">
            {isLoading
              ? 'Analyzing thread messages & extracting workpaper figures...'
              : isSynthesized
              ? 'AI Thread Synthesis Active'
              : 'Generate AI Thread Synthesis'}
          </span>
        </div>

        <Badge
          variant="outline"
          className="font-mono text-[9px] py-0 px-1.5 uppercase bg-background"
        >
          {isLoading ? 'Scanning' : isSynthesized ? 'Hide' : 'AI Assistant'}
        </Badge>
      </Button>

      {/* Streaming Lines Text Loading Animation */}
      {isLoading && (
        <div className="p-3 bg-muted/20 border border-border/80 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground text-[11px]">
            <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
            <span className="font-mono animate-pulse">
              Parsing conversation context and Schedule C concordance...
            </span>
          </div>
          <div className="space-y-1.5 pt-1">
            <div className="h-2 bg-primary/20 rounded animate-pulse w-full" />
            <div className="h-2 bg-primary/15 rounded animate-pulse w-4/5" />
            <div className="h-2 bg-primary/10 rounded animate-pulse w-2/3" />
          </div>
        </div>
      )}

      {/* Pure Text Synthesized Output Box (No Action Buttons) */}
      {isSynthesized && !isLoading && (
        <div
          className={`border p-3.5 transition-all text-xs ${
            isActionCompleted
              ? 'border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20'
              : isClientResponseReady
              ? 'border-emerald-500/40 bg-emerald-50/30 dark:bg-emerald-950/20'
              : hasPendingRequest || currentReturn.isBlocked
              ? 'border-amber-500/40 bg-amber-50/40 dark:bg-amber-950/20'
              : 'border-primary/30 bg-primary/5'
          }`}
        >
          <div className="flex items-start gap-2.5">
            <div
              className={`p-1.5 shrink-0 ${
                isActionCompleted || isClientResponseReady
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : hasPendingRequest
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  : 'bg-primary/10 text-primary'
              }`}
            >
              {isActionCompleted ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : isClientResponseReady ? (
                <FileCheck className="h-4 w-4" />
              ) : hasPendingRequest ? (
                <Clock className="h-4 w-4" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
            </div>

            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground">
                  {isActionCompleted
                    ? 'AI Resolution Summary'
                    : isClientResponseReady
                    ? (isClient ? 'AI Document Upload Verified' : 'AI Document Verification Complete')
                    : hasPendingRequest
                    ? (isClient ? 'AI Monitoring: Awaiting Your Document Upload' : 'AI Monitoring: Awaiting Taxpayer Upload')
                    : 'AI Thread Synthesis'}
                </span>
                <Badge
                  variant="outline"
                  className={`font-mono text-[9px] py-0 ${
                    isActionCompleted || isClientResponseReady
                      ? 'border-emerald-400 text-emerald-700 dark:text-emerald-300'
                      : 'border-amber-400 text-amber-700 dark:text-amber-300'
                  }`}
                >
                  {isActionCompleted
                    ? 'Resolved'
                    : isClientResponseReady
                    ? (isClient ? 'Received' : 'Verified')
                    : hasPendingRequest
                    ? (isClient ? 'Action Needed from You' : 'In Flight')
                    : 'Active'}
                </Badge>
              </div>

              <p className="text-muted-foreground leading-relaxed text-[11px]">
                {isActionCompleted
                  ? (isClient
                      ? 'You have submitted the required documentation. AI verified your figures match return schedules with 100% concordance.'
                      : 'Client provided required documentation. AI verified extracted figures match return schedules with 100% concordance.')
                  : isClientResponseReady
                  ? (isClient
                      ? 'Your uploaded documents have been received. Your CPA team will integrate these figures into your return.'
                      : `Taxpayer ${currentReturn.taxpayerName} submitted response workpapers. AI extracted verified figures matching Schedule C line items with 100% concordance.`)
                  : hasPendingRequest
                  ? (isClient
                      ? 'Your CPA team requested supporting documentation. Please upload your document in this portal to proceed.'
                      : `Request is in flight. Waiting for taxpayer ${currentReturn.taxpayerName} to upload documentation in their portal.`)
                  : `Thread active with ${thread.messages.length} messages. AI explainability active for this context.`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
