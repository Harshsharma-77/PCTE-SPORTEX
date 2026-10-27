import React, { useEffect, useState, useCallback } from 'react';
import {
  Bell,
  Plus,
  RefreshCw,
  Search,
  Pin,
  Calendar,
  Megaphone,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../context/ToastContext';
import { notificationApi } from '../../services/notificationApi';
import { Announcement } from '../../types/notification';

export const AnnouncementsAdminPage: React.FC = () => {
  const toast = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [audienceFilter, setAudienceFilter] = useState('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'NORMAL',
    targetAudience: 'ALL',
    isPinned: false,
    expiresAt: '',
  });

  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      const data = await notificationApi.getAnnouncements(
        audienceFilter === 'ALL' ? undefined : audienceFilter
      );
      setAnnouncements(data || []);
    } catch (err: any) {
      toast.error('Failed to load campus announcements.');
    } finally {
      setLoading(false);
    }
  }, [audienceFilter, toast]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Please enter both title and announcement content.');
      return;
    }

    try {
      setSubmitting(true);
      await notificationApi.createAnnouncement({
        title: formData.title.trim(),
        content: formData.content.trim(),
        priority: formData.priority,
        targetAudience: formData.targetAudience,
        isPinned: formData.isPinned,
        expiresAt: formData.expiresAt || undefined,
      });

      toast.success('Campus bulletin published successfully!');
      setIsCreateModalOpen(false);
      setFormData({
        title: '',
        content: '',
        priority: 'NORMAL',
        targetAudience: 'ALL',
        isPinned: false,
        expiresAt: '',
      });
      fetchAnnouncements();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to publish announcement.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAnnouncements = announcements.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return <Badge variant="danger">Urgent Notice</Badge>;
      case 'HIGH':
        return <Badge variant="warning">High Priority</Badge>;
      default:
        return <Badge variant="info">General Bulletin</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Varsity Bulletins & Announcements"
        subtitle="Broadcast inter-departmental sports notices, tournament draws, and collegiate athletic announcements."
        badge={
          <Badge variant="success" size="sm">
            <Megaphone className="w-3.5 h-3.5 mr-1" />
            Bulletin Desk Active
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAnnouncements}
              leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
            >
              Refresh
            </Button>
            <Button
              variant="glow"
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Publish Bulletin
            </Button>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <Card variant="glass" className="p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search announcements by keywords, tournaments, or dates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-slate-900/60 border border-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:border-sportex-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Audience:</span>
            <select
              value={audienceFilter}
              onChange={(e) => setAudienceFilter(e.target.value)}
              className="px-3 py-2 text-xs font-medium rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-sportex-500"
            >
              <option value="ALL">All Campus Stakeholders</option>
              <option value="COACH">Coaching Staff Only</option>
              <option value="STUDENT">Student Athletes Only</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Announcements List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="card" height={130} />
          ))}
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <Card variant="glass" className="p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-500">
            <Bell className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No Campus Bulletins Found</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
            There are currently no active sports announcements matching your search criteria. Publish a new notice to notify departmental squads.
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Publish New Notice
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map((item) => (
            <Card
              key={item.id}
              variant="default"
              className={`p-6 transition-all ${
                item.isPinned
                  ? 'border-l-4 border-l-amber-500 bg-slate-900/90 shadow-lg'
                  : 'hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  {item.isPinned && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-800/60">
                      <Pin className="w-3 h-3" />
                      PINNED NOTICE
                    </span>
                  )}
                  {getPriorityBadge(item.priority)}
                  <span className="text-[11px] font-mono text-slate-400 px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800">
                    Target: {item.targetAudience}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(item.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  {item.author && (
                    <span className="font-semibold text-slate-300">
                      by {item.author.name}
                    </span>
                  )}
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-2 font-display">{item.title}</h3>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {item.content}
              </p>
            </Card>
          ))}
        </div>
      )}

      {/* Publish Bulletin Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Publish Official Campus Bulletin"
        description="Broadcast athletic announcements across varsity noticeboards and mobile alerts."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateAnnouncement} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Bulletin Title *
            </label>
            <Input
              placeholder="e.g. PCTE ATHLOS 2026 Football Squad Submission Deadline"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Priority Tier
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-sportex-500"
              >
                <option value="NORMAL">Standard Notice</option>
                <option value="HIGH">High Priority</option>
                <option value="URGENT">Urgent Action Required</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Target Audience
              </label>
              <select
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-sportex-500"
              >
                <option value="ALL">Entire Campus (All Users)</option>
                <option value="COACH">Coaches & Managers Only</option>
                <option value="STUDENT">Student Athletes Only</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Detailed Bulletin Content *
            </label>
            <textarea
              rows={4}
              placeholder="Write the full announcement details, tournament schedules, venue changes, or eligibility requirements..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:border-sportex-500"
              required
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="isPinned"
              checked={formData.isPinned}
              onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
              className="w-4 h-4 rounded text-sportex-500 bg-slate-900 border-slate-700"
            />
            <label htmlFor="isPinned" className="text-xs font-medium text-slate-300 cursor-pointer">
              Pin this notice to top of public portal bulletin boards
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="glow"
              size="sm"
              isLoading={submitting}
              leftIcon={<Megaphone className="w-4 h-4" />}
            >
              Publish Notice
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
