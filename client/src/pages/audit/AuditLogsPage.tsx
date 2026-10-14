import React, { useEffect, useState, useCallback } from 'react';
import {
  ShieldAlert,
  Search,
  RefreshCw,
  FileCode,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { useToast } from '../../context/ToastContext';
import { auditApi } from '../../services/auditApi';
import { AuditLogItem } from '../../types/audit';

export const AuditLogsPage: React.FC = () => {
  const toast = useToast();

  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  const fetchAuditLogs = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setError(null);
    try {
      const data = await auditApi.getAuditLogs();
      setLogs(data);
    } catch (err: any) {
      console.error('Failed to load audit logs:', err);
      setError(err.response?.data?.message || err.message || 'Could not load compliance logs.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchAuditLogs(false);
    toast.info('Fetching latest system compliance logs...');
  };

  const filteredLogs = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.entity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Security & Compliance Audit Trail" subtitle="Immutable record of system operations, match updates, and access logs." />
        <Skeleton variant="card" height={120} />
        <Skeleton variant="card" height={360} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Security & Compliance Audit Trail" subtitle="Immutable record of system operations, match updates, and access logs." />
        <ErrorState title="Audit Trail Error" message={error} onRetry={() => fetchAuditLogs(true)} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. Header Banner */}
      <PageHeader
        title="Security & Compliance Audit Trail"
        subtitle="Immutable ledger of administrative actions, score revisions, certificate emissions, and role changes."
        badge={
          <Badge variant="purple" size="sm">
            <ShieldAlert className="w-3.5 h-3.5 mr-1" />
            Compliance Ledger Active
          </Badge>
        }
        actions={
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            isLoading={isRefreshing}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />}
          >
            Sync Logs
          </Button>
        }
      />

      {/* 2. Filter Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search action, entity, user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>
        <span className="text-xs font-mono text-slate-500">{filteredLogs.length} Records Logged</span>
      </div>

      {/* 3. Audit Table */}
      <Card variant="glass" className="p-6 space-y-4">
        {filteredLogs.length === 0 ? (
          <EmptyState title="No Audit Records" description="System audit records will be logged automatically." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="pb-3">Timestamp</th>
                  <th className="pb-3">Action Triggered</th>
                  <th className="pb-3">Entity Scope</th>
                  <th className="pb-3">User & Role</th>
                  <th className="pb-3">IP Address</th>
                  <th className="pb-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 text-slate-400 font-mono text-[10px] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>

                    <td className="py-3.5">
                      <Badge
                        variant={
                          log.action.includes('CREATED') || log.action.includes('ISSUED')
                            ? 'success'
                            : log.action.includes('RESOLVED') || log.action.includes('RETURNED')
                            ? 'info'
                            : log.action.includes('DELETE') || log.action.includes('REVOKE')
                            ? 'danger'
                            : 'purple'
                        }
                        size="sm"
                      >
                        {log.action}
                      </Badge>
                    </td>

                    <td className="py-3.5 font-mono text-slate-300">
                      {log.entity} {log.entityId && <span className="text-[9px] text-slate-500">({log.entityId.slice(0, 6)}...)</span>}
                    </td>

                    <td className="py-3.5">
                      <p className="font-bold text-white">{log.user?.name || 'System Auto'}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{log.user?.roleEnum || 'SYSTEM'}</p>
                    </td>

                    <td className="py-3.5 font-mono text-slate-400 text-[10px]">
                      {log.ipAddress || '127.0.0.1'}
                    </td>

                    <td className="py-3.5 text-right">
                      {log.changesDiff ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                          leftIcon={<FileCode className="w-3 h-3 text-sportex-400" />}
                        >
                          Diff
                        </Button>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ========================================================================= */}
      {/* 4. CHANGES DIFF VIEWER MODAL                                              */}
      {/* ========================================================================= */}
      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title={`Audit Record Diff — ${selectedLog?.action}`}
        description={`Logged at ${new Date(selectedLog?.createdAt || '').toLocaleString()}`}
        maxWidth="md"
      >
        {selectedLog && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs overflow-x-auto max-h-64">
              <pre className="text-cyan-300 whitespace-pre-wrap">
                {JSON.stringify(selectedLog.changesDiff, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <Button variant="ghost" onClick={() => setSelectedLog(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
