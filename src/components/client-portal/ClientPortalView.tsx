import React from 'react';
import { usePlatformStore } from '@/store/usePlatformStore';
import { SourceDocument } from '@/types';
import { ClientMilestoneProgress } from './ClientMilestoneProgress';
import { ClientActionBanner } from './ClientActionBanner';
import { ClientSummaryCard } from './ClientSummaryCard';
import { ClientDocumentUpload } from './ClientDocumentUpload';

interface ClientPortalViewProps {
  className?: string;
}

export const ClientPortalView: React.FC<ClientPortalViewProps> = ({
  className = '',
}) => {
  const {
    returns,
    documents,
    currentUser,
    selectedReturnId,
    signClientForm8879,
    updateReturnStatus,
    toggleReturnBlocker,
    addUploadedDocument,
  } = usePlatformStore();

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

  return (
    <div className={`space-y-5 pb-10 ${className}`}>
      {/* 1. Centered 60% Width Return Progress Stepper */}
      <ClientMilestoneProgress activeReturn={activeReturn} />

      {/* 2. Primary Immediate Action Banner (E-Sign Form 8879 / Blocked Alert) */}
      <ClientActionBanner
        activeReturn={activeReturn}
        onSignReturn={handleSignReturn}
        onOpenUpload={() => {
          const uploadEl = document.getElementById('client-document-upload-section');
          if (uploadEl) {
            uploadEl.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      />

      {/* 3. Financial Summary Card */}
      <ClientSummaryCard activeReturn={activeReturn} />

      {/* 4. Document Intake & Upload Section */}
      <div id="client-document-upload-section">
        <ClientDocumentUpload
          documents={returnDocuments}
          onUploadDocument={handleUploadDocument}
          isBlocked={activeReturn.isBlocked}
          blockerReason={activeReturn.blockerReason}
        />
      </div>
    </div>
  );
};
