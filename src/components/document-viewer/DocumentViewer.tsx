import React, { useState } from 'react';
import { SourceDocument } from '@/types';
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
  ArrowRight,
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
    fields,
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

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 15, 140));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 15, 75));
  const handleResetZoom = () => setZoomLevel(100);

  // Active return field linked to current selection
  const linkedReturnField = fields.find(
    (f) =>
      f.id === activeFieldId ||
      (f.sourceDocumentIds && f.sourceDocumentIds.includes(doc.id))
  );

  const handleFieldBoxClick = (boxId: string, fieldKey: string) => {
    setHighlightedBoundingBox(boxId);
    const targetField = fields.find(
      (f) =>
        f.id === fieldKey ||
        f.lineNumber.toLowerCase().includes(fieldKey.toLowerCase()) ||
        (f.sourceDocumentIds && f.sourceDocumentIds.includes(doc.id))
    );
    if (targetField) {
      selectField(targetField.id);
    } else if (fieldKey) {
      selectField(fieldKey);
    }
  };

  const isBoxActive = (boxId: string, fieldKey?: string) => {
    if (highlightedBoundingBoxId === boxId) return true;
    if (activeFieldId && fieldKey && activeFieldId.includes(fieldKey)) return true;
    if (activeFieldId && linkedReturnField && linkedReturnField.id === activeFieldId) {
      const box = boundingBoxes.find((b) => b.id === boxId);
      if (box && linkedReturnField.label.toLowerCase().includes(box.label.toLowerCase())) return true;
    }
    return false;
  };

  return (
    <div className={`flex flex-col border border-border bg-card shadow-xs ${className}`}>
      {/* Top Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/40 p-2.5 text-xs">
        {/* Document Meta */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <FileText className="h-4 w-4 text-primary shrink-0" />
          <span className="font-semibold text-foreground truncate max-w-[200px]" title={doc.fileName}>
            {doc.fileName}
          </span>
          <Badge variant="outline" className="font-mono text-[10px] uppercase">
            {doc.docType.replace('_', ' ')}
          </Badge>
          {doc.status === 'processed' && (
            <Badge variant="outline" className="hidden sm:inline-flex gap-1 text-[10px] text-emerald-700 border-emerald-200 bg-emerald-50/50">
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

      {/* Linked Number Callout Banner (Clicking Doc leads directly to Return Line) */}
      {linkedReturnField && (
        <div
          onClick={() => selectField(linkedReturnField.id)}
          className="bg-primary/10 border-b border-primary/20 px-3 py-2 text-xs flex items-center justify-between cursor-pointer hover:bg-primary/15 transition-colors"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="text-foreground truncate">
              <strong>Source Provenance:</strong> Linked to{' '}
              <span className="font-mono font-bold text-primary underline">
                {linkedReturnField.formCode} {linkedReturnField.lineNumber}
              </span>{' '}
              ({linkedReturnField.label})
            </span>
          </div>
          <div className="flex items-center gap-1.5 font-mono font-extrabold text-foreground shrink-0 ml-2">
            <span>{linkedReturnField.formattedValue || `$${linkedReturnField.value}`}</span>
            <ArrowRight className="h-3.5 w-3.5 text-primary" />
          </div>
        </div>
      )}

      {/* Document Viewport with Tight, Accurate Bounding Boxes */}
      <div className="relative flex-1 min-h-[440px] max-h-[580px] overflow-auto bg-slate-900/5 p-4 flex items-start justify-center">
        <div
          className="relative bg-white text-slate-900 shadow-md border border-slate-300 transition-transform origin-top select-none w-full max-w-[540px]"
          style={{
            transform: zoomLevel !== 100 ? `scale(${zoomLevel / 100})` : undefined,
            transformOrigin: 'top center',
          }}
        >
          {/* Authentic Form Simulation Container */}
          <div className="p-5 font-sans text-xs space-y-3">
            {/* Header / Department Banner */}
            <div className="border-b-2 border-slate-900 pb-2 flex justify-between items-start gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-bold tracking-widest text-slate-500 uppercase">INTERNAL REVENUE SERVICE</p>
                <h2 className="text-sm font-extrabold tracking-tight text-slate-900 truncate">
                  {doc.docType === 'W2' && 'Wage and Tax Statement (Form W-2)'}
                  {doc.docType === '1099_NEC' && 'Nonemployee Compensation (Form 1099-NEC)'}
                  {doc.docType === '1099_DIV' && 'Dividends and Distributions (Form 1099-DIV)'}
                  {doc.docType === '1099_B' && 'Proceeds From Broker & Barter (1099-B)'}
                  {doc.docType === 'K1' && "Partner's Share of Income (Schedule K-1)"}
                  {doc.docType === 'RECEIPT' && 'Commercial Expense Receipt & Invoice'}
                  {doc.docType === 'OTHER' && 'Tax Source Workpaper'}
                </h2>
                <p className="text-[10px] text-slate-600 font-mono mt-0.5">Tax Year: {doc.taxYear || 2025} • Copy B for Taxpayer</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[9px] font-mono font-bold bg-slate-900 text-white px-1.5 py-0.5">
                  OMB No. 1545-0008
                </span>
              </div>
            </div>

            {/* Payer / Employer Box with Accurate EIN Bounding Box */}
            <div className="grid grid-cols-2 gap-2.5 border border-slate-400 p-2 bg-slate-50/50">
              <div className="min-w-0 overflow-hidden">
                <p className="text-[9px] font-bold text-slate-500 uppercase">PAYER / EMPLOYER</p>
                <p className="font-bold text-slate-900 text-xs mt-0.5 truncate" title={doc.vendor || 'Stark Industries LLC'}>
                  {doc.vendor || 'Stark Industries LLC'}
                </p>
                <p className="text-slate-600 text-[10px] truncate">10880 Wilshire Blvd, Suite 1400</p>
                
                {/* EIN Box with Accurate Hugging Bounding Box */}
                <div
                  onClick={() => handleFieldBoxClick('box-t-w2-1', 'ein')}
                  className={`relative mt-1 inline-block px-1 py-0.5 transition-all cursor-pointer ${
                    showAllBoxes && isBoxActive('box-t-w2-1', 'ein')
                      ? 'border-2 border-primary bg-primary/20 ring-2 ring-primary/30 font-bold'
                      : showAllBoxes
                      ? 'border border-dashed border-purple-500/80 bg-purple-500/10'
                      : ''
                  }`}
                >
                  <span className="font-mono text-slate-800 text-[10px]">EIN: 12-3456789</span>
                  {showAllBoxes && (
                    <span className="absolute -top-3.5 left-0 text-[8px] font-mono font-bold bg-purple-700 text-white px-1 py-0 leading-none">
                      EIN (99%)
                    </span>
                  )}
                </div>
              </div>

              <div className="min-w-0 overflow-hidden border-l border-slate-300 pl-2.5">
                <p className="text-[9px] font-bold text-slate-500 uppercase">RECIPIENT / TAXPAYER</p>
                <p className="font-bold text-slate-900 text-xs mt-0.5 truncate" title={doc.uploadedBy || 'Tony Stark'}>
                  {doc.uploadedBy || 'Tony Stark'}
                </p>
                <p className="text-slate-600 text-[10px] truncate">10880 Malibu Point, CA 90265</p>
                <p className="font-mono text-slate-700 text-[10px] mt-1">SSN: ***-**-9999</p>
              </div>
            </div>

            {/* Structured Line Item Grid with Pixel-Accurate Bounding Boxes */}
            <div className="border border-slate-400 divide-y divide-slate-300 text-xs">
              {/* FORM W-2 Simulation */}
              {doc.docType === 'W2' && (
                <>
                  <div className="grid grid-cols-2 p-2 bg-white items-center">
                    <div className="min-w-0">
                      <span className="font-mono font-bold text-slate-900 text-[11px] block truncate">Box 1: Wages, tips, compensation</span>
                      <p className="text-[9px] text-slate-500">Gross W-2 earnings</p>
                    </div>
                    <div className="text-right">
                      <div
                        onClick={() => handleFieldBoxClick('box-t-w2-2', 'fld-tony-1040-1a')}
                        className={`relative inline-block px-1.5 py-1 text-right transition-all cursor-pointer ${
                          showAllBoxes && isBoxActive('box-t-w2-2', 'fld-tony-1040-1a')
                            ? 'border-2 border-primary bg-primary/20 ring-4 ring-primary/30 z-10 shadow-sm'
                            : showAllBoxes
                            ? 'border-2 border-purple-500/80 bg-purple-500/10 hover:border-purple-600'
                            : ''
                        }`}
                      >
                        <span className="font-mono font-extrabold text-sm text-slate-900">
                          ${Number(doc.extractedFields.wagesBox1 || doc.extractedFields.box1_wages || doc.amount || 1450000).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                        {showAllBoxes && (
                          <div className="absolute -top-4 right-0 px-1 py-0.2 text-[8px] font-mono font-bold bg-purple-700 text-white flex items-center gap-0.5 whitespace-nowrap">
                            <Sparkles className="h-2 w-2" />
                            <span>Box 1 Wages (98%)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 p-2 bg-slate-50/50 items-center">
                    <div className="min-w-0">
                      <span className="font-mono font-bold text-slate-700 text-[11px]">Box 2: Federal income tax withheld</span>
                    </div>
                    <div className="text-right">
                      <div
                        onClick={() => handleFieldBoxClick('box-t-w2-3', 'fld-tony-1040-25d')}
                        className={`relative inline-block px-1.5 py-1 text-right transition-all cursor-pointer ${
                          showAllBoxes && isBoxActive('box-t-w2-3', 'fld-tony-1040-25d')
                            ? 'border-2 border-primary bg-primary/20 ring-4 ring-primary/30 z-10 shadow-sm'
                            : showAllBoxes
                            ? 'border-2 border-purple-500/80 bg-purple-500/10 hover:border-purple-600'
                            : ''
                        }`}
                      >
                        <span className="font-mono font-bold text-slate-900 text-xs">
                          ${Number(doc.extractedFields.fedWithholdingBox2 || doc.extractedFields.box2_fed_tax || 522000).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                        {showAllBoxes && (
                          <div className="absolute -top-4 right-0 px-1 py-0.2 text-[8px] font-mono font-bold bg-purple-700 text-white flex items-center gap-0.5 whitespace-nowrap">
                            <Sparkles className="h-2 w-2" />
                            <span>Box 2 Fed Tax (99%)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 p-2 bg-white items-center">
                    <span className="font-mono text-slate-700 text-[10px]">Box 3: Social Security wages</span>
                    <span className="text-right font-mono text-slate-700 text-xs">$168,600.00</span>
                  </div>
                </>
              )}

              {/* FORM 1099-DIV Simulation */}
              {doc.docType === '1099_DIV' && (
                <>
                  <div className="grid grid-cols-2 p-2 bg-white items-center">
                    <div className="min-w-0">
                      <span className="font-mono font-bold text-slate-900 text-[11px] block truncate">Box 1a: Total Ordinary Dividends</span>
                    </div>
                    <div className="text-right">
                      <div
                        onClick={() => handleFieldBoxClick('box-t-div-1', 'fld-tony-1040-3b')}
                        className={`relative inline-block px-1.5 py-1 text-right transition-all cursor-pointer ${
                          showAllBoxes && isBoxActive('box-t-div-1', 'fld-tony-1040-3b')
                            ? 'border-2 border-primary bg-primary/20 ring-4 ring-primary/30 z-10 shadow-sm'
                            : showAllBoxes
                            ? 'border-2 border-purple-500/80 bg-purple-500/10 hover:border-purple-600'
                            : ''
                        }`}
                      >
                        <span className="font-mono font-extrabold text-sm text-slate-900">
                          ${Number(doc.extractedFields.totalOrdinaryDividends || doc.amount || 325000).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                        {showAllBoxes && (
                          <div className="absolute -top-4 right-0 px-1 py-0.2 text-[8px] font-mono font-bold bg-purple-700 text-white flex items-center gap-0.5 whitespace-nowrap">
                            <Sparkles className="h-2 w-2" />
                            <span>Box 1a Dividends (97%)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 p-2 bg-slate-50/50 items-center">
                    <div className="min-w-0">
                      <span className="font-mono font-bold text-slate-700 text-[11px] block truncate">Box 1b: Qualified Dividends</span>
                    </div>
                    <div className="text-right">
                      <div
                        onClick={() => handleFieldBoxClick('box-t-div-2', 'fld-tony-1040-3a')}
                        className={`relative inline-block px-1.5 py-1 text-right transition-all cursor-pointer ${
                          showAllBoxes && isBoxActive('box-t-div-2', 'fld-tony-1040-3a')
                            ? 'border-2 border-primary bg-primary/20 ring-4 ring-primary/30 z-10 shadow-sm'
                            : showAllBoxes
                            ? 'border-2 border-purple-500/80 bg-purple-500/10 hover:border-purple-600'
                            : ''
                        }`}
                      >
                        <span className="font-mono font-bold text-slate-900 text-xs">
                          ${Number(doc.extractedFields.qualifiedDividends || 290000).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                        {showAllBoxes && (
                          <div className="absolute -top-4 right-0 px-1 py-0.2 text-[8px] font-mono font-bold bg-purple-700 text-white flex items-center gap-0.5 whitespace-nowrap">
                            <Sparkles className="h-2 w-2" />
                            <span>Box 1b Qualified (96%)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* FORM 1099-B Simulation */}
              {doc.docType === '1099_B' && (
                <>
                  <div className="grid grid-cols-2 p-2 bg-white items-center">
                    <div className="min-w-0">
                      <span className="font-mono font-bold text-slate-900 text-[11px] block truncate">Schedule D Net Gain (LT + ST)</span>
                      <p className="text-[9px] text-slate-500">Short-Term: $70k • Long-Term: $805k</p>
                    </div>
                    <div className="text-right">
                      <div
                        onClick={() => handleFieldBoxClick('box-t-b-1', 'fld-tony-1040-7')}
                        className={`relative inline-block px-1.5 py-1 text-right transition-all cursor-pointer ${
                          showAllBoxes && isBoxActive('box-t-b-1', 'fld-tony-1040-7')
                            ? 'border-2 border-primary bg-primary/20 ring-4 ring-primary/30 z-10 shadow-sm'
                            : showAllBoxes
                            ? 'border-2 border-purple-500/80 bg-purple-500/10 hover:border-purple-600'
                            : ''
                        }`}
                      >
                        <span className="font-mono font-extrabold text-sm text-slate-900">
                          ${Number(doc.extractedFields.longTermGain || 805000).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                        {showAllBoxes && (
                          <div className="absolute -top-4 right-0 px-1 py-0.2 text-[8px] font-mono font-bold bg-purple-700 text-white flex items-center gap-0.5 whitespace-nowrap">
                            <Sparkles className="h-2 w-2" />
                            <span>Net Gain (95%)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* FORM 1099-NEC Simulation */}
              {doc.docType === '1099_NEC' && (
                <>
                  <div className="grid grid-cols-2 p-2 bg-white items-center">
                    <div className="min-w-0">
                      <span className="font-mono font-bold text-slate-900 text-[11px] block truncate">Box 1: Nonemployee Compensation</span>
                    </div>
                    <div className="text-right">
                      <div
                        onClick={() => handleFieldBoxClick('box-t-nec-1', 'fld-tony-c-1')}
                        className={`relative inline-block px-1.5 py-1 text-right transition-all cursor-pointer ${
                          showAllBoxes
                            ? 'border-2 border-primary bg-primary/20 ring-4 ring-primary/30 z-10 shadow-sm'
                            : ''
                        }`}
                      >
                        <span className="font-mono font-extrabold text-sm text-slate-900">
                          ${Number(doc.extractedFields.box1_nonemployee_compensation || doc.amount || 45000).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                        {showAllBoxes && (
                          <div className="absolute -top-4 right-0 px-1 py-0.2 text-[8px] font-mono font-bold bg-purple-700 text-white flex items-center gap-0.5 whitespace-nowrap">
                            <Sparkles className="h-2 w-2" />
                            <span>Box 1 NEC (98%)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* RECEIPT Simulation */}
              {doc.docType === 'RECEIPT' && (
                <>
                  <div className="p-2 bg-white space-y-1">
                    <div className="flex justify-between font-mono text-slate-600 text-[10px]">
                      <span>Item Description</span>
                      <span>Amount</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-900 text-xs">
                      <span className="truncate pr-2">{doc.fileName.replace('.pdf', '')}</span>
                      <span className="shrink-0 font-mono">${Number(doc.amount || 12500).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 p-2 bg-slate-100 font-bold text-xs items-center">
                    <span>Total Expense</span>
                    <div className="text-right">
                      <span className="font-mono text-sm bg-purple-100 border border-purple-300 px-1 py-0.5 text-purple-900">
                        ${Number(doc.amount || 12500).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </>
              )}

              {/* Generic fallback */}
              {doc.docType !== 'W2' && doc.docType !== '1099_DIV' && doc.docType !== '1099_B' && doc.docType !== '1099_NEC' && doc.docType !== 'RECEIPT' && (
                <div className="p-2.5 space-y-1.5">
                  {Object.entries(doc.extractedFields).map(([k, v]) => (
                    <div key={k} className="flex justify-between items-center py-0.5 border-b border-slate-200 last:border-0 font-mono text-xs">
                      <span className="text-slate-600 capitalize truncate max-w-[180px]">{k.replace(/_/g, ' ')}</span>
                      <span className="font-bold text-slate-900 shrink-0">
                        {typeof v === 'number' ? `$${v.toLocaleString()}` : String(v)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* OCR Provenance Stamp */}
            <div className="border-t border-slate-300 pt-2 flex justify-between items-center text-[9px] text-slate-500 font-mono">
              <span className="truncate max-w-[220px]">MiraFlores OCR Engine v4.2</span>
              <span className="text-emerald-700 font-bold shrink-0">Confidence: 98%</span>
            </div>
          </div>
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
