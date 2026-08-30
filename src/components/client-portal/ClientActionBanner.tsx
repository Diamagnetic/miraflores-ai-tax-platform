import React, { useState } from 'react';
import { TaxReturn } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  FileCheck,
  CheckCircle2,
  Clock,
  Upload,
  Send,
  Lock,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface ClientActionBannerProps {
  activeReturn: TaxReturn;
  onSignReturn?: () => void;
  onOpenUpload?: () => void;
  className?: string;
}

export const ClientActionBanner: React.FC<ClientActionBannerProps> = ({
  activeReturn,
  onSignReturn,
  onOpenUpload,
  className = '',
}) => {
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);
  const [signatureText, setSignatureText] = useState<string>(activeReturn.taxpayerName);
  const [isSigning, setIsSigning] = useState<boolean>(false);
  const [signedSuccess, setSignedSuccess] = useState<boolean>(false);

  const handleSignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms || !signatureText.trim()) return;

    setIsSigning(true);
    setTimeout(() => {
      setIsSigning(false);
      setSignedSuccess(true);
      if (onSignReturn) {
        onSignReturn();
      }
    }, 600);
  };

  // 1. BLOCKED State: Urgent call to action
  if (activeReturn.isBlocked) {
    return (
      <Card className={`border-rose-300 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/20 shadow-xs ${className}`}>
        <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-200 shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300">
                  Action Required From You
                </span>
                <Badge variant="destructive" className="font-mono text-[10px] py-0">
                  Intake Blocked
                </Badge>
              </div>
              <p className="text-sm font-semibold text-foreground mt-0.5">
                {activeReturn.blockerReason || 'Additional documentation is required to finalize your return calculation.'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Your CPA preparer ({activeReturn.assignedPreparerName}) has requested supporting workpapers before continuing.
              </p>
            </div>
          </div>

          <Button
            onClick={onOpenUpload}
            className="shrink-0 h-9 px-4 text-xs font-semibold gap-1.5 bg-rose-600 text-white hover:bg-rose-700 shadow-xs"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Upload Requested Files</span>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // 2. READY_FOR_SIGNATURE State: Form 8879 Electronic Signature Card
  if (activeReturn.status === 'CLIENT_SIGN' || activeReturn.clientMilestone === 'READY_FOR_SIGNATURE') {
    return (
      <Card className={`border-primary/40 bg-card shadow-sm ${className}`}>
        <CardHeader className="p-4 sm:p-5 border-b border-border bg-primary/5 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 text-primary shrink-0">
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-foreground">
                Form 8879: IRS e-file Signature Authorization
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Review your final return summary and electronically sign to authorize IRS transmission.
              </p>
            </div>
          </div>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 font-mono text-[10px] hover:bg-primary/10 hover:text-primary">
            Ready to Sign
          </Badge>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 space-y-4">
          {/* Return summary numbers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-muted/20 border border-border">
            <div>
              <span className="text-[10px] text-muted-foreground font-mono uppercase block">Total Income (AGI)</span>
              <strong className="text-sm font-mono font-bold text-foreground">
                {formatCurrency(activeReturn.totalIncome)}
              </strong>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground font-mono uppercase block">Total Tax Liability</span>
              <strong className="text-sm font-mono font-bold text-foreground">
                {formatCurrency(activeReturn.taxLiability)}
              </strong>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground font-mono uppercase block">
                {activeReturn.refundOrDueAmount >= 0 ? 'Estimated Refund' : 'Amount You Owe'}
              </span>
              <strong
                className={`text-sm font-mono font-bold ${
                  activeReturn.refundOrDueAmount >= 0
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-amber-700 dark:text-amber-400'
                }`}
              >
                {formatCurrency(Math.abs(activeReturn.refundOrDueAmount))}
              </strong>
            </div>
          </div>

          {/* E-Signature Form */}
          {signedSuccess ? (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
                  Form 8879 Successfully Signed & Authorized!
                </p>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300 mt-0.5">
                  Your return has been queued for immediate IRS electronic filing submission.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSignSubmit} className="space-y-3 pt-2">
              <div className="flex items-start gap-2 text-xs">
                <input
                  type="checkbox"
                  id="agree-checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 rounded-none border-border cursor-pointer text-primary focus:ring-primary"
                />
                <label htmlFor="agree-checkbox" className="text-muted-foreground leading-snug cursor-pointer select-none">
                  I declare under penalties of perjury that I have examined a copy of my {activeReturn.taxYear} Form {activeReturn.returnType} tax return and accompanying schedules, and to the best of my knowledge and belief, it is true, correct, and complete.
                </label>
              </div>

              <div className="flex flex-wrap items-end gap-3 pt-1">
                <div className="flex-1 min-w-[220px]">
                  <label className="text-[11px] font-semibold text-foreground block mb-1">
                    Taxpayer Electronic Signature (Type Full Legal Name):
                  </label>
                  <input
                    type="text"
                    value={signatureText}
                    onChange={(e) => setSignatureText(e.target.value)}
                    placeholder="Full Legal Name"
                    className="w-full h-8 px-3 bg-background border border-border text-xs font-mono font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={!agreedToTerms || !signatureText.trim() || isSigning}
                  className="h-8 px-4 text-xs font-semibold gap-1.5 bg-card text-primary border border-primary/40 shadow-xs hover:bg-primary/5 hover:border-primary/70"
                >
                  <Lock className="h-3.5 w-3.5" />
                  <span>{isSigning ? 'Submitting Authorization...' : 'Sign & Authorize E-File'}</span>
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    );
  }

  // 3. E_FILED or ACCEPTED State
  if (activeReturn.status === 'E_FILED' || activeReturn.status === 'ACCEPTED' || activeReturn.clientMilestone === 'SUBMITTED_TO_IRS' || activeReturn.clientMilestone === 'ACCEPTED') {
    return (
      <Card className="border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs">
        <CardContent className="p-4 sm:p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 shrink-0">
              <Send className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  {activeReturn.status === 'ACCEPTED' ? 'IRS Acceptance Confirmed' : 'Submitted to IRS'}
                </span>
                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 border-emerald-300 font-mono text-[10px] py-0">
                  {activeReturn.status === 'ACCEPTED' ? 'Return Accepted' : 'E-Filed Pending IRS ACK'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Submission ID: <code className="font-mono font-bold text-foreground">IRS-2026-TX-89104</code> • Official Form 1040 copy saved to your permanent record.
              </p>
            </div>
          </div>

          <Badge variant="outline" className="font-mono text-xs hidden sm:inline-flex bg-card">
            TY {activeReturn.taxYear} Completed
          </Badge>
        </CardContent>
      </Card>
    );
  }

  // 4. PREPARATION / REVIEW State: Reassuring progress notice
  return (
    <Card className={`border-border bg-card shadow-xs ${className}`}>
      <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-muted text-foreground shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                Return Under Active CPA Preparation
              </span>
              <Badge variant="outline" className="font-mono text-[10px] py-0">
                {activeReturn.status === 'REVIEW' ? 'Partner Review' : 'Expert Prep'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Your tax files have been ingested by AI extraction and are currently undergoing expert verification by {activeReturn.assignedPreparerName}.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenUpload}
            className="h-8 text-xs gap-1.5 font-semibold"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Upload More Files</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
