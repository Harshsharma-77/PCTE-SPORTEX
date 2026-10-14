export interface FeedbackTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  category: 'FACILITY' | 'EQUIPMENT' | 'COACHING' | 'OFFICIATING' | 'TOURNAMENT' | 'SCHEDULE' | 'OTHER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  subject: string;
  description: string;
  attachmentUrl?: string | null;
  status: 'PENDING' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED';
  assignedToUserId?: string | null;
  resolutionNotes?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    roleEnum: string;
  };
  assignedTo?: {
    id: string;
    name: string;
  } | null;
}
