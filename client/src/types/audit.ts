export interface AuditLogItem {
  id: string;
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  changesDiff?: any;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    roleEnum: string;
  } | null;
}
