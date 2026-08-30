import React, { useState } from 'react';
import { ActionRequest } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  CheckCircle2,
  AlertCircle,
  Check,
  X,
  Send,
} from 'lucide-react';

interface ActionRequestCardProps {
  actionRequest: ActionRequest;
  messageId: string;
  isClientView?: boolean;
  onComplete?: (responsePayload?: string | number | boolean) => void;
  onUploadFile?: () => void;
  className?: string;
}

export const ActionRequestCard: React.FC<ActionRequestCardProps> = ({
  actionRequest,
  messageId: _messageId,
  isClientView = false,
  onComplete,
  onUploadFile,
  className = '',
}) => {
  const [textInput, setTextInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleResolve = (payload: string | number | boolean) => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onComplete?.(payload);
    }, 400);
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    handleResolve(textInput.trim());
    setTextInput('');
  };

  // If already completed:
  if (actionRequest.isCompleted) {
    return (
      <div className={`p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 text-xs flex items-center justify-between gap-3 ${className}`}>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div>
            <span className="font-bold text-emerald-950 dark:text-emerald-200">
              Action Request Resolved
            </span>
            <p className="text-[11px] text-emerald-800 dark:text-emerald-300 mt-0.5">
              {actionRequest.description}
            </p>
            {actionRequest.responsePayload !== undefined && (
              <span className="text-[10px] font-mono text-emerald-900 dark:text-emerald-200 mt-0.5 block">
                Response: <strong>{String(actionRequest.responsePayload)}</strong>
              </span>
            )}
          </div>
        </div>
        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 border-emerald-300 font-mono text-[9px]">
          Completed
        </Badge>
      </div>
    );
  }

  // Pending Action Request:
  return (
    <div className={`p-3.5 bg-sky-50/70 dark:bg-sky-950/30 border border-sky-300 dark:border-sky-800 text-xs space-y-2.5 ${className}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <div className="p-1 bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 shrink-0">
            <AlertCircle className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold uppercase tracking-wider text-[10px] text-sky-900 dark:text-sky-200">
                Actionable Request
              </span>
              <Badge variant="outline" className="font-mono text-[9px] py-0 bg-card border-sky-300">
                {actionRequest.type.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-xs text-foreground font-semibold mt-0.5">
              {actionRequest.description}
            </p>
          </div>
        </div>
      </div>

      {/* Action Controls by Request Type */}
      <div className="pt-1 flex flex-wrap items-center gap-2">
        {actionRequest.type === 'upload_document' && (
          isClientView ? (
            <Button
              size="sm"
              onClick={onUploadFile}
              className="h-7 text-xs font-semibold gap-1.5 bg-card text-primary border border-primary/40 shadow-xs hover:bg-primary/5 hover:border-primary/70"
            >
              <Upload className="h-3 w-3" />
              <span>Upload Document</span>
            </Button>
          ) : (
            <span className="text-[11px] text-muted-foreground font-mono">
              Awaiting client document upload
            </span>
          )
        )}

        {actionRequest.type === 'confirm_yes_no' && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              disabled={isSubmitting}
              onClick={() => handleResolve(true)}
              className="h-7 px-3 text-xs font-semibold gap-1 bg-card text-emerald-700 border border-emerald-400 shadow-xs hover:bg-emerald-50"
            >
              <Check className="h-3 w-3" />
              <span>Yes, Confirm</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => handleResolve(false)}
              className="h-7 px-3 text-xs font-semibold gap-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
              <span>No</span>
            </Button>
          </div>
        )}

        {actionRequest.type === 'clarify_number' && (
          <form onSubmit={handleTextSubmit} className="flex items-center gap-2 w-full max-w-sm">
            <input
              type="text"
              placeholder="Enter exact figure or explanation..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="h-7 px-2.5 flex-1 bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <Button
              type="submit"
              size="sm"
              disabled={!textInput.trim() || isSubmitting}
              className="h-7 px-2.5 text-xs font-semibold gap-1 bg-card text-primary border border-primary/40 shadow-xs hover:bg-primary/5 hover:border-primary/70"
            >
              <Send className="h-3 w-3" />
              <span>Submit</span>
            </Button>
          </form>
        )}

        {actionRequest.type === 'e_sign' && (
          <Button
            size="sm"
            disabled={isSubmitting}
            onClick={() => handleResolve(true)}
            className="h-7 text-xs font-semibold gap-1 bg-card text-primary border border-primary/40 shadow-xs hover:bg-primary/5 hover:border-primary/70"
          >
            <CheckCircle2 className="h-3 w-3" />
            <span>1-Click Acknowledge & Verify</span>
          </Button>
        )}
      </div>
    </div>
  );
};
