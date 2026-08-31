import React, { useState, useEffect } from 'react';
import { ReturnField } from '@/types';
import { usePlatformStore } from '@/store/usePlatformStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Edit3,
  CheckCircle2,
  X,
  History,
  FileText,
  Clock,
  User,
} from 'lucide-react';

interface ManualEditModalProps {
  field: ReturnField | null;
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_AUDIT_REASONS = [
  'Taxpayer oral confirmation / explanation',
  'Supporting receipt & workpaper reconciliation',
  'Schedule K-1 partner basis adjustment',
  'Section 179 / MACRS depreciation schedule adjustment',
  'IRS CP2000 / prior-year carryforward adjustment',
  'Other / Custom justification',
];

export const ManualEditModal: React.FC<ManualEditModalProps> = ({
  field,
  isOpen,
  onClose,
}) => {
  const { updateFieldValue } = usePlatformStore();

  const [newValueStr, setNewValueStr] = useState<string>('');
  const [selectedReason, setSelectedReason] = useState<string>(PRESET_AUDIT_REASONS[0]);
  const [customReason, setCustomReason] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (field) {
      setNewValueStr(String(field.value));
      setSelectedReason(PRESET_AUDIT_REASONS[0]);
      setCustomReason('');
      setSaveSuccess(false);
    }
  }, [field, isOpen]);

  if (!isOpen || !field) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newValueStr.trim()) return;

    setIsSaving(true);

    const numericVal = Number(newValueStr.replace(/[^0-9.-]/g, ''));
    const finalVal = isNaN(numericVal) ? newValueStr.trim() : numericVal;
    const finalReason =
      selectedReason === 'Other / Custom justification'
        ? customReason.trim() || 'Manual override by CPA'
        : selectedReason;

    setTimeout(() => {
      updateFieldValue(field.id, finalVal, finalReason);
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => {
        onClose();
      }, 500);
    }, 300);
  };

  const isNumericField = typeof field.value === 'number';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-lg bg-card border border-border shadow-2xl p-5 space-y-4 text-xs animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Edit3 className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-foreground">
                  Manual Value Override
                </span>
                <Badge variant="outline" className="font-mono text-[10px] py-0 bg-background">
                  {field.formCode} • {field.lineNumber}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {field.label}
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Current State Info */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-muted/20 border border-border/80">
          <div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              Current Reported Value
            </span>
            <span className="text-sm font-mono font-bold text-foreground">
              {field.formattedValue}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              Current Affordance State
            </span>
            <Badge variant="outline" className="font-mono text-[10px] uppercase mt-0.5">
              {field.state.replace('_', ' ')}
            </Badge>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* New Value Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground flex items-center justify-between">
              <span>New Value {isNumericField ? '($ USD)' : ''}:</span>
              <span className="text-[10px] text-muted-foreground font-normal">
                Will change state to <strong>Manual Override</strong>
              </span>
            </label>
            <input
              type={isNumericField ? 'number' : 'text'}
              step={isNumericField ? '0.01' : undefined}
              value={newValueStr}
              onChange={(e) => setNewValueStr(e.target.value)}
              required
              className="w-full h-8 px-3 bg-background border border-border text-xs font-mono font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder={isNumericField ? 'Enter dollar amount...' : 'Enter value...'}
            />
          </div>

          {/* Audit Trail Justification */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-primary" />
              <span>Mandatory Audit Justification (Circular 230):</span>
            </label>

            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="w-full h-8 px-2.5 bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {PRESET_AUDIT_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            {selectedReason === 'Other / Custom justification' && (
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Enter specific regulatory justification, workpaper page, or client confirmation details..."
                rows={2}
                required
                className="w-full p-2 bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            )}
          </div>

          {/* Prior Audit History (if any) */}
          {field.auditHistory && field.auditHistory.length > 0 && (
            <div className="p-3 bg-muted/10 border border-border space-y-2">
              <div className="flex items-center gap-1.5 text-muted-foreground font-bold text-[10px] uppercase">
                <History className="h-3.5 w-3.5 text-primary" />
                <span>Audit Trail History ({field.auditHistory.length} prior {field.auditHistory.length === 1 ? 'entry' : 'entries'})</span>
              </div>
              <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                {field.auditHistory.map((entry, idx) => (
                  <div key={idx} className="p-1.5 bg-background border border-border/60 text-[10px] space-y-0.5">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="font-semibold text-foreground flex items-center gap-1">
                        <User className="h-2.5 w-2.5" />
                        {entry.changedBy}
                      </span>
                      <span className="font-mono flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" />
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-foreground/90 italic">
                      &ldquo;{entry.reason}&rdquo;
                    </p>
                    {entry.oldValue !== undefined && entry.newValue !== undefined && (
                      <span className="text-muted-foreground font-mono block">
                        {String(entry.oldValue)} &rarr; {String(entry.newValue)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-8 px-3 text-xs"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              size="sm"
              disabled={isSaving || !newValueStr.trim()}
              className="h-8 px-4 text-xs font-semibold gap-1.5 bg-amber-600 hover:bg-amber-700 text-white shadow-2xs"
            >
              {isSaving ? (
                <Clock className="h-3.5 w-3.5 animate-spin" />
              ) : saveSuccess ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <Edit3 className="h-3.5 w-3.5" />
              )}
              <span>{isSaving ? 'Recording Audit Trail...' : saveSuccess ? 'Saved!' : 'Save Manual Override'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
