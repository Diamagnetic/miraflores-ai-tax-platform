import { create } from 'zustand';
import {
  TaxReturn,
  ReturnField,
  SourceDocument,
  CollaborationThread,
  UserSession,
  UserRoleType,
  ReturnStatus,
  ClientMilestone,
  FilterState,
  ActionRequest,
  Message,
} from '@/types';
import { mockTaxReturns, mockReturnFields } from '@/data/mockReturns';
import { mockDocuments } from '@/data/mockDocuments';
import { mockThreads } from '@/data/mockThreads';
import { calculateTriageScore } from './triageLogic';

export interface PlatformStoreState {
  // Core State
  returns: TaxReturn[];
  fields: ReturnField[];
  documents: SourceDocument[];
  threads: CollaborationThread[];
  currentUser: UserSession;
  selectedReturnId: string | null;
  activeDocumentId: string | null;
  activeFieldId: string | null;
  highlightedBoundingBoxId: string | null;

  // View & Filter States
  filterState: FilterState;
  selectedDocumentCategory: string;
  documentSearchQuery: string;
  diffMode: 'prior_year' | 'draft_vs_final' | 'none';

  // Role & Context Actions
  setRole: (role: UserRoleType, isPersonalReturnView?: boolean) => void;
  selectReturn: (returnId: string | null) => void;
  selectField: (fieldId: string | null) => void;
  selectDocument: (docId: string | null) => void;
  setHighlightedBoundingBox: (boxId: string | null) => void;

  // Field Manipulation Actions
  updateFieldValue: (fieldId: string, newValue: number | string) => void;
  verifyField: (fieldId: string) => void;
  flagFieldForApproval: (fieldId: string) => void;

  // Collaboration Actions
  addMessageToThread: (
    threadId: string,
    content: string,
    isInternal: boolean,
    actionRequest?: ActionRequest
  ) => void;
  completeActionRequest: (
    threadId: string,
    messageId: string,
    responsePayload?: string | number | boolean
  ) => void;
  createThread: (
    returnId: string,
    contextType: 'field' | 'document' | 'return' | 'questionnaire',
    contextId: string,
    contextLabel: string,
    initialMessage: string,
    isInternal: boolean,
    actionRequest?: ActionRequest
  ) => void;

  // Return Management Actions
  updateReturnStatus: (
    returnId: string,
    newStatus: ReturnStatus,
    milestone: ClientMilestone
  ) => void;
  toggleReturnBlocker: (returnId: string, blockerReason?: string) => void;
  addUploadedDocument: (doc: SourceDocument) => void;

  // Filter & Search Actions
  setFilterState: (partial: Partial<FilterState>) => void;
  setDocumentSearch: (query: string) => void;
  setDocumentCategory: (category: string) => void;
  setDiffMode: (mode: 'prior_year' | 'draft_vs_final' | 'none') => void;

  // Ephemeral Reset Action
  resetToBaseline: () => void;
}

const DEFAULT_USER: UserSession = {
  userId: 'prep-sam-wilson',
  name: 'Sam Wilson (CPA)',
  email: 'sam.wilson@miraflores.tax',
  role: 'tax_preparer',
  isPersonalReturnView: false,
};

const DEFAULT_FILTERS: FilterState = {
  searchQuery: '',
  statusFilter: 'ALL',
  returnTypeFilter: 'ALL',
  blockerOnly: false,
  sortBy: 'triageScore',
  sortOrder: 'desc',
};

