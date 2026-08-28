import { SourceDocument, BoundingBox } from '@/types';

function createBox(
  id: string,
  pageNumber: number,
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  fieldKey: string,
  extractedValue: string,
  confidence: number
): BoundingBox {
  return { id, pageNumber, x, y, width, height, label, fieldKey, extractedValue, confidence };
}

// 1. Core Source Documents for Tony Stark (ret-tony-1040)
const tonyDocuments: SourceDocument[] = [
  {
    id: 'doc-tony-w2-01',
    returnId: 'ret-tony-1040',
    fileName: '2025_Stark_Industries_W2_TonyStark.pdf',
    docType: 'W2',
    category: 'income',
    pageCount: 1,
    uploadedAt: '2026-02-01T10:15:00Z',
    uploadedBy: 'tony.stark@starkenterprises.com',
    status: 'processed',
    amount: 1450000,
    vendor: 'Stark Industries Inc.',
    taxYear: 2025,
    extractedFields: {
      employerName: 'Stark Industries Inc.',
      ein: '12-3456789',
      wagesBox1: 1450000,
      fedWithholdingBox2: 522000,
      ssWagesBox3: 168600,
      ssWithholdingBox4: 10453.20,
      medicareWagesBox5: 1450000,
      medicareWithholdingBox6: 34075.00,
    },
    boundingBoxes: [
      createBox('box-t-w2-1', 1, 15, 25, 30, 8, 'Employer EIN', 'ein', '12-3456789', 0.99),
      createBox('box-t-w2-2', 1, 55, 35, 35, 10, 'Box 1 Wages & Tips', 'wagesBox1', '$1,450,000.00', 0.98),
      createBox('box-t-w2-3', 1, 55, 48, 35, 10, 'Box 2 Federal Withholding', 'fedWithholdingBox2', '$522,000.00', 0.99),
    ],
    rawTextPreview: 'STARK INDUSTRIES INC - FORM W-2 WAGE AND TAX STATEMENT 2025\nEmployee: Anthony E. Stark\nSSN: ***-**-9999\nBox 1 Wages: $1,450,000.00\nBox 2 Fed Tax Withheld: $522,000.00',
  },
  {
    id: 'doc-tony-1099div-01',
    returnId: 'ret-tony-1040',
    fileName: 'Morgan_Stanley_1099DIV_TonyStark.pdf',
    docType: '1099_DIV',
    category: 'income',
    pageCount: 1,
    uploadedAt: '2026-02-03T14:20:00Z',
    uploadedBy: 'tony.stark@starkenterprises.com',
    status: 'processed',
    amount: 325000,
    vendor: 'Morgan Stanley Wealth Management',
    taxYear: 2025,
    extractedFields: {
      payerName: 'Morgan Stanley Wealth Management',
      totalOrdinaryDividends: 325000,
      qualifiedDividends: 290000,
      totalCapitalGain: 48000,
    },
    boundingBoxes: [
      createBox('box-t-div-1', 1, 10, 30, 40, 9, 'Total Ordinary Dividends Box 1a', 'totalOrdinaryDividends', '$325,000.00', 0.97),
      createBox('box-t-div-2', 1, 10, 42, 40, 9, 'Qualified Dividends Box 1b', 'qualifiedDividends', '$290,000.00', 0.96),
    ],
  },
  {
    id: 'doc-tony-1099b-01',
    returnId: 'ret-tony-1040',
    fileName: 'Goldman_Sachs_Consolidated_1099B.pdf',
    docType: '1099_B',
    category: 'income',
    pageCount: 3,
    uploadedAt: '2026-02-05T09:00:00Z',
    uploadedBy: 'tony.stark@starkenterprises.com',
    status: 'processed',
    amount: 875000,
    vendor: 'Goldman Sachs & Co.',
    taxYear: 2025,
    extractedFields: {
      shortTermProceeds: 450000,
      shortTermCostBasis: 380000,
      shortTermGain: 70000,
      longTermProceeds: 1200000,
      longTermCostBasis: 395000,
      longTermGain: 805000,
    },
    boundingBoxes: [
      createBox('box-t-b-1', 1, 15, 60, 45, 12, 'Schedule D Net Long Term Gain', 'longTermGain', '$805,000.00', 0.95),
    ],
  },
  {
    id: 'doc-tony-1098-01',
    returnId: 'ret-tony-1040',
    fileName: 'JPMorgan_Mortgage_1098_MalibuPoint.pdf',
    docType: '1098_MORTGAGE',
    category: 'deductions',
    pageCount: 1,
    uploadedAt: '2026-02-08T11:45:00Z',
    uploadedBy: 'tony.stark@starkenterprises.com',
    status: 'processed',
    amount: 84500,
    vendor: 'JPMorgan Chase Bank',
    taxYear: 2025,
    extractedFields: {
      mortgageInterest: 84500,
      outstandingPrincipal: 1750000,
      propertyTaxes: 42000,
    },
    boundingBoxes: [
      createBox('box-t-1098-1', 1, 20, 35, 40, 10, 'Box 1 Mortgage Interest Received', 'mortgageInterest', '$84,500.00', 0.99),
    ],
  },
];

