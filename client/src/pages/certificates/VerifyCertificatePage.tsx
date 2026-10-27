import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  AlertTriangle,
  Printer,
  Search,
  ArrowLeft,
  QrCode,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Skeleton } from '../../components/ui/Skeleton';
import { certificateApi } from '../../services/certificateApi';
import { VerificationResult } from '../../types/certificate';

export const VerifyCertificatePage: React.FC = () => {
  const { certificateId, identifier } = useParams<{ certificateId?: string; identifier?: string }>();
  const navigate = useNavigate();

  const lookupId = certificateId || identifier || '';

  const [verification, setVerification] = useState<VerificationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchKey, setSearchKey] = useState<string>('');

  const fetchVerification = useCallback(async (idToVerify: string) => {
    if (!idToVerify) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const result = await certificateApi.verifyCertificate(idToVerify);
      setVerification(result);
    } catch (err: any) {
      setVerification({
        isValid: false,
        isRevoked: false,
        message: 'Could not connect to certificate verification gateway.',
        certificate: null,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (lookupId) {
      fetchVerification(lookupId);
    } else {
      setIsLoading(false);
    }
  }, [lookupId, fetchVerification]);

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchKey.trim()) return;
    navigate(`/verify-certificate/${searchKey.trim()}`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Navigation & Brand Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            PCTE SPORTEX Home
          </Button>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              Institutional Registry
            </span>
          </div>
        </div>

        {/* Manual Lookup Search Bar */}
        <Card variant="glass" className="p-4">
          <form onSubmit={handleManualSearch} className="flex gap-2">
            <Input
              placeholder="Enter Certificate No (e.g. SPORTEX/2026/FBT/1284) or Verification UUID..."
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
              className="text-xs flex-1"
            />
            <Button type="submit" variant="primary" size="sm" leftIcon={<Search className="w-3.5 h-3.5" />}>
              Verify
            </Button>
          </form>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            <Skeleton variant="card" height={280} />
            <Skeleton variant="card" height={160} />
          </div>
        )}

        {/* Default Portal Welcome State (when no certificate is looked up yet) */}
        {!isLoading && !verification && (
          <Card variant="glass" className="p-8 sm:p-10 text-center space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-sportex-600/20 text-sportex-400 flex items-center justify-center mx-auto border border-sportex-500/30">
              <QrCode className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Official Digital Certificate Verification Portal
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg mx-auto mt-2 leading-relaxed">
                PCTE SPORTEX utilizes cryptographic QR codes and cryptographic hashes to verify varsity athletic certificates. Enter a Certificate Number (e.g., <span className="font-mono text-sportex-500 font-semibold">SPORTEX/2026/FBT/1284</span>) or paste a verification identifier in the box above to validate authenticity against our cloud database.
              </p>
            </div>

            <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">Instant Verification</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Directly validates against PostgreSQL sports registry.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">Anti-Tamper Record</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Immutable certificate hash ensures certificate credentials are untampered.</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">Official Accreditation</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Recognized by PCTE Directorate of Sports for academic sports quota.</span>
              </div>
            </div>
          </Card>
        )}

        {/* Verification Outcomes */}
        {!isLoading && verification && (
          <div className="space-y-6">
            {/* 1. VALID CERTIFICATE VERIFIED */}
            {verification.isValid && verification.certificate && (
              <div className="space-y-6">
                {/* Official Verification Banner */}
                <div className="p-6 rounded-3xl bg-emerald-950/40 border-2 border-emerald-500/40 shadow-2xl flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex-shrink-0">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="success" size="sm">
                        OFFICIALLY VERIFIED
                      </Badge>
                      <span className="text-xs font-mono text-emerald-400">
                        {verification.certificate.certificateNo}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-white">Authentic University Sports Certificate</h2>
                    <p className="text-xs text-slate-300">
                      {verification.message} Verified at {new Date().toLocaleString()}.
                    </p>
                  </div>
                </div>

                {/* Printable Certificate Showcase */}
                <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-4 border-amber-500/40 shadow-2xl text-center space-y-6 relative overflow-hidden">
                  {/* Gold Ornament Borders */}
                  <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-amber-400" />
                  <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-amber-400" />
                  <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-amber-400" />
                  <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-amber-400" />

                  {/* Institution Seal */}
                  <div className="space-y-1">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-black">
                      PUNJAB COLLEGE OF TECHNICAL EDUCATION
                    </p>
                    <h1 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight uppercase">
                      SPORTEX ATHLETIC DIRECTORATE
                    </h1>
                    <div className="w-24 h-1 bg-amber-500 mx-auto rounded-full mt-2" />
                  </div>

                  {/* Awardee Info */}
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-widest text-slate-400">This is certified to</p>
                    <h3 className="text-3xl sm:text-4xl font-black text-amber-300 font-display tracking-tight">
                      {verification.certificate.student?.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Roll Number: {verification.certificate.student?.rollNumber} • Dept of {verification.certificate.student?.department}
                    </p>
                  </div>

                  {/* Citation */}
                  <div className="max-w-xl mx-auto space-y-2">
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-serif italic">
                      "{verification.certificate.achievement}"
                    </p>
                    <p className="text-xs font-bold text-sportex-400">
                      {verification.certificate.tournament?.name} ({verification.certificate.sport?.name})
                    </p>
                  </div>

                  {/* Verification & Signatures Bar */}
                  <div className="grid grid-cols-3 items-end pt-8 border-t border-slate-800/80 text-xs">
                    <div className="text-left space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase font-mono block">Date of Issue</span>
                      <span className="font-mono text-white font-bold">
                        {new Date(verification.certificate.issueDate || '').toLocaleDateString()}
                      </span>
                    </div>

                    <div className="text-center space-y-1">
                      <div className="w-14 h-14 p-1 rounded-xl bg-white mx-auto shadow-lg flex items-center justify-center">
                        <QrCode className="w-full h-full text-slate-950" />
                      </div>
                      <span className="text-[9px] font-mono text-emerald-400 block font-bold">
                        QR VERIFIED
                      </span>
                    </div>

                    <div className="text-right space-y-1">
                      <div className="w-32 border-b border-slate-700 ml-auto pb-1">
                        <span className="font-serif italic text-amber-400 text-xs font-bold">Authorized</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">
                        {verification.certificate.issuedByAdmin || 'PCTE Director of Sports'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 text-[9px] font-mono text-slate-500">
                    Cryptographic UUID: {verification.certificate.verificationUuid}
                  </div>
                </div>

                {/* Print Action */}
                <div className="flex justify-end">
                  <Button variant="primary" onClick={handlePrint} leftIcon={<Printer className="w-4 h-4" />}>
                    Print Official Certificate PDF
                  </Button>
                </div>
              </div>
            )}

            {/* 2. REVOKED CERTIFICATE */}
            {verification.isRevoked && (
              <Card variant="glass" className="p-8 border-rose-500/50 bg-rose-950/20 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <Badge variant="danger" size="md">
                  CERTIFICATE REVOKED
                </Badge>
                <h3 className="text-xl font-bold text-white">This Certificate Has Been Revoked</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto">{verification.message}</p>
                <p className="text-[10px] font-mono text-slate-500">
                  Certificate Number: {verification.certificate?.certificateNo}
                </p>
              </Card>
            )}

            {/* 3. INVALID / NOT FOUND */}
            {!verification.isValid && !verification.isRevoked && (
              <Card variant="glass" className="p-8 text-center space-y-4 border-amber-500/40">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <Badge variant="warning">NOT FOUND</Badge>
                <h3 className="text-xl font-bold text-white">Certificate Verification Failed</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  {verification.message ||
                    'No record matching this identifier was found in the official PCTE SPORTEX database registry.'}
                </p>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
