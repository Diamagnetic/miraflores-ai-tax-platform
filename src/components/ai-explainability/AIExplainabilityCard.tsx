import React, { useState } from 'react';
import { ReturnField, EvidenceItem, FieldAuditEntry } from '@/types';
import { usePlatformStore } from '@/store/usePlatformStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  ShieldCheck,
  Edit3,
  FileText,
  AlertTriangle,
  History,
  Check,
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
      <div className={`p-8 border border-border bg-card text-center text-muted-foreground ${className}`}>
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

  const confidenceScore = Math.round(
    (field.aiConfidence && field.aiConfidence <= 1 ? field.aiConfidence * 100 : field.aiConfidence) ||
      explainability?.confidenceScore ||
      98
  );
  const isFlagged = confidenceScore < 85;

  return (
    <div className={`border border-border bg-card shadow-xs flex flex-col ${className}`}>
      {/* Clean Header: Field Line, Name & Confidence Score */}
      <div className="border-b border-border bg-muted/30 p-3.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-7 w-7 items-center justify-center bg-purple-600 text-white font-bold shrink-0">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-foreground truncate">
              {field.formCode} {field.lineNumber}: {field.label}
            </h3>
            <p className="text-[11px] text-muted-foreground font-mono">
              Value: <strong className="text-foreground">{field.formattedValue || `$${field.value}`}</strong>
            </p>
          </div>
        </div>

        {/* Confidence Gauge */}
        <div className="shrink-0">
          <Badge
            variant="outline"
            className={`font-mono text-xs font-bold gap-1 py-1 px-2.5 ${
              isFlagged
                ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200'
                : 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/60 dark:text-purple-200'
            }`}
          >
            {isFlagged ? <AlertTriangle className="h-3.5 w-3.5 text-amber-600" /> : <Sparkles className="h-3.5 w-3.5 text-purple-600" />}
            <span>{confidenceScore}% AI Confidence</span>
          </Badge>
        </div>
      </div>

      {/* Streamlined Body Content (Zero Clutter) */}
      <div className="p-4 space-y-3.5 text-xs">
        {/* Plain English Extraction Summary */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Extraction Summary</span>
          <p className="text-xs text-foreground leading-relaxed">
            {explainability?.summary ||
              `Extracted ${field.formattedValue || field.value} for ${field.label} directly from ${field.sourceDocumentIds?.length || 1} verified source document(s).`}
          </p>
        </div>

        {/* Direct Source Evidence Pill */}
        {explainability?.evidence && explainability.evidence.length > 0 ? (
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Source Evidence</span>
            <div className="space-y-1">
              {explainability.evidence.map((item: EvidenceItem, idx: number) => (
                <div
                  key={idx}
                  onClick={() => handleEvidenceClick(item.sourceDocumentId, item.boundingBoxId)}
                  className="flex items-center justify-between p-2.5 border border-border bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors"
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
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Formula Breakdown (if present) */}
        {field.formula && (
          <div className="space-y-1 pt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Calculation Rule</span>
            <div className="p-2 font-mono text-xs font-semibold text-foreground bg-muted/20 border border-border">
              {field.formula}
            </div>
          </div>
        )}

        {/* Inline Manual Correction Form */}
        {isEditing ? (
          <form onSubmit={handleSaveEdit} className="p-3 border border-amber-300 bg-amber-50/50 dark:bg-amber-950/20 space-y-2.5">
            <span className="text-xs font-bold text-amber-900 dark:text-amber-200">Manual Override</span>
            <div>
              <label className="block text-[11px] font-medium text-muted-foreground mb-1">Corrected Value</label>
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full h-8 bg-background border border-border px-2.5 font-mono text-xs text-foreground focus:outline-none"
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
                className="w-full h-8 bg-background border border-border px-2.5 text-xs text-foreground focus:outline-none"
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
          <div className="border-t border-border pt-2.5 space-y-1">
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

      {/* Clean Action Footer */}
      {isReviewerOrPreparer && (
        <div className="border-t border-border bg-muted/30 p-3 flex items-center justify-between gap-2 mt-auto">
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleStartEdit}
              className="h-8 text-xs gap-1.5 border-border"
            >
              <Edit3 className="h-3.5 w-3.5 text-amber-700" />
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
            <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 ml-auto">
              <ShieldCheck className="h-3.5 w-3.5" />
              Verified & Locked
            </span>
          )}
        </div>
      )}
    </div>
  );
};
