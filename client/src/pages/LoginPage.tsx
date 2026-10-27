import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Lock,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  Shield,
  AlertCircle,
  KeyRound,
  GraduationCap,
  Zap,
  Award,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';

export const LoginPage: React.FC = () => {
  const { login, registerStudent, forgotPassword, resetPassword, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If already authenticated, redirect to dashboard
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Tab State
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Login Form State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRoll, setRegRoll] = useState('');
  const [regDept, setRegDept] = useState('CSE');
  const [regBatch, setRegBatch] = useState(2023);
  const [regSem, setRegSem] = useState(6);
  const [regGender, setRegGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [regPhone, setRegPhone] = useState('');
  const [regBlood, setRegBlood] = useState('B+');
  const [regError, setRegError] = useState<string | null>(null);

  // Forgot Password Modal State
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotResult, setForgotResult] = useState<{ message: string; resetToken?: string } | null>(null);
  const [newResetPassword, setNewResetPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsSubmitting(true);

    try {
      await login({ identifier, password });
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setLoginError(err.response?.data?.message || err.message || 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setIsSubmitting(true);

    try {
      await registerStudent({
        name: regName,
        email: regEmail,
        password: regPassword,
        rollNumber: regRoll,
        department: regDept,
        batchYear: Number(regBatch),
        semester: Number(regSem),
        gender: regGender,
        phone: regPhone,
        bloodGroup: regBlood,
      });
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setRegError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    try {
      const res = await forgotPassword(forgotEmail);
      setForgotResult(res);
    } catch (err: any) {
      setForgotResult({ message: err.message || 'Could not process request' });
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotResult?.resetToken) return;
    setForgotLoading(true);
    try {
      await resetPassword({
        token: forgotResult.resetToken,
        newPassword: newResetPassword,
        confirmPassword: newResetPassword,
      });
      setResetSuccess('Password reset successfully! You can now log in.');
      setTimeout(() => {
        setForgotModalOpen(false);
        setForgotResult(null);
        setResetSuccess(null);
      }, 2000);
    } catch (err: any) {
      setResetSuccess(err.message || 'Reset failed');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-[550px] pointer-events-none -z-10">
        <div className="absolute top-0 left-1/4 w-80 h-80 bg-sportex-600/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-600/15 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Side: Institutional Overview & Security Policy (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-2xl">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sportex-600 to-cyan-400 p-0.5 shadow-lg shadow-sportex-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-sportex-400" />
                </div>
              </div>
              <div>
                <h2 className="font-display font-black text-xl text-white">PCTE SPORTEX</h2>
                <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">Directorate of Sports</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              Official Sports Management & Athletic Operations Platform for Punjab College of Technical Education (PCTE), Ludhiana.
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Multi-Tier RBAC Access</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Role-guarded workspaces for Administrators, Coaches, Referees, and Athletes.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Live Match Telemetry</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    WebSocket scoring arena with real-time score feeds and penalty tracking.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Cryptographic QR Verification</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Tamper-proof participation certificates verified against our cloud registry.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-sportex-400 flex-shrink-0" />
              <span>Sign in using your institutional email or registered university roll number.</span>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Enterprise Security
            </span>
            <span>PCTE &copy; 2026</span>
          </div>
        </div>

        {/* Right Side: Auth Forms (7 cols) */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl flex flex-col justify-center">
          {/* Tab Switcher */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-950/80 border border-slate-800 mb-6">
            <button
              onClick={() => {
                setTab('login');
                setLoginError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                tab === 'login'
                  ? 'bg-sportex-600 text-white shadow-md shadow-sportex-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>

            <button
              onClick={() => {
                setTab('register');
                setRegError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                tab === 'register'
                  ? 'bg-sportex-600 text-white shadow-md shadow-sportex-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Athlete Registration</span>
            </button>
          </div>

          <AnimatePresence mode="wait">
            {tab === 'login' ? (
              <motion.div
                key="login-tab"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-5">
                  <h3 className="text-xl font-bold text-white">Welcome Back</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Enter your credentials or university roll number.</p>
                </div>

                {loginError && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-200 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <Input
                    label="Email Address or Roll Number"
                    placeholder="e.g. harsh.cse@pcte.edu.in or 2329263"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    leftIcon={<Mail className="w-4 h-4" />}
                  />

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-slate-300">Password</label>
                      <button
                        type="button"
                        onClick={() => setForgotModalOpen(true)}
                        className="text-xs text-sportex-400 hover:text-sportex-300 hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        leftIcon={<Lock className="w-4 h-4" />}
                        rightIcon={
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="p-1 text-slate-400 hover:text-slate-200"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        }
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="glow"
                    size="lg"
                    className="w-full mt-2"
                    isLoading={isSubmitting}
                    rightIcon={<LogIn className="w-4 h-4" />}
                  >
                    Authenticate & Access Hub
                  </Button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="register-tab"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-white">Student Athlete Sign Up</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Register for varsity sports eligibility and rosters.</p>
                </div>

                {regError && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-200 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    <span>{regError}</span>
                  </div>
                )}

                <form onSubmit={handleRegisterSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Full Name"
                      placeholder="Harsh Sharma"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      required
                      leftIcon={<UserIcon className="w-4 h-4" />}
                    />
                    <Input
                      label="College Email"
                      type="email"
                      placeholder="student@pcte.edu.in"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      required
                      leftIcon={<Mail className="w-4 h-4" />}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="University Roll No"
                      placeholder="2329263"
                      value={regRoll}
                      onChange={(e) => setRegRoll(e.target.value)}
                      required
                      leftIcon={<GraduationCap className="w-4 h-4" />}
                    />
                    <Input
                      label="Password (min 6 characters)"
                      type="password"
                      placeholder="Enter a secure password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                      leftIcon={<Lock className="w-4 h-4" />}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Department</label>
                      <select
                        value={regDept}
                        onChange={(e) => setRegDept(e.target.value)}
                        className="w-full rounded-xl bg-slate-900/90 border border-slate-800 text-slate-100 text-xs px-3 py-2.5 focus:ring-2 focus:ring-sportex-500 focus:outline-none"
                      >
                        <option value="CSE">CSE</option>
                        <option value="IT">IT</option>
                        <option value="ME">ME</option>
                        <option value="ECE">ECE</option>
                        <option value="BBA">BBA</option>
                        <option value="MBA">MBA</option>
                        <option value="BPHARM">BPHARM</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Batch Year</label>
                      <select
                        value={regBatch}
                        onChange={(e) => setRegBatch(Number(e.target.value))}
                        className="w-full rounded-xl bg-slate-900/90 border border-slate-800 text-slate-100 text-xs px-3 py-2.5 focus:ring-2 focus:ring-sportex-500 focus:outline-none"
                      >
                        {[2021, 2022, 2023, 2024, 2025, 2026].map((yr) => (
                          <option key={yr} value={yr}>
                            {yr}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Semester</label>
                      <select
                        value={regSem}
                        onChange={(e) => setRegSem(Number(e.target.value))}
                        className="w-full rounded-xl bg-slate-900/90 border border-slate-800 text-slate-100 text-xs px-3 py-2.5 focus:ring-2 focus:ring-sportex-500 focus:outline-none"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                          <option key={sem} value={sem}>
                            Sem {sem}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Gender</label>
                      <select
                        value={regGender}
                        onChange={(e) => setRegGender(e.target.value as any)}
                        className="w-full rounded-xl bg-slate-900/90 border border-slate-800 text-slate-100 text-xs px-3 py-2.5 focus:ring-2 focus:ring-sportex-500 focus:outline-none"
                      >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>

                    <Input
                      label="Blood Group"
                      placeholder="e.g. B+, O+"
                      value={regBlood}
                      onChange={(e) => setRegBlood(e.target.value)}
                    />
                  </div>

                  <Input
                    label="Phone (Optional)"
                    placeholder="+91 98765 43210"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="w-full mt-2"
                    isLoading={isSubmitting}
                    rightIcon={<UserPlus className="w-4 h-4" />}
                  >
                    Register as Athlete
                  </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={forgotModalOpen}
        onClose={() => {
          setForgotModalOpen(false);
          setForgotResult(null);
          setResetSuccess(null);
        }}
        title="Reset Account Password"
        description="Enter your registered college email to receive a password reset token."
        maxWidth="md"
      >
        {!forgotResult?.resetToken ? (
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
            <Input
              label="Registered Email Address"
              type="email"
              placeholder="e.g. student@pcte.edu.in"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              required
              leftIcon={<Mail className="w-4 h-4" />}
            />
            {forgotResult && (
              <p className="text-xs text-emerald-400 bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-800/50">
                {forgotResult.message}
              </p>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setForgotModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={forgotLoading}>
                Generate Reset Token
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-950 border border-sportex-500/40 text-xs">
              <div className="flex items-center gap-1.5 text-sportex-400 font-bold mb-1">
                <KeyRound className="w-4 h-4" /> Demo Reset Token Generated:
              </div>
              <p className="font-mono text-slate-300 break-all select-all">{forgotResult.resetToken}</p>
            </div>

            <Input
              label="New Password"
              type="password"
              placeholder="Enter new password (min 8 chars)"
              value={newResetPassword}
              onChange={(e) => setNewResetPassword(e.target.value)}
              required
              leftIcon={<Lock className="w-4 h-4" />}
            />

            {resetSuccess && (
              <p className="text-xs text-emerald-400 bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-800">
                {resetSuccess}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="submit" variant="primary" isLoading={forgotLoading}>
                Confirm Password Reset
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
