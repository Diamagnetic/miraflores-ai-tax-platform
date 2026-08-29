import React, { useState } from 'react';
import { AffordanceState } from '@/types';
import { usePlatformStore } from '@/store/usePlatformStore';
import { AffordanceCell } from './AffordanceCell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileSpreadsheet,
  CheckCheck,
  Eye,
  ShieldCheck,
  Filter,
  FileText,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface TaxFormViewerProps {
  className?: string;
}

export const TaxFormViewer: React.FC<TaxFormViewerProps> = ({
  className = '',
}) => {
  const {
    fields,
    selectedReturnId,
    activeFieldId,
    selectField,
    verifyField,
    currentUser,
  } = usePlatformStore();

  const [activeFormTab, setActiveFormTab] = useState<string>('all');
  const [filterState, setFilterState] = useState<AffordanceState | 'all'>('all');

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

  // Batch verify all AI-extracted fields with confidence >= 90%
  const handleVerifyAllHighConfidence = () => {
    returnFields
      .filter((f) => f.state === 'ai_extracted' && (f.aiConfidence || 0) >= 90)
      .forEach((f) => verifyField(f.id));
  };

  const highConfidenceCount = returnFields.filter(
    (f) => f.state === 'ai_extracted' && (f.aiConfidence || 0) >= 90
  ).length;

  const isReviewerOrPreparer =
    currentUser.role === 'tax_reviewer' || currentUser.role === 'tax_preparer';

  return (
    <div className={`flex flex-col border border-border bg-card shadow-xs ${className}`}>
      {/* Form Navigation & Batch Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/30 p-3">
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
        <table className="w-full text-left border-collapse min-w-[850px]">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <th className="py-2.5 px-3 w-20">Line #</th>
              <th className="py-2.5 px-3">Description / Field Name</th>
              <th className="py-2.5 px-3 w-36">Schedule</th>
              <th className="py-2.5 px-3 w-48">Value & Affordance</th>
              <th className="py-2.5 px-3 w-36 text-center">Source Provenance</th>
              <th className="py-2.5 px-3 w-28 text-right">Actions</th>
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
              filteredFields.map((field) => {
                const isSelected = activeFieldId === field.id;
                const hasDocs = field.sourceDocumentIds && field.sourceDocumentIds.length > 0;

                return (
                  <tr
                    key={field.id}
                    onClick={() => selectField(field.id)}
                    className={`transition-colors cursor-pointer hover:bg-muted/30 ${
                      isSelected ? 'bg-primary/5 font-medium' : ''
                    }`}
                  >
                    {/* Line Number */}
                    <td className="py-2.5 px-3 font-mono font-bold text-foreground">
                      {field.lineNumber || '—'}
                    </td>

                    {/* Field Description */}
                    <td className="py-2.5 px-3 text-foreground">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate max-w-sm">{field.label}</span>
                        {field.formula && (
                          <span
                            className="text-muted-foreground hover:text-foreground"
                            title={`Calculation Formula: ${field.formula}`}
                          >
                            <HelpCircle className="h-3 w-3" />
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Schedule Badge */}
                    <td className="py-2.5 px-3">
                      <Badge variant="outline" className="font-mono text-[11px] bg-muted/20">
                        {field.formCode}
                      </Badge>
                    </td>

                    {/* 5-State Affordance Cell */}
                    <td className="py-2 px-3">
                      <AffordanceCell
                        field={field}
                        isSelected={isSelected}
                        onClick={() => selectField(field.id)}
                      />
                    </td>

                    {/* Source Document Provenance */}
                    <td className="py-2.5 px-3 text-center">
                      {hasDocs ? (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 border border-purple-200 bg-purple-50 text-purple-800 text-[11px] font-mono font-semibold"
                          title={`Tied to ${field.sourceDocumentIds.length} source document(s)`}
                        >
                          <FileText className="h-3 w-3 text-purple-600" />
                          {field.sourceDocumentIds.length} Source {field.sourceDocumentIds.length > 1 ? 'Docs' : 'Doc'}
                        </span>
                      ) : field.formula ? (
                        <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5">
                          Calculated
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">—</span>
                      )}
                    </td>

                    {/* Quick Actions */}
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            selectField(field.id);
                          }}
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                          title="Inspect AI Explainability & Source Document"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>

                        {field.state === 'ai_extracted' && isReviewerOrPreparer && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              verifyField(field.id);
                            }}
                            className="h-6 w-6 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                            title="1-Click Verify"
                          >
                            <ShieldCheck className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer Summary */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-muted/20 p-2.5 text-xs text-muted-foreground font-mono">
        <span>Showing {filteredFields.length} of {returnFields.length} schedule lines</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 bg-purple-500 inline-block" /> AI-Extracted
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 bg-emerald-500 inline-block" /> Verified
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 bg-sky-500 inline-block" /> Manual Edit
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 bg-slate-400 inline-block" /> Formula Locked
          </span>
        </div>
      </div>
    </div>
  );
};