// 2. Peter Parker (ret-peter-1040)
const peterDocuments: SourceDocument[] = [
  {
    id: 'doc-peter-w2-01',
    returnId: 'ret-peter-1040',
    fileName: 'Daily_Bugle_W2_PeterParker.pdf',
    docType: 'W2',
    category: 'income',
    pageCount: 1,
    uploadedAt: '2026-01-28T16:00:00Z',
    uploadedBy: 'peter.parker@nyu.edu',
    status: 'processed',
    amount: 34500,
    vendor: 'The Daily Bugle Publications',
    taxYear: 2025,
    extractedFields: {
      wagesBox1: 34500,
      fedWithholdingBox2: 3450,
      ssWagesBox3: 34500,
      ssWithholdingBox4: 2139,
    },
    boundingBoxes: [
      createBox('box-p-w2-1', 1, 55, 35, 35, 10, 'Box 1 Wages', 'wagesBox1', '$34,500.00', 0.99),
      createBox('box-p-w2-2', 1, 55, 48, 35, 10, 'Box 2 Withholding', 'fedWithholdingBox2', '$3,450.00', 0.99),
    ],
  },
  {
    id: 'doc-peter-1099nec-01',
    returnId: 'ret-peter-1040',
    fileName: 'FEAST_Foundation_1099NEC.pdf',
    docType: '1099_NEC',
    category: 'income',
    pageCount: 1,
    uploadedAt: '2026-01-30T12:00:00Z',
    uploadedBy: 'peter.parker@nyu.edu',
    status: 'processed',
    amount: 18200,
    vendor: 'F.E.A.S.T. Community Centers Inc.',
    taxYear: 2025,
    extractedFields: {
      nonemployeeCompensation: 18200,
      payerTin: '13-9876543',
    },
    boundingBoxes: [
      createBox('box-p-nec-1', 1, 50, 40, 40, 10, 'Box 1 Nonemployee Compensation', 'nonemployeeCompensation', '$18,200.00', 0.98),
    ],
  },
  {
    id: 'doc-peter-1098e-01',
    returnId: 'ret-peter-1040',
    fileName: 'Nelnet_StudentLoan_1098E.pdf',
    docType: 'OTHER',
    category: 'deductions',
    pageCount: 1,
    uploadedAt: '2026-02-02T10:00:00Z',
    uploadedBy: 'peter.parker@nyu.edu',
    status: 'processed',
    amount: 2500,
    vendor: 'Nelnet Student Loan Servicing',
    taxYear: 2025,
    extractedFields: {
      studentLoanInterest: 2500,
    },
    boundingBoxes: [
      createBox('box-p-1098e-1', 1, 20, 45, 45, 10, 'Student Loan Interest Deduction', 'studentLoanInterest', '$2,500.00', 0.98),
    ],
  },
];

