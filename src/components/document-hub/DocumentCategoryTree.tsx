import React, { useState } from 'react';
import { SourceDocument, DocumentType } from '@/types';
import { Badge } from '@/components/ui/badge';
import {
  FolderOpen,
  ChevronDown,
  ChevronRight,
  FileText,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Tag,
} from 'lucide-react';

export interface CategoryTreeSelection {
  type: 'all' | 'category' | 'docType' | 'status';
  value: string;
}

interface DocumentCategoryTreeProps {
  documents: SourceDocument[];
  selectedSelection: CategoryTreeSelection;
  onSelect: (selection: CategoryTreeSelection) => void;
  className?: string;
}

export const DocumentCategoryTree: React.FC<DocumentCategoryTreeProps> = ({
  documents,
  selectedSelection,
  onSelect,
  className = '',
}) => {
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    categories: true,
    docTypes: true,
    statuses: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Group by extracted category or general category
  const categoryCounts: { [cat: string]: { count: number; totalAmount: number } } = {};
  const docTypeCounts: { [type in DocumentType]?: { count: number; totalAmount: number } } = {};
  const statusCounts: { [status: string]: { count: number; totalAmount: number } } = {};

  let totalAmount = 0;

  documents.forEach((doc) => {
    const amt = doc.amount || 0;
    totalAmount += amt;

    // By category
    const cat = (doc.extractedFields?.expenseCategory as string) || doc.category || 'other';
    if (!categoryCounts[cat]) categoryCounts[cat] = { count: 0, totalAmount: 0 };
    categoryCounts[cat].count++;
    categoryCounts[cat].totalAmount += amt;

    // By docType
    if (!docTypeCounts[doc.docType]) docTypeCounts[doc.docType] = { count: 0, totalAmount: 0 };
    docTypeCounts[doc.docType]!.count++;
    docTypeCounts[doc.docType]!.totalAmount += amt;

    // By status
    if (!statusCounts[doc.status]) statusCounts[doc.status] = { count: 0, totalAmount: 0 };
    statusCounts[doc.status].count++;
    statusCounts[doc.status].totalAmount += amt;
  });

  const formatCurrency = (val: number) => {
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}k`;
    return `$${val.toLocaleString()}`;
  };

  return (
    <div className={`flex flex-col border border-border bg-card shadow-2xs text-xs select-none ${className}`}>
      {/* Sidebar Header */}
      <div className="p-3 border-b border-border bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          <span className="font-bold text-foreground">Document Hierarchy</span>
        </div>
        <Badge variant="outline" className="font-mono text-[10px] py-0 bg-background">
          {documents.length} Files
        </Badge>
      </div>

      <div className="p-2 space-y-1 overflow-y-auto max-h-[600px]">
        {/* All Documents Root Item */}
        <button
          type="button"
          onClick={() => onSelect({ type: 'all', value: 'all' })}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 border text-left transition-all ${
            selectedSelection.type === 'all'
              ? 'bg-primary/10 border-primary/40 text-primary font-bold shadow-2xs'
              : 'border-transparent text-foreground hover:bg-muted/40'
          }`}
        >
          <div className="flex items-center gap-2">
            <FolderOpen className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate">All Ingested Workpapers</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-[10px]">
            <span className="text-muted-foreground">{documents.length}</span>
            <span className="text-foreground/80 font-bold">({formatCurrency(totalAmount)})</span>
          </div>
        </button>

        {/* Section 1: Expense Categories */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => toggleSection('categories')}
            className="w-full flex items-center justify-between px-1.5 py-1 text-[10px] uppercase font-bold text-muted-foreground hover:text-foreground tracking-wider"
          >
            <div className="flex items-center gap-1">
              {expandedSections.categories ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
              <span>Expense Categories</span>
            </div>
            <span>{Object.keys(categoryCounts).length}</span>
          </button>

          {expandedSections.categories && (
            <div className="pl-2.5 pt-1 space-y-0.5 border-l border-border/80 ml-2 mt-0.5">
              {Object.entries(categoryCounts)
                .sort((a, b) => b[1].count - a[1].count)
                .map(([cat, info]) => {
                  const isSelected =
                    selectedSelection.type === 'category' && selectedSelection.value === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => onSelect({ type: 'category', value: cat })}
                      className={`w-full flex items-center justify-between px-2 py-1 border text-left transition-all ${
                        isSelected
                          ? 'bg-primary/10 border-primary/40 text-primary font-bold shadow-2xs'
                          : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <Tag className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="truncate capitalize">{cat.replace(/_/g, ' ')}</span>
                      </div>
                      <div className="flex items-center gap-1 font-mono text-[10px] shrink-0 ml-1">
                        <span className="text-muted-foreground">{info.count}</span>
                        <span className="text-foreground/80 font-semibold">{formatCurrency(info.totalAmount)}</span>
                      </div>
                    </button>
                  );
                })}
            </div>
          )}
        </div>

        {/* Section 2: Document Types */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => toggleSection('docTypes')}
            className="w-full flex items-center justify-between px-1.5 py-1 text-[10px] uppercase font-bold text-muted-foreground hover:text-foreground tracking-wider"
          >
            <div className="flex items-center gap-1">
              {expandedSections.docTypes ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
              <span>Document Types</span>
            </div>
            <span>{Object.keys(docTypeCounts).length}</span>
          </button>

          {expandedSections.docTypes && (
            <div className="pl-2.5 pt-1 space-y-0.5 border-l border-border/80 ml-2 mt-0.5">
              {Object.entries(docTypeCounts)
                .sort((a, b) => b[1].count - a[1].count)
                .map(([type, info]) => {
                  const isSelected =
                    selectedSelection.type === 'docType' && selectedSelection.value === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => onSelect({ type: 'docType', value: type })}
                      className={`w-full flex items-center justify-between px-2 py-1 border text-left transition-all ${
                        isSelected
                          ? 'bg-primary/10 border-primary/40 text-primary font-bold shadow-2xs'
                          : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <FileText className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="truncate">{type.replace(/_/g, '-')}</span>
                      </div>
                      <div className="flex items-center gap-1 font-mono text-[10px] shrink-0 ml-1">
                        <span className="text-muted-foreground">{info.count}</span>
                        <span className="text-foreground/80 font-semibold">{formatCurrency(info.totalAmount)}</span>
                      </div>
                    </button>
                  );
                })}
            </div>
          )}
        </div>

        {/* Section 3: Review Status */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => toggleSection('statuses')}
            className="w-full flex items-center justify-between px-1.5 py-1 text-[10px] uppercase font-bold text-muted-foreground hover:text-foreground tracking-wider"
          >
            <div className="flex items-center gap-1">
              {expandedSections.statuses ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
              <span>Ingestion Status</span>
            </div>
            <span>{Object.keys(statusCounts).length}</span>
          </button>

          {expandedSections.statuses && (
            <div className="pl-2.5 pt-1 space-y-0.5 border-l border-border/80 ml-2 mt-0.5">
              {Object.entries(statusCounts).map(([status, info]) => {
                const isSelected =
                  selectedSelection.type === 'status' && selectedSelection.value === status;
                const isNeedsReview = status === 'needs_review';
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => onSelect({ type: 'status', value: status })}
                    className={`w-full flex items-center justify-between px-2 py-1 border text-left transition-all ${
                      isSelected
                        ? 'bg-primary/10 border-primary/40 text-primary font-bold shadow-2xs'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      {isNeedsReview ? (
                        <AlertTriangle className="h-3 w-3 text-rose-600 dark:text-rose-400 shrink-0" />
                      ) : (
                        <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      )}
                      <span className="truncate capitalize">{status.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="flex items-center gap-1 font-mono text-[10px] shrink-0 ml-1">
                      <span className="text-muted-foreground">{info.count}</span>
                      <span className="text-foreground/80 font-semibold">{formatCurrency(info.totalAmount)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
