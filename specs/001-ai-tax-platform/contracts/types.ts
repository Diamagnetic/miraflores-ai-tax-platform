/**
 * Core Type Definitions for AI-Powered Tax Platform (MiraFlores AI)
 */

export type UserRoleType = 
  | 'individual_client'
  | 'tax_preparer'
  | 'tax_reviewer';

export type AffordanceState = 
  | 'ai_extracted'      // Extracted by AI, needs verification
  | 'verified'          // Verified by human/CPA, locked
  | 'user_edited'       // Manually overridden by user
  | 'calculated_locked' // Form calculation, non-editable
  | 'requires_approval';// Flagged discrepancy needing senior approval

export type ReturnStatus = 
  | 'INTAKE'
  | 'EXTRACTION'
  | 'PREPARATION'
  | 'REVIEW'
  | 'CLIENT_SIGN'
  | 'E_FILED'
  | 'ACCEPTED';

export type ClientMilestone = 
  | 'DOCUMENTS_NEEDED'
  | 'PROCESSING'
  | 'PREPARATION'
  | 'EXPERT_REVIEW'
  | 'READY_FOR_SIGNATURE'
  | 'SUBMITTED_TO_IRS'
  | 'ACCEPTED';

export type NextActionOwner = 'client' | 'preparer' | 'reviewer' | 'irs';

export type DocumentType = 
  | 'W2'
  | '1099_NEC'
  | '1099_DIV'
  | '1099_INT'
  | '1099_B'
  | '1098_MORTGAGE'
  | 'K1'
  | 'RECEIPT'
  | 'PROFIT_LOSS'
  | 'PRIOR_RETURN'
  | 'OTHER';

export interface BoundingBox {
  id: string;
  pageNumber: number;
  x: number;      // 0-100 percentage
  y: number;      // 0-100 percentage
  width: number;  // 0-100 percentage
  height: number; // 0-100 percentage
  label: string;
  fieldKey: string;
  extractedValue: string;
  confidence: number;
}

export interface SourceDocument {
  id: string;
  returnId: string;
  fileName: string;
  docType: DocumentType;
  category: 'income' | 'deductions' | 'credits' | 'business' | 'workpapers';
  pageCount: number;
  uploadedAt: string;
  uploadedBy: string;
  status: 'processed' | 'needs_review' | 'processing' | 'rejected';
  extractedFields: Record<string, string | number>;
  boundingBoxes: BoundingBox[];
  rawTextPreview?: string;
}

export interface AIExplainability {
  summary: string;
  confidenceScore: number;
  evidence: {
    sourceDocumentId: string;
    sourceDocumentName: string;
    pageNumber: number;
    boxLabel: string;
    extractedText: string;
    boundingBoxId: string;
  }[];
  calculationBreakdown?: {
    formula: string;
    inputs: { label: string; value: number; docRef: string }[];
  };
  uncertaintyFactors: string[];
  suggestedAction: string;
}

export interface ReturnField {
  id: string;
  returnId: string;
  formCode: string; // e.g. "Form 1040", "Schedule C"
  lineNumber: string; // e.g. "Line 1a", "Line 24"
  label: string;
  value: number | string;
  formattedValue: string;
  state: AffordanceState;
  aiConfidence: number;
  aiExplanation?: AIExplainability;
  sourceDocumentIds: string[];
  formula?: string;
  lastModifiedBy: string;
  lastModifiedAt: string;
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRoleType;
  timestamp: string;
  content: string;
  isInternalFirmOnly: boolean;
  actionRequest?: {
    type: 'upload_document' | 'clarify_number' | 'e_sign' | 'confirm_yes_no';
    description: string;
    isCompleted: boolean;
    responsePayload?: string | number | boolean;
  };
}

export interface CollaborationThread {
  id: string;
  returnId: string;
  contextType: 'field' | 'document' | 'return' | 'questionnaire';
  contextId: string;
  contextLabel: string;
  status: 'open' | 'waiting_client' | 'waiting_cpa' | 'resolved';
  messages: Message[];
}

export interface TaxReturn {
  id: string;
  taxYear: number;
  returnType: '1040' | '1120S' | '1065' | '1041';
  taxpayerName: string;
  taxpayerEmail: string;
  entityName?: string;
  assignedPreparerId: string;
  assignedPreparerName: string;
  assignedReviewerId: string;
  assignedReviewerName: string;
  status: ReturnStatus;
  clientMilestone: ClientMilestone;
  nextActionOwner: NextActionOwner;
  nextActionDescription: string;
  dueDate: string;
  isBlocked: boolean;
  blockerReason?: string;
  triageScore: number;
  totalIncome: number;
  taxLiability: number;
  refundOrDueAmount: number;
  documentCount: number;
  openIssueCount: number;
  aiConfidenceAvg: number;
}
