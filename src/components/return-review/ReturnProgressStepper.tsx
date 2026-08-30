import React from 'react';
import { TaxReturn, ReturnStatus } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Check, AlertTriangle, FileText, Sparkles, Clock, CheckCircle2, PenTool, Send, ShieldCheck } from 'lucide-react';

interface ReturnProgressStepperProps {
  activeReturn: TaxReturn;
  className?: string;
}

interface CpaStageDefinition {
  id: number;
  statusKey: ReturnStatus;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}

const CPA_STAGES: CpaStageDefinition[] = [
  { id: 1, statusKey: 'INTAKE', title: 'Intake', icon: FileText },
  { id: 2, statusKey: 'EXTRACTION', title: 'Extraction', icon: Sparkles },
  { id: 3, statusKey: 'PREPARATION', title: 'Preparation', icon: Clock },
  { id: 4, statusKey: 'REVIEW', title: 'Review', icon: CheckCircle2 },
  { id: 5, statusKey: 'CLIENT_SIGN', title: 'Client Sign', icon: PenTool },
  { id: 6, statusKey: 'E_FILED', title: 'E-Filed', icon: Send },
  { id: 7, statusKey: 'ACCEPTED', title: 'Accepted', icon: ShieldCheck },
];

export const ReturnProgressStepper: React.FC<ReturnProgressStepperProps> = ({
  activeReturn,
  className = '',
}) => {
  // Determine current stage index (1 to 7)
  const currentStageIndex = (() => {
    switch (activeReturn.status) {
      case 'ACCEPTED': return 7;
      case 'E_FILED': return 6;
      case 'CLIENT_SIGN': return 5;
      case 'REVIEW': return 4;
      case 'PREPARATION': return 3;
      case 'EXTRACTION': return 2;
      case 'INTAKE':
      default:
        return 1;
    }
  })();

  const isAllCompleted = activeReturn.status === 'ACCEPTED';

  return (
    <Card className={`border border-border bg-card shadow-xs ${className}`}>
      <CardContent className="p-3.5 sm:p-4">
        <div className="flex items-start justify-between w-full">
          {CPA_STAGES.map((stage, index) => {
            const isCompleted =
              isAllCompleted ||
              (activeReturn.clientSigned && stage.id <= 5 && currentStageIndex === 5) ||
              stage.id < currentStageIndex;
            const isCurrent = !isAllCompleted && !isCompleted && stage.id === currentStageIndex;
            const isBlockedCurrent = isCurrent && activeReturn.isBlocked;
            const Icon = stage.icon;

            return (
              <div key={stage.id} className="flex-1 flex flex-col items-center relative">
                {/* Connector line connecting previous node to this node */}
                {index > 0 && (
                  <div
                    className={`absolute top-3.5 h-0.5 -z-0 transition-colors duration-300 ${
                      isCompleted || isCurrent ? 'bg-primary' : 'bg-muted'
                    }`}
                    style={{
                      left: 'calc(-50% + 18px)',
                      right: 'calc(50% + 18px)',
                    }}
                  />
                )}

                {/* Node Circle */}
                <div
                  className={`relative z-10 h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-200 border-2 ${
                    isCompleted
                      ? 'bg-primary text-primary-foreground border-primary'
                      : isBlockedCurrent
                      ? 'bg-background text-rose-600 border-rose-500 ring-4 ring-rose-100 dark:ring-rose-900/30'
                      : isCurrent
                      ? 'bg-background text-primary border-primary ring-4 ring-primary/15 font-extrabold shadow-xs'
                      : 'bg-background text-muted-foreground border-muted'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                  ) : isBlockedCurrent ? (
                    <AlertTriangle className="h-3.5 w-3.5 stroke-[2.5]" />
                  ) : (
                    <Icon className="h-3 w-3" />
                  )}
                </div>

                {/* Step Title */}
                <div className="mt-1.5 text-center space-y-0.5 max-w-[90px] px-0.5">
                  <p
                    className={`text-[11px] leading-tight font-medium ${
                      isCurrent
                        ? isBlockedCurrent
                          ? 'text-rose-700 dark:text-rose-400 font-bold'
                          : 'text-primary font-bold'
                        : isCompleted
                        ? 'text-foreground font-semibold'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {stage.title}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
