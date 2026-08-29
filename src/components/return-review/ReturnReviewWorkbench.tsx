import React, { useState } from 'react';
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

  // Full-height inspection drawer state: opens on click and covers navbar
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [activeDrawerTab, setActiveDrawerTab] = useState<'document' | 'explainability'>('document');

  // Active return resolution
  const activeReturn =
    returns.find((r) => r.id === selectedReturnId) ||
    returns[0];

  const activeField = fields.find((f) => f.id === activeFieldId);
  const returnDocs = documents.filter((d) => d.returnId === activeReturn?.id);

  const urgency = getTriageUrgency(activeReturn?.triageScore || 0);
  const urgencyStyle = getUrgencyBadgeStyle(urgency);

  const handleOpenInspection = () => {
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

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

      {/* Full-Height Document Inspection Drawer (Portaled to document.body: 0px top offset, covers navbar) */}
      {isDrawerOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-50 overflow-hidden pointer-events-auto">
            {/* Backdrop Blur */}
            <div
              onClick={handleCloseDrawer}
              className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity"
              aria-label="Close document drawer overlay"
            />

            {/* Full-Height Drawer Spanning from top: 0 to bottom: 0 */}
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="drawer-title"
              className="fixed top-0 bottom-0 right-0 z-50 h-screen w-full sm:w-[640px] lg:w-[720px] xl:w-[800px] bg-card border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
            >
              {/* Immersive Dark / Primary Drawer Header */}
              <div className="bg-slate-900 text-white p-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-7 w-7 items-center justify-center bg-primary text-primary-foreground font-bold">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 id="drawer-title" className="text-xs font-bold tracking-tight truncate text-white">
                      Source Document Traceability & AI Defensibility
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono truncate">
                      {activeReturn?.taxpayerName} • Tax Year {activeReturn?.taxYear}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Close Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCloseDrawer}
                    className="h-8 w-8 p-0 text-slate-300 hover:text-white hover:bg-slate-800"
                    title="Close inspection panel (Esc)"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Tab Navigation Toolbar */}
              <div className="flex items-center justify-between border-b border-border bg-muted/40 p-2 shrink-0">
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveDrawerTab('document')}
                    className={`h-7 px-3 text-xs font-semibold gap-1.5 border ${
                      activeDrawerTab === 'document'
                        ? 'bg-card text-foreground border-border shadow-2xs font-bold'
                        : 'text-muted-foreground border-transparent hover:border-border'
                    }`}
                  >
                    <FileText className="h-3.5 w-3.5 text-primary" />
                    Source Document ({returnDocs.length})
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveDrawerTab('explainability')}
                    className={`h-7 px-3 text-xs font-semibold gap-1.5 border ${
                      activeDrawerTab === 'explainability'
                        ? 'bg-card text-foreground border-border shadow-2xs font-bold'
                        : 'text-muted-foreground border-transparent hover:border-border'
                    }`}
                  >
                    <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                    AI Explainability
                  </Button>
                </div>

                {/* Source Document Picker */}
                {activeDrawerTab === 'document' && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground font-medium hidden sm:inline">File:</span>
                    <select
                      aria-label="Select source document to inspect"
                      value={activeDocumentId || ''}
                      onChange={(e) => selectDocument(e.target.value)}
                      className="h-7 bg-card border border-border px-2 text-xs font-medium text-foreground focus:outline-none max-w-[180px] sm:max-w-[220px] truncate"
                    >
                      {returnDocs.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.fileName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Scrollable Drawer Body Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {activeDrawerTab === 'document' ? (
                  <DocumentViewer />
                ) : (
                  <div className="space-y-4">
                    <AIExplainabilityCard />
                    {activeField?.formula && <FormulaBreakdown field={activeField} />}
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
