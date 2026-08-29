import React, { useState } from 'react';
import { SourceDocument, DocumentType } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Plus,
  Sparkles,
} from 'lucide-react';

interface ClientDocumentUploadProps {
  documents: SourceDocument[];
  onUploadDocument?: (doc: Partial<SourceDocument>) => void;
  isBlocked?: boolean;
  blockerReason?: string;
  className?: string;
}

export const ClientDocumentUpload: React.FC<ClientDocumentUploadProps> = ({
  documents,
  onUploadDocument,
  isBlocked = false,
  blockerReason = '',
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>('1099_NEC');
  const [customDocName, setCustomDocName] = useState<string>('');
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);

  const handleSimulatedUpload = (e: React.FormEvent) => {
    e.preventDefault();
    const docName = customDocName.trim() || `Tax_Document_${selectedDocType}_2025.pdf`;

    const newDoc: Partial<SourceDocument> = {
      id: `doc-client-${Date.now()}`,
      fileName: docName,
      docType: selectedDocType,
      category: 'income',
      pageCount: 1,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'Taxpayer Upload',
      status: 'processed',
      extractedFields: {},
      boundingBoxes: [],
    };

    if (onUploadDocument) {
      onUploadDocument(newDoc);
    }

    setUploadSuccessMessage(`Successfully uploaded "${docName}"! AI extraction started.`);
    setCustomDocName('');
    setTimeout(() => {
      setUploadSuccessMessage(null);
    }, 4000);
  };

  return (
    <Card className={`border border-border bg-card shadow-xs ${className}`}>
      <CardHeader className="p-4 border-b border-border bg-muted/20 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-bold text-foreground">
            Tax Documents & Supporting Workpapers
          </CardTitle>
        </div>
        <Badge variant="outline" className="font-mono text-xs">
          {documents.length} files on record
        </Badge>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Upload Success Alert */}
        {uploadSuccessMessage && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{uploadSuccessMessage}</span>
          </div>
        )}

        {/* Requested / Missing Documents Notice (if blocked) */}
        {isBlocked && (
          <div className="p-3.5 bg-rose-50/70 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-800 space-y-2">
            <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <strong className="text-xs uppercase tracking-wide">
                Missing Documents Requested by CPA
              </strong>
            </div>
            <p className="text-xs text-foreground font-medium">
              {blockerReason || 'Please upload the following missing tax forms to continue preparation:'}
            </p>
          </div>
        )}

        {/* Drag and drop upload zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
              const file = e.dataTransfer.files[0];
              setCustomDocName(file.name);
            }
          }}
          className={`border-2 border-dashed p-6 text-center transition-all ${
            isDragging
              ? 'border-primary bg-primary/5 ring-4 ring-primary/10'
              : 'border-border hover:border-primary/50 bg-muted/10'
          }`}
        >
          <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-80" />
          <p className="text-xs font-bold text-foreground">
            Drag & drop tax documents here, or choose form type below
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Supported formats: PDF, PNG, JPG, TIFF (W-2, 1099, 1098, K-1, Receipts)
          </p>

          <form onSubmit={handleSimulatedUpload} className="mt-4 flex flex-wrap items-center justify-center gap-2.5 max-w-lg mx-auto">
            <select
              aria-label="Select tax document form type"
              value={selectedDocType}
              onChange={(e) => setSelectedDocType(e.target.value as DocumentType)}
              className="h-8 px-2.5 bg-background border border-border text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="W2">Form W-2 (Wage Statement)</option>
              <option value="1099_NEC">Form 1099-NEC (Freelance / Nonemployee)</option>
              <option value="1099_DIV">Form 1099-DIV (Dividends)</option>
              <option value="1099_INT">Form 1099-INT (Interest)</option>
              <option value="1099_B">Form 1099-B (Brokerage / Crypto)</option>
              <option value="1098_MORTGAGE">Form 1098 (Mortgage Interest)</option>
              <option value="K1">Schedule K-1 (Pass-Through)</option>
              <option value="RECEIPT">Expense Receipt / Invoice</option>
              <option value="OTHER">Other Supporting Document</option>
            </select>

            <input
              type="text"
              placeholder="Custom filename (optional)"
              value={customDocName}
              onChange={(e) => setCustomDocName(e.target.value)}
              className="h-8 px-2.5 flex-1 min-w-[150px] bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />

            <Button
              type="submit"
              className="h-8 px-4 text-xs font-semibold gap-1 bg-card text-primary border border-primary/40 shadow-xs hover:bg-primary/5 hover:border-primary/70"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Upload Document</span>
            </Button>
          </form>
        </div>

        {/* Existing Documents List */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
            Uploaded Documents ({documents.length})
          </span>

          <div className="divide-y divide-border border border-border">
            {documents.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">
                No documents uploaded yet. Upload your W-2 or 1099 above.
              </p>
            ) : (
              documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 flex items-center justify-between gap-3 hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate" title={doc.fileName}>
                        {doc.fileName}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono mt-0.5">
                        <Badge variant="outline" className="text-[9px] px-1 py-0 uppercase">
                          {doc.docType.replace('_', ' ')}
                        </Badge>
                        <span>•</span>
                        <span>{doc.pageCount} page(s)</span>
                        <span>•</span>
                        <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200 border-emerald-300 font-mono text-[10px] gap-1">
                      <CheckCircle2 className="h-2.5 w-2.5" />
                      <span className="uppercase">{doc.status}</span>
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
