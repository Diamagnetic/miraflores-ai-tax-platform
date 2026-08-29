import React, { useState } from 'react';
import { usePlatformStore } from '@/store/usePlatformStore';
import { TaxFormViewer } from './TaxFormViewer';
import { DocumentViewer } from '../document-viewer/DocumentViewer';
import { AIExplainabilityCard } from '../ai-explainability/AIExplainabilityCard';
import { FormulaBreakdown } from './FormulaBreakdown';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  FileSpreadsheet,
  FileText,
  Sparkles,
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

  // Side-by-side inspection panel state: opens only on click
  const [isSidePanelOpen, setIsSidePanelOpen] = useState<boolean>(false);
  const [rightPaneTab, setRightPaneTab] = useState<'document' | 'explainability'>('document');

  // Active return resolution
  const activeReturn =
    returns.find((r) => r.id === selectedReturnId) ||
    returns[0];

  const activeField = fields.find((f) => f.id === activeFieldId);
  const returnDocs = documents.filter((d) => d.returnId === activeReturn?.id);

  const urgency = getTriageUrgency(activeReturn?.triageScore || 0);
  const urgencyStyle = getUrgencyBadgeStyle(urgency);

  const handleOpenInspection = () => {
    setIsSidePanelOpen(true);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Return Context Header Banner (Zero 3-option toggle clutter) */}
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

      {/* Dynamic Layout: Full-Width by default, squeezes left table when inspection drawer opens on right */}
      <div className="flex flex-col xl:flex-row gap-4 items-start w-full">
        {/* Left Pane: Tax Return Grid (Squeezes smoothly with horizontal container scroll when panel opens) */}
        <div className={`transition-all duration-200 w-full ${isSidePanelOpen ? 'xl:flex-1 xl:min-w-0 overflow-hidden' : 'w-full'}`}>
          <TaxFormViewer onOpenInspection={handleOpenInspection} />
        </div>

        {/* Right Pane: Source Document Traceability & AI Explainability Drawer (Shown ONLY when clicking Review/Inspect) */}
        {isSidePanelOpen && (
          <div className="w-full xl:w-[520px] 2xl:w-[580px] shrink-0 border border-border bg-card shadow-md flex flex-col transition-all duration-200">
            {/* Drawer Header with Close Button */}
            <div className="flex items-center justify-between border-b border-border bg-muted/40 p-2.5">
              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRightPaneTab('document')}
                  className={`h-7 px-2.5 text-xs font-semibold gap-1.5 border ${
                    rightPaneTab === 'document'
                      ? 'bg-card text-foreground border-border shadow-2xs font-bold'
                      : 'text-muted-foreground border-transparent hover:border-border'
                  }`}
                >
                  <FileText className="h-3.5 w-3.5 text-primary" />
                  Source Traceability ({returnDocs.length})
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRightPaneTab('explainability')}
                  className={`h-7 px-2.5 text-xs font-semibold gap-1.5 border ${
                    rightPaneTab === 'explainability'
                      ? 'bg-card text-foreground border-border shadow-2xs font-bold'
                      : 'text-muted-foreground border-transparent hover:border-border'
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                  AI Explainability
                </Button>
              </div>

              <div className="flex items-center gap-2">
                {/* Document Selector in Tab */}
                {rightPaneTab === 'document' && (
                  <select
                    aria-label="Select source document to inspect"
                    value={activeDocumentId || ''}
                    onChange={(e) => selectDocument(e.target.value)}
                    className="h-7 bg-card border border-border px-2 text-xs font-medium text-foreground focus:outline-none max-w-[140px] truncate"
                  >
                    {returnDocs.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.fileName}
                      </option>
                    ))}
                  </select>
                )}

                {/* Close Drawer Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSidePanelOpen(false)}
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  title="Close inspection panel and return to full-width table"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Drawer Body Content */}
            <div className="p-3 space-y-3">
              {rightPaneTab === 'document' ? (
                <DocumentViewer />
              ) : (
                <div className="space-y-3">
                  <AIExplainabilityCard />
                  {activeField?.formula && <FormulaBreakdown field={activeField} />}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
