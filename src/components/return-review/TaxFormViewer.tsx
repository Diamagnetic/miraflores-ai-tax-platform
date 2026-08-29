import React, { useState, useEffect, useRef } from 'react';
import { ReturnField, AffordanceState, SourceDocument } from '@/types';
import { usePlatformStore } from '@/store/usePlatformStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileSpreadsheet,
  CheckCheck,
  Filter,
  FileText,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ShieldCheck,
  Edit3,
  Lock,
  AlertTriangle,
} from 'lucide-react';

interface TaxFormViewerProps {
  onOpenInspection?: (fieldId: string, initialTab: 'document' | 'explainability', targetDocId?: string) => void;
  className?: string;
}

interface HoveredDocInfo {
  fieldId: string;
  doc: SourceDocument;
  x: number;
  y: number;
  placement: 'top' | 'bottom';
}

export const TaxFormViewer: React.FC<TaxFormViewerProps> = ({
  onOpenInspection,
  className = '',
}) => {
  const {
    fields,
    documents,
    selectedReturnId,
    activeFieldId,
    selectField,
    verifyField,
    currentUser,
  } = usePlatformStore();

  const [activeFormTab, setActiveFormTab] = useState<string>('all');
  const [filterState, setFilterState] = useState<AffordanceState | 'all'>('all');
  const [hoveredDocInfo, setHoveredDocInfo] = useState<HoveredDocInfo | null>(null);
  const activeRowRef = useRef<HTMLTableRowElement | null>(null);

  // Filter fields belonging to the active return
  const returnFields = fields.filter((f) => f.returnId === selectedReturnId);

  // Available forms in this return
  const formNames = Array.from(new Set(returnFields.map((f) => f.formCode)));

  // Filtered fields
  const filteredFields = returnFields.filter((f) => {
    const matchesTab = activeFormTab === 'all' || f.formCode === activeFormTab;
    const matchesState = filterState === 'all' || f.state === filterState;
    return matchesTab && matchesState;
  });

  // Group fields by financial category
  const categoryGroups: { [key: string]: ReturnField[] } = {
    'Income & Gross Receipts': filteredFields.filter(
      (f) => f.category === 'income' || (!f.category && f.lineNumber.startsWith('1'))
    ),
    'Adjustments & Deductions': filteredFields.filter(
      (f) => f.category === 'deductions' || f.lineNumber.startsWith('10') || f.lineNumber.startsWith('12')
    ),
    'Tax Liability & Payments': filteredFields.filter(
      (f) => f.category === 'taxes' || f.category === 'credits' || f.lineNumber.startsWith('2')
    ),
    'Summary & Amount Owed / Refund': filteredFields.filter(
      (f) => f.category === 'summary' || f.lineNumber.startsWith('3')
    ),
    'Other Schedule Line Items': filteredFields.filter(
      (f) =>
        f.category === 'business_expenses' ||
        (!['income', 'deductions', 'taxes', 'credits', 'summary'].includes(f.category || '') &&
          !f.lineNumber.startsWith('1') &&
          !f.lineNumber.startsWith('2') &&
          !f.lineNumber.startsWith('3'))
    ),
  };

  // Auto-scroll to active field when selection changes
  useEffect(() => {
    if (activeFieldId && activeRowRef.current) {
      activeRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activeFieldId]);

  // Batch verify all AI-extracted fields with confidence >= 90%
  const handleVerifyAllHighConfidence = () => {
    returnFields
      .filter((f) => f.state === 'ai_extracted' && (f.aiConfidence || 0) >= 90)
      .forEach((f) => verifyField(f.id));
  };

  const handleOpenDoc = (fieldId: string, docId?: string) => {
    setHoveredDocInfo(null);
    selectField(fieldId);
    if (onOpenInspection) {
      onOpenInspection(fieldId, 'document', docId);
    }
  };

  const handleOpenExplainability = (fieldId: string) => {
    setHoveredDocInfo(null);
    selectField(fieldId);
    if (onOpenInspection) {
      onOpenInspection(fieldId, 'explainability');
    }
  };

  const highConfidenceCount = returnFields.filter(
    (f) => f.state === 'ai_extracted' && (f.aiConfidence || 0) >= 90
  ).length;

  const isReviewerOrPreparer =
    currentUser.role === 'tax_reviewer' || currentUser.role === 'tax_preparer';

  // Helper to format source doc label: strictly document type name only (e.g. W-2, 1099-DIV)
  const getSourceDocLabel = (field: ReturnField) => {
    if (field.sourceDocumentIds && field.sourceDocumentIds.length > 0) {
      const linkedDocs = documents.filter((d) => field.sourceDocumentIds.includes(d.id));
      if (linkedDocs.length === 1) {
        const doc = linkedDocs[0];
        return doc.docType.replace('_', '-');
      }
      return `${linkedDocs.length}x ${linkedDocs[0].docType.replace('_', '-')}`;
    }
    if (field.formula) return 'Formula';
    if (field.state === 'user_edited') return 'Manual Entry';
    return '-';
  };

  // Helper to get first linked doc
  const getFirstLinkedDoc = (field: ReturnField): SourceDocument | undefined => {
    if (field.sourceDocumentIds && field.sourceDocumentIds.length > 0) {
      return documents.find((d) => d.id === field.sourceDocumentIds[0]);
    }
    return undefined;
  };

  // Handle doc mouse enter with viewport-safe fixed positioning
  const handleDocMouseEnter = (
    field: ReturnField,
    doc: SourceDocument,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const placement = spaceBelow < 180 ? 'top' : 'bottom';
    const y = placement === 'top' ? rect.top - 8 : rect.bottom + 8;
    const x = Math.min(Math.max(rect.left + rect.width / 2, 140), window.innerWidth - 140);
    setHoveredDocInfo({
      fieldId: field.id,
      doc,
      x,
      y,
      placement,
    });
  };

  const handleDocMouseLeave = () => {
    setHoveredDocInfo(null);
  };

  // Render separate affordance badge: clicking opens AI Explainability tab directly
  const renderAffordanceBadge = (field: ReturnField) => {
    switch (field.state) {
      case 'ai_extracted':
        return (
          <button
            type="button"
            onClick={() => handleOpenExplainability(field.id)}
            className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-purple-100 hover:bg-purple-200 dark:bg-purple-950/60 dark:hover:bg-purple-900/80 border border-purple-300 dark:border-purple-700 text-purple-950 dark:text-purple-200 text-[11px] font-semibold font-mono transition-colors cursor-pointer"
            title="Click to view AI Explainability in drawer"
          >
            <Sparkles className="h-3 w-3 text-purple-700 dark:text-purple-400 shrink-0" />
            <span>AI Extracted</span>
            {field.aiConfidence ? (
              <span className="text-[10px] bg-purple-200 dark:bg-purple-900/70 text-purple-900 dark:text-purple-200 px-1 py-0 font-bold ml-0.5">
                {Math.round(field.aiConfidence > 1 ? field.aiConfidence : field.aiConfidence * 100)}%
              </span>
            ) : null}
          </button>
        );

      case 'verified':
        return (
          <button
            type="button"
            onClick={() => handleOpenExplainability(field.id)}
            className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 border border-emerald-300 dark:border-emerald-700 text-emerald-950 dark:text-emerald-200 text-[11px] font-semibold font-mono transition-colors cursor-pointer"
            title="Click to view verification audit trail"
          >
            <ShieldCheck className="h-3 w-3 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <span>Verified (Locked)</span>
          </button>
        );

      case 'user_edited':
        return (
          <button
            type="button"
            onClick={() => handleOpenExplainability(field.id)}
            className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 dark:hover:bg-amber-900/80 border border-amber-400 dark:border-amber-700 text-amber-950 dark:text-amber-200 text-[11px] font-semibold font-mono transition-colors cursor-pointer"
            title="Click to view manual edit audit history"
          >
            <Edit3 className="h-3 w-3 text-amber-800 dark:text-amber-400 shrink-0" />
            <span>Manual Edit</span>
          </button>
        );

      case 'calculated_locked':
        return (
          <button
            type="button"
            onClick={() => handleOpenExplainability(field.id)}
            className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-[11px] font-semibold font-mono transition-colors cursor-pointer"
            title="Click to view formula calculation breakdown"
          >
            <Lock className="h-3 w-3 text-slate-600 dark:text-slate-400 shrink-0" />
            <span>Calculated</span>
          </button>
        );

      case 'requires_approval':
        return (
          <button
            type="button"
            onClick={() => handleOpenExplainability(field.id)}
            className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/60 dark:hover:bg-rose-900/80 border border-rose-300 dark:border-rose-700 text-rose-950 dark:text-rose-200 text-[11px] font-semibold font-mono animate-pulse transition-colors cursor-pointer"
            title="Click to view QA discrepancy details"
          >
            <AlertTriangle className="h-3 w-3 text-rose-700 dark:text-rose-400 shrink-0" />
            <span>Needs QA</span>
          </button>
        );

      default:
        return <span className="text-muted-foreground text-xs">-</span>;
    }
  };

  return (
    <div className={`flex flex-col border border-border bg-card shadow-xs select-text ${className}`}>
      {/* Form Navigation & Batch Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/20 p-3">
        {/* Form Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveFormTab('all')}
            className={`h-7 px-2.5 text-xs font-semibold border ${
              activeFormTab === 'all'
                ? 'bg-card text-foreground border-border shadow-2xs font-bold'
                : 'text-muted-foreground border-transparent hover:border-border'
            }`}
          >
            <FileSpreadsheet className="h-3.5 w-3.5 mr-1" />
            All Schedules ({returnFields.length})
          </Button>

          {formNames.map((form) => {
            const count = returnFields.filter((f) => f.formCode === form).length;
            return (
              <Button
                key={form}
                variant="ghost"
                size="sm"
                onClick={() => setActiveFormTab(form)}
                className={`h-7 px-2.5 text-xs font-medium border ${
                  activeFormTab === form
                    ? 'bg-card text-foreground border-border shadow-2xs font-bold'
                    : 'text-muted-foreground border-transparent hover:border-border'
                }`}
              >
                {form} ({count})
              </Button>
            );
          })}
        </div>

        {/* Action Controls & Affordance Filters */}
        <div className="flex items-center gap-2">
          {isReviewerOrPreparer && highConfidenceCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleVerifyAllHighConfidence}
              className="h-7 text-xs gap-1.5 border-emerald-600/40 text-emerald-700 hover:bg-emerald-50 bg-emerald-50/40 font-semibold"
            >
              <CheckCheck className="h-3.5 w-3.5 text-emerald-600" />
              Verify High Confidence ({highConfidenceCount})
            </Button>
          )}

          {/* Quick Filter */}
          <div className="flex items-center gap-1 border border-border bg-card p-0.5 text-xs">
            <Filter className="h-3 w-3 text-muted-foreground ml-1.5" />
            <select
              aria-label="Filter by affordance state"
              value={filterState}
              onChange={(e) => setFilterState(e.target.value as AffordanceState | 'all')}
              className="h-6 bg-transparent border-0 text-xs font-medium text-foreground focus:outline-none cursor-pointer pr-2"
            >
              <option value="all">All States</option>
              <option value="ai_extracted">AI-Extracted Only</option>
              <option value="verified">Verified Only</option>
              <option value="user_edited">User-Edited Only</option>
              <option value="calculated_locked">Calculated Only</option>
              <option value="requires_approval">Needs QA Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Horizontal Scroll Safe Data Table */}
      <div className="overflow-x-auto min-w-full">
        <table className="w-full text-left border-collapse min-w-[720px]">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <th className="py-2.5 px-3 w-16 whitespace-nowrap">Line #</th>
              <th className="py-2.5 px-3 min-w-[220px]">Description / Line Item</th>
              <th className="py-2.5 px-3 w-28">Schedule</th>
              <th className="py-2.5 px-3 w-40 text-right whitespace-nowrap">Value</th>
              <th className="py-2.5 px-3 w-44">Affordance</th>
              <th className="py-2.5 px-3 w-32 text-center whitespace-nowrap">Source Doc</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-xs font-sans">
            {filteredFields.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-6 w-6 mx-auto mb-2 opacity-50" />
                  No line items found for the selected filter.
                </td>
              </tr>
            ) : (
              Object.entries(categoryGroups).map(([groupTitle, groupFields]) => {
                if (groupFields.length === 0) return null;

                return (
                  <React.Fragment key={groupTitle}>
                    {/* Category Group Header */}
                    <tr className="bg-muted/60 border-y border-border">
                      <td colSpan={6} className="py-1.5 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {groupTitle} ({groupFields.length})
                      </td>
                    </tr>

                    {/* Group Items */}
                    {groupFields.map((field) => {
                      const isSelected = activeFieldId === field.id;
                      const hasDocs = field.sourceDocumentIds && field.sourceDocumentIds.length > 0;
                      const cleanLineNumber = field.lineNumber
                        ? field.lineNumber.replace(/^Line\s*/i, '')
                        : '-';
                      const docLabel = getSourceDocLabel(field);
                      const firstDoc = getFirstLinkedDoc(field);

                      const formattedDisplayValue =
                        field.formattedValue ||
                        (typeof field.value === 'number'
                          ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(field.value)
                          : String(field.value ?? '-'));

                      return (
                        <tr
                          key={field.id}
                          ref={isSelected ? activeRowRef : null}
                          className="transition-colors hover:bg-muted/30"
                        >
                          {/* Line Number */}
                          <td className="py-2 px-3 font-mono font-bold text-foreground whitespace-nowrap select-text cursor-text">
                            {cleanLineNumber}
                          </td>

                          {/* Field Description */}
                          <td className="py-2 px-3 text-foreground select-text cursor-text">
                            <div className="flex items-center gap-1.5">
                              <span className="truncate max-w-sm">{field.label}</span>
                              {field.formula && (
                                <span
                                  className="text-muted-foreground hover:text-foreground shrink-0 cursor-help"
                                  title={`Calculation Formula: ${field.formula}`}
                                >
                                  <HelpCircle className="h-3 w-3" />
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Schedule Badge */}
                          <td className="py-2 px-3">
                            <Badge variant="outline" className="font-mono text-[10px] bg-muted/20 whitespace-nowrap">
                              {field.formCode}
                            </Badge>
                          </td>

                          {/* Separate Column: Value (Mouse Selectable) */}
                          <td className="py-2 px-3 text-right font-mono font-bold text-xs text-foreground select-text cursor-text whitespace-nowrap">
                            {formattedDisplayValue}
                          </td>

                          {/* Separate Column: Affordance Badge (Opens AI Explainability tab) */}
                          <td className="py-1.5 px-3 whitespace-nowrap">
                            {renderAffordanceBadge(field)}
                          </td>

                          {/* Source Document Button (Opens Source Document tab) */}
                          <td className="py-2 px-3 text-center whitespace-nowrap">
                            {hasDocs && firstDoc ? (
                              <button
                                type="button"
                                onClick={() => handleOpenDoc(field.id, firstDoc.id)}
                                onMouseEnter={(e) => handleDocMouseEnter(field, firstDoc, e)}
                                onMouseLeave={handleDocMouseLeave}
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 border border-purple-300 bg-purple-100 hover:bg-purple-200 dark:bg-purple-950/60 dark:hover:bg-purple-900/80 text-purple-950 dark:text-purple-200 text-[10px] font-mono font-bold transition-colors cursor-pointer"
                                title="Click to view this source document in drawer"
                              >
                                <FileText className="h-3 w-3 text-purple-700 dark:text-purple-400" />
                                <span>{docLabel}</span>
                              </button>
                            ) : field.formula ? (
                              <button
                                type="button"
                                onClick={() => handleOpenExplainability(field.id)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 border border-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-[10px] font-mono font-semibold transition-colors cursor-pointer"
                                title="Click to inspect formula calculation tree"
                              >
                                <span>Formula</span>
                              </button>
                            ) : (
                              <span className="text-[10px] text-muted-foreground font-mono">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Viewport-Safe Floating Hover Card */}
      {hoveredDocInfo && (
        <div
          style={{
            position: 'fixed',
            left: `${hoveredDocInfo.x}px`,
            top: `${hoveredDocInfo.y}px`,
            transform:
              hoveredDocInfo.placement === 'top'
                ? 'translate(-50%, -100%)'
                : 'translate(-50%, 0)',
          }}
          className="z-50 w-64 p-3 bg-card text-card-foreground shadow-2xl border border-border text-xs font-sans text-left pointer-events-none animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="flex items-center gap-1.5 pb-1.5 border-b border-border">
            <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="font-bold truncate text-foreground">{hoveredDocInfo.doc.fileName}</span>
          </div>
          <div className="space-y-1 pt-1.5 text-[11px] text-muted-foreground font-mono">
            <p>
              <span className="text-muted-foreground font-sans">Payer:</span>{' '}
              <strong className="text-foreground">{hoveredDocInfo.doc.vendor || 'Stark Industries Inc.'}</strong>
            </p>
            <p>
              <span className="text-muted-foreground font-sans">Source:</span>{' '}
              <strong className="text-foreground">
                {hoveredDocInfo.doc.docType} (Page 1)
              </strong>
            </p>
            <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 font-bold pt-1 border-t border-border">
              <span>OCR Match: 98%</span>
              <span className="text-[10px] text-primary font-sans font-semibold">Click to view ➔</span>
            </div>
          </div>
        </div>
      )}

      {/* Table Footer Summary */}
      <div className="border-t border-border bg-muted/20 p-2.5 text-xs text-muted-foreground font-mono flex items-center justify-between">
        <span>Showing {filteredFields.length} schedule lines across {Object.keys(categoryGroups).length} categories</span>
      </div>
    </div>
  );
};

