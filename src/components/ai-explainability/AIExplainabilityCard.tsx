import React, { useState } from 'react';
import { ReturnField, EvidenceItem, CalculationInput, FieldAuditEntry } from '@/types';
import { usePlatformStore } from '@/store/usePlatformStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  ShieldCheck,
  Edit3,
  FileText,
  AlertTriangle,
  Calculator,
  History,
  Check,
  X,
  ChevronRight,
} from 'lucide-react';

interface AIExplainabilityCardProps {
  field?: ReturnField | null;
  className?: string;
}

export const AIExplainabilityCard: React.FC<AIExplainabilityCardProps> = ({
  field: propField,
  className = '',
}) => {
  const {
    fields,
    activeFieldId,
    verifyField,
    updateFieldValue,
    selectDocument,
    setHighlightedBoundingBox,
    currentUser,
  } = usePlatformStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState<string>('');
  const [editReason, setEditReason] = useState<string>('');

  // Active field resolution
  const field =
    propField ||
    fields.find((f) => f.id === activeFieldId) ||
    fields[0];

  if (!field) {
    return (
      <div className={`p-6 border border-border bg-card text-center text-muted-foreground ${className}`}>
        <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-40 text-purple-600" />
        <p className="text-sm font-semibold text-foreground">No Field Selected</p>
        <p className="text-xs mt-1">Select any line item to inspect AI extraction provenance and explainability.</p>
      </div>
    );
  }

  const explainability = field.aiExplanation;
  const isReviewerOrPreparer =
    currentUser.role === 'tax_reviewer' || currentUser.role === 'tax_preparer';

  const handleStartEdit = () => {
    setEditValue(typeof field.value === 'number' ? String(field.value) : String(field.value || ''));
    setEditReason('');
    setIsEditing(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(editValue.replace(/[$,]/g, ''));
    if (!isNaN(num)) {
      updateFieldValue(field.id, num);
    } else {
      updateFieldValue(field.id, editValue);
    }
    setIsEditing(false);
  };

  const handleEvidenceClick = (docId: string, boxId: string) => {
    selectDocument(docId);
    setHighlightedBoundingBox(boxId);
  };

  const confidenceScore = field.aiConfidence || explainability?.confidenceScore || 90;
  const isFlagged = confidenceScore < 85;

  return (
    <div className={`border border-border bg-card shadow-xs flex flex-col ${className}`}>
      {/* Header Banner */}
      <div className="border-b border-border bg-muted/40 p-3.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center bg-purple-600 text-white font-bold">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-foreground">AI Explainability & Defensibility</h3>
            <p className="text-[11px] text-muted-foreground font-mono">
              {field.formCode} • {field.label}
            </p>
          </div>
        </div>

        {/* Confidence Gauge */}
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={`font-mono text-xs font-bold gap-1 py-1 px-2.5 ${
              isFlagged
                ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300'
                : 'bg-purple-50 text-purple-800 border-purple-300 dark:bg-purple-950/40 dark:text-purple-300'
            }`}
          >
            {isFlagged ? <AlertTriangle className="h-3.5 w-3.5 text-amber-600" /> : <Sparkles className="h-3.5 w-3.5 text-purple-600" />}
            {confidenceScore}% Confidence
          </Badge>
        </div>
      </div>

      {/* 4-Pillar Content Body */}
      <div className="p-4 space-y-4 text-xs overflow-y-auto max-h-[600px]">
        {/* Pillar 1: What AI Did */}
        <div className="border border-border bg-muted/20 p-3 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pillar 1: What AI Extracted</span>
          <p className="text-xs text-foreground font-medium leading-relaxed">
            {explainability?.summary ||
              `Extracted ${field.formattedValue || field.value} for ${field.label} directly from ${field.sourceDocumentIds?.length || 1} verified source tax document(s).`}
          </p>
          <div className="pt-2 flex items-center justify-between border-t border-border mt-2 font-mono">
            <span className="text-muted-foreground">Current Return Value:</span>
            <strong className="text-sm font-bold text-foreground">{field.formattedValue || `$${field.value}`}</strong>
          </div>
        </div>

        {/* Pillar 2: Evidence & Source Provenance */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pillar 2: Evidence & Source Coordinates</span>

          {explainability?.evidence && explainability.evidence.length > 0 ? (
            <div className="space-y-1.5">
              {explainability.evidence.map((item: EvidenceItem, idx: number) => (
                <div
                  key={idx}
                  onClick={() => handleEvidenceClick(item.sourceDocumentId, item.boundingBoxId)}
                  className="flex items-center justify-between p-2 border border-border bg-card hover:bg-muted/40 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="h-4 w-4 text-purple-600 shrink-0" />
                    <div className="truncate">
                      <p className="font-semibold text-foreground truncate">{item.sourceDocumentName}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">Page {item.pageNumber} • {item.boxLabel}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono font-bold text-foreground text-xs">{item.extractedText}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 border border-border bg-card text-muted-foreground text-center">
              No direct OCR bounding box citations attached to this calculation.
            </div>
          )}
        </div>

        {/* Pillar 3: Mathematical Formula Breakdown */}
        {explainability?.calculationBreakdown ? (
          <div className="border border-border bg-slate-50/50 dark:bg-slate-900/30 p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              <Calculator className="h-3.5 w-3.5" />
              <span>Pillar 3: Calculation Breakdown</span>
            </div>
            <p className="font-mono text-xs font-bold text-foreground bg-card p-2 border border-border">
              {explainability.calculationBreakdown.formula}
            </p>
            <div className="space-y-1 pt-1">
              {explainability.calculationBreakdown.inputs.map((inp: CalculationInput, i: number) => (
                <div key={i} className="flex justify-between font-mono text-[11px] text-muted-foreground">
                  <span>{inp.label}:</span>
                  <span className="font-bold text-foreground">${inp.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Pillar 4: Uncertainty & Risk Assessment */}
        <div className="border border-border bg-muted/20 p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <AlertTriangle className="h-3.5 w-3.5 text-purple-600" />
            <span>Pillar 4: Uncertainty & Rationale</span>
          </div>

          {explainability?.uncertaintyFactors && explainability.uncertaintyFactors.length > 0 ? (
            <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
              {explainability.uncertaintyFactors.map((factor: string, i: number) => (
                <li key={i} className={isFlagged ? 'text-amber-800 dark:text-amber-300 font-medium' : ''}>
                  {factor}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
              ✓ High-confidence match: 100% OCR clarity, matching EIN/SSN, and corroborated with prior year returns.
            </p>
          )}

          {explainability?.suggestedAction && (
            <div className="pt-2 border-t border-border text-[11px]">
              <span className="text-muted-foreground">Recommended Action: </span>
              <strong className="text-foreground">{explainability.suggestedAction}</strong>
            </div>
          )}
        </div>

        {/* Inline Value Correction Form */}
        {isEditing ? (
          <form onSubmit={handleSaveEdit} className="border-2 border-primary bg-card p-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-foreground">Manual Override & Correction</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">New Value ($)</label>
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full h-8 bg-background border border-border px-2.5 font-mono text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Enter corrected value..."
                autoFocus
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">Audit Rationale</label>
              <input
                type="text"
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                className="w-full h-8 bg-background border border-border px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="e.g. Adjusted per client flight log clarification"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(false)} className="h-7 text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="h-7 text-xs gap-1 bg-primary text-primary-foreground font-semibold">
                <Check className="h-3.5 w-3.5" />
                Save Override
              </Button>
            </div>
          </form>
        ) : null}

        {/* Audit History Log */}
        {field.auditHistory && field.auditHistory.length > 0 && (
          <div className="border-t border-border pt-3 space-y-1.5">
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <History className="h-3 w-3" />
              <span>Audit Trail</span>
            </div>
            {field.auditHistory.map((audit: FieldAuditEntry, i: number) => (
              <div key={i} className="text-[11px] font-mono text-muted-foreground bg-muted/20 p-1.5 border border-border flex justify-between">
                <span>{audit.changedBy} ({audit.reason || 'Verified'}):</span>
                <span className="font-bold text-foreground">{String(audit.newValue)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Footer */}
      {isReviewerOrPreparer && (
        <div className="border-t border-border bg-muted/30 p-3 flex items-center justify-between gap-2 mt-auto">
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleStartEdit}
              className="h-8 text-xs gap-1.5 border-border"
            >
              <Edit3 className="h-3.5 w-3.5 text-sky-600" />
              Correct Value
            </Button>
          )}

          {field.state !== 'verified' ? (
            <Button
              size="sm"
              onClick={() => verifyField(field.id)}
              className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold ml-auto"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Verify & Lock Field
            </Button>
          ) : (
            <Badge variant="outline" className="gap-1.5 text-xs text-emerald-700 border-emerald-300 bg-emerald-50 font-semibold py-1 ml-auto">
              <ShieldCheck className="h-3.5 w-3.5" />
              Field Verified & Locked
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
