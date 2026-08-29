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

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 20, 160));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 20, 70));
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
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <FileText className="h-4 w-4 text-primary shrink-0" />
          <span className="font-semibold text-foreground truncate max-w-[180px] sm:max-w-[240px]" title={doc.fileName}>
            {doc.fileName}
          </span>
          {getDocTypeBadge(doc.docType)}
          {doc.status === 'processed' && (
            <Badge variant="outline" className="hidden sm:inline-flex gap-1 text-[11px] text-emerald-700 border-emerald-200 bg-emerald-50/50">
              <ShieldCheck className="h-3 w-3" />
              OCR Verified
            </Badge>
          )}
        </div>

        {/* Zoom & View Actions */}
        <div className="flex items-center gap-1.5 ml-auto shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAllBoxes((prev) => !prev)}
            className={`h-7 px-2 text-xs gap-1 border border-border ${showAllBoxes ? 'bg-primary/10 text-primary border-primary/30 font-semibold' : 'text-muted-foreground'}`}
            title="Toggle Bounding Boxes"
          >
            <Layers className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Boxes ({boundingBoxes.length})</span>
          </Button>

          <div className="h-4 w-px bg-border mx-0.5" />

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
                {currentPage}/{totalPages}
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
          <span className="text-xs font-mono min-w-[36px] text-center">{zoomLevel}%</span>
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

      {/* Document Viewport with Exact Responsive Canvas & Bounding Box Overlays */}
      <div className="relative flex-1 min-h-[460px] max-h-[640px] overflow-auto bg-slate-900/5 p-3 sm:p-4 flex items-start justify-center">
        <div
          className="relative bg-white text-slate-900 shadow-md border border-slate-300 transition-transform origin-top select-none w-full max-w-[580px] min-h-[760px]"
          style={{
            transform: zoomLevel !== 100 ? `scale(${zoomLevel / 100})` : undefined,
            transformOrigin: 'top center',
          }}
        >
          {/* Authentic Form Simulation Container */}
          <div className="p-6 font-sans text-xs space-y-4">
            {/* Header / Department Banner */}
            <div className="border-b-2 border-slate-900 pb-2.5 flex justify-between items-start gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-bold tracking-widest text-slate-500 uppercase">INTERNAL REVENUE SERVICE</p>
                <h2 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 truncate">
                  {doc.docType === 'W2' && 'Wage and Tax Statement (Form W-2)'}
                  {doc.docType === '1099_NEC' && 'Nonemployee Compensation (Form 1099-NEC)'}
                  {doc.docType === '1099_DIV' && 'Dividends and Distributions (Form 1099-DIV)'}
                  {doc.docType === '1099_B' && 'Proceeds From Broker & Barter (1099-B)'}
                  {doc.docType === 'K1' && "Partner's Share of Income (Schedule K-1)"}
                  {doc.docType === 'RECEIPT' && 'Commercial Expense Receipt & Invoice'}
                  {doc.docType === 'OTHER' && 'Tax Source Workpaper'}
                </h2>
                <p className="text-[10px] text-slate-600 font-mono mt-0.5">Tax Year: {doc.taxYear || 2025} • Official Copy</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] font-mono font-bold bg-slate-900 text-white px-2 py-0.5">
                  OMB No. 1545-0008
                </span>
              </div>
            </div>

            {/* Payer / Employer Box with Overflow Protection */}
            <div className="grid grid-cols-2 gap-3 border border-slate-400 p-2.5 bg-slate-50/50">
              <div className="min-w-0 overflow-hidden">
                <p className="text-[9px] font-bold text-slate-500 uppercase">PAYER / EMPLOYER</p>
                <p className="font-bold text-slate-900 text-xs mt-0.5 truncate" title={doc.vendor || 'Stark Industries LLC'}>
                  {doc.vendor || 'Stark Industries LLC'}
                </p>
                <p className="text-slate-600 text-[10px] truncate">10880 Wilshire Blvd, Suite 1400</p>
                <p className="text-slate-600 text-[10px] truncate">Los Angeles, CA 90024</p>
                <p className="font-mono text-slate-700 text-[10px] mt-0.5">EIN: 95-4820193</p>
              </div>
              <div className="min-w-0 overflow-hidden border-l border-slate-300 pl-3">
                <p className="text-[9px] font-bold text-slate-500 uppercase">RECIPIENT / TAXPAYER</p>
                <p className="font-bold text-slate-900 text-xs mt-0.5 truncate" title={doc.uploadedBy || 'Tony Stark'}>
                  {doc.uploadedBy || 'Tony Stark'}
                </p>
                <p className="text-slate-600 text-[10px] truncate">10880 Malibu Point</p>
                <p className="text-slate-600 text-[10px] truncate">Malibu, CA 90265</p>
                <p className="font-mono text-slate-700 text-[10px] mt-0.5">SSN: ***-**-4082</p>
              </div>
            </div>

            {/* Structured Line Item Grid */}
            <div className="border border-slate-400 divide-y divide-slate-300 text-xs">
              {doc.docType === '1099_NEC' && (
                <>
                  <div className="grid grid-cols-2 p-2.5 bg-white hover:bg-slate-50">
                    <div className="min-w-0">
                      <span className="font-mono font-bold text-slate-900 text-xs block truncate">Box 1: Nonemployee Compensation</span>
                      <p className="text-[10px] text-slate-500 truncate">Consulting / engineering fees</p>
                    </div>
                    <div className="text-right font-mono font-extrabold text-sm text-slate-900">
                      ${Number(doc.extractedFields.box1_nonemployee_compensation || doc.amount || 45000).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 p-2.5 bg-slate-50/50">
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
                  <div className="grid grid-cols-2 p-2.5 bg-white">
                    <div className="min-w-0">
                      <span className="font-mono font-bold text-slate-900 text-xs block truncate">Box 1: Wages, tips, compensation</span>
                    </div>
                    <div className="text-right font-mono font-extrabold text-sm text-slate-900">
                      ${Number(doc.extractedFields.wagesBox1 || doc.extractedFields.box1_wages || doc.amount || 1450000).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 p-2.5 bg-slate-50/50">
                    <div>
                      <span className="font-mono font-bold text-slate-700 text-xs">Box 2: Federal income tax withheld</span>
                    </div>
                    <div className="text-right font-mono text-slate-900 font-bold">
                      ${Number(doc.extractedFields.fedWithholdingBox2 || doc.extractedFields.box2_fed_tax || 522000).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 p-2.5 bg-white">
                    <div>
                      <span className="font-mono text-slate-700 text-[11px]">Box 3: Social Security wages</span>
                    </div>
                    <div className="text-right font-mono text-slate-700">
                      $168,600.00
                    </div>
                  </div>
                </>
              )}

              {doc.docType === '1099_DIV' && (
                <>
                  <div className="grid grid-cols-2 p-2.5 bg-white">
                    <div className="min-w-0">
                      <span className="font-mono font-bold text-slate-900 text-xs block truncate">Box 1a: Total Ordinary Dividends</span>
                    </div>
                    <div className="text-right font-mono font-extrabold text-sm text-slate-900">
                      ${Number(doc.extractedFields.totalOrdinaryDividends || doc.amount || 325000).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 p-2.5 bg-slate-50/50">
                    <div className="min-w-0">
                      <span className="font-mono font-bold text-slate-700 text-xs block truncate">Box 1b: Qualified Dividends</span>
                    </div>
                    <div className="text-right font-mono text-slate-900 font-bold">
                      ${Number(doc.extractedFields.qualifiedDividends || 290000).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </>
              )}

              {doc.docType === 'RECEIPT' && (
                <>
                  <div className="p-2.5 bg-white space-y-1.5">
                    <div className="flex justify-between font-mono text-slate-600 text-[11px]">
                      <span>Item Description</span>
                      <span>Amount</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-900 text-xs">
                      <span className="truncate pr-2">{doc.fileName.replace('.pdf', '')}</span>
                      <span className="shrink-0 font-mono">${Number(doc.amount || 12500).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <p className="text-[10px] text-slate-500">Category: {doc.category} • Method: Corporate Card</p>
                  </div>
                  <div className="grid grid-cols-2 p-2.5 bg-slate-100 font-bold text-xs">
                    <span>Total Expense</span>
                    <span className="text-right font-mono text-sm">${Number(doc.amount || 12500).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                </>
              )}

              {doc.docType !== '1099_NEC' && doc.docType !== 'W2' && doc.docType !== '1099_DIV' && doc.docType !== 'RECEIPT' && (
                <div className="p-3 space-y-2">
                  {Object.entries(doc.extractedFields).map(([k, v]) => (
                    <div key={k} className="flex justify-between items-center py-1 border-b border-slate-200 last:border-0 font-mono text-xs">
                      <span className="text-slate-600 capitalize truncate max-w-[200px]">{k.replace(/_/g, ' ')}</span>
                      <span className="font-bold text-slate-900 shrink-0">
                        {typeof v === 'number' ? `$${v.toLocaleString()}` : String(v)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* OCR Provenance Stamp */}
            <div className="border-t border-slate-300 pt-3 flex justify-between items-center text-[10px] text-slate-500 font-mono">
              <span className="truncate max-w-[260px]">MiraFlores OCR Engine v4.2 • Sha256: 8f9b2...a40e</span>
              <span className="text-emerald-700 font-bold shrink-0">Confidence: 98%</span>
            </div>
          </div>

          {/* Coordinate-Based Bounding Boxes Overlay with Visual Precision */}
          {showAllBoxes &&
            boundingBoxes.map((box) => {
              const isSelected =
                highlightedBoundingBoxId === box.id ||
                activeFieldId === box.fieldKey ||
                (box.fieldKey && activeFieldId && box.fieldKey.includes(box.fieldKey));

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
                    className={`absolute -top-5 left-0 px-1 py-0.2 text-[9px] font-mono font-bold whitespace-nowrap flex items-center gap-1 shadow-sm ${
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-purple-700 text-white'
                    }`}
                  >
                    <Sparkles className="h-2 w-2" />
                    <span>{box.label}</span>
                    <span className="opacity-80">({Math.round((box.confidence > 1 ? box.confidence : box.confidence * 100))}%)</span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Document Footer Summary */}
      <div className="border-t border-border bg-card p-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-3 text-muted-foreground min-w-0 flex-1">
          <span className="flex items-center gap-1 truncate">
            <Building className="h-3.5 w-3.5 text-foreground shrink-0" />
            <strong className="text-foreground truncate">{doc.vendor || 'Stark Industries'}</strong>
          </span>
          <span className="hidden sm:flex items-center gap-1 shrink-0">
            <Calendar className="h-3.5 w-3.5 text-foreground" />
            <span>{doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : '2026-02-14'}</span>
          </span>
        </div>

        <div className="shrink-0">
          <Badge variant="outline" className="gap-1 font-mono text-[10px]">
            <Sparkles className="h-3 w-3 text-purple-600" />
            {boundingBoxes.length} Traceable Coordinate Boxes
          </Badge>
        </div>
      </div>
    </div>
  );
};