// 3. Natasha Romanoff (ret-natasha-1040)
const natashaDocuments: SourceDocument[] = [
  {
    id: 'doc-natasha-w2-01',
    returnId: 'ret-natasha-1040',
    fileName: 'SHIELD_Strategic_Services_W2.pdf',
    docType: 'W2',
    category: 'income',
    pageCount: 1,
    uploadedAt: '2026-02-04T11:00:00Z',
    uploadedBy: 'n.romanoff@shield.gov',
    status: 'processed',
    amount: 215000,
    vendor: 'Strategic Homeland Intervention Division',
    taxYear: 2025,
    extractedFields: {
      wagesBox1: 215000,
      fedWithholdingBox2: 54000,
      foreignEarnedExclusionEligible: true,
    },
    boundingBoxes: [
      createBox('box-n-w2-1', 1, 55, 35, 35, 10, 'Box 1 Wages', 'wagesBox1', '$215,000.00', 0.99),
    ],
  },
  {
    id: 'doc-natasha-foreign-01',
    returnId: 'ret-natasha-1040',
    fileName: 'Form_2555_ForeignEarnedIncome_Worksheet.pdf',
    docType: 'PRIOR_RETURN',
    category: 'workpapers',
    pageCount: 2,
    uploadedAt: '2026-02-06T15:30:00Z',
    uploadedBy: 'n.romanoff@shield.gov',
    status: 'needs_review',
    amount: 120000,
    vendor: 'Global Security Consulting Budapest',
    taxYear: 2025,
    extractedFields: {
      foreignExclusionAmount: 120000,
      foreignTaxPaid: 28400,
      qualifyingDaysAbroad: 342,
    },
    boundingBoxes: [
      createBox('box-n-2555-1', 1, 15, 50, 50, 12, 'Line 45 Foreign Earned Income Exclusion', 'foreignExclusionAmount', '$120,000.00', 0.91),
    ],
  },
];

// 4. Bruce Banner (ret-bruce-1040)
const bruceDocuments: SourceDocument[] = [
  {
    id: 'doc-bruce-w2-01',
    returnId: 'ret-bruce-1040',
    fileName: 'Culver_University_W2_BruceBanner.pdf',
    docType: 'W2',
    category: 'income',
    pageCount: 1,
    uploadedAt: '2026-02-07T08:00:00Z',
    uploadedBy: 'bruce.banner@culver.edu',
    status: 'processed',
    amount: 185000,
    vendor: 'Culver University Research Dept',
    taxYear: 2025,
    extractedFields: {
      wagesBox1: 185000,
      fedWithholdingBox2: 41200,
      ssWagesBox3: 168600,
      medicareWagesBox5: 185000,
    },
    boundingBoxes: [
      createBox('box-b-w2-1', 1, 55, 35, 35, 10, 'Box 1 Wages', 'wagesBox1', '$185,000.00', 0.99),
    ],
  },
  {
    id: 'doc-bruce-1099misc-01',
    returnId: 'ret-bruce-1040',
    fileName: 'Stark_Institute_Biophysics_Honorarium_1099MISC.pdf',
    docType: 'OTHER',
    category: 'income',
    pageCount: 1,
    uploadedAt: '2026-02-09T14:10:00Z',
    uploadedBy: 'bruce.banner@culver.edu',
    status: 'processed',
    amount: 65000,
    vendor: 'Stark Institute of Applied Physics',
    taxYear: 2025,
    extractedFields: {
      otherIncomeBox3: 65000,
    },
    boundingBoxes: [
      createBox('box-b-misc-1', 1, 50, 45, 40, 10, 'Box 3 Other Income - Gamma Radiation Research', 'otherIncomeBox3', '$65,000.00', 0.97),
    ],
  },
];

