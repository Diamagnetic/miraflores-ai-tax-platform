import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { usePlatformStore } from '@/store/usePlatformStore';
import { SourceDocument } from '@/types';
import { ClientMilestoneProgress } from './ClientMilestoneProgress';
import { ClientActionBanner } from './ClientActionBanner';
import { ClientSummaryCard } from './ClientSummaryCard';
import { ClientDocumentUpload } from './ClientDocumentUpload';
import { ClientRequestsWidget } from '../collaboration/ClientRequestsWidget';
import { ContextualThreadDrawer } from '../collaboration/ContextualThreadDrawer';

interface ClientPortalViewProps {
  className?: string;
}

export const ClientPortalView: React.FC<ClientPortalViewProps> = ({
  className = '',
}) => {
  const {
    returns,
    documents,
    threads,
    currentUser,
    selectedReturnId,
    signClientForm8879,
    updateReturnStatus,
    toggleReturnBlocker,
    addUploadedDocument,
  } = usePlatformStore();

  const [isDiscussionOpen, setIsDiscussionOpen] = useState<boolean>(false);

  // Resolve active return for the client
  const activeReturn =
    currentUser.role === 'individual_client'
      ? returns.find((r) =>
          currentUser.isPersonalReturnView
            ? r.id === 'ret-bruce-1040'
            : r.id === 'ret-tony-1040'
        ) || returns[0]
      : returns.find((r) => r.id === selectedReturnId) || returns[0];

  // Filter documents belonging to this return
  const returnDocuments = documents.filter((d) => d.returnId === activeReturn.id);

  // Resolve primary return thread or fallback
  const activeReturnThread =
    threads.find((t) => t.returnId === activeReturn.id) || {
      id: `th-client-${activeReturn.id}`,
      returnId: activeReturn.id,
      contextType: 'return' as const,
      contextId: activeReturn.id,
      contextLabel: `${activeReturn.taxpayerName} - General Tax Q&A`,
      status: 'open' as const,
      messages: [],
    };

  // E-Sign Form 8879 Handler (Authorizes signature, waiting for CPA EFIN transmission)
  const handleSignReturn = () => {
    signClientForm8879(activeReturn.id);
  };

  // Upload Document Handler
  const handleUploadDocument = (newDocData: Partial<SourceDocument>) => {
    const fullDoc: SourceDocument = {
      id: newDocData.id || `doc-client-${Date.now()}`,
      returnId: activeReturn.id,
      fileName: newDocData.fileName || 'Uploaded_Tax_Document.pdf',
      docType: newDocData.docType || 'OTHER',
      category: newDocData.category || 'income',
      pageCount: 1,
      uploadedAt: new Date().toISOString(),
      uploadedBy: currentUser.name,
      status: 'processed',
      extractedFields: {},
      boundingBoxes: [],
    };

    addUploadedDocument(fullDoc);

    // If return was blocked on missing documents, clear the blocker and advance
    if (activeReturn.isBlocked) {
      toggleReturnBlocker(activeReturn.id);
      updateReturnStatus(activeReturn.id, 'PREPARATION', 'PREPARATION');
    }
  };

  const scrollToUpload = () => {
    const uploadEl = document.getElementById('client-document-upload-section');
    if (uploadEl) {
      uploadEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={`space-y-5 pb-10 ${className}`}>
      {/* 1. Centered 60% Width Return Progress Stepper */}
      <ClientMilestoneProgress activeReturn={activeReturn} />

      {/* 2. Primary Immediate Action Banner (E-Sign Form 8879 / Blocked Alert) */}
      <ClientActionBanner
        activeReturn={activeReturn}
        onSignReturn={handleSignReturn}
        onOpenUpload={scrollToUpload}
      />

      {/* 3. Client Requests Widget (CPA Inquiries & Action Requests) */}
      <ClientRequestsWidget
        returnId={activeReturn.id}
        onOpenUploadForMessage={scrollToUpload}
      />

      {/* 4. Financial Summary Card */}
      <ClientSummaryCard
        activeReturn={activeReturn}
        onOpenMessages={() => setIsDiscussionOpen(true)}
      />

      {/* 5. Document Intake & Upload Section */}
      <div id="client-document-upload-section">
        <ClientDocumentUpload
          documents={returnDocuments}
          onUploadDocument={handleUploadDocument}
          isBlocked={activeReturn.isBlocked}
          blockerReason={activeReturn.blockerReason}
        />
      </div>

      {/* Slide-Over Contextual Discussion Drawer (Portaled to document.body) */}
      {isDiscussionOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-50 overflow-hidden pointer-events-auto">
            <div
              onClick={() => setIsDiscussionOpen(false)}
              className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity cursor-pointer"
              aria-label="Close discussion overlay (Esc)"
            />
            <div
              role="dialog"
              aria-modal="true"
              className="fixed top-0 bottom-0 right-0 z-50 h-screen w-full sm:w-[480px] md:w-[560px] bg-card border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
            >
              <ContextualThreadDrawer
                thread={activeReturnThread}
                onClose={() => setIsDiscussionOpen(false)}
                onUploadRequestedFile={scrollToUpload}
              />
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
