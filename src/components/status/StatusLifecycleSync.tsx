import React from 'react';
import { TaxReturn, ReturnStatus, ClientMilestone, NextActionOwner } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, RefreshCw, ShieldCheck, UserCheck, Briefcase } from 'lucide-react';

/**
 * Bidirectional translation utilities between internal 7-stage CPA status
 * and client-facing 6-milestone progress tracking.
 */

export const syncCpaStatusToClientMilestone = (status: ReturnStatus): ClientMilestone => {
  switch (status) {
    case 'INTAKE':
      return 'DOCUMENTS_NEEDED';
    case 'EXTRACTION':
      return 'PROCESSING';
    case 'PREPARATION':
      return 'PREPARATION';
    case 'REVIEW':
      return 'EXPERT_REVIEW';
    case 'CLIENT_SIGN':
      return 'READY_FOR_SIGNATURE';
    case 'E_FILED':
      return 'SUBMITTED_TO_IRS';
    case 'ACCEPTED':
      return 'ACCEPTED';
    default:
      return 'DOCUMENTS_NEEDED';
  }
};

export const syncClientMilestoneToCpaStatus = (milestone: ClientMilestone): ReturnStatus => {
  switch (milestone) {
    case 'DOCUMENTS_NEEDED':
      return 'INTAKE';
    case 'PROCESSING':
      return 'EXTRACTION';
    case 'PREPARATION':
      return 'PREPARATION';
    case 'EXPERT_REVIEW':
      return 'REVIEW';
    case 'READY_FOR_SIGNATURE':
      return 'CLIENT_SIGN';
    case 'SUBMITTED_TO_IRS':
      return 'E_FILED';
    case 'ACCEPTED':
      return 'ACCEPTED';
    default:
      return 'INTAKE';
  }
};

export const determineNextActionOwner = (
  status: ReturnStatus,
  isBlocked: boolean,
  clientSigned?: boolean
): { owner: NextActionOwner; description: string } => {
  if (isBlocked) {
    return {
      owner: 'client',
      description: 'Taxpayer action required: Upload missing documents or clarify flagged deduction.',
    };
  }

  switch (status) {
    case 'INTAKE':
    case 'EXTRACTION':
      return {
        owner: 'preparer',
        description: 'CPA associate ingesting workpapers and verifying automated AI extraction.',
      };
    case 'PREPARATION':
      return {
        owner: 'preparer',
        description: 'CPA finalizing tax schedules, depreciation calculations, and deductions.',
      };
    case 'REVIEW':
      return {
        owner: 'reviewer',
        description: 'Senior CPA reviewer performing quality assurance and compliance sign-off.',
      };
    case 'CLIENT_SIGN':
      if (clientSigned) {
        return {
          owner: 'reviewer',
          description: 'Client signed Form 8879. Awaiting CPA final transmission to IRS MeF gateway.',
        };
      }
      return {
        owner: 'client',
        description: 'Taxpayer review and electronic signature on Form 8879 required.',
      };
    case 'E_FILED':
      return {
        owner: 'irs',
        description: 'Return transmitted to IRS Modernized e-File (MeF). Awaiting electronic acceptance.',
      };
    case 'ACCEPTED':
      return {
        owner: 'client',
        description: 'Return officially accepted by the IRS. Filing complete for this tax year.',
      };
    default:
      return {
        owner: 'preparer',
        description: 'CPA review in progress.',
      };
  }
};

export const getStageProgressPercentage = (status: ReturnStatus, isBlocked: boolean): number => {
  if (isBlocked) return 20;
  switch (status) {
    case 'INTAKE': return 15;
    case 'EXTRACTION': return 30;
    case 'PREPARATION': return 50;
    case 'REVIEW': return 75;
    case 'CLIENT_SIGN': return 90;
    case 'E_FILED': return 95;
    case 'ACCEPTED': return 100;
    default: return 10;
  }
};

interface StatusLifecycleSyncCardProps {
  activeReturn: TaxReturn;
  className?: string;
}

export const StatusLifecycleSyncCard: React.FC<StatusLifecycleSyncCardProps> = ({
  activeReturn,
  className = '',
}) => {
  const syncedMilestone = syncCpaStatusToClientMilestone(activeReturn.status);
  const actionInfo = determineNextActionOwner(
    activeReturn.status,
    activeReturn.isBlocked,
    Boolean(activeReturn.clientSigned)
  );

  return (
    <Card className={`border border-border bg-card shadow-2xs ${className}`}>
      <CardContent className="p-3 sm:p-4 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-foreground flex items-center gap-1.5">
            <RefreshCw className="h-3.5 w-3.5 text-primary" />
            Lifecycle Synchronization Matrix
          </span>
          <Badge variant="outline" className="font-mono text-[10px] py-0">
            {getStageProgressPercentage(activeReturn.status, activeReturn.isBlocked)}% Complete
          </Badge>
        </div>

        {/* Dual Stage Mapping Visualization */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-2.5 bg-muted/30 border border-border text-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-muted-foreground uppercase flex items-center gap-1">
              <Briefcase className="h-3 w-3 text-primary" />
              CPA Internal Stage (7-Stage)
            </span>
            <div className="font-mono font-bold text-foreground">
              {activeReturn.status}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono text-muted-foreground uppercase flex items-center gap-1">
              <UserCheck className="h-3 w-3 text-primary" />
              Client Portal Milestone (6-Stage)
            </span>
            <div className="font-mono font-bold text-primary flex items-center gap-1.5">
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              {syncedMilestone}
            </div>
          </div>
        </div>

        {/* Next Action Owner Description */}
        <div className="text-xs bg-card border border-border/70 p-2.5 flex items-start gap-2">
          <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold capitalize text-foreground">
              {actionInfo.owner} Next Step:
            </strong>{' '}
            <span className="text-muted-foreground">{actionInfo.description}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