// 5. Stark Industries S-Corp (ret-stark-1120s)
const starkCorpDocuments: SourceDocument[] = [
  {
    id: 'doc-starkcorp-pl-01',
    returnId: 'ret-stark-1120s',
    fileName: 'Stark_Industries_2025_Audited_PandL.pdf',
    docType: 'PROFIT_LOSS',
    category: 'business',
    pageCount: 6,
    uploadedAt: '2026-02-02T18:00:00Z',
    uploadedBy: 'pepper.potts@starkenterprises.com',
    status: 'processed',
    amount: 48500000,
    vendor: 'Stark Industries Corporate Accounting',
    taxYear: 2025,
    extractedFields: {
      grossReceipts: 142800000,
      costOfGoodsSold: 64200000,
      grossProfit: 78600000,
      officerCompensation: 4500000,
      salariesAndWages: 18200000,
      rdExpenses: 7400000,
      netOrdinaryIncome: 48500000,
    },
    boundingBoxes: [
      createBox('box-sc-pl-1', 1, 20, 30, 45, 10, 'Form 1120-S Line 1a Gross Receipts', 'grossReceipts', '$142,800,000.00', 0.99),
      createBox('box-sc-pl-2', 1, 20, 75, 45, 10, 'Form 1120-S Line 21 Ordinary Business Income', 'netOrdinaryIncome', '$48,500,000.00', 0.99),
    ],
  },
];

// 6. Pym Quantum Solutions (ret-pym-1120s)
const pymDocuments: SourceDocument[] = [
  {
    id: 'doc-pym-pl-01',
    returnId: 'ret-pym-1120s',
    fileName: 'Pym_Technologies_2025_Financial_Statements.pdf',
    docType: 'PROFIT_LOSS',
    category: 'business',
    pageCount: 4,
    uploadedAt: '2026-02-10T11:00:00Z',
    uploadedBy: 'hank.pym@pymtech.com',
    status: 'processed',
    amount: 14200000,
    vendor: 'Pym Technologies LLC',
    taxYear: 2025,
    extractedFields: {
      grossReceipts: 36800000,
      rdCreditQualified: 4200000,
      ordinaryIncome: 14200000,
    },
    boundingBoxes: [
      createBox('box-pym-pl-1', 1, 20, 40, 45, 10, 'Ordinary Business Income', 'ordinaryIncome', '$14,200,000.00', 0.97),
    ],
  },
];

// 7. Avengers Compound LLC (ret-avengers-1065)
const compoundDocuments: SourceDocument[] = [
  {
    id: 'doc-compound-1065-01',
    returnId: 'ret-avengers-1065',
    fileName: 'Upstate_Avengers_Facility_Operating_Expenses_2025.pdf',
    docType: 'PROFIT_LOSS',
    category: 'business',
    pageCount: 5,
    uploadedAt: '2026-02-11T13:00:00Z',
    uploadedBy: 'steve.rogers@avengers.org',
    status: 'processed',
    amount: 12400000,
    vendor: 'Avengers Compound Upstate Facility Operations',
    taxYear: 2025,
    extractedFields: {
      facilityOperatingCosts: 8900000,
      aviationFuelAndHangars: 3500000,
      partnerAllocationCount: 6,
    },
    boundingBoxes: [
      createBox('box-comp-1', 1, 15, 30, 50, 10, 'Total Partnership Operating Expenses', 'facilityOperatingCosts', '$8,900,000.00', 0.98),
    ],
  },
];

