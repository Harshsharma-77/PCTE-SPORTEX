export interface EquipmentItem {
  id: string;
  name: string;
  sku: string;
  sportId: string;
  totalQuantity: number;
  availableQuantity: number;
  condition: 'NEW' | 'GOOD' | 'FAIR' | 'POOR' | 'DAMAGED';
  storageLocation?: string | null;
  costPerItem?: number | null;
  purchaseDate?: string | null;
  notes?: string | null;
  createdAt: string;
  isLowStock?: boolean;
  activeIssuesCount?: number;
  sport?: {
    id: string;
    name: string;
    category: string;
  };
}

export interface EquipmentIssueItem {
  id: string;
  equipmentId: string;
  issuedToUserId: string;
  approvedByUserId?: string | null;
  quantity: number;
  issueDate: string;
  dueDate: string;
  returnDate?: string | null;
  status: 'ISSUED' | 'RETURNED' | 'OVERDUE' | 'DAMAGED' | 'LOST';
  returnCondition?: string | null;
  fineAmount: number;
  remarks?: string | null;
  equipment?: {
    name: string;
    sku: string;
    sport?: { name: string };
  };
  issuedTo?: {
    id: string;
    name: string;
    email: string;
    roleEnum: string;
  };
  approvedBy?: {
    name: string;
  } | null;
}
