import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePlatformStore } from '@/store/usePlatformStore';
import { TaxFormViewer } from './TaxFormViewer';
import { DocumentViewer } from '../document-viewer/DocumentViewer';
import { AIExplainabilityCard } from '../ai-explainability/AIExplainabilityCard';
import { FormulaBreakdown } from './FormulaBreakdown';
import { ContextualThreadDrawer } from '../collaboration/ContextualThreadDrawer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  FileSpreadsheet,
  X,
  Send,
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileCheck,
  MessageSquare,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { getTriageUrgency, getUrgencyBadgeStyle } from '@/store/triageLogic';

interface ReturnReviewWorkbenchProps {
  className?: string;
}

export const ReturnReviewWorkbench: React.FC<ReturnReviewWorkbenchProps> = ({
  className = '',
}) => {
  const {
    returns,
    fields,
    documents,
    threads,
    selectedReturnId,
    activeFieldId,
    activeDocumentId,
    selectDocument,
    transmitReturnToIrs,
    acknowledgeIrsAcceptance,
  } = usePlatformStore();

  // Full-height inspection drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [activeDrawerTab, setActiveDrawerTab] = useState<'document' | 'explainability' | 'thread'>('document');

  // Animation state for opening/closing workbench drawer smoothly
  const [isRendered, setIsRendered] = useState<boolean>(isDrawerOpen);
  const [isVisible, setIsVisible] = useState<boolean>(isDrawerOpen);

  useEffect(() => {
    if (isDrawerOpen) {
      setIsRendered(true);
      const timer = setTimeout(() => setIsVisible(true), 20);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setIsRendered(false), 250);
      return () => clearTimeout(timer);
    }
  }, [isDrawerOpen]);

  // Active return resolution
  const activeReturn =
    returns.find((r) => r.id === selectedReturnId) ||
    returns[0];

  const activeField = fields.find((f) => f.id === activeFieldId);
  const activeDoc = documents.find((d) => d.id === activeDocumentId) || documents[0];

  // Resolve collaboration thread for this return / field
  const returnThreads = threads.filter((t) => t.returnId === activeReturn?.id);
  const activeThread =
    (activeFieldId ? returnThreads.find((t) => t.contextId === activeFieldId) : undefined) ||
    returnThreads.find((t) => t.contextType === 'return') ||
    returnThreads[0] || {
      id: `th-auto-${activeReturn?.id}`,
      returnId: activeReturn?.id || 'ret-default',
      contextType: 'return' as const,
      contextId: activeReturn?.id || 'ret-default',
      contextLabel: `${activeReturn?.taxpayerName || 'Return'} (Form ${activeReturn?.returnType || '1040'}): Return Notes & Team Collaboration`,
      status: 'open' as const,
      messages: [],
    };

  // Calculate pending client actionable requests & recent client responses
  const pendingClientRequestsCount = returnThreads.reduce((total, thread) => {
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

  const lastMessage = activeThread.messages[activeThread.messages.length - 1];
  const hasRecentClientReply =
    lastMessage &&
    lastMessage.senderRole === 'individual_client' &&
    pendingClientRequestsCount === 0;

  const urgency = getTriageUrgency(activeReturn?.triageScore || 0);
  const urgencyStyle = getUrgencyBadgeStyle(urgency);
  const isRefund = (activeReturn?.refundOrDueAmount || 0) >= 0;

  const handleOpenInspection = (
    fieldId: string,
    initialTab: 'document' | 'explainability' | 'thread' = 'document',
    targetDocId?: string
  ) => {
    if (targetDocId) {
      selectDocument(targetDocId);
    } else if (fieldId) {
      const field = fields.find((f) => f.id === fieldId);
      if (field?.sourceDocumentIds && field.sourceDocumentIds.length > 0) {
        selectDocument(field.sourceDocumentIds[0]);
      }
    }
    setActiveDrawerTab(initialTab);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  // Close drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        setIsDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Return Context Header Banner */}
      <div className="border border-border bg-card p-4 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-primary text-primary-foreground font-bold">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-foreground">
                {activeReturn?.taxpayerName}
              </h2>
              <Badge variant="outline" className="font-mono text-xs">
                {activeReturn?.returnType} • Tax Year {activeReturn?.taxYear}
              </Badge>
              <Badge variant="secondary" className="font-mono text-xs uppercase">
                {activeReturn?.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-3">
              <span>Next Action: <strong>{activeReturn?.nextActionOwner}</strong> ({activeReturn?.nextActionDescription || 'Review Form 1040'})</span>
              <span>•</span>
              <span>Due: <strong>{activeReturn?.dueDate ? new Date(activeReturn.dueDate).toLocaleDateString() : 'Oct 15, 2026'}</strong></span>
            </p>
          </div>
        </div>

        {/* Financial Metrics, Collaboration Drawer Button & Triage Score */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="border border-border bg-muted/20 px-3 py-1.5 text-right font-mono text-xs">
            <span className="text-[10px] text-muted-foreground block uppercase">Total Income</span>
            <strong className="text-foreground">{formatCurrency(activeReturn?.totalIncome || 0)}</strong>
          </div>

          <div className="border border-border bg-muted/20 px-3 py-1.5 text-right font-mono text-xs">
            <span className="text-[10px] text-muted-foreground block uppercase">
              {isRefund ? 'Est. Refund' : 'Tax Due'}
            </span>
            <strong className={isRefund ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-amber-700 dark:text-amber-400 font-bold'}>
              {formatCurrency(Math.abs(activeReturn?.refundOrDueAmount || 0))}
            </strong>
          </div>

          <Badge variant="outline" className={`font-mono text-xs py-1.5 px-3 border ${urgencyStyle}`}>
            Priority: {urgency}
          </Badge>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenInspection('', 'thread')}
            className="h-8 px-3 text-xs font-semibold gap-1.5 border-border shadow-2xs hover:bg-muted"
          >
            <MessageSquare className="h-3.5 w-3.5 text-primary" />
            <span>
              Notes & Threads
              {pendingClientRequestsCount > 0
                ? ` (${pendingClientRequestsCount} Open ${pendingClientRequestsCount === 1 ? 'Request' : 'Requests'})`
                : hasRecentClientReply
                ? ' (New Client Reply)'
                : ''}
            </span>
          </Button>
        </div>
      </div>

      {/* CPA E-Filing & IRS Transmission Action Callout */}
      {activeReturn && activeReturn.status === 'CLIENT_SIGN' && (
        <Card className={`border-primary/40 bg-card shadow-xs`}>
          <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 text-primary shrink-0">
                <FileCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                    E-File Authorization Status
                  </span>
                  <Badge
                    variant="outline"
                    className="bg-primary/10 text-primary border-primary/30 font-mono text-[10px]"
                  >
                    {activeReturn.clientSigned ? 'Form 8879 Signed by Taxpayer' : 'Awaiting Taxpayer Signature'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {activeReturn.clientSigned
                    ? `Taxpayer ${activeReturn.taxpayerName} has signed Form 8879. The legal authorization is locked. You may now electronically submit and transmit all return documents and schedules to the IRS MeF Gateway under the firm's EFIN.`
                    : `Form 8879 has been prepared and sent to ${activeReturn.taxpayerName}. CPA transmission will unlock once the taxpayer signs.`}
                </p>
              </div>
            </div>

            {activeReturn.clientSigned && (
              <Button
                onClick={() => transmitReturnToIrs(activeReturn.id)}
                className="shrink-0 h-8 px-4 text-xs font-semibold gap-1.5 bg-card text-primary border border-primary/40 shadow-xs hover:bg-primary/5 hover:border-primary/70"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Transmit Documents to IRS MeF Gateway</span>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* CPA IRS Acceptance Acknowledgment Callout */}
      {activeReturn && activeReturn.status === 'E_FILED' && (
        <Card className={`border-sky-300 dark:border-sky-800 bg-sky-50/40 dark:bg-sky-950/20 shadow-xs`}>
          <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 shrink-0">
                {activeReturn.irsApproved ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-800 dark:text-sky-300">
                    {activeReturn.irsApproved ? 'IRS Electronic Acceptance Received (Code 0000)' : 'Transmitted to IRS MeF Gateway'}
                  </span>
                  <Badge className="bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-200 border-sky-300 font-mono text-[10px]">
                    {activeReturn.irsApproved ? 'Ready for CPA Acknowledgment' : 'In Gateway Processing'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {activeReturn.irsApproved
                    ? `The IRS MeF Gateway has officially accepted ${activeReturn.taxpayerName}'s return with zero discrepancies (Submission ID: ${activeReturn.irsSubmissionId || 'IRS-2026-TX-89104'}). ${isRefund ? `Refund of ${formatCurrency(Math.abs(activeReturn.refundOrDueAmount))} approved.` : `Tax due of ${formatCurrency(Math.abs(activeReturn.refundOrDueAmount))} assessed.`} Click below to acknowledge IRS approval and notify the client.`
                    : `CPA has submitted documents (Submission ID: ${activeReturn.irsSubmissionId || 'IRS-2026-TX-89104'}). Awaiting IRS electronic acknowledgment gateway verification.`}
                </p>
              </div>
            </div>

            {activeReturn.irsApproved && (
              <Button
                onClick={() => acknowledgeIrsAcceptance(activeReturn.id)}
                className="shrink-0 h-8 px-4 text-xs font-semibold gap-1.5 bg-card text-emerald-700 border border-emerald-400 shadow-xs hover:bg-emerald-50 hover:border-emerald-600"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Acknowledge IRS Approval & Issue Notice</span>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* CPA Completed Filing Callout */}
      {activeReturn && activeReturn.status === 'ACCEPTED' && (
        <Card className={`border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs`}>
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                    Official IRS Filing Complete
                  </span>
                  <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 border-emerald-300 font-mono text-[10px]">
                    Accepted & Acknowledged
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Submission ID: <code className="font-mono font-bold text-foreground">{activeReturn.irsSubmissionId || 'IRS-2026-TX-89104'}</code> • IRS has verified and accepted return. {isRefund ? `Refund of ${formatCurrency(Math.abs(activeReturn.refundOrDueAmount))} scheduled for client.` : `Payment schedule for ${formatCurrency(Math.abs(activeReturn.refundOrDueAmount))} generated.`} Taxpayer {activeReturn.taxpayerName} notified.
                </p>
              </div>
            </div>

            <Badge variant="outline" className="font-mono text-xs bg-card">
              Lifecycle Complete
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Main Full-Width Schedule Grid */}
      <div className="w-full">
        <TaxFormViewer onOpenInspection={handleOpenInspection} />
      </div>

      {/* Clean Full-Height Drawer (Portaled to document.body with smooth left-to-right slide exit) */}
      {isRendered &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-50 overflow-hidden pointer-events-auto">
            {/* Backdrop Blur */}
            <div
              onClick={handleCloseDrawer}
              className={`fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity duration-250 ease-in-out cursor-pointer ${
                isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
              aria-label="Close document drawer overlay (Esc)"
            />

            {/* Full-Height Drawer */}
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="drawer-content"
              className={`fixed top-0 bottom-0 right-0 z-50 h-screen w-full sm:w-[640px] lg:w-[740px] xl:w-[820px] bg-card border-l border-border shadow-2xl flex flex-col transition-transform duration-250 ease-in-out transform ${
                isVisible ? 'translate-x-0' : 'translate-x-full'
              }`}
            >
              {activeDrawerTab === 'document' ? (
                <DocumentViewer
                  document={activeDoc}
                  onClose={handleCloseDrawer}
                  className="h-full border-0 shadow-none"
                />
              ) : activeDrawerTab === 'thread' ? (
                <ContextualThreadDrawer
                  thread={activeThread}
                  onClose={handleCloseDrawer}
                  className="h-full border-0 shadow-none"
                />
              ) : (
                <div className="h-full flex flex-col bg-card overflow-y-auto">
                  {/* Clean Minimal Header for Explainability */}
                  <div className="flex items-center justify-between border-b border-border bg-muted/40 p-3 shrink-0">
                    <span className="font-bold text-xs text-foreground">
                      AI Explainability & Defensibility
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCloseDrawer}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                      title="Close panel (Esc)"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="p-4 space-y-4 flex-1">
                    <AIExplainabilityCard field={activeField} className="border-0 shadow-none" />
                    {activeField?.formula && <FormulaBreakdown field={activeField} />}
                  </div>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
