import React, { useState, useMemo } from 'react';
import { SourceDocument } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  CheckCheck,
  Download,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Crosshair,
  Building2,
  Calendar,
  AlertCircle,
  Tag,
} from 'lucide-react';

interface DocumentListGridProps {
  documents: SourceDocument[];
  selectedDocIds: string[];
  onToggleSelectDoc: (docId: string) => void;
  onToggleSelectAll: (filteredDocIds: string[]) => void;
  onOpenDocument: (doc: SourceDocument) => void;
  onBatchVerify: (docIds: string[]) => void;
  className?: string;
}

export const DocumentListGrid: React.FC<DocumentListGridProps> = ({
  documents,
  selectedDocIds,
  onToggleSelectDoc,
  onToggleSelectAll,
  onOpenDocument,
  onBatchVerify,
  className = '',
}) => {
  const [pageSize, setPageSize] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [batchActionSuccess, setBatchActionSuccess] = useState<string | null>(null);

  // Calculate pages
  const totalPages = Math.max(1, Math.ceil(documents.length / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedDocs = useMemo(() => {
    const start = (validCurrentPage - 1) * pageSize;
    return documents.slice(start, start + pageSize);
  }, [documents, validCurrentPage, pageSize]);

  // Checkbox calculations
  const allFilteredIds = useMemo(() => documents.map((d) => d.id), [documents]);
  const isAllSelected =
    documents.length > 0 && allFilteredIds.every((id) => selectedDocIds.includes(id));
  const isSomeSelected =
    documents.some((d) => selectedDocIds.includes(d.id)) && !isAllSelected;

  const selectedDocs = useMemo(
    () => documents.filter((d) => selectedDocIds.includes(d.id)),
    [documents, selectedDocIds]
  );
  const selectedAmount = useMemo(
    () => selectedDocs.reduce((sum, d) => sum + (d.amount || 0), 0),
    [selectedDocs]
  );
  const unverifiedSelectedCount = useMemo(
    () => selectedDocs.filter((d) => d.status === 'needs_review').length,
    [selectedDocs]
  );

  const handleBatchVerifyClick = () => {
    if (selectedDocIds.length === 0) return;
    onBatchVerify(selectedDocIds);
    setBatchActionSuccess(`Verified & locked ${selectedDocIds.length} documents!`);
    setTimeout(() => setBatchActionSuccess(null), 3000);
  };

  const handleExportCsv = () => {
    if (selectedDocs.length === 0) return;
    const headers = ['ID', 'FileName', 'DocType', 'Vendor', 'Category', 'Amount', 'Date', 'Status'];
    const rows = selectedDocs.map((d) => [
      d.id,
      `"${d.fileName}"`,
      d.docType,
      `"${d.vendor || ''}"`,
      `"${d.extractedFields?.expenseCategory || d.category || ''}"`,
      d.amount || 0,
      d.extractedFields?.date || d.uploadedAt.split('T')[0],
      d.status,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Wakanda_Tech_Expense_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(val);
  };

  return (
    <div className={`flex flex-col border border-border bg-card shadow-2xs text-xs ${className}`}>
      {/* Batch Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-muted/30 border-b border-border">
        {/* Selection Stats */}
        <div className="flex items-center gap-2.5">
          <input
            type="checkbox"
            checked={isAllSelected}
            ref={(el) => {
              if (el) el.indeterminate = isSomeSelected;
            }}
            onChange={() => onToggleSelectAll(allFilteredIds)}
            aria-label="Select all filtered documents"
            className="h-4 w-4 rounded-none border-border accent-primary cursor-pointer"
          />

          <div className="font-mono text-xs">
            {selectedDocIds.length > 0 ? (
              <span className="font-bold text-foreground">
                {selectedDocIds.length} Selected{' '}
                <span className="text-muted-foreground font-normal">
                  ({formatCurrency(selectedAmount)})
                </span>
              </span>
            ) : (
              <span className="text-muted-foreground">Select items for batch operations</span>
            )}
          </div>
        </div>

        {/* Batch Operations Controls */}
        <div className="flex items-center gap-2">
          {batchActionSuccess && (
            <span className="text-emerald-700 dark:text-emerald-300 font-semibold text-[11px] animate-in fade-in">
              ✓ {batchActionSuccess}
            </span>
          )}

          {selectedDocIds.length > 0 && (
            <>
              {unverifiedSelectedCount > 0 ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBatchVerifyClick}
                  className="h-7 px-2.5 text-xs font-semibold gap-1.5 border-emerald-600/40 text-emerald-700 hover:bg-emerald-50 bg-emerald-50/40 dark:bg-emerald-950/40 dark:text-emerald-300 shadow-2xs"
                >
                  <CheckCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Batch Verify ({unverifiedSelectedCount})</span>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className="h-7 px-2.5 text-xs font-semibold gap-1.5 border-emerald-600/30 text-emerald-700 dark:text-emerald-300 bg-emerald-50/20 opacity-80"
                >
                  <CheckCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>All Selected Verified</span>
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCsv}
                className="h-7 px-2.5 text-xs font-semibold gap-1.5 border-border hover:bg-muted"
                title="Export selected rows as CSV ledger"
              >
                <Download className="h-3.5 w-3.5 text-primary" />
                <span>Export CSV</span>
              </Button>
            </>
          )}

          {/* Page Size Selector */}
          <div className="flex items-center gap-1 pl-2 border-l border-border/80 text-[11px] text-muted-foreground">
            <span>Show:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              aria-label="Rows per page"
              className="h-6 px-1.5 bg-background border border-border text-xs font-mono font-medium text-foreground focus:outline-none cursor-pointer"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Scalable Data Table with Container Horizontal Scroll */}
      <div className="overflow-x-auto min-w-full">
        <table className="w-full text-left border-collapse min-w-[920px]">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <th className="py-2.5 px-3 w-10 text-center">
                <span className="sr-only">Select</span>
              </th>
              <th className="py-2.5 px-3 min-w-[200px]">Document / File Name</th>
              <th className="py-2.5 px-3 min-w-[180px]">Vendor / Payer</th>
              <th className="py-2.5 px-3 w-32">Expense Category</th>
              <th className="py-2.5 px-3 w-28 whitespace-nowrap">Date</th>
              <th className="py-2.5 px-3 w-32 text-right whitespace-nowrap">Amount</th>
              <th className="py-2.5 px-3 w-32 text-center whitespace-nowrap">AI OCR</th>
              <th className="py-2.5 px-3 w-28 text-center whitespace-nowrap">Status</th>
              <th className="py-2.5 px-3 w-28 text-center whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-xs font-sans">
            {documents.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-12 text-muted-foreground">
                  <AlertCircle className="h-7 w-7 mx-auto mb-2 opacity-40 text-muted-foreground" />
                  <p className="font-semibold text-foreground">No matching documents found</p>
                  <p className="text-[11px] mt-0.5">Try adjusting your keyword search or category filters.</p>
                </td>
              </tr>
            ) : (
              paginatedDocs.map((doc) => {
                const isSelected = selectedDocIds.includes(doc.id);
                const expenseCat =
                  (doc.extractedFields?.expenseCategory as string) || doc.category || 'other';
                const docDate =
                  (doc.extractedFields?.date as string) || doc.uploadedAt.split('T')[0];
                const avgConfidence =
                  doc.boundingBoxes.length > 0
                    ? Math.round(
                        (doc.boundingBoxes.reduce((acc, b) => acc + b.confidence, 0) /
                          doc.boundingBoxes.length) *
                          100
                      )
                    : 98;

                const isNeedsReview = doc.status === 'needs_review';

                return (
                  <tr
                    key={doc.id}
                    className={`transition-colors hover:bg-muted/30 ${
                      isSelected ? 'bg-primary/5' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-2 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelectDoc(doc.id)}
                        aria-label={`Select ${doc.fileName}`}
                        className="h-4 w-4 rounded-none border-border accent-primary cursor-pointer"
                      />
                    </td>

                    {/* File Name & Type */}
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary shrink-0" />
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => onOpenDocument(doc)}
                            className="font-semibold text-foreground hover:text-primary hover:underline truncate max-w-xs block text-left cursor-pointer"
                            title={doc.fileName}
                          >
                            {doc.fileName}
                          </button>
                          <span className="font-mono text-[10px] text-muted-foreground block">
                            {doc.docType.replace(/_/g, '-')} • {doc.pageCount} page(s)
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Vendor / Payer */}
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-1.5 text-foreground truncate max-w-[180px]">
                        <Building2 className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="truncate">{doc.vendor || 'Unknown Vendor'}</span>
                      </div>
                    </td>

                    {/* Expense Category */}
                    <td className="py-2 px-3">
                      <Badge
                        variant="outline"
                        className="font-mono text-[10px] py-0 bg-muted/20 capitalize truncate max-w-[120px]"
                      >
                        <Tag className="h-2.5 w-2.5 mr-1 text-muted-foreground" />
                        {expenseCat.replace(/_/g, ' ')}
                      </Badge>
                    </td>

                    {/* Date */}
                    <td className="py-2 px-3 font-mono text-muted-foreground whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span>{docDate}</span>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-2 px-3 text-right font-mono font-bold text-foreground whitespace-nowrap select-text">
                      {formatCurrency(doc.amount)}
                    </td>

                    {/* AI OCR & Bounding Boxes */}
                    <td className="py-2 px-3 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1 font-mono text-[10px] px-1.5 py-0.5 bg-purple-100 dark:bg-purple-950/60 text-purple-950 dark:text-purple-200 border border-purple-300 dark:border-purple-700">
                        <Crosshair className="h-2.5 w-2.5 text-purple-700 dark:text-purple-400" />
                        <span>{doc.boundingBoxes.length} coords</span>
                        <span className="font-bold">({avgConfidence}%)</span>
                      </div>
                    </td>

                    {/* Review Status */}
                    <td className="py-2 px-3 text-center whitespace-nowrap">
                      {isNeedsReview ? (
                        <Badge
                          variant="outline"
                          className="font-mono text-[10px] py-0 border-rose-400 text-rose-700 dark:text-rose-300 bg-rose-50/50 dark:bg-rose-950/30 gap-1"
                        >
                          <AlertTriangle className="h-2.5 w-2.5" />
                          Needs Review
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="font-mono text-[10px] py-0 border-emerald-400 text-emerald-700 dark:text-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/30 gap-1"
                        >
                          Processed
                        </Badge>
                      )}
                    </td>

                    {/* Action Button */}
                    <td className="py-2 px-3 text-center whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onOpenDocument(doc)}
                        className="h-6 px-2 text-[10px] font-semibold gap-1 text-primary hover:bg-primary/10"
                        title="View document in vector viewer with bounding box overlay"
                      >
                        <Eye className="h-3 w-3" />
                        <span>View</span>
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-muted/20 border-t border-border text-xs">
        <div className="text-muted-foreground font-mono">
          Showing {documents.length === 0 ? 0 : (validCurrentPage - 1) * pageSize + 1} to{' '}
          {Math.min(validCurrentPage * pageSize, documents.length)} of {documents.length} entries
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={validCurrentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="h-7 px-2 gap-1 text-xs"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Prev</span>
            </Button>

            <span className="font-mono text-xs px-2 text-foreground font-semibold">
              Page {validCurrentPage} of {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={validCurrentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="h-7 px-2 gap-1 text-xs"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