// 8. High Volume Receipts for Wakanda Tech & Design LLC (ret-wakanda-1065) - 150+ deterministic items
const receiptVendors = [
  { vendor: 'Vibranium Research Instruments', cat: 'supplies', basePrice: 4200 },
  { vendor: 'Quantum Particle Cloud Services (AWS)', cat: 'cloud_infra', basePrice: 1850 },
  { vendor: 'Kimoyo Bead Telemetry Systems', cat: 'hardware', basePrice: 940 },
  { vendor: 'Birnin Zana Express Logistics', cat: 'shipping', basePrice: 320 },
  { vendor: 'Advanced Metallurgy Lab Supplies', cat: 'materials', basePrice: 2800 },
  { vendor: 'Panther Energy Storage Cells', cat: 'utilities', basePrice: 1450 },
  { vendor: 'Wakandan Design Studio Office Lease', cat: 'rent', basePrice: 12500 },
  { vendor: 'Global Patent Defense & IP Legal LLC', cat: 'legal_professional', basePrice: 7500 },
  { vendor: 'High-Speed Maglev Courier', cat: 'travel', basePrice: 680 },
  { vendor: 'Stealth Shielding Alloy Ingot Batch', cat: 'raw_materials', basePrice: 16500 },
];

const wakandaReceipts: SourceDocument[] = [];
let totalWakandaExpenses = 0;

for (let i = 1; i <= 155; i++) {
  const vIndex = (i * 7) % receiptVendors.length;
  const vendorConfig = receiptVendors[vIndex];
  const priceVariance = ((i * 137) % 500) - 200;
  const amount = Math.max(120, vendorConfig.basePrice + priceVariance);
  totalWakandaExpenses += amount;

  const month = ((i % 12) + 1).toString().padStart(2, '0');
  const day = (((i * 3) % 28) + 1).toString().padStart(2, '0');
  const dateStr = `2025-${month}-${day}`;

  wakandaReceipts.push({
    id: `doc-wakanda-rec-${i.toString().padStart(3, '0')}`,
    returnId: 'ret-wakanda-1065',
    fileName: `Receipt_${dateStr}_${vendorConfig.vendor.replace(/[^a-zA-Z0-9]/g, '_')}_#${1000 + i}.pdf`,
    docType: 'RECEIPT',
    category: 'business',
    pageCount: 1,
    uploadedAt: `${dateStr}T14:30:00Z`,
    uploadedBy: 'shuri.rd@wakandatech.wk',
    status: i % 19 === 0 ? 'needs_review' : 'processed',
    amount,
    vendor: vendorConfig.vendor,
    taxYear: 2025,
    extractedFields: {
      vendor: vendorConfig.vendor,
      amount,
      expenseCategory: vendorConfig.cat,
      invoiceNumber: `WK-2025-${8000 + i}`,
      date: dateStr,
      isTaxDeductible: true,
    },
    boundingBoxes: [
      createBox(
        `box-wk-rec-${i}-1`,
        1,
        15,
        20 + ((i % 10) * 2),
        40,
        8,
        'Vendor Name',
        'vendor',
        vendorConfig.vendor,
        0.99
      ),
      createBox(
        `box-wk-rec-${i}-2`,
        1,
        60,
        70 + ((i % 5) * 2),
        30,
        8,
        'Invoice Total USD',
        'amount',
        `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        i % 19 === 0 ? 0.82 : 0.98
      ),
    ],
    rawTextPreview: `INVOICE #${8000 + i}\nVendor: ${vendorConfig.vendor}\nDate: ${dateStr}\nCategory: ${vendorConfig.cat}\nTotal Amount Due: $${amount.toFixed(2)} USD`,
  });
}

// Master collection of 170+ documents
export const mockDocuments: SourceDocument[] = [
  ...tonyDocuments,
  ...peterDocuments,
  ...natashaDocuments,
  ...bruceDocuments,
  ...starkCorpDocuments,
  ...pymDocuments,
  ...compoundDocuments,
  ...wakandaReceipts,
];

export function getDocumentsForReturn(returnId: string): SourceDocument[] {
  return mockDocuments.filter((doc) => doc.returnId === returnId);
}

export function getDocumentById(docId: string): SourceDocument | undefined {
  return mockDocuments.find((doc) => doc.id === docId);
}
