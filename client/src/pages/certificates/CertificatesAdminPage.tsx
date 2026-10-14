import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Award,
  Plus,
  Search,
  RefreshCw,
  Eye,
  ShieldCheck,
  Ban,
  Copy,
  Printer,
  QrCode,
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
import { useToast } from '../../context/ToastContext';
import { certificateApi } from '../../services/certificateApi';
import { CertificateItem } from '../../types/certificate';

export const CertificatesAdminPage: React.FC = () => {
  const toast = useToast();

  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  // Modals
  const [issueModalOpen, setIssueModalOpen] = useState<boolean>(false);
  const [previewCert, setPreviewCert] = useState<CertificateItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    studentId: '',
    tournamentId: '',
    sportId: '',
    type: 'WINNER',
    title: 'Certificate of Athletic Excellence',
    achievement: 'Secured 1st Place / Championship Title in the Annual PCTE Inter-Department Tournament',
    issuedByAdmin: 'Director of Sports & Physical Education, PCTE',
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const printRef = useRef<HTMLDivElement>(null);

  const fetchCertificates = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setError(null);
    try {
      const data = await certificateApi.getAllCertificates();
      setCertificates(data);
    } catch (err: any) {
      console.error('Failed to load certificates:', err);
      setError(err.response?.data?.message || err.message || 'Could not load certificates.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchCertificates(false);
    toast.info('Refreshing official certificates registry...');
  };

  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId || !formData.tournamentId) {
      toast.error('Please enter Student ID and Tournament ID');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await certificateApi.generateCertificate(formData);
      toast.success(`Issued certificate ${created.certificateNo} successfully!`);
      setIssueModalOpen(false);
      fetchCertificates(false);
      setPreviewCert(created);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to issue certificate');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = async (certId: string, certNo: string) => {
    if (!window.confirm(`Are you sure you want to REVOKE certificate ${certNo}? This will immediately invalidate the verification QR token.`)) {
      return;
    }

    try {
      await certificateApi.revokeCertificate(certId);
      toast.warning(`Certificate ${certNo} revoked.`);
      fetchCertificates(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to revoke certificate');
    }
  };

  const copyVerifyLink = (cert: CertificateItem) => {
    const url = `${window.location.origin}/verify-certificate/${cert.verificationUuid}`;
    navigator.clipboard.writeText(url);
    toast.success('Public verification link copied to clipboard!');
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredCertificates = certificates.filter((c) => {
    const matchesSearch =
      c.certificateNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.student?.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tournament?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedType === 'ALL' || c.type === selectedType;

    return matchesSearch && matchesType;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Certificates & QR Verification Registry" subtitle="Generate, sign, and verify institutional varsity awards." />
        <Skeleton variant="card" height={120} />
        <Skeleton variant="card" height={360} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Certificates & QR Verification Registry" subtitle="Generate, sign, and verify institutional varsity awards." />
        <ErrorState title="Certificates Registry Error" message={error} onRetry={() => fetchCertificates(true)} />
      </div>
    );
  }

  const activeCerts = certificates.filter((c) => !c.isRevoked).length;
  const winnerCerts = certificates.filter((c) => c.type === 'WINNER').length;

  return (
    <div className="space-y-8">
      {/* 1. Header Banner */}
      <PageHeader
        title="Certificates & Verification Registry"
        subtitle="Issue cryptographically verifiable digital certificates with institutional QR tokens."
        badge={
          <Badge variant="purple" size="sm">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
            Zero-Auth Public Verification
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
              onClick={() => setIssueModalOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Issue Certificate
            </Button>
          </div>
        }
      />

      {/* 2. Metric Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card variant="glass" className="p-4 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-sportex-500/10 border border-sportex-500/30 text-sportex-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Certificates Issued</p>
            <h3 className="text-2xl font-black text-white font-mono">{certificates.length}</h3>
          </div>
        </Card>

        <Card variant="glass" className="p-4 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Active & Verifiable</p>
            <h3 className="text-2xl font-black text-emerald-400 font-mono">{activeCerts}</h3>
          </div>
        </Card>

        <Card variant="glass" className="p-4 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Championship Winners</p>
            <h3 className="text-2xl font-black text-amber-400 font-mono">{winnerCerts}</h3>
          </div>
        </Card>
      </div>

      {/* 3. Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search by student, number, title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'WINNER', 'RUNNER_UP', 'PARTICIPATION', 'BEST_PLAYER'].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedType === t
                  ? 'bg-sportex-500 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Certificates Table */}
      <Card variant="glass" className="p-6 space-y-4">
        {filteredCertificates.length === 0 ? (
          <EmptyState
            title="No Certificates Found"
            description="Issue certificates to varsity student athletes to record honors."
            actionLabel="Issue Certificate"
            onAction={() => setIssueModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="pb-3">Certificate Number</th>
                  <th className="pb-3">Recipient Athlete</th>
                  <th className="pb-3">Honor Type</th>
                  <th className="pb-3">Tournament & Sport</th>
                  <th className="pb-3">Issue Date</th>
                  <th className="pb-3 text-center">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredCertificates.map((cert) => (
                  <tr key={cert.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 font-mono font-bold text-white">
                      {cert.certificateNo}
                      <span className="block text-[9px] text-slate-500 font-mono truncate max-w-[120px]">
                        UUID: {cert.verificationUuid.slice(0, 8)}...
                      </span>
                    </td>

                    <td className="py-3.5">
                      <p className="font-bold text-white">{cert.student?.user?.name || 'Athlete'}</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Dept: {cert.student?.department || 'N/A'} • {cert.student?.rollNumber || 'TBD'}
                      </p>
                    </td>

                    <td className="py-3.5">
                      <Badge
                        variant={
                          cert.type === 'WINNER'
                            ? 'warning'
                            : cert.type === 'RUNNER_UP'
                            ? 'info'
                            : cert.type === 'BEST_PLAYER'
                            ? 'success'
                            : 'purple'
                        }
                        size="sm"
                      >
                        {cert.type}
                      </Badge>
                    </td>

                    <td className="py-3.5 text-slate-300">
                      <p className="font-semibold">{cert.tournament?.name || 'Varsity Cup'}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{cert.sport?.name || 'Sport'}</p>
                    </td>

                    <td className="py-3.5 text-slate-400 font-mono text-[10px]">
                      {new Date(cert.issueDate).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 text-center">
                      {cert.isRevoked ? (
                        <Badge variant="danger" size="sm">
                          REVOKED
                        </Badge>
                      ) : (
                        <Badge variant="success" size="sm">
                          VALID
                        </Badge>
                      )}
                    </td>

                    <td className="py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Preview & Print Certificate"
                          onClick={() => setPreviewCert(cert)}
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-400 hover:text-white" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          title="Copy Public Verification Link"
                          onClick={() => copyVerifyLink(cert)}
                        >
                          <Copy className="w-3.5 h-3.5 text-slate-400 hover:text-cyan-400" />
                        </Button>

                        {!cert.isRevoked && (
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Revoke Certificate"
                            onClick={() => handleRevoke(cert.id, cert.certificateNo)}
                          >
                            <Ban className="w-3.5 h-3.5 text-slate-500 hover:text-rose-400" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ========================================================================= */}
      {/* 5. ISSUE CERTIFICATE MODAL                                                */}
      {/* ========================================================================= */}
      <Modal
        isOpen={issueModalOpen}
        onClose={() => setIssueModalOpen(false)}
        title="Issue Official Varsity Certificate"
        description="Generates an authentic PDF certificate registered on the institutional ledger."
        maxWidth="lg"
      >
        <form onSubmit={handleIssueSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Student Athlete ID / UUID"
              placeholder="e.g. Student ID"
              required
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
            />

            <Input
              label="Tournament ID"
              placeholder="e.g. Tournament ID"
              required
              value={formData.tournamentId}
              onChange={(e) => setFormData({ ...formData, tournamentId: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Certificate Category"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              options={[
                { value: 'WINNER', label: '1st Place / Winner' },
                { value: 'RUNNER_UP', label: '2nd Place / Runner-up' },
                { value: 'THIRD_PLACE', label: '3rd Place' },
                { value: 'PARTICIPATION', label: 'Official Participation' },
                { value: 'BEST_PLAYER', label: 'Best Player / MVP' },
                { value: 'BEST_GOALKEEPER', label: 'Best Goalkeeper' },
                { value: 'FAIR_PLAY', label: 'Fair Play Honor' },
              ]}
            />

            <Input
              label="Signatory Authority"
              value={formData.issuedByAdmin}
              onChange={(e) => setFormData({ ...formData, issuedByAdmin: e.target.value })}
            />
          </div>

          <Input
            label="Certificate Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Achievement Citation</label>
            <textarea
              rows={3}
              value={formData.achievement}
              onChange={(e) => setFormData({ ...formData, achievement: e.target.value })}
              required
              className="w-full rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs p-3 focus:outline-none focus:ring-2 focus:ring-sportex-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setIssueModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Generate & Sign Certificate
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* 6. HIGH-RES CERTIFICATE PREVIEW & PRINT MODAL                             */}
      {/* ========================================================================= */}
      <Modal
        isOpen={!!previewCert}
        onClose={() => setPreviewCert(null)}
        title="Official Certificate of Achievement"
        description={`Certificate Number: ${previewCert?.certificateNo}`}
        maxWidth="xl"
      >
        {previewCert && (
          <div className="space-y-6">
            {/* Printable High-Impact Certificate Canvas */}
            <div
              ref={printRef}
              className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-4 border-amber-500/40 shadow-2xl text-center space-y-6 relative overflow-hidden"
            >
              {/* Gold Ornament Borders */}
              <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-amber-400" />
              <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-amber-400" />
              <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-amber-400" />
              <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-amber-400" />

              {/* Header */}
              <div className="space-y-1">
                <p className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-black">
                  PUNJAB COLLEGE OF TECHNICAL EDUCATION
                </p>
                <h2 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight uppercase">
                  SPORTEX ATHLETIC DIRECTORATE
                </h2>
                <div className="w-24 h-1 bg-amber-500 mx-auto rounded-full mt-2" />
              </div>

              {/* Title */}
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-widest text-slate-400">This is proudly awarded to</p>
                <h3 className="text-3xl sm:text-4xl font-black text-amber-300 font-display tracking-tight">
                  {previewCert.student?.user?.name || 'Athlete Name'}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Roll No: {previewCert.student?.rollNumber || 'N/A'} • Dept of {previewCert.student?.department || 'Varsity Athletics'}
                </p>
              </div>

              {/* Citation */}
              <div className="max-w-xl mx-auto space-y-2">
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-serif italic">
                  "{previewCert.achievement}"
                </p>
                <p className="text-xs font-bold text-sportex-400">
                  {previewCert.tournament?.name} ({previewCert.sport?.name})
                </p>
              </div>

              {/* Verification & Signatures Bar */}
              <div className="grid grid-cols-3 items-end pt-8 border-t border-slate-800/80 text-xs">
                <div className="text-left space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Issue Date</span>
                  <span className="font-mono text-white font-bold">
                    {new Date(previewCert.issueDate).toLocaleDateString()}
                  </span>
                </div>

                {/* QR Code Seal */}
                <div className="text-center space-y-1">
                  <div className="w-16 h-16 p-1.5 rounded-xl bg-white mx-auto shadow-lg flex items-center justify-center">
                    <QrCode className="w-full h-full text-slate-950" />
                  </div>
                  <span className="text-[9px] font-mono text-emerald-400 block font-bold">
                    SECURE VERIFIED
                  </span>
                </div>

                <div className="text-right space-y-1">
                  <div className="w-32 border-b border-slate-700 ml-auto pb-1">
                    <span className="font-serif italic text-amber-400 text-xs font-bold">Authorized</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">{previewCert.issuedByAdmin}</span>
                </div>
              </div>

              <div className="pt-2 text-[9px] font-mono text-slate-500">
                Verification UUID: {previewCert.verificationUuid} • Verify at {window.location.origin}/verify-certificate/{previewCert.verificationUuid}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyVerifyLink(previewCert)}
                leftIcon={<Copy className="w-3.5 h-3.5" />}
              >
                Copy Verification URL
              </Button>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setPreviewCert(null)}>
                  Close
                </Button>
                <Button variant="primary" size="sm" onClick={handlePrint} leftIcon={<Printer className="w-3.5 h-3.5" />}>
                  Print / Save PDF
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
