import React, { useState } from 'react';
import { SourceDocument, BoundingBox } from '@/types';
import { usePlatformStore } from '@/store/usePlatformStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileText,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building,
  Calendar,
  Layers,
} from 'lucide-react';

interface DocumentViewerProps {
  document?: SourceDocument | null;
  className?: string;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document: propDoc,
  className = '',
}) => {
  const {
    documents,
    activeDocumentId,
    activeFieldId,
    highlightedBoundingBoxId,
    selectField,
    setHighlightedBoundingBox,
  } = usePlatformStore();

  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showAllBoxes, setShowAllBoxes] = useState<boolean>(true);

  // Active document resolution
  const doc =
    propDoc ||
    documents.find((d) => d.id === activeDocumentId) ||
    documents[0];

  if (!doc) {
    return (
      <div className={`flex flex-col items-center justify-center p-12 border border-border bg-card text-center ${className}`}>
        <FileText className="h-10 w-10 text-muted-foreground mb-3 opacity-40" />
        <p className="text-sm font-semibold text-foreground">No Document Selected</p>
        <p className="text-xs text-muted-foreground mt-1">Select a return field or document to inspect source traceability.</p>
      </div>
    );
  }

  const boundingBoxes = doc.boundingBoxes || [];
  const totalPages = doc.pageCount || 1;

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 20, 180));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 20, 60));
  const handleResetZoom = () => setZoomLevel(100);

  const handleBoxClick = (box: BoundingBox) => {
    setHighlightedBoundingBox(box.id);
    if (box.fieldKey) {
      selectField(box.fieldKey);
    }
  };

  const getDocTypeBadge = (type: string) => {
    switch (type) {
      case 'W2':
        return <Badge variant="outline" className="bg-sky-50 text-sky-800 border-sky-300 font-mono">Form W-2</Badge>;
      case '1099_NEC':
        return <Badge variant="outline" className="bg-purple-50 text-purple-800 border-purple-300 font-mono">Form 1099-NEC</Badge>;
      case '1099_DIV':
        return <Badge variant="outline" className="bg-indigo-50 text-indigo-800 border-indigo-300 font-mono">Form 1099-DIV</Badge>;
      case 'K1':
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-300 font-mono">Schedule K-1</Badge>;
      case 'RECEIPT':
        return <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-300 font-mono">Receipt</Badge>;
      default:
        return <Badge variant="outline" className="font-mono">{type}</Badge>;
    }
  };

  return (
    <div className={`flex flex-col border border-border bg-card shadow-xs ${className}`}>
      {/* Top Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/40 p-2.5 text-xs">
        {/* Document Meta */}
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="h-4 w-4 text-primary shrink-0" />
          <span className="font-semibold text-foreground truncate max-w-[220px]" title={doc.fileName}>
            {doc.fileName}
          </span>
          {getDocTypeBadge(doc.docType)}
          {doc.status === 'processed' && (
            <Badge variant="outline" className="gap-1 text-[11px] text-emerald-700 border-emerald-200 bg-emerald-50/50">
              <ShieldCheck className="h-3 w-3" />
              OCR Verified
            </Badge>
          )}
        </div>

        {/* Zoom & View Actions */}
        <div className="flex items-center gap-1.5 ml-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAllBoxes((prev) => !prev)}
            className={`h-7 px-2 text-xs gap-1 border border-border ${showAllBoxes ? 'bg-primary/10 text-primary border-primary/30' : 'text-muted-foreground'}`}
            title="Toggle Bounding Boxes"
          >
            <Layers className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Boxes ({boundingBoxes.length})</span>
          </Button>

          <div className="h-4 w-px bg-border mx-1" />

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage <= 1}
                className="h-7 w-7 p-0"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <span className="text-xs font-mono px-1">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage >= totalPages}
                className="h-7 w-7 p-0"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            className="h-7 w-7 p-0"
            title="Zoom Out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <span className="text-xs font-mono min-w-[40px] text-center">{zoomLevel}%</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            className="h-7 w-7 p-0"
            title="Zoom In"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetZoom}
            className="h-7 w-7 p-0"
            title="Reset Zoom"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Document Viewport with Vector Template & Bounding Box Overlays */}
      <div className="relative flex-1 min-h-[480px] max-h-[680px] overflow-auto bg-slate-900/5 p-4 sm:p-6 flex items-center justify-center">
        <div
          className="relative bg-white text-slate-900 shadow-md border border-slate-300 transition-transform origin-top select-none"
          style={{
            width: '680px',
            minHeight: '880px',
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: 'top center',
          }}
        >
          {/* Document Content Simulation based on docType */}
          <div className="p-8 font-sans text-xs space-y-6">
            {/* Header / Department Banner */}
            <div className="border-b-2 border-slate-900 pb-3 flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">INTERNAL REVENUE SERVICE</p>
                <h2 className="text-base font-extrabold tracking-tight text-slate-900">
                  {doc.docType === 'W2' && 'Wage and Tax Statement (Form W-2)'}
                  {doc.docType === '1099_NEC' && 'Nonemployee Compensation (Form 1099-NEC)'}
                  {doc.docType === '1099_DIV' && 'Dividends and Distributions (Form 1099-DIV)'}
                  {doc.docType === 'K1' && "Partner's Share of Income (Schedule K-1 Form 1065)"}
                  {doc.docType === 'RECEIPT' && 'Commercial Expense Receipt & Invoice'}
                  {doc.docType === 'OTHER' && 'Tax Source Workpaper'}
                </h2>
                <p className="text-[11px] text-slate-600 font-mono mt-0.5">Tax Year: {doc.taxYear || 2025} • Copy B for Taxpayer Record</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold bg-slate-900 text-white px-2 py-1">
                  OMB No. 1545-0008
                </span>
              </div>
            </div>

            {/* Payer / Employer Box */}
            <div className="grid grid-cols-2 gap-4 border border-slate-400 p-3 bg-slate-50/50">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">PAYER / EMPLOYER</p>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{doc.vendor || 'Stark Industries LLC'}</p>
                <p className="text-slate-600 text-[11px]">10880 Wilshire Blvd, Suite 1400</p>
                <p className="text-slate-600 text-[11px]">Los Angeles, CA 90024</p>
                <p className="font-mono text-slate-700 text-[11px] mt-1">EIN: 95-4820193</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">RECIPIENT / TAXPAYER</p>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{doc.uploadedBy || 'Tony Stark'}</p>
                <p className="text-slate-600 text-[11px]">10880 Malibu Point</p>
                <p className="text-slate-600 text-[11px]">Malibu, CA 90265</p>
                <p className="font-mono text-slate-700 text-[11px] mt-1">SSN: ***-**-4082</p>
              </div>
            </div>

            {/* Structured Line Item Grid */}
            <div className="border border-slate-400 divide-y divide-slate-300">
              {doc.docType === '1099_NEC' && (
                <>
                  <div className="grid grid-cols-2 p-3 bg-white hover:bg-slate-50">
                    <div>
                      <span className="font-mono font-bold text-slate-900 text-xs">Box 1: Nonemployee Compensation</span>
                      <p className="text-[10px] text-slate-500">Gross receipts or fees for consulting services</p>
                    </div>
                    <div className="text-right font-mono font-extrabold text-sm text-slate-900">
                      ${Number(doc.extractedFields.box1_nonemployee_compensation || doc.amount || 45000).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 p-3 bg-slate-50/50">
                    <div>
                      <span className="font-mono font-bold text-slate-700 text-xs">Box 4: Federal income tax withheld</span>
                    </div>
                    <div className="text-right font-mono text-slate-700">
                      $0.00
                    </div>
                  </div>
                </>
              )}

              {doc.docType === 'W2' && (
                <>
                  <div className="grid grid-cols-2 p-3 bg-white">
                    <div>
                      <span className="font-mono font-bold text-slate-900 text-xs">Box 1: Wages, tips, other compensation</span>
                    </div>
                    <div className="text-right font-mono font-extrabold text-sm text-slate-900">
                      ${Number(doc.extractedFields.box1_wages || doc.amount || 85400).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 p-3 bg-slate-50/50">
                    <div>
                      <span className="font-mono font-bold text-slate-700 text-xs">Box 2: Federal income tax withheld</span>
                    </div>
                    <div className="text-right font-mono text-slate-900">
                      ${Number(doc.extractedFields.box2_fed_tax || 14200).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </>
              )}

              {doc.docType === 'RECEIPT' && (
                <>
                  <div className="p-3 bg-white space-y-2">
                    <div className="flex justify-between font-mono text-slate-700">
                      <span>Item Description</span>
                      <span>Amount</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{doc.fileName.replace('.pdf', '')}</span>
                      <span>${Number(doc.amount || 12500).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <p className="text-[10px] text-slate-500">Category: {doc.category} • Payment Method: Corporate Card Ending in 8831</p>
                  </div>
                  <div className="grid grid-cols-2 p-3 bg-slate-100 font-bold">
                    <span>Total Expense</span>
                    <span className="text-right font-mono text-sm">${Number(doc.amount || 12500).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                </>
              )}

              {doc.docType !== '1099_NEC' && doc.docType !== 'W2' && doc.docType !== 'RECEIPT' && (
                <div className="p-4 space-y-3">
                  {Object.entries(doc.extractedFields).map(([k, v]) => (
                    <div key={k} className="flex justify-between items-center py-1 border-b border-slate-200 last:border-0 font-mono text-xs">
                      <span className="text-slate-600 capitalize">{k.replace(/_/g, ' ')}</span>
                      <span className="font-bold text-slate-900">
                        {typeof v === 'number' ? `$${v.toLocaleString()}` : String(v)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* OCR Provenance Stamp */}
            <div className="border-t border-slate-300 pt-4 flex justify-between items-center text-[10px] text-slate-500 font-mono">
              <span>MiraFlores OCR Engine v4.2 • Sha256: 8f9b2...a40e</span>
              <span className="text-emerald-700 font-bold">Confidence: 98% (High Defensibility)</span>
            </div>
          </div>

          {/* Coordinate-Based Bounding Boxes Overlay */}
          {showAllBoxes &&
            boundingBoxes.map((box) => {
              const isSelected =
                highlightedBoundingBoxId === box.id ||
                activeFieldId === box.fieldKey ||
                (box.fieldKey && activeFieldId && box.fieldKey.includes(activeFieldId));

              return (
                <div
                  key={box.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBoxClick(box);
                  }}
                  className={`absolute cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? 'border-2 border-primary bg-primary/20 ring-4 ring-primary/30 z-30 shadow-lg'
                      : 'border-2 border-purple-500/70 bg-purple-500/10 hover:border-purple-600 hover:bg-purple-500/25 z-20'
                  }`}
                  style={{
                    left: `${box.x}%`,
                    top: `${box.y}%`,
                    width: `${box.width}%`,
                    height: `${box.height}%`,
                  }}
                >
                  {/* Bounding Box Label Tooltip Badge */}
                  <div
                    className={`absolute -top-6 left-0 px-1.5 py-0.5 text-[10px] font-mono font-bold whitespace-nowrap flex items-center gap-1 shadow-sm ${
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-purple-700 text-white'
                    }`}
                  >
                    <Sparkles className="h-2.5 w-2.5" />
                    <span>{box.label}</span>
                    <span className="opacity-80">({box.confidence}%)</span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Document Footer Summary */}
      <div className="border-t border-border bg-card p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4 text-muted-foreground">
          <span className="flex items-center gap-1">
            <Building className="h-3.5 w-3.5 text-foreground" />
            Vendor: <strong className="text-foreground">{doc.vendor || 'Stark Industries'}</strong>
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-foreground" />
            Uploaded: <strong className="text-foreground">{doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : '2026-02-14'}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1 font-mono text-[11px]">
            <Sparkles className="h-3 w-3 text-purple-600" />
            {boundingBoxes.length} Traceable Coordinate Boxes
          </Badge>
        </div>
      </div>
    </div>
  );
};
