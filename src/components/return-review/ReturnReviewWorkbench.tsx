import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePlatformStore } from '@/store/usePlatformStore';
import { TaxFormViewer } from './TaxFormViewer';
import { DocumentViewer } from '../document-viewer/DocumentViewer';
import { AIExplainabilityCard } from '../ai-explainability/AIExplainabilityCard';
import { FormulaBreakdown } from './FormulaBreakdown';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  FileSpreadsheet,
  X,
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
    selectedReturnId,
    activeFieldId,
    activeDocumentId,
    selectDocument,
  } = usePlatformStore();

  // Full-height inspection drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [activeDrawerTab, setActiveDrawerTab] = useState<'document' | 'explainability'>('document');

  // Active return resolution
  const activeReturn =
    returns.find((r) => r.id === selectedReturnId) ||
    returns[0];

  const activeField = fields.find((f) => f.id === activeFieldId);
  const activeDoc = documents.find((d) => d.id === activeDocumentId) || documents[0];

  const urgency = getTriageUrgency(activeReturn?.triageScore || 0);
  const urgencyStyle = getUrgencyBadgeStyle(urgency);

  const handleOpenInspection = (fieldId: string, initialTab: 'document' | 'explainability' = 'document', targetDocId?: string) => {
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

        {/* Financial Metrics & Triage Score */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="border border-border bg-muted/20 px-3 py-1.5 text-right font-mono text-xs">
            <span className="text-[10px] text-muted-foreground block uppercase">Total Income</span>
            <strong className="text-foreground">{formatCurrency(activeReturn?.totalIncome || 0)}</strong>
          </div>

          <div className="border border-border bg-muted/20 px-3 py-1.5 text-right font-mono text-xs">
            <span className="text-[10px] text-muted-foreground block uppercase">
              {(activeReturn?.refundOrDueAmount || 0) >= 0 ? 'Est. Refund' : 'Tax Due'}
            </span>
            <strong className={(activeReturn?.refundOrDueAmount || 0) >= 0 ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-amber-700 dark:text-amber-400 font-bold'}>
              {formatCurrency(Math.abs(activeReturn?.refundOrDueAmount || 0))}
            </strong>
          </div>

          <Badge variant="outline" className={`font-mono text-xs py-1.5 px-3 border ${urgencyStyle}`}>
            Triage Score: {activeReturn?.triageScore} ({urgency})
          </Badge>
        </div>
      </div>

      {/* Main Full-Width Schedule Grid */}
      <div className="w-full">
        <TaxFormViewer onOpenInspection={handleOpenInspection} />
      </div>

      {/* Clean Full-Height Drawer (Portaled to document.body: renders ONLY the document/explainability with zero extra wrapper divs) */}
      {isDrawerOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-50 overflow-hidden pointer-events-auto">
            {/* Backdrop Blur */}
            <div
              onClick={handleCloseDrawer}
              className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity cursor-pointer"
              aria-label="Close document drawer overlay (Esc)"
            />

            {/* Full-Height Drawer */}
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="drawer-content"
              className="fixed top-0 bottom-0 right-0 z-50 h-screen w-full sm:w-[640px] lg:w-[740px] xl:w-[820px] bg-card border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
            >
              {activeDrawerTab === 'document' ? (
                <DocumentViewer
                  document={activeDoc}
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
