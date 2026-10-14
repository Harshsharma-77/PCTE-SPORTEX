import React, { useEffect, useState, useCallback } from 'react';
import {
  MessageSquare,
  Plus,
  CheckCircle2,
  RefreshCw,
  Clock,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { feedbackApi } from '../../services/feedbackApi';
import { FeedbackTicket } from '../../types/feedback';

export const FeedbackDeskPage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [tickets, setTickets] = useState<FeedbackTicket[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [submitModalOpen, setSubmitModalOpen] = useState<boolean>(false);
  const [resolveModalOpen, setResolveModalOpen] = useState<boolean>(false);
  const [selectedTicket, setSelectedTicket] = useState<FeedbackTicket | null>(null);

  // Form State
  const [submitForm, setSubmitForm] = useState({
    category: 'FACILITY',
    priority: 'MEDIUM',
    subject: '',
    description: '',
  });

  const [resolveForm, setResolveForm] = useState({
    status: 'RESOLVED',
    resolutionNotes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'SPORTS_ADMIN';

  const fetchTickets = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setError(null);
    try {
      const data = isAdmin
        ? await feedbackApi.getAllFeedback()
        : await feedbackApi.getUserFeedback();
      setTickets(data);
    } catch (err: any) {
      console.error('Failed to load feedback tickets:', err);
      setError(err.response?.data?.message || err.message || 'Could not load tickets.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchTickets(false);
    toast.info('Refreshing grievance desk records...');
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await feedbackApi.submitFeedback(submitForm);
      toast.success('Grievance ticket registered! Sports staff will review shortly.');
      setSubmitModalOpen(false);
      setSubmitForm({ category: 'FACILITY', priority: 'MEDIUM', subject: '', description: '' });
      fetchTickets(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    setIsSubmitting(true);
    try {
      await feedbackApi.respondToFeedback(selectedTicket.id, resolveForm);
      toast.success(`Ticket ${selectedTicket.ticketNumber} marked as ${resolveForm.status}`);
      setResolveModalOpen(false);
      fetchTickets(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Grievance & Feedback Desk" subtitle="Student and coach complaints, facility disputes, and resolution audit." />
        <Skeleton variant="card" height={120} />
        <Skeleton variant="card" height={360} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Grievance & Feedback Desk" subtitle="Student and coach complaints, facility disputes, and resolution audit." />
        <ErrorState title="Feedback Desk Error" message={error} onRetry={() => fetchTickets(true)} />
      </div>
    );
  }

  const pendingCount = tickets.filter((t) => t.status === 'PENDING').length;
  const resolvedCount = tickets.filter((t) => t.status === 'RESOLVED').length;

  return (
    <div className="space-y-8">
      {/* 1. Header Banner */}
      <PageHeader
        title="Grievance & Feedback Desk"
        subtitle="Submit facility disputes, equipment complaints, referee reviews, and track administrative resolutions."
        badge={
          <Badge variant="purple" size="sm">
            <MessageSquare className="w-3.5 h-3.5 mr-1" />
            Ticket Audit Active
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              isLoading={isRefreshing}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />}
            >
              Sync
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setSubmitModalOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Submit Ticket
            </Button>
          </div>
        }
      />

      {/* 2. Metric Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card variant="glass" className="p-4 flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-sportex-500/10 border border-sportex-500/30 text-sportex-400">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Registered Tickets</p>
            <h3 className="text-2xl font-black text-white font-mono">{tickets.length}</h3>
          </div>
        </Card>

        <Card variant="glass" className="p-4 flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Pending Review</p>
            <h3 className="text-2xl font-black text-amber-400 font-mono">{pendingCount}</h3>
          </div>
        </Card>

        <Card variant="glass" className="p-4 flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Resolved & Closed</p>
            <h3 className="text-2xl font-black text-emerald-400 font-mono">{resolvedCount}</h3>
          </div>
        </Card>
      </div>

      {/* 3. Tickets Ledger */}
      <Card variant="glass" className="p-6 space-y-4">
        <h3 className="text-base font-bold text-white pb-3 border-b border-slate-800">
          Grievance & Feedback Register
        </h3>

        {tickets.length === 0 ? (
          <EmptyState
            title="No Grievance Tickets"
            description="Have feedback or a facility dispute? Register a ticket with the sports directorate."
            actionLabel="Submit Ticket"
            onAction={() => setSubmitModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="pb-3">Ticket ID</th>
                  <th className="pb-3">Subject & Details</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Priority</th>
                  <th className="pb-3">Submitter</th>
                  <th className="pb-3 text-center">Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 font-mono font-bold text-sportex-400">{t.ticketNumber}</td>

                    <td className="py-3.5 max-w-xs">
                      <p className="font-bold text-white truncate">{t.subject}</p>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{t.description}</p>
                      {t.resolutionNotes && (
                        <p className="text-[10px] text-emerald-400 mt-1 italic">
                          Resolution: {t.resolutionNotes}
                        </p>
                      )}
                    </td>

                    <td className="py-3.5">
                      <Badge variant="default" size="sm">
                        {t.category}
                      </Badge>
                    </td>

                    <td className="py-3.5">
                      <Badge
                        variant={
                          t.priority === 'URGENT'
                            ? 'danger'
                            : t.priority === 'HIGH'
                            ? 'warning'
                            : 'info'
                        }
                        size="sm"
                      >
                        {t.priority}
                      </Badge>
                    </td>

                    <td className="py-3.5 text-slate-300">
                      <p className="font-semibold">{t.user?.name || 'User'}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{t.user?.roleEnum}</p>
                    </td>

                    <td className="py-3.5 text-center">
                      <Badge
                        variant={
                          t.status === 'RESOLVED'
                            ? 'success'
                            : t.status === 'UNDER_REVIEW'
                            ? 'warning'
                            : t.status === 'REJECTED'
                            ? 'danger'
                            : 'purple'
                        }
                        size="sm"
                      >
                        {t.status}
                      </Badge>
                    </td>

                    <td className="py-3.5 text-right">
                      {isAdmin ? (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            setSelectedTicket(t);
                            setResolveForm({
                              status: t.status === 'PENDING' ? 'RESOLVED' : t.status,
                              resolutionNotes: t.resolutionNotes || '',
                            });
                            setResolveModalOpen(true);
                          }}
                        >
                          Respond
                        </Button>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-500">
                          {new Date(t.createdAt).toLocaleDateString()}
                        </span>
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
      {/* 4. SUBMIT TICKET MODAL                                                    */}
      {/* ========================================================================= */}
      <Modal
        isOpen={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        title="Submit Grievance / Feedback Ticket"
        description="Your submission will be routed directly to the PCTE Sports Directorate."
        maxWidth="md"
      >
        <form onSubmit={handleSubmitTicket} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Issue Category"
              value={submitForm.category}
              onChange={(e) => setSubmitForm({ ...submitForm, category: e.target.value })}
              options={[
                { value: 'FACILITY', label: 'Facility / Court Condition' },
                { value: 'EQUIPMENT', label: 'Equipment Dispute' },
                { value: 'OFFICIATING', label: 'Refereeing / Rules' },
                { value: 'COACHING', label: 'Coaching / Training' },
                { value: 'TOURNAMENT', label: 'Tournament Scheduling' },
                { value: 'OTHER', label: 'General Feedback' },
              ]}
            />

            <Select
              label="Priority Level"
              value={submitForm.priority}
              onChange={(e) => setSubmitForm({ ...submitForm, priority: e.target.value })}
              options={[
                { value: 'LOW', label: 'Low Priority' },
                { value: 'MEDIUM', label: 'Medium Priority' },
                { value: 'HIGH', label: 'High Priority' },
                { value: 'URGENT', label: 'Urgent Action Required' },
              ]}
            />
          </div>

          <Input
            label="Subject"
            placeholder="Brief summary of the issue..."
            required
            value={submitForm.subject}
            onChange={(e) => setSubmitForm({ ...submitForm, subject: e.target.value })}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Detailed Description</label>
            <textarea
              rows={4}
              placeholder="Provide complete facts, dates, court locations, or referee details..."
              required
              value={submitForm.description}
              onChange={(e) => setSubmitForm({ ...submitForm, description: e.target.value })}
              className="w-full rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs p-3 focus:outline-none focus:ring-2 focus:ring-sportex-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setSubmitModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Submit Grievance
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* 5. ADMIN RESOLVE MODAL                                                    */}
      {/* ========================================================================= */}
      <Modal
        isOpen={resolveModalOpen}
        onClose={() => setResolveModalOpen(false)}
        title={`Respond to Ticket ${selectedTicket?.ticketNumber}`}
        description={`Subject: ${selectedTicket?.subject}`}
        maxWidth="md"
      >
        <form onSubmit={handleResolveSubmit} className="space-y-4">
          <Select
            label="Updated Ticket Status"
            value={resolveForm.status}
            onChange={(e) => setResolveForm({ ...resolveForm, status: e.target.value })}
            options={[
              { value: 'RESOLVED', label: 'Resolved & Closed' },
              { value: 'UNDER_REVIEW', label: 'Under Investigation' },
              { value: 'REJECTED', label: 'Rejected / Invalid' },
            ]}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Administrative Resolution Notes</label>
            <textarea
              rows={4}
              placeholder="Enter official resolution details or instructions communicated to athlete..."
              required
              value={resolveForm.resolutionNotes}
              onChange={(e) => setResolveForm({ ...resolveForm, resolutionNotes: e.target.value })}
              className="w-full rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs p-3 focus:outline-none focus:ring-2 focus:ring-sportex-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setResolveModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Save Resolution & Notify
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
