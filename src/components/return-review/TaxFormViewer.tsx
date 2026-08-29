import React, { useState, useEffect, useRef } from 'react';
import { ReturnField, AffordanceState, SourceDocument } from '@/types';
import { usePlatformStore } from '@/store/usePlatformStore';
import { AffordanceCell } from './AffordanceCell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileSpreadsheet,
  CheckCheck,
  Eye,
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
  onOpenInspection?: (fieldId: string) => void;
  className?: string;
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
  const [hoveredFieldId, setHoveredFieldId] = useState<string | null>(null);
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

  const handleRowClick = (fieldId: string) => {
    selectField(fieldId);
    if (onOpenInspection) {
      onOpenInspection(fieldId);
    }
  };

  const highConfidenceCount = returnFields.filter(
    (f) => f.state === 'ai_extracted' && (f.aiConfidence || 0) >= 90
  ).length;

  const isReviewerOrPreparer =
    currentUser.role === 'tax_reviewer' || currentUser.role === 'tax_preparer';

  // Helper to format source doc label
  const getSourceDocLabel = (field: ReturnField) => {
    if (field.sourceDocumentIds && field.sourceDocumentIds.length > 0) {
      const linkedDocs = documents.filter((d) => field.sourceDocumentIds.includes(d.id));
      if (linkedDocs.length === 1) {
        const doc = linkedDocs[0];
        const typeName = doc.docType.replace('_', '-');
        const vendorShort = doc.vendor ? ` (${doc.vendor.split(' ')[0]})` : '';
        return `${typeName}${vendorShort}`;
      }
      return `${linkedDocs.length}x Source Docs`;
    }
    if (field.formula) return 'Formula';
    if (field.state === 'user_edited') return 'Manual Entry';
    return '—';
  };

  // Helper to get first linked doc
  const getFirstLinkedDoc = (field: ReturnField): SourceDocument | undefined => {
    if (field.sourceDocumentIds && field.sourceDocumentIds.length > 0) {
      return documents.find((d) => d.id === field.sourceDocumentIds[0]);
    }
    return undefined;
  };

  return (
    <div className={`flex flex-col border border-border bg-card shadow-xs ${className}`}>
      {/* Top Legend Bar: Clear 5-Color Semantic Tokens */}
      <div className="border-b border-border bg-muted/50 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-[11px]">
        <div className="flex items-center gap-1.5 text-muted-foreground font-semibold">
          <span>Field Legend:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* AI Extracted */}
          <div className="flex items-center gap-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-950/60 border border-purple-300 dark:border-purple-700 text-purple-950 dark:text-purple-200 font-semibold font-mono">
            <Sparkles className="h-3 w-3 text-purple-700 dark:text-purple-400" />
            <span>AI-Extracted</span>
          </div>

          {/* Verified */}
          <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-950 dark:text-emerald-200 font-semibold font-mono">
            <ShieldCheck className="h-3 w-3 text-emerald-700 dark:text-emerald-400" />
            <span>Verified (Locked)</span>
          </div>

          {/* Manual Edit - Distinct Amber */}
          <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-950/60 border border-amber-400 dark:border-amber-700 text-amber-950 dark:text-amber-200 font-semibold font-mono">
            <Edit3 className="h-3 w-3 text-amber-800 dark:text-amber-400" />
            <span>Manual Edit</span>
          </div>

          {/* Calculated */}
          <div className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold font-mono">
            <Lock className="h-3 w-3 text-slate-600 dark:text-slate-400" />
            <span>Calculated Formula</span>
          </div>

          {/* Needs QA */}
          <div className="flex items-center gap-1 px-2 py-0.5 bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-700 text-rose-950 dark:text-rose-200 font-semibold font-mono">
            <AlertTriangle className="h-3 w-3 text-rose-700 dark:text-rose-400" />
            <span>Needs QA / Approval</span>
          </div>
        </div>
      </div>

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

      {/* Horizontal Scroll Safe Data Table with Semantic Grouping */}
      <div className="overflow-x-auto min-w-full">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <th className="py-2.5 px-3 w-16 whitespace-nowrap">Line #</th>
              <th className="py-2.5 px-3 min-w-[200px]">Description / Line Item</th>
              <th className="py-2.5 px-3 w-28">Schedule</th>
              <th className="py-2.5 px-3 w-44">Value & Affordance</th>
              <th className="py-2.5 px-3 w-36 text-center">Source Provenance</th>
              <th className="py-2.5 px-3 w-24 text-right whitespace-nowrap">Action</th>
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
                        : '—';
                      const docLabel = getSourceDocLabel(field);
                      const firstDoc = getFirstLinkedDoc(field);
                      const isHovered = hoveredFieldId === field.id;

                      return (
                        <tr
                          key={field.id}
                          ref={isSelected ? activeRowRef : null}
                          onClick={() => handleRowClick(field.id)}
                          className="transition-colors cursor-pointer hover:bg-muted/30"
                        >
                          {/* Line Number without "Line" prefix */}
                          <td className="py-2 px-3 font-mono font-bold text-foreground whitespace-nowrap">
                            {cleanLineNumber}
                          </td>

                          {/* Field Description */}
                          <td className="py-2 px-3 text-foreground">
                            <div className="flex items-center gap-1.5">
                              <span className="truncate max-w-sm">{field.label}</span>
                              {field.formula && (
                                <span
                                  className="text-muted-foreground hover:text-foreground shrink-0"
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

                          {/* 5-State Affordance Cell */}
                          <td className="py-1.5 px-3">
                            <AffordanceCell
                              field={field}
                              isSelected={isSelected}
                              onClick={() => handleRowClick(field.id)}
                            />
                          </td>

                          {/* Source Document Provenance with Rich Hover Card */}
                          <td
                            className="py-2 px-3 text-center whitespace-nowrap relative"
                            onMouseEnter={() => setHoveredFieldId(field.id)}
                            onMouseLeave={() => setHoveredFieldId(null)}
                          >
                            {hasDocs ? (
                              <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 border border-purple-300 bg-purple-100 dark:bg-purple-950/60 text-purple-950 dark:text-purple-200 text-[10px] font-mono font-bold hover:bg-purple-200 transition-colors"
                              >
                                <FileText className="h-3 w-3 text-purple-700 dark:text-purple-400" />
                                <span>{docLabel}</span>
                              </span>
                            ) : field.formula ? (
                              <span className="text-[10px] font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 border border-slate-200">
                                Formula
                              </span>
                            ) : (
                              <span className="text-[10px] text-muted-foreground font-mono">—</span>
                            )}

                            {/* Hover Card Details */}
                            {isHovered && hasDocs && firstDoc && (
                              <div className="absolute z-40 bottom-full mb-1.5 left-1/2 -translate-x-1/2 w-64 p-3 bg-slate-900 text-white text-left shadow-xl border border-slate-700 text-xs font-sans pointer-events-none animate-in fade-in zoom-in-95 duration-100">
                                <div className="flex items-center gap-1.5 pb-1.5 border-b border-slate-800">
                                  <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
                                  <span className="font-bold truncate text-white">{firstDoc.fileName}</span>
                                </div>
                                <div className="space-y-1 pt-1.5 text-[11px] text-slate-300 font-mono">
                                  <p>
                                    <span className="text-slate-400">Payer:</span>{' '}
                                    <strong className="text-white">{firstDoc.vendor || 'Stark Industries Inc.'}</strong>
                                  </p>
                                  <p>
                                    <span className="text-slate-400">Source:</span>{' '}
                                    <strong className="text-white">
                                      {firstDoc.docType} (Page 1)
                                    </strong>
                                  </p>
                                  <p className="flex items-center justify-between text-emerald-400 font-bold pt-1 border-t border-slate-800">
                                    <span>OCR Match: 98%</span>
                                    <span className="text-[10px] text-primary">Click to view ➔</span>
                                  </p>
                                </div>
                              </div>
                            )}
                          </td>

                          {/* ONLY ONE ACTION: Review */}
                          <td className="py-2 px-3 text-right whitespace-nowrap">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRowClick(field.id);
                              }}
                              className={`h-6 px-2 text-[11px] gap-1 ${
                                isSelected
                                  ? 'bg-primary text-primary-foreground border-primary font-bold'
                                  : 'text-foreground hover:bg-muted/50 border-border'
                              }`}
                              title="Inspect AI Explainability & Source Document"
                            >
                              <Eye className="h-3 w-3" />
                              <span>Review</span>
                            </Button>
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

      {/* Table Footer Summary */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-muted/20 p-2.5 text-xs text-muted-foreground font-mono">
        <span>Showing {filteredFields.length} schedule lines across {Object.keys(categoryGroups).length} categories</span>
      </div>
    </div>
  );
};
