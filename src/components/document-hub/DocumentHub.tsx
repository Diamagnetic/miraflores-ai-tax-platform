import React, { useState, useMemo } from 'react';
import { SourceDocument, TaxReturn } from '@/types';
import { usePlatformStore } from '@/store/usePlatformStore';
import { DocumentCategoryTree, CategoryTreeSelection } from './DocumentCategoryTree';
import { DocumentFilters, DocumentFilterCriteria, INITIAL_DOC_FILTERS } from './DocumentFilters';
import { DocumentListGrid } from './DocumentListGrid';
import {
  Layers,
  Sparkles,
  AlertTriangle,
  Receipt,
} from 'lucide-react';

interface DocumentHubProps {
  activeReturn?: TaxReturn;
  onOpenDocument?: (doc: SourceDocument) => void;
  className?: string;
}

export const DocumentHub: React.FC<DocumentHubProps> = ({
  activeReturn,
  onOpenDocument,
  className = '',
}) => {
  const { documents, selectedReturnId, returns, batchVerifyDocuments } = usePlatformStore();

  const currentReturn =
    activeReturn || returns.find((r) => r.id === selectedReturnId) || returns[0];

  // All documents belonging to this return
  const returnDocs = useMemo(() => {
    return documents.filter((d) => d.returnId === currentReturn?.id);
  }, [documents, currentReturn]);

  // State management
  const [treeSelection, setTreeSelection] = useState<CategoryTreeSelection>({
    type: 'all',
    value: 'all',
  });
  const [filters, setFilters] = useState<DocumentFilterCriteria>(INITIAL_DOC_FILTERS);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);

  // Collect all available categories for dropdown
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    returnDocs.forEach((d) => {
      const c = (d.extractedFields?.expenseCategory as string) || d.category;
      if (c) cats.add(c);
    });
    return Array.from(cats).sort();
  }, [returnDocs]);

  // Filter pipeline
  const filteredDocuments = useMemo(() => {
    return returnDocs.filter((doc) => {
        // 1. Sidebar Tree Selection
      if (treeSelection.type === 'category') {
        const cat = (doc.extractedFields?.expenseCategory as string) || doc.category;
        if (cat !== treeSelection.value) return false;
      } else if (treeSelection.type === 'docType') {
        if (doc.docType !== treeSelection.value) return false;
      } else if (treeSelection.type === 'status') {
        if (doc.status !== treeSelection.value) return false;
      }

      // 2. Search Query (Vendor, filename, invoice number, amount, raw text)
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const vendor = (doc.vendor || '').toLowerCase();
        const filename = (doc.fileName || '').toLowerCase();
        const invoiceNum = String(doc.extractedFields?.invoiceNumber || '').toLowerCase();
        const rawText = (doc.rawTextPreview || '').toLowerCase();
        const amountStr = String(doc.amount || '');

        const matchesQuery =
          vendor.includes(q) ||
          filename.includes(q) ||
          invoiceNum.includes(q) ||
          rawText.includes(q) ||
          amountStr.includes(q);

        if (!matchesQuery) return false;
      }

      // 3. Doc Type Filter
      if (filters.docType !== 'all' && doc.docType !== filters.docType) {
        return false;
      }

      // 4. Category Filter
      if (filters.category !== 'all') {
        const cat = (doc.extractedFields?.expenseCategory as string) || doc.category;
        if (cat !== filters.category) return false;
      }

      // 5. Amount Range
      if (filters.amountRange !== 'all') {
        const amt = doc.amount || 0;
        if (filters.amountRange === 'under_1k' && amt >= 1000) return false;
        if (filters.amountRange === '1k_to_5k' && (amt < 1000 || amt > 5000)) return false;
        if (filters.amountRange === 'over_5k' && amt <= 5000) return false;
        if (filters.amountRange === 'over_10k' && amt <= 10000) return false;
      }

      // 6. AI Confidence Filter
      if (filters.confidence !== 'all') {
        const avgConf =
          doc.boundingBoxes.length > 0
            ? doc.boundingBoxes.reduce((acc, b) => acc + b.confidence, 0) / doc.boundingBoxes.length
            : 0.98;
        if (filters.confidence === 'high' && avgConf < 0.9) return false;
        if (filters.confidence === 'needs_qa' && avgConf >= 0.9) return false;
      }

      // 7. Status Filter
      if (filters.status !== 'all' && doc.status !== filters.status) {
        return false;
      }

      return true;
    });
  }, [returnDocs, treeSelection, filters]);

  // Statistics
  const totalMatchAmount = useMemo(() => {
    return filteredDocuments.reduce((sum, d) => sum + (d.amount || 0), 0);
  }, [filteredDocuments]);

  const totalReturnExpenses = useMemo(() => {
    return returnDocs.reduce((sum, d) => sum + (d.amount || 0), 0);
  }, [returnDocs]);

  const highConfidenceCount = useMemo(() => {
    return returnDocs.filter((d) => {
      const avg =
        d.boundingBoxes.length > 0
          ? d.boundingBoxes.reduce((acc, b) => acc + b.confidence, 0) / d.boundingBoxes.length
          : 0.98;
      return avg >= 0.9;
    }).length;
  }, [returnDocs]);

  const needsReviewCount = useMemo(() => {
    return returnDocs.filter((d) => d.status === 'needs_review').length;
  }, [returnDocs]);

  // Selection handlers
  const handleToggleSelectDoc = (docId: string) => {
    setSelectedDocIds((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  };

  const handleToggleSelectAll = (filteredIds: string[]) => {
    const allSelected = filteredIds.every((id) => selectedDocIds.includes(id));
    if (allSelected) {
      setSelectedDocIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      setSelectedDocIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const handleBatchVerify = (docIds: string[]) => {
    batchVerifyDocuments(docIds);
    setSelectedDocIds([]);
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_DOC_FILTERS);
    setTreeSelection({ type: 'all', value: 'all' });
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className={`space-y-3.5 ${className}`}>
      {/* Top Metrics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Ingested */}
        <div className="bg-card border border-border p-3 flex items-center gap-3 shadow-2xs">
          <div className="p-2 bg-primary/10 text-primary shrink-0">
            <Layers className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              Ingested Workpapers
            </span>
            <span className="text-base font-bold font-mono text-foreground">
              {returnDocs.length} Documents
            </span>
          </div>
        </div>

        {/* Total Ledger Value */}
        <div className="bg-card border border-border p-3 flex items-center gap-3 shadow-2xs">
          <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
            <Receipt className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              Total Ledger Value
            </span>
            <span className="text-base font-bold font-mono text-foreground">
              {formatCurrency(totalReturnExpenses)}
            </span>
          </div>
        </div>

        {/* AI Confidence */}
        <div className="bg-card border border-border p-3 flex items-center gap-3 shadow-2xs">
          <div className="p-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              High Confidence OCR
            </span>
            <span className="text-base font-bold font-mono text-foreground">
              {highConfidenceCount} / {returnDocs.length} ({Math.round((highConfidenceCount / Math.max(1, returnDocs.length)) * 100)}%)
            </span>
          </div>
        </div>

        {/* QA Review Flagged */}
        <div className="bg-card border border-border p-3 flex items-center gap-3 shadow-2xs">
          <div className="p-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 shrink-0">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              QA Flags &amp; Variance
            </span>
            <span className="text-base font-bold font-mono text-rose-600 dark:text-rose-400">
              {needsReviewCount} Receipts
            </span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3.5 items-start">
        {/* Left Sidebar: Document Category Hierarchy Tree */}
        <div className="lg:col-span-1">
          <DocumentCategoryTree
            documents={returnDocs}
            selectedSelection={treeSelection}
            onSelect={(sel) => setTreeSelection(sel)}
          />
        </div>

        {/* Right Area: Filters + Scalable Data Grid */}
        <div className="lg:col-span-3 space-y-3">
          {/* Multi-Faceted Filter Bar */}
          <DocumentFilters
            filters={filters}
            onFilterChange={(f) => setFilters(f)}
            onResetFilters={handleResetFilters}
            totalMatchCount={filteredDocuments.length}
            totalDocumentCount={returnDocs.length}
            totalMatchAmount={totalMatchAmount}
            availableCategories={availableCategories}
          />

          {/* Scalable Document List Grid */}
          <DocumentListGrid
            documents={filteredDocuments}
            selectedDocIds={selectedDocIds}
            onToggleSelectDoc={handleToggleSelectDoc}
            onToggleSelectAll={handleToggleSelectAll}
            onOpenDocument={(doc) => onOpenDocument?.(doc)}
            onBatchVerify={handleBatchVerify}
          />
        </div>
      </div>
    </div>
  );
};
