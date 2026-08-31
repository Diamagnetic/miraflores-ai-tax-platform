import React from 'react';
import { DocumentType } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  X,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';

export interface DocumentFilterCriteria {
  searchQuery: string;
  docType: DocumentType | 'all';
  category: string;
  amountRange: 'all' | 'under_1k' | '1k_to_5k' | 'over_5k' | 'over_10k';
  confidence: 'all' | 'high' | 'needs_qa';
  status: 'all' | 'processed' | 'needs_review';
}

export const INITIAL_DOC_FILTERS: DocumentFilterCriteria = {
  searchQuery: '',
  docType: 'all',
  category: 'all',
  amountRange: 'all',
  confidence: 'all',
  status: 'all',
};

interface DocumentFiltersProps {
  filters: DocumentFilterCriteria;
  onFilterChange: (filters: DocumentFilterCriteria) => void;
  onResetFilters: () => void;
  totalMatchCount: number;
  totalDocumentCount: number;
  totalMatchAmount: number;
  availableCategories: string[];
  className?: string;
}

export const DocumentFilters: React.FC<DocumentFiltersProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  totalMatchCount,
  totalDocumentCount,
  totalMatchAmount,
  availableCategories,
  className = '',
}) => {
  const isFiltered =
    filters.searchQuery.trim() !== '' ||
    filters.docType !== 'all' ||
    filters.category !== 'all' ||
    filters.amountRange !== 'all' ||
    filters.confidence !== 'all' ||
    filters.status !== 'all';

  const handleUpdate = (partial: Partial<DocumentFilterCriteria>) => {
    onFilterChange({
      ...filters,
      ...partial,
    });
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className={`space-y-2.5 bg-card border border-border p-3 shadow-2xs text-xs ${className}`}>
      {/* Top Row: Search Input + Preset Filter Dropdowns */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder='Search 150+ docs by vendor, "Vibranium", receipt #, amount, raw text...'
            value={filters.searchQuery}
            onChange={(e) => handleUpdate({ searchQuery: e.target.value })}
            className="w-full h-8 pl-8 pr-7 bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {filters.searchQuery && (
            <button
              type="button"
              onClick={() => handleUpdate({ searchQuery: '' })}
              className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Doc Type Dropdown */}
        <div className="flex items-center gap-1">
          <select
            value={filters.docType}
            onChange={(e) => handleUpdate({ docType: e.target.value as DocumentType | 'all' })}
            aria-label="Filter by Document Type"
            className="h-8 px-2 bg-background border border-border text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="all">All Document Types</option>
            <option value="RECEIPT">Receipts Only</option>
            <option value="W2">Form W-2</option>
            <option value="1099_DIV">1099-DIV</option>
            <option value="1099_B">1099-B</option>
            <option value="1099_NEC">1099-NEC</option>
            <option value="PROFIT_LOSS">P&amp;L Statements</option>
            <option value="OTHER">Other Documents</option>
          </select>
        </div>

        {/* Category Dropdown */}
        <div className="flex items-center gap-1">
          <select
            value={filters.category}
            onChange={(e) => handleUpdate({ category: e.target.value })}
            aria-label="Filter by Expense Category"
            className="h-8 px-2 bg-background border border-border text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer max-w-[150px] truncate capitalize"
          >
            <option value="all">All Categories</option>
            {availableCategories.map((c) => (
              <option key={c} value={c}>
                {c.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Amount Range Filter */}
        <div className="flex items-center gap-1">
          <select
            value={filters.amountRange}
            onChange={(e) => handleUpdate({ amountRange: e.target.value as DocumentFilterCriteria['amountRange'] })}
            aria-label="Filter by Amount Range"
            className="h-8 px-2 bg-background border border-border text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="all">Any Amount</option>
            <option value="under_1k">&lt; $1,000</option>
            <option value="1k_to_5k">$1,000 - $5,000</option>
            <option value="over_5k">&gt; $5,000 (Major)</option>
            <option value="over_10k">&gt; $10,000 (High Value)</option>
          </select>
        </div>

        {/* AI Confidence Filter */}
        <div className="flex items-center gap-1">
          <select
            value={filters.confidence}
            onChange={(e) => handleUpdate({ confidence: e.target.value as DocumentFilterCriteria['confidence'] })}
            aria-label="Filter by AI Confidence"
            className="h-8 px-2 bg-background border border-border text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="all">All AI Confidence</option>
            <option value="high">&ge; 90% High Confidence</option>
            <option value="needs_qa">&lt; 90% Needs QA Review</option>
          </select>
        </div>

        {/* Ingestion Status Filter */}
        <div className="flex items-center gap-1">
          <select
            value={filters.status}
            onChange={(e) => handleUpdate({ status: e.target.value as DocumentFilterCriteria['status'] })}
            aria-label="Filter by Review Status"
            className="h-8 px-2 bg-background border border-border text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="processed">Processed Only</option>
            <option value="needs_review">Needs Review Only</option>
          </select>
        </div>

        {/* Clear All Filters Button */}
        {isFiltered && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="h-8 px-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 gap-1"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </Button>
        )}
      </div>

      {/* Bottom Row: Active Filter Pills + Result Statistics */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/60 text-[11px]">
        {/* Active Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
          <SlidersHorizontal className="h-3 w-3 text-muted-foreground shrink-0" />
          <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">
            Active:
          </span>

          {!isFiltered && (
            <span className="text-muted-foreground italic text-[11px]">
              No filters applied (showing full collection)
            </span>
          )}

          {filters.searchQuery && (
            <Badge variant="outline" className="gap-1 font-mono text-[10px] py-0 bg-primary/5 border-primary/40 text-foreground">
              Search: &ldquo;{filters.searchQuery}&rdquo;
              <button type="button" onClick={() => handleUpdate({ searchQuery: '' })}>
                <X className="h-2.5 w-2.5" />
              </button>
            </Badge>
          )}

          {filters.docType !== 'all' && (
            <Badge variant="outline" className="gap-1 font-mono text-[10px] py-0 bg-primary/5 border-primary/40 text-foreground">
              Type: {filters.docType.replace(/_/g, '-')}
              <button type="button" onClick={() => handleUpdate({ docType: 'all' })}>
                <X className="h-2.5 w-2.5" />
              </button>
            </Badge>
          )}

          {filters.category !== 'all' && (
            <Badge variant="outline" className="gap-1 font-mono text-[10px] py-0 bg-primary/5 border-primary/40 text-foreground capitalize">
              Cat: {filters.category.replace(/_/g, ' ')}
              <button type="button" onClick={() => handleUpdate({ category: 'all' })}>
                <X className="h-2.5 w-2.5" />
              </button>
            </Badge>
          )}

          {filters.amountRange !== 'all' && (
            <Badge variant="outline" className="gap-1 font-mono text-[10px] py-0 bg-primary/5 border-primary/40 text-foreground">
              Amount: {filters.amountRange.replace(/_/g, ' ')}
              <button type="button" onClick={() => handleUpdate({ amountRange: 'all' })}>
                <X className="h-2.5 w-2.5" />
              </button>
            </Badge>
          )}

          {filters.confidence !== 'all' && (
            <Badge variant="outline" className="gap-1 font-mono text-[10px] py-0 bg-primary/5 border-primary/40 text-foreground">
              AI: {filters.confidence === 'high' ? '≥90%' : '<90% QA'}
              <button type="button" onClick={() => handleUpdate({ confidence: 'all' })}>
                <X className="h-2.5 w-2.5" />
              </button>
            </Badge>
          )}

          {filters.status !== 'all' && (
            <Badge variant="outline" className="gap-1 font-mono text-[10px] py-0 bg-primary/5 border-primary/40 text-foreground capitalize">
              Status: {filters.status.replace(/_/g, ' ')}
              <button type="button" onClick={() => handleUpdate({ status: 'all' })}>
                <X className="h-2.5 w-2.5" />
              </button>
            </Badge>
          )}
        </div>

        {/* Live Filter Counters */}
        <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground ml-auto">
          <span>
            Showing <strong className="text-foreground">{totalMatchCount}</strong> of {totalDocumentCount}
          </span>
          <span className="text-border">|</span>
          <span>
            Total Value: <strong className="text-foreground">{formatCurrency(totalMatchAmount)}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