export const usePlatformStore = create<PlatformStoreState>((set, get) => ({
  returns: [...mockTaxReturns],
  fields: [...mockReturnFields],
  documents: [...mockDocuments],
  threads: [...mockThreads],
  currentUser: DEFAULT_USER,
  selectedReturnId: 'ret-tony-1040',
  activeDocumentId: 'doc-tony-w2-01',
  activeFieldId: 'fld-tony-1040-1a',
  highlightedBoundingBoxId: 'box-t-w2-2',

  filterState: DEFAULT_FILTERS,
  selectedDocumentCategory: 'ALL',
  documentSearchQuery: '',
  diffMode: 'none',

  setRole: (role, isPersonalReturnView = false) => {
    let name = 'Sam Wilson (CPA)';
    let email = 'sam.wilson@miraflores.tax';
    let userId = 'prep-sam-wilson';
    let defaultReturnId: string | null = get().selectedReturnId;

    if (role === 'tax_reviewer') {
      name = 'Steve Rogers (Senior Tax Director)';
      email = 'steve.rogers@miraflores.tax';
      userId = 'rev-steve-rogers';
    } else if (role === 'individual_client') {
      if (isPersonalReturnView) {
        name = 'Dr. Bruce Banner';
        email = 'bruce.banner@culver.edu';
        userId = 'client-bruce-banner';
        defaultReturnId = 'ret-bruce-1040';
      } else {
        name = 'Tony Stark';
        email = 'tony.stark@starkenterprises.com';
        userId = 'client-tony-stark';
        defaultReturnId = 'ret-tony-1040';
      }
    }

    set({
      currentUser: { userId, name, email, role, isPersonalReturnView },
      selectedReturnId: defaultReturnId,
    });
  },

  selectReturn: (returnId) => {
    if (!returnId) {
      set({
        selectedReturnId: null,
        activeFieldId: null,
        activeDocumentId: null,
        highlightedBoundingBoxId: null,
      });
      return;
    }

    const firstDoc = get().documents.find((d) => d.returnId === returnId);
    const firstField = get().fields.find((f) => f.returnId === returnId);

    set({
      selectedReturnId: returnId,
      activeDocumentId: firstDoc ? firstDoc.id : null,
      activeFieldId: firstField ? firstField.id : null,
      highlightedBoundingBoxId: firstDoc && firstDoc.boundingBoxes[0] ? firstDoc.boundingBoxes[0].id : null,
    });
  },

  selectField: (fieldId) => {
    const field = get().fields.find((f) => f.id === fieldId);
    if (!field) {
      set({ activeFieldId: null, highlightedBoundingBoxId: null });
      return;
    }

    let linkedDocId = get().activeDocumentId;
    let linkedBoxId: string | null = null;

    if (field.sourceDocumentIds && field.sourceDocumentIds.length > 0) {
      linkedDocId = field.sourceDocumentIds[0];
      const doc = get().documents.find((d) => d.id === linkedDocId);
      if (doc && doc.boundingBoxes.length > 0) {
        linkedBoxId = doc.boundingBoxes[0].id;
      }
    }

    set({
      activeFieldId: fieldId,
      activeDocumentId: linkedDocId,
      highlightedBoundingBoxId: linkedBoxId,
    });
  },

  selectDocument: (docId) => {
    const doc = get().documents.find((d) => d.id === docId);
    set({
      activeDocumentId: docId,
      highlightedBoundingBoxId: doc && doc.boundingBoxes.length > 0 ? doc.boundingBoxes[0].id : null,
    });
  },

  setHighlightedBoundingBox: (boxId) => {
    set({ highlightedBoundingBoxId: boxId });
  },

  updateFieldValue: (fieldId, newValue) => {
    const { fields, currentUser } = get();
    const formatted =
      typeof newValue === 'number'
        ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(newValue)
        : String(newValue);

    const updatedFields = fields.map((f) =>
      f.id === fieldId
        ? {
            ...f,
            value: newValue,
            formattedValue: formatted,
            state: 'user_edited' as const,
            lastModifiedBy: currentUser.name,
            lastModifiedAt: new Date().toISOString(),
          }
        : f
    );

    set({ fields: updatedFields });
  },

  verifyField: (fieldId) => {
    const { fields, currentUser } = get();
    const updatedFields = fields.map((f) =>
      f.id === fieldId
        ? {
            ...f,
            state: 'verified' as const,
            lastModifiedBy: currentUser.name,
            lastModifiedAt: new Date().toISOString(),
          }
        : f
    );
    set({ fields: updatedFields });
  },

  flagFieldForApproval: (fieldId) => {
    const { fields, currentUser } = get();
    const updatedFields = fields.map((f) =>
      f.id === fieldId
        ? {
            ...f,
            state: 'requires_approval' as const,
            lastModifiedBy: currentUser.name,
            lastModifiedAt: new Date().toISOString(),
          }
        : f
    );
    set({ fields: updatedFields });
  },

  addMessageToThread: (threadId, content, isInternal, actionRequest) => {
    const { threads, currentUser } = get();
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      threadId,
      senderId: currentUser.userId,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      timestamp: new Date().toISOString(),
      content,
      isInternalFirmOnly: isInternal,
      actionRequest,
    };

    const updatedThreads = threads.map((th) =>
      th.id === threadId
        ? {
            ...th,
            status: isInternal ? th.status : currentUser.role === 'individual_client' ? 'waiting_cpa' : 'waiting_client',
            messages: [...th.messages, newMessage],
          }
        : th
    );

    set({ threads: updatedThreads });
  },

  completeActionRequest: (threadId, messageId, responsePayload) => {
    const { threads } = get();
    const updatedThreads = threads.map((th) => {
      if (th.id !== threadId) return th;
      return {
        ...th,
        status: 'open' as const,
        messages: th.messages.map((m) =>
          m.id === messageId && m.actionRequest
            ? {
                ...m,
                actionRequest: {
                  ...m.actionRequest,
                  isCompleted: true,
                  responsePayload,
                },
              }
            : m
        ),
      };
    });

    set({ threads: updatedThreads });
  },

  createThread: (returnId, contextType, contextId, contextLabel, initialMessage, isInternal, actionRequest) => {
    const { threads, currentUser } = get();
    const threadId = `th-${Date.now()}`;
    const newThread: CollaborationThread = {
      id: threadId,
      returnId,
      contextType,
      contextId,
      contextLabel,
      status: isInternal ? 'open' : currentUser.role === 'individual_client' ? 'waiting_cpa' : 'waiting_client',
      messages: [
        {
          id: `msg-${Date.now()}`,
          threadId,
          senderId: currentUser.userId,
          senderName: currentUser.name,
          senderRole: currentUser.role,
          timestamp: new Date().toISOString(),
          content: initialMessage,
          isInternalFirmOnly: isInternal,
          actionRequest,
        },
      ],
    };

    set({ threads: [newThread, ...threads] });
  },

  updateReturnStatus: (returnId, newStatus, milestone) => {
    const { returns } = get();
    const updatedReturns = returns.map((ret) => {
      if (ret.id !== returnId) return ret;
      const updated: TaxReturn = {
        ...ret,
        status: newStatus,
        clientMilestone: milestone,
      };
      updated.triageScore = calculateTriageScore(updated);
      return updated;
    });

    set({ returns: updatedReturns });
  },

  toggleReturnBlocker: (returnId, blockerReason) => {
    const { returns } = get();
    const updatedReturns = returns.map((ret) => {
      if (ret.id !== returnId) return ret;
      const isBlocked = !ret.isBlocked;
      const updated: TaxReturn = {
        ...ret,
        isBlocked,
        blockerReason: isBlocked ? blockerReason || 'Pending document review' : undefined,
      };
      updated.triageScore = calculateTriageScore(updated);
      return updated;
    });

    set({ returns: updatedReturns });
  },

  addUploadedDocument: (doc) => {
    const { documents, returns } = get();
    const updatedDocuments = [doc, ...documents];
    const updatedReturns = returns.map((ret) => {
      if (ret.id !== doc.returnId) return ret;
      return {
        ...ret,
        documentCount: ret.documentCount + 1,
      };
    });

    set({ documents: updatedDocuments, returns: updatedReturns, activeDocumentId: doc.id });
  },

  setFilterState: (partial) => {
    set({ filterState: { ...get().filterState, ...partial } });
  },

  setDocumentSearch: (query) => {
    set({ documentSearchQuery: query });
  },

  setDocumentCategory: (category) => {
    set({ selectedDocumentCategory: category });
  },

  setDiffMode: (mode) => {
    set({ diffMode: mode });
  },

  resetToBaseline: () => {
    set({
      returns: [...mockTaxReturns],
      fields: [...mockReturnFields],
      documents: [...mockDocuments],
      threads: [...mockThreads],
      currentUser: DEFAULT_USER,
      selectedReturnId: 'ret-tony-1040',
      activeDocumentId: 'doc-tony-w2-01',
      activeFieldId: 'fld-tony-1040-1a',
      highlightedBoundingBoxId: 'box-t-w2-2',
      filterState: DEFAULT_FILTERS,
      selectedDocumentCategory: 'ALL',
      documentSearchQuery: '',
      diffMode: 'none',
    });
  },
}));
