import React, { useState, useEffect } from 'react';
import { TaxReturn } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  FileCheck,
  Clock,
  Upload,
  Send,
  Lock,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface ClientActionBannerProps {
  activeReturn: TaxReturn;
  onSignReturn?: () => void;
  onOpenUpload?: () => void;
  onUploadSampleW2?: () => void;
  className?: string;
}

export const ClientActionBanner: React.FC<ClientActionBannerProps> = ({
  activeReturn,
  onSignReturn,
  onOpenUpload,
  onUploadSampleW2,
  className = '',
}) => {
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);
  const [signatureText, setSignatureText] = useState<string>(activeReturn.taxpayerName);
  const [isSigning, setIsSigning] = useState<boolean>(false);
  const [signedSuccess, setSignedSuccess] = useState<boolean>(Boolean(activeReturn.clientSigned));

  const isRefund = activeReturn.refundOrDueAmount >= 0;

  // Keep signature field strictly synchronized with the active account holder's name
  useEffect(() => {
    setSignatureText(activeReturn.taxpayerName);
    setAgreedToTerms(false);
    setSignedSuccess(Boolean(activeReturn.clientSigned));
  }, [activeReturn.id, activeReturn.taxpayerName, activeReturn.clientSigned]);

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

  // 0. NEW CLIENT INTAKE State (0 documents uploaded yet - 10-second first-time start)
  if (activeReturn.status === 'INTAKE' && activeReturn.documentCount === 0) {
    return (
      <Card className={`border-primary/40 bg-card shadow-sm ${className}`}>
        <CardHeader className="p-4 sm:p-5 border-b border-border bg-primary/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-primary/10 text-primary shrink-0">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-foreground">
                  Welcome to Your 2025 Tax Portal, {activeReturn.taxpayerName}!
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Get started in under 10 seconds. Complete Step 2 to begin your return preparation.
                </p>
              </div>
            </div>
            <Badge variant="outline" className="font-mono text-xs bg-card hidden sm:inline-flex">
              Step 1 of 3 Active
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Step 1 */}
            <div className="p-3.5 border border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                    Step 1 • Profile
                  </span>
                  <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 border-emerald-300 text-[10px] py-0">
                    Ready
                  </Badge>
                </div>
                <p className="text-xs font-semibold text-foreground">Tax Year 2025 Filing</p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Single Filer • Standard Deduction profile initialized.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-3.5 border-2 border-primary bg-primary/5 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                    Step 2 • Action Required
                  </span>
                  <Badge className="bg-primary text-primary-foreground text-[10px] py-0">
                    Next Action
                  </Badge>
                </div>
                <p className="text-xs font-semibold text-foreground">Upload 2025 Tax Forms</p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Upload your W-2 or 1099 to trigger automatic AI extraction.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-3.5 border border-border bg-muted/30 flex flex-col justify-between opacity-80">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Step 3 • CPA Review
                  </span>
                  <Badge variant="outline" className="text-[10px] py-0 text-muted-foreground">
                    Upcoming
                  </Badge>
                </div>
                <p className="text-xs font-semibold text-foreground">Expert Verification</p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {activeReturn.assignedPreparerName || 'Sam Wilson, CPA'} will verify your numbers.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Start Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Have your 2025 W-2 ready? Drag and drop below or click the quick simulation button:
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                onClick={onUploadSampleW2 || onOpenUpload}
                className="h-9 px-4 text-xs font-semibold gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xs"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Upload Sample 2025 W-2 Form</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

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

  // 2. READY_FOR_SIGNATURE / CLIENT_SIGN State (Not signed yet)
  if (activeReturn.status === 'CLIENT_SIGN' && !activeReturn.clientSigned && !signedSuccess) {
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
          <Badge
            variant="outline"
            className="bg-primary/10 text-primary border-primary/30 font-mono text-[10px] hover:bg-primary/10 hover:text-primary"
          >
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
                {isRefund ? 'Estimated Refund' : 'Amount You Owe'}
              </span>
              <strong
                className={`text-sm font-mono font-bold ${
                  isRefund
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-amber-700 dark:text-amber-400'
                }`}
              >
                {formatCurrency(Math.abs(activeReturn.refundOrDueAmount))}
              </strong>
            </div>
          </div>

          {/* E-Signature Form */}
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
        </CardContent>
      </Card>
    );
  }

  // 3. Stage 5 State: Signed, Awaiting CPA Transmission to IRS
  if (
    (activeReturn.status === 'CLIENT_SIGN' && (activeReturn.clientSigned || signedSuccess)) ||
    (activeReturn.clientMilestone === 'SUBMITTED_TO_IRS' && activeReturn.status !== 'E_FILED' && activeReturn.status !== 'ACCEPTED')
  ) {
    return (
      <Card className="border-sky-300 dark:border-sky-800 bg-sky-50/40 dark:bg-sky-950/20 shadow-xs">
        <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 shrink-0">
              <Send className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-800 dark:text-sky-300">
                  Stage 5: Form 8879 Signed & Ready for Transmission
                </span>
                <Badge className="bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-200 border-sky-300 font-mono text-[10px] py-0">
                  Signed by Taxpayer
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Form 8879 signed & authorized. Your CPA preparer ({activeReturn.assignedPreparerName}) will transmit the electronic return package to the IRS MeF Gateway under the firm's EFIN.
              </p>
            </div>
          </div>

          <Badge variant="outline" className="font-mono text-xs hidden sm:inline-flex bg-card shrink-0">
            Stage 5 Active
          </Badge>
        </CardContent>
      </Card>
    );
  }

  // 4. Stage 6 State (Transmitted, Awaiting Acceptance)
  if (activeReturn.status === 'E_FILED') {
    return (
      <Card className="border-sky-300 dark:border-sky-800 bg-sky-50/40 dark:bg-sky-950/20 shadow-xs">
        <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 shrink-0">
              <Send className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-800 dark:text-sky-300">
                  Stage 6: Return Transmitted to IRS (Awaiting Acceptance)
                </span>
                <Badge className="bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-200 border-sky-300 font-mono text-[10px] py-0">
                  In IRS Processing
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                CPA has electronically transmitted your return documents and schedules to the IRS MeF Gateway (Submission ID: <code className="font-mono font-bold text-foreground">{activeReturn.irsSubmissionId || 'IRS-2026-TX-89104'}</code>). Stage 5 (IRS Submission) is complete. Awaiting official IRS acceptance and refund/payment verification.
              </p>
            </div>
          </div>

          <Badge variant="outline" className="font-mono text-xs hidden sm:inline-flex bg-card shrink-0">
            Stage 6 Active
          </Badge>
        </CardContent>
      </Card>
    );
  }

  // 5. Stage 6 State: Return Accepted & Processed by IRS
  if (activeReturn.status === 'ACCEPTED' || activeReturn.clientMilestone === 'ACCEPTED') {
    return (
      <Card className="border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs">
        <CardContent className="p-4 sm:p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  Stage 6: Return Accepted & Processed by IRS
                </span>
                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 border-emerald-300 font-mono text-[10px] py-0">
                  Return Accepted (Code 0000)
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                The IRS has completed its review, verified the return with zero discrepancies, and officially accepted it (Submission ID: <code className="font-mono font-bold text-foreground">{activeReturn.irsSubmissionId || 'IRS-2026-TX-89104'}</code>). {isRefund ? `Your estimated refund of ${formatCurrency(Math.abs(activeReturn.refundOrDueAmount))} has been approved for direct deposit.` : `Your calculated balance due of ${formatCurrency(Math.abs(activeReturn.refundOrDueAmount))} is payable to the IRS by April 15.`} Official Form {activeReturn.returnType} filing completed and archived.
              </p>
            </div>
          </div>

          <Badge variant="outline" className="font-mono text-xs hidden sm:inline-flex bg-card shrink-0">
            TY {activeReturn.taxYear} Completed
          </Badge>
        </CardContent>
      </Card>
    );
  }

  // 6. PREPARATION / REVIEW State: Reassuring progress notice
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
