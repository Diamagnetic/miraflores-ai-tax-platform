/**
 * Mock API Contract & State Store Operations
 */

import {
  TaxReturn,
  ReturnField,
  SourceDocument,
  CollaborationThread,
  Message,
  UserRoleType,
  AffordanceState
} from './types';

export interface MockTaxPlatformAPI {
  // Return Queries & Actions
  getReturns(filter?: { status?: string; role?: UserRoleType; search?: string }): Promise<TaxReturn[]>;
  getReturnById(id: string): Promise<TaxReturn | null>;
  updateReturnStatus(returnId: string, status: TaxReturn['status']): Promise<TaxReturn>;

  // Return Fields & Traceability
  getReturnFields(returnId: string): Promise<ReturnField[]>;
  updateFieldState(fieldId: string, state: AffordanceState, newValue?: number | string): Promise<ReturnField>;
  verifyField(fieldId: string, verifiedBy: string): Promise<ReturnField>;
  overrideFieldWithAudit(fieldId: string, newValue: number | string, author: string, reason: string): Promise<ReturnField>;

  // Documents & Extraction
  getDocuments(returnId: string): Promise<SourceDocument[]>;
  getDocumentById(docId: string): Promise<SourceDocument | null>;
  uploadDocument(returnId: string, file: { name: string; type: string }): Promise<SourceDocument>;

  // Collaboration Threads & Notes
  getThreads(returnId: string): Promise<CollaborationThread[]>;
  createThread(returnId: string, contextType: string, contextId: string, contextLabel: string, initialMessage: string, isInternal: boolean): Promise<CollaborationThread>;
  postMessage(threadId: string, message: Omit<Message, 'id' | 'timestamp'>): Promise<Message>;
  resolveActionRequest(threadId: string, messageId: string, payload: any): Promise<Message>;

  // Triage & Workload
  getPrioritizedQueue(): Promise<{
    urgent: TaxReturn[];
    readyForReview: TaxReturn[];
    waitingOnClient: TaxReturn[];
    readyToFile: TaxReturn[];
  }>;
}
