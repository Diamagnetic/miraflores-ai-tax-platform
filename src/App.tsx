import { Header } from '@/components/common/Header';
import { usePlatformStore } from '@/store/usePlatformStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  FileSpreadsheet,
  FileText,
  Users,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { getTriageUrgency, getUrgencyBadgeStyle } from '@/store/triageLogic';

export default function App() {
  const { returns, documents, currentUser, selectedReturnId, selectReturn } = usePlatformStore();
  const activeReturn = returns.find((r) => r.id === selectedReturnId) || returns[0];
  const activeDocs = documents.filter((d) => d.returnId === activeReturn?.id);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* Banner / Role Indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-border bg-card p-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-foreground">
                {currentUser.name}
              </h1>
              <Badge variant="outline" className="font-mono text-xs capitalize">
                {currentUser.isPersonalReturnView
                  ? 'Personal Return Mode'
                  : currentUser.role.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Foundational store active • {returns.length} Avengers Returns • {documents.length} Source Documents & Receipts
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="verified" className="gap-1.5 py-1 px-3">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Phase 2 Foundational State Live
            </Badge>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                <span>Active Returns</span>
                <Users className="h-4 w-4 text-primary" />
              </CardTitle>
              <CardDescription>Multi-entity Avengers dataset</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono tracking-tight text-foreground">
                {returns.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Form 1040, 1120-S, 1065 schedules loaded
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                <span>Source Documents & Receipts</span>
                <FileText className="h-4 w-4 text-primary" />
              </CardTitle>
              <CardDescription>OCR bounding boxes & ledgers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono tracking-tight text-foreground">
                {documents.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Includes 150+ Wakanda Tech receipt fixtures
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                <span>Current Active Return</span>
                <FileSpreadsheet className="h-4 w-4 text-primary" />
              </CardTitle>
              <CardDescription>{activeReturn?.taxpayerName}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono tracking-tight text-foreground">
                {formatCurrency(activeReturn?.totalIncome || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Status: {activeReturn?.status} • Due: {activeReturn?.dueDate}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Active Return Overview & Queue Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Return Queue List */}
          <div className="lg:col-span-1 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-primary" />
              Returns Queue ({returns.length})
            </h2>

            <div className="space-y-2">
              {returns.map((ret) => {
                const urgency = getTriageUrgency(ret.triageScore);
                const urgencyStyle = getUrgencyBadgeStyle(urgency);
                const isSelected = ret.id === selectedReturnId;

                return (
                  <div
                    key={ret.id}
                    onClick={() => selectReturn(ret.id)}
                    className={`cursor-pointer border p-3 transition-colors ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border bg-card hover:bg-muted/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold text-sm text-foreground">
                          {ret.taxpayerName}
                        </div>
                        {ret.entityName && (
                          <div className="text-xs text-muted-foreground font-mono">
                            {ret.entityName}
                          </div>
                        )}
                      </div>
                      <Badge variant="outline" className={`text-[10px] font-mono ${urgencyStyle.className}`}>
                        Score {ret.triageScore}
                      </Badge>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-mono">{ret.returnType}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {ret.dueDate}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Return Detail & Tie-Out Proof */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="border border-border">
              <CardHeader className="pb-3 border-b border-border bg-muted/20">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <span>{activeReturn.taxpayerName}</span>
                      <Badge variant="outline" className="font-mono text-xs">
                        Form {activeReturn.returnType} ({activeReturn.taxYear})
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Preparer: {activeReturn.assignedPreparerName} • Reviewer: {activeReturn.assignedReviewerName}
                    </CardDescription>
                  </div>

                  <Badge variant={activeReturn.isBlocked ? 'destructive' : 'verified'}>
                    {activeReturn.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-4 space-y-4">
                {/* Next Action Owner Alert */}
                <div className="border border-primary/20 bg-primary/5 p-3 text-xs">
                  <div className="font-bold text-foreground flex items-center gap-1.5">
                    <ArrowRight className="h-3.5 w-3.5 text-primary" />
                    Next Action Owner: <span className="uppercase font-mono">{activeReturn.nextActionOwner}</span>
                  </div>
                  <p className="text-muted-foreground mt-1">
                    {activeReturn.nextActionDescription}
                  </p>
                </div>

                {/* Return Financial Summary */}
                <div className="grid grid-cols-3 gap-3 border border-border p-3 bg-muted/10 font-mono text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Total Income</span>
                    <span className="font-bold text-sm text-foreground">
                      {formatCurrency(activeReturn.totalIncome)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Tax Liability</span>
                    <span className="font-bold text-sm text-foreground">
                      {formatCurrency(activeReturn.taxLiability)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">
                      {activeReturn.refundOrDueAmount >= 0 ? 'Estimated Refund' : 'Amount You Owe'}
                    </span>
                    <span
                      className={`font-bold text-sm ${
                        activeReturn.refundOrDueAmount >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {formatCurrency(Math.abs(activeReturn.refundOrDueAmount))}
                    </span>
                  </div>
                </div>

                {/* Documents Attached Table (Container Horizontal Scroll) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Attached Documents ({activeDocs.length})
                    </h3>
                    <span className="text-[11px] text-muted-foreground">
                      Container Scroll Enabled
                    </span>
                  </div>

                  <div className="overflow-x-auto border border-border">
                    <table className="w-full text-xs text-left min-w-[550px]">
                      <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-mono border-b border-border">
                        <tr>
                          <th className="p-2.5">Document File</th>
                          <th className="p-2.5">Type</th>
                          <th className="p-2.5">Status</th>
                          <th className="p-2.5">Amount</th>
                          <th className="p-2.5">Bounding Boxes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border font-mono">
                        {activeDocs.slice(0, 6).map((doc) => (
                          <tr key={doc.id} className="hover:bg-muted/30">
                            <td className="p-2.5 font-sans font-medium text-foreground truncate max-w-[200px]">
                              {doc.fileName}
                            </td>
                            <td className="p-2.5 text-muted-foreground">{doc.docType}</td>
                            <td className="p-2.5">
                              <Badge
                                variant={doc.status === 'processed' ? 'verified' : 'warning'}
                                className="text-[10px] py-0 px-1.5"
                              >
                                {doc.status}
                              </Badge>
                            </td>
                            <td className="p-2.5 font-semibold text-foreground">
                              {doc.amount ? formatCurrency(doc.amount) : '—'}
                            </td>
                            <td className="p-2.5 text-muted-foreground">
                              {doc.boundingBoxes.length} tagged
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end pt-2">
              <Button variant="default" className="gap-2">
                <ShieldCheck className="h-4 w-4" />
                Ready for Phase 3 (Client Portal)
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
