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
  Split,
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

  const [rightPaneTab, setRightPaneTab] = useState<'document' | 'explainability'>('document');
  const [layoutMode, setLayoutMode] = useState<'split' | 'form_only' | 'doc_only'>('split');

  // Active return resolution
  const activeReturn =
    returns.find((r) => r.id === selectedReturnId) ||
    returns[0];

  const activeField = fields.find((f) => f.id === activeFieldId);
  const returnDocs = documents.filter((d) => d.returnId === activeReturn?.id);

  const urgency = getTriageUrgency(activeReturn?.triageScore || 0);
  const urgencyStyle = getUrgencyBadgeStyle(urgency);

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

          {/* Layout Controls */}
          <div className="flex items-center gap-1 border border-border bg-card p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLayoutMode('split')}
              className={`h-7 px-2 text-xs gap-1 ${layoutMode === 'split' ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground'}`}
              title="Side-by-Side Split Review"
            >
              <Split className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Split</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLayoutMode('form_only')}
              className={`h-7 px-2 text-xs gap-1 ${layoutMode === 'form_only' ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground'}`}
              title="Maximize Tax Form View"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Form</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLayoutMode('doc_only')}
              className={`h-7 px-2 text-xs gap-1 ${layoutMode === 'doc_only' ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground'}`}
              title="Maximize Document View"
            >
              <FileText className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Document</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Split-Screen Workbench Grid */}
      <div className={`grid gap-4 ${
        layoutMode === 'split'
          ? 'grid-cols-1 xl:grid-cols-12'
          : layoutMode === 'form_only'
          ? 'grid-cols-1'
          : 'grid-cols-1'
      }`}>
        {/* Left Pane: Interactive Tax Return Grid (Form 1040 & Schedule C) */}
        {(layoutMode === 'split' || layoutMode === 'form_only') && (
          <div className={layoutMode === 'split' ? 'xl:col-span-6 2xl:col-span-7' : 'w-full'}>
            <TaxFormViewer />
          </div>
        )}

        {/* Right Pane: Source Document Traceability & AI Explainability */}
        {(layoutMode === 'split' || layoutMode === 'doc_only') && (
          <div className={layoutMode === 'split' ? 'xl:col-span-6 2xl:col-span-5 space-y-4' : 'w-full space-y-4'}>
            {/* Right Pane Navigation Tabs */}
            <div className="flex items-center justify-between border-b border-border bg-muted/40 p-1.5">
              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRightPaneTab('document')}
                  className={`h-7 px-3 text-xs font-semibold gap-1.5 border ${
                    rightPaneTab === 'document'
                      ? 'bg-card text-foreground border-border shadow-2xs font-bold'
                      : 'text-muted-foreground border-transparent hover:border-border'
                  }`}
                >
                  <FileText className="h-3.5 w-3.5 text-primary" />
                  Source Traceability ({returnDocs.length} Docs)
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRightPaneTab('explainability')}
                  className={`h-7 px-3 text-xs font-semibold gap-1.5 border ${
                    rightPaneTab === 'explainability'
                      ? 'bg-card text-foreground border-border shadow-2xs font-bold'
                      : 'text-muted-foreground border-transparent hover:border-border'
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                  AI Explainability
                </Button>
              </div>

              {/* Source Document Quick Switcher */}
              <div className="flex items-center gap-1">
                <select
                  aria-label="Select source document to inspect"
                  value={activeDocumentId || ''}
                  onChange={(e) => selectDocument(e.target.value)}
                  className="h-7 bg-card border border-border px-2 text-xs font-medium text-foreground focus:outline-none max-w-[200px] truncate"
                >
                  {returnDocs.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.fileName} ({d.docType})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Right Pane Content */}
            {rightPaneTab === 'document' ? (
              <DocumentViewer />
            ) : (
              <div className="space-y-4">
                <AIExplainabilityCard />
                {activeField?.formula && <FormulaBreakdown field={activeField} />}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
