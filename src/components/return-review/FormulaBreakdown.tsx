import React from 'react';
import { ReturnField, CalculationInput } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Calculator, ArrowRight, Lock, CheckCircle } from 'lucide-react';

interface FormulaBreakdownProps {
  field: ReturnField;
  className?: string;
}

export const FormulaBreakdown: React.FC<FormulaBreakdownProps> = ({
  field,
  className = '',
}) => {
  const { formula, aiExplanation } = field;
  const breakdown = aiExplanation?.calculationBreakdown;

  if (!formula && !breakdown) {
    return null;
  }

  return (
    <div className={`border border-border bg-card p-4 space-y-3 shadow-xs ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center bg-slate-800 text-white">
            <Calculator className="h-3.5 w-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">Calculation Tree</h4>
            <p className="text-[10px] text-muted-foreground font-mono">{field.label}</p>
          </div>
        </div>
        <Badge variant="outline" className="text-[10px] font-mono gap-1 text-slate-700 bg-slate-100 dark:bg-slate-800">
          <Lock className="h-3 w-3" />
          Formula Locked
        </Badge>
      </div>

      {/* Primary Mathematical Formula */}
      <div className="bg-muted/40 p-2.5 border border-border font-mono text-xs font-bold text-foreground">
        {formula || breakdown?.formula}
      </div>

      {/* Input Breakdown List */}
      {breakdown?.inputs && breakdown.inputs.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Operand Inputs</span>
          <div className="divide-y divide-border border border-border">
            {breakdown.inputs.map((inp: CalculationInput, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-2 text-xs font-mono bg-card hover:bg-muted/30">
                <div className="flex items-center gap-1.5">
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <span className="font-semibold text-foreground">{inp.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {inp.docRef && (
                    <span className="text-[10px] text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950 px-1.5 py-0.5 border border-purple-200">
                      {inp.docRef}
                    </span>
                  )}
                  <strong className="text-foreground">${inp.value.toLocaleString()}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Result Verification */}
      <div className="flex items-center justify-between p-2.5 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 text-xs font-mono">
        <span className="flex items-center gap-1 text-emerald-800 dark:text-emerald-300 font-bold">
          <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
          Calculated Total:
        </span>
        <span className="text-sm font-extrabold text-emerald-950 dark:text-emerald-100">
          {field.formattedValue || `$${field.value}`}
        </span>
      </div>
    </div>
  );
};
