import React, { useState } from 'react';
import { TaxReturn, ActionRequest } from '@/types';
import { usePlatformStore } from '@/store/usePlatformStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Send,
  AlertTriangle,
  CheckCircle2,
  User,
  ArrowRight,
  X,
  MessageSquare,
  Clock,
} from 'lucide-react';

interface AiNextActionBannerProps {
  activeReturn: TaxReturn;
  onOpenThreadDrawer?: () => void;
  className?: string;
}

export const AiNextActionBanner: React.FC<AiNextActionBannerProps> = ({
  activeReturn,
  onOpenThreadDrawer,
  className = '',
}) => {
  const {
    threads,
    addMessageToThread,
    updateReturnStatus,
  } = usePlatformStore();

  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [dispatchedSuccess, setDispatchedSuccess] = useState<boolean>(false);

  if (isDismissed) return null;

  // Resolve primary return thread or fallback
  const existingThread =
    threads.find((t) => t.returnId === activeReturn.id && t.contextType === 'return') ||
    threads.find((t) => t.returnId === activeReturn.id) ||
    threads[0];

  // Check if a client action request is already pending in the thread
  const hasPendingClientRequest = Boolean(
    existingThread?.messages.some(
      (m) => !m.isInternalFirmOnly && m.actionRequest && !m.actionRequest.isCompleted
    )
  );

  // Check if client has already completed / uploaded the requested documentation
  const hasCompletedClientRequest = Boolean(
    existingThread?.messages.some(
      (m) => !m.isInternalFirmOnly && m.actionRequest && m.actionRequest.isCompleted
    )
  );

  // Determine the AI suggested scenario based on return metadata
  const isBlocked = activeReturn.isBlocked;
  const isPeterParker = activeReturn.taxpayerName.includes('Parker');
  const isTonyStark = activeReturn.taxpayerName.includes('Stark') && activeReturn.returnType === '1040';
  const isReadyForReview = activeReturn.status === 'PREPARATION' && !isBlocked && activeReturn.openIssueCount === 0;
  const isReadyForSign = activeReturn.status === 'REVIEW' && !isBlocked;

  // Pre-drafted inquiry configuration
  const aiProposal = (() => {
    if (isBlocked) {
      if (hasCompletedClientRequest) {
        return {
          type: 'advance' as const,
          title: 'Client Responded: Requested Documentation Received',
          reason: `${activeReturn.taxpayerName} has uploaded the requested documentation in response to your inquiry. Ready for preparer verification.`,
          suggestedAction: 'Review uploaded workpapers in Document Hub.',
          draftMessage: '',
          actionLabel: '',
          actionType: null,
          targetOwner: 'preparer' as const,
          isDispatched: true,
        };
      }

      if (hasPendingClientRequest || dispatchedSuccess) {
        return {
          type: 'blocker' as const,
          title: 'Request Dispatched: Awaiting Client Upload',
          reason: `Document request has been sent to ${activeReturn.taxpayerName}. Waiting for taxpayer to upload required workpapers in their portal.`,
          suggestedAction: 'Waiting on client submission.',
          draftMessage: '',
          actionLabel: '',
          actionType: null,
          targetOwner: 'client (waiting)' as const,
          isDispatched: true,
        };
      }

      if (isPeterParker) {
        return {
          type: 'blocker' as const,
          title: 'AI Detected Blocker: Missing 1099-NEC & Equipment Expense Log',
          reason: 'AI identified $14,200 nonemployee compensation reported on Schedule C Line 1 without an attached Form 1099-NEC from Daily Bugle Photo Dept.',
          suggestedAction: 'Request Form 1099-NEC and photography gear receipts from Peter Parker.',
          draftMessage:
            'Hi Peter, our AI ingestion system noticed that your 2025 Schedule C reports $14,200 in nonemployee compensation, but we are missing your Form 1099-NEC from the Daily Bugle. Could you please upload your 1099-NEC and any camera equipment receipts so we can complete your Schedule C verification?',
          actionLabel: 'Upload Form 1099-NEC & Equipment Receipts',
          actionType: 'upload_document' as const,
          targetOwner: 'client' as const,
          isDispatched: false,
        };
      }
      return {
        type: 'blocker' as const,
        title: `AI Detected Blocker: ${activeReturn.blockerReason || 'Missing Source Documentation'}`,
        reason: activeReturn.blockerReason || 'Supporting workpapers are required to substantiate tax deduction figures before finalizing preparation.',
        suggestedAction: `Request supporting documentation from ${activeReturn.taxpayerName}.`,
        draftMessage: `Hi ${activeReturn.taxpayerName}, we need additional supporting documentation to finalize your ${activeReturn.returnType} tax return. Please review the requested items in your portal.`,
        actionLabel: `Upload Supporting Documentation for ${activeReturn.returnType}`,
        actionType: 'upload_document' as const,
        targetOwner: 'client' as const,
        isDispatched: false,
      };
    }

    if (isTonyStark) {
      if (hasCompletedClientRequest) {
        return {
          type: 'advance' as const,
          title: 'Client Responded: Meal Substantiation Received',
          reason: 'Tony Stark uploaded supporting meal expense receipts in response to your inquiry. AI analyzed the document with 99% concordance. Ready for preparer verification.',
          suggestedAction: 'Review uploaded receipts in Document Hub.',
          draftMessage: '',
          actionLabel: '',
          actionType: null,
          targetOwner: 'preparer' as const,
          isDispatched: true,
        };
      }

      if (hasPendingClientRequest || dispatchedSuccess) {
        return {
          type: 'advisory' as const,
          title: 'Request Dispatched: Awaiting Meal Substantiation',
          reason: `Document request for Schedule C meal substantiation has been dispatched to Tony Stark.`,
          suggestedAction: 'Waiting on client submission.',
          draftMessage: '',
          actionLabel: '',
          actionType: null,
          targetOwner: 'client (waiting)' as const,
          isDispatched: true,
        };
      }

      return {
        type: 'advisory' as const,
        title: 'AI Advisory: Schedule C Line 24b Meal & Travel Variance',
        reason: 'Business meals & entertainment deduction ($12,400) is 140% above prior year. 50% IRS limitation applies and requires explicit taxpayer substantiation.',
        suggestedAction: 'Request taxpayer itemized meal log or expense receipts for meals over $75.',
        draftMessage:
          'Hi Tony, we are reviewing your Schedule C Line 24b ($12,400 business meal expenses). Please upload your itemized business meal receipts or expense diary so we can confirm the 50% business deduction limit.',
        actionLabel: 'Upload Itemized Business Meal Log / Receipts (Schedule C Line 24b)',
        actionType: 'upload_document' as const,
        targetOwner: 'client' as const,
        isDispatched: false,
      };
    }

    if (isReadyForReview) {
      return {
        type: 'advance' as const,
        title: 'AI Pre-Filing QA Passed: Ready for Senior Review',
        reason: `All ${activeReturn.documentCount} documents verified with ${Math.round(activeReturn.aiConfidenceAvg * 100)}% average AI confidence and 0 open discrepancies.`,
        suggestedAction: 'Submit return to Senior Partner Steve Rogers for final quality sign-off.',
        draftMessage: '',
        actionLabel: '',
        actionType: null,
        targetOwner: 'reviewer' as const,
        isDispatched: false,
      };
    }

    if (isReadyForSign) {
      return {
        type: 'advance' as const,
        title: 'Partner QA Approved: Ready for Taxpayer E-Signature',
        reason: 'Senior Partner Steve Rogers has finalized review. Tax liability calculated at $' + activeReturn.taxLiability.toLocaleString() + '.',
        suggestedAction: 'Authorize and dispatch Form 8879 for client electronic signature.',
        draftMessage: '',
        actionLabel: '',
        actionType: null,
        targetOwner: 'client' as const,
        isDispatched: false,
      };
    }

    return null;
  })();

  if (!aiProposal) return null;

  const handle1ClickDispatch = () => {
    setIsSending(true);

    setTimeout(() => {
      // If dispatching a client request
      if (aiProposal.draftMessage && existingThread) {
        const req: ActionRequest | undefined = aiProposal.actionType
          ? {
              type: aiProposal.actionType,
              description: aiProposal.actionLabel || aiProposal.draftMessage,
              isCompleted: false,
            }
          : undefined;

        addMessageToThread(
          existingThread.id,
          aiProposal.draftMessage,
          false,
          req
        );

        // Automatically switch context to message drawer
        onOpenThreadDrawer?.();
      } else if (aiProposal.type === 'advance') {
        if (isReadyForReview) {
          updateReturnStatus(activeReturn.id, 'REVIEW', 'EXPERT_REVIEW');
        } else if (isReadyForSign) {
          updateReturnStatus(activeReturn.id, 'CLIENT_SIGN', 'READY_FOR_SIGNATURE');
        }
      }

      setIsSending(false);
      setDispatchedSuccess(true);
    }, 400);
  };

  return (
    <div
      className={`border transition-all duration-200 ${
        aiProposal.type === 'blocker'
          ? 'border-amber-400/80 bg-amber-500/5 dark:bg-amber-950/20'
          : aiProposal.type === 'advisory'
          ? 'border-blue-400/80 bg-blue-500/5 dark:bg-blue-950/20'
          : 'border-emerald-400/80 bg-emerald-500/5 dark:bg-emerald-950/20'
      } p-3.5 sm:p-4 shadow-2xs ${className}`}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Left: AI Icon + Proposal Information */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div
            className={`p-2 shrink-0 ${
              aiProposal.type === 'blocker'
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                : aiProposal.type === 'advisory'
                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {aiProposal.isDispatched ? (
              <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            ) : aiProposal.type === 'blocker' ? (
              <AlertTriangle className="h-4 w-4" />
            ) : aiProposal.type === 'advisory' ? (
              <Sparkles className="h-4 w-4" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-foreground tracking-tight">
                {aiProposal.title}
              </span>
              <Badge
                variant="outline"
                className="font-mono text-[10px] py-0 gap-1 bg-background uppercase"
              >
                <User className="h-2.5 w-2.5" />
                Target: {aiProposal.targetOwner}
              </Badge>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {aiProposal.reason}
            </p>

            {aiProposal.draftMessage && (
              <div className="text-[11px] bg-background/80 border border-border/80 p-2 text-foreground/90 font-sans italic mt-1.5 flex items-start gap-1.5">
                <MessageSquare className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong>AI Pre-Drafted Inquiry:</strong> &ldquo;{aiProposal.draftMessage}&rdquo;
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Action Dispatch Button / View in Notes */}
        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
          {aiProposal.isDispatched ? (
            <Button
              size="sm"
              variant="outline"
              onClick={onOpenThreadDrawer}
              className="h-8 px-3 text-xs font-semibold gap-1.5 border-border shadow-2xs hover:bg-muted"
            >
              <MessageSquare className="h-3.5 w-3.5 text-primary" />
              <span>View in Notes Drawer</span>
            </Button>
          ) : (
            <>
              <Button
                size="sm"
                onClick={handle1ClickDispatch}
                disabled={isSending}
                className={`h-8 px-3 text-xs font-semibold gap-1.5 shadow-2xs ${
                  aiProposal.type === 'blocker'
                    ? 'bg-amber-600 text-white hover:bg-amber-700'
                    : aiProposal.type === 'advisory'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                {isSending ? (
                  <Sparkles className="h-3.5 w-3.5 animate-spin" />
                ) : aiProposal.draftMessage ? (
                  <Send className="h-3.5 w-3.5" />
                ) : (
                  <ArrowRight className="h-3.5 w-3.5" />
                )}
                <span>
                  {isSending
                    ? 'Processing...'
                    : aiProposal.draftMessage
                    ? '1-Click Send to Client'
                    : 'Advance Status'}
                </span>
              </Button>

              {onOpenThreadDrawer && aiProposal.draftMessage && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onOpenThreadDrawer}
                  className="h-8 px-2.5 text-xs font-medium gap-1 text-muted-foreground hover:text-foreground"
                  title="Edit in Notes Drawer"
                >
                  <MessageSquare className="h-3 w-3" />
                  <span className="hidden sm:inline">Edit</span>
                </Button>
              )}

              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsDismissed(true)}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                title="Dismiss"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
