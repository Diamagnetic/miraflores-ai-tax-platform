import React from 'react';
import { TaxReturn, ClientMilestone, ReturnStatus } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Clock, AlertTriangle, FileText, CheckCircle2, Send, ShieldCheck, PenTool } from 'lucide-react';

interface ClientMilestoneProgressProps {
  activeReturn: TaxReturn;
  className?: string;
}

interface StageDefinition {
  id: number;
  title: string;
  milestones: ClientMilestone[];
  statuses: ReturnStatus[];
  icon: React.ComponentType<{ className?: string }>;
}

const STAGES: StageDefinition[] = [
  {
    id: 1,
    title: 'Documents Intake',
    milestones: ['DOCUMENTS_NEEDED', 'PROCESSING'],
    statuses: ['INTAKE', 'EXTRACTION'],
    icon: FileText,
  },
  {
    id: 2,
    title: 'Expert Prep',
    milestones: ['PREPARATION'],
    statuses: ['PREPARATION'],
    icon: Clock,
  },
  {
    id: 3,
    title: 'Partner Review',
    milestones: ['EXPERT_REVIEW'],
    statuses: ['REVIEW'],
    icon: CheckCircle2,
  },
  {
    id: 4,
    title: 'Client Signature',
    milestones: ['READY_FOR_SIGNATURE'],
    statuses: ['CLIENT_SIGN'],
    icon: PenTool,
  },
  {
    id: 5,
    title: 'IRS Submission',
    milestones: ['SUBMITTED_TO_IRS'],
    statuses: ['E_FILED'],
    icon: Send,
  },
  {
    id: 6,
    title: 'Return Accepted',
    milestones: ['ACCEPTED'],
    statuses: ['ACCEPTED'],
    icon: ShieldCheck,
  },
];

export const ClientMilestoneProgress: React.FC<ClientMilestoneProgressProps> = ({
  activeReturn,
  className = '',
}) => {
  // Determine current stage index (1 to 6)
  const currentStageIndex = (() => {
    if (activeReturn.status === 'ACCEPTED' || activeReturn.clientMilestone === 'ACCEPTED') return 6;
    if (activeReturn.status === 'E_FILED' || activeReturn.clientMilestone === 'SUBMITTED_TO_IRS') return 5;
    if (activeReturn.status === 'CLIENT_SIGN' || activeReturn.clientMilestone === 'READY_FOR_SIGNATURE') return 4;
    if (activeReturn.status === 'REVIEW' || activeReturn.clientMilestone === 'EXPERT_REVIEW') return 3;
    if (activeReturn.status === 'PREPARATION' || activeReturn.clientMilestone === 'PREPARATION') return 2;
    return 1;
  })();

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      <Card className="border border-border bg-card shadow-xs">
        <CardContent className="p-4 sm:p-5">
          {/* 6-Stage Progress Stepper */}
          <div className="relative">
            {/* Background connecting bar */}
            <div className="absolute top-4 left-6 right-6 h-0.5 bg-muted hidden sm:block -z-0" />

            {/* Active completed connector bar */}
            <div
              className="absolute top-4 left-6 h-0.5 bg-primary transition-all duration-500 hidden sm:block -z-0"
              style={{
                width: `${Math.max(0, ((currentStageIndex - 1) / (STAGES.length - 1)) * 100)}%`,
              }}
            />

            {/* Stage nodes */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 sm:gap-1 relative z-10">
              {STAGES.map((stage) => {
                const isCompleted = stage.id < currentStageIndex;
                const isCurrent = stage.id === currentStageIndex;
                const isBlockedCurrent = isCurrent && activeReturn.isBlocked;
                const Icon = stage.icon;

                return (
                  <div
                    key={stage.id}
                    className="flex flex-col items-center text-center space-y-1.5 group"
                  >
                    {/* Node circle */}
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 border-2 ${
                        isCompleted
                          ? 'bg-primary text-primary-foreground border-primary'
                          : isBlockedCurrent
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 border-rose-500 ring-4 ring-rose-100 dark:ring-rose-900/30'
                          : isCurrent
                          ? 'bg-primary/10 text-primary border-primary ring-4 ring-primary/15 font-extrabold'
                          : 'bg-card text-muted-foreground border-muted'
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
                    <div className="space-y-0.5">
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
        </CardContent>
      </Card>
    </div>
  );
};
