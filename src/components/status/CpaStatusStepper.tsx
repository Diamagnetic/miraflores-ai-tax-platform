import React from 'react';
import { TaxReturn, ReturnStatus } from '@/types';
import {
  Check,
  Clock,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Send,
  ShieldCheck,
  PenTool,
  Sparkles,
} from 'lucide-react';

interface CpaStatusStepperProps {
  activeReturn: TaxReturn;
  className?: string;
}

interface CpaStageDefinition {
  id: number;
  title: string;
  statuses: ReturnStatus[];
  icon: React.ComponentType<{ className?: string }>;
}

const CPA_STAGES: CpaStageDefinition[] = [
  {
    id: 1,
    title: 'Documents Intake',
    statuses: ['INTAKE'],
    icon: FileText,
  },
  {
    id: 2,
    title: 'AI Extraction',
    statuses: ['EXTRACTION'],
    icon: Sparkles,
  },
  {
    id: 3,
    title: 'Expert Prep',
    statuses: ['PREPARATION'],
    icon: Clock,
  },
  {
    id: 4,
    title: 'Partner Review',
    statuses: ['REVIEW'],
    icon: CheckCircle2,
  },
  {
    id: 5,
    title: 'Client Signature',
    statuses: ['CLIENT_SIGN'],
    icon: PenTool,
  },
  {
    id: 6,
    title: 'IRS Submission',
    statuses: ['E_FILED'],
    icon: Send,
  },
  {
    id: 7,
    title: 'Return Accepted',
    statuses: ['ACCEPTED'],
    icon: ShieldCheck,
  },
];

export const CpaStatusStepper: React.FC<CpaStatusStepperProps> = ({
  activeReturn,
  className = '',
}) => {
  const isAccepted = activeReturn.status === 'ACCEPTED';
  const isTransmitted = activeReturn.status === 'E_FILED';
  const isSigned = Boolean(activeReturn.clientSigned);

  // Determine current stage index (1 to 7)
  const currentStageIndex = (() => {
    if (isAccepted) return 7;
    if (isTransmitted) return 7; // When transmitted, Stage 6 is DONE and Stage 7 is current awaiting acceptance
    if (isSigned && activeReturn.status === 'CLIENT_SIGN') return 6; // When client signs, Stage 5 is DONE and Stage 6 (IRS Submission) is current
    if (activeReturn.status === 'CLIENT_SIGN') return 5;
    if (activeReturn.status === 'REVIEW') return 4;
    if (activeReturn.status === 'PREPARATION') return 3;
    if (activeReturn.status === 'EXTRACTION') return 2;
    return 1;
  })();

  const isAllCompleted = isAccepted;

  return (
    <div className={`w-full ${className}`}>
      {/* 7-Stage Progress Stepper - Direct Stepper Row */}
      <div className="flex items-start justify-between w-full">
        {CPA_STAGES.map((stage, index) => {
          const isCompleted = isAllCompleted || stage.id < currentStageIndex;
          const isCurrent = !isAllCompleted && stage.id === currentStageIndex;
          const isBlockedCurrent = isCurrent && activeReturn.isBlocked;
          const Icon = stage.icon;

          return (
            <div key={stage.id} className="flex-1 flex flex-col items-center relative">
              {/* Connector line connecting previous node to this node */}
              {index > 0 && (
                <div
                  className={`absolute top-4 h-0.5 -z-0 transition-colors duration-300 ${
                    isCompleted || isCurrent ? 'bg-primary' : 'bg-muted'
                  }`}
                  style={{
                    left: 'calc(-50% + 20px)',
                    right: 'calc(50% + 20px)',
                  }}
                />
              )}

              {/* Node Circle */}
              <div
                className={`relative z-10 h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 border-2 ${
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
                  <Check className="h-4 w-4 stroke-[2.5]" />
                ) : isBlockedCurrent ? (
                  <AlertTriangle className="h-4 w-4 stroke-[2.5]" />
                ) : (
                  <Icon className="h-3.5 w-3.5" />
                )}
              </div>

              {/* Step Title */}
              <div className="mt-2 text-center space-y-0.5 max-w-[105px] px-1">
                <span className="text-[10px] font-mono text-muted-foreground block">
                  Stage {stage.id}
                </span>
                <p
                  className={`text-xs leading-tight font-medium ${
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
    </div>
  );
};
