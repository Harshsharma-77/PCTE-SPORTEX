import React, { useEffect, useState, useCallback } from 'react';
import {
  GraduationCap,
  UserCheck,
  Activity,
  Shield,
  Search,
  RefreshCw,
  Mail,
  CheckCircle2,
  XCircle,
  Filter,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Tabs } from '../../components/ui/Tabs';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../context/ToastContext';
import { dashboardApi } from '../../services/dashboardApi';

interface InstitutionalDirectoryProps {
  initialTab?: 'students' | 'coaches' | 'referees' | 'users';
}

export const InstitutionalDirectoryPage: React.FC<InstitutionalDirectoryProps> = ({
  initialTab = 'students',
}) => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');

  const [directoryData, setDirectoryData] = useState<{
    users: any[];
    students: any[];
    coaches: any[];
    referees: any[];
  }>({
    users: [],
    students: [],
    coaches: [],
    referees: [],
  });

  // Sync tab if prop changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const fetchDirectory = useCallback(async () => {
    try {
      setLoading(true);
      const data = await dashboardApi.getInstitutionalDirectory();
      setDirectoryData(data);
    } catch (err: any) {
      toast.error('Failed to load institutional roster directory.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDirectory();
  }, [fetchDirectory]);

  // Tab definitions
  const tabsList = [
    {
      id: 'students',
      label: 'Student Athletes',
      icon: <GraduationCap className="w-4 h-4" />,
      badge: directoryData.students.length,
    },
    {
      id: 'coaches',
      label: 'Coaching Staff',
      icon: <UserCheck className="w-4 h-4" />,
      badge: directoryData.coaches.length,
    },
    {
      id: 'referees',
      label: 'Match Officials',
      icon: <Activity className="w-4 h-4" />,
      badge: directoryData.referees.length,
    },
    {
      id: 'users',
      label: 'Identity Accounts',
      icon: <Shield className="w-4 h-4" />,
      badge: directoryData.users.length,
    },
  ];

  // Filters
  const filteredStudents = directoryData.students.filter((st) => {
    const matchesSearch =
      st.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.rollNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.department?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = departmentFilter === 'ALL' || st.department?.toUpperCase() === departmentFilter.toUpperCase();
    return matchesSearch && matchesDept;
  });

  const filteredCoaches = directoryData.coaches.filter((c) => {
    return (
      c.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.specialization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.qualification?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const filteredReferees = directoryData.referees.filter((r) => {
    return (
      r.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.officiatingLevel?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.certifiedSports?.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const filteredUsers = directoryData.users.filter((u) => {
    return (
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.roleEnum?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <PageHeader
        title="Institutional Sports Directory & Rosters"
        subtitle="Comprehensive varsity rosters, verified athletes, licensed coaches, match officials, and identity accounts."
        badge={
          <Badge variant="info" size="sm">
            <Shield className="w-3.5 h-3.5 mr-1" />
            Official Varsity Register
          </Badge>
        }
        actions={
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchDirectory}
            isLoading={loading}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          >
            Sync Directory
          </Button>
        }
      />

      {/* Metrics Highlights Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sportex-600/20 text-sportex-400 flex items-center justify-center border border-sportex-500/30">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Athletes</p>
              <p className="text-xl font-bold text-white font-display">{directoryData.students.length}</p>
            </div>
          </div>
        </Card>

        <Card variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Head Coaches</p>
              <p className="text-xl font-bold text-white font-display">{directoryData.coaches.length}</p>
            </div>
          </div>
        </Card>

        <Card variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Match Officials</p>
              <p className="text-xl font-bold text-white font-display">{directoryData.referees.length}</p>
            </div>
          </div>
        </Card>

        <Card variant="glass" className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">System Accounts</p>
              <p className="text-xl font-bold text-white font-display">{directoryData.users.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs Switcher */}
      <Tabs activeTab={activeTab} onChange={setActiveTab} tabs={tabsList} variant="pills" />

      {/* Filter and Search Bar */}
      <Card variant="default" className="p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search in ${tabsList.find((t) => t.id === activeTab)?.label}...`}
              className="pl-10 text-xs"
            />
          </div>

          {activeTab === 'students' && (
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-sportex-500"
              >
                <option value="ALL">All Departments</option>
                <option value="CSE">CSE (Computer Science)</option>
                <option value="IT">IT (Information Tech)</option>
                <option value="ME">ME (Mechanical)</option>
                <option value="ECE">ECE (Electronics)</option>
                <option value="BBA">BBA (Management)</option>
                <option value="BPHARM">B.Pharmacy</option>
              </select>
            </div>
          )}
        </div>
      </Card>

      {/* Tab Panels */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} variant="card" height={160} />
          ))}
        </div>
      ) : (
        <>
          {/* TAB 1: STUDENT ATHLETES */}
          {activeTab === 'students' && (
            <div className="space-y-4">
              {filteredStudents.length === 0 ? (
                <Card variant="default" className="p-8 text-center text-slate-400 text-sm">
                  No student athlete records matching criteria.
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredStudents.map((st) => (
                    <Card key={st.id} variant="glass" className="p-5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div>
                            <h4 className="font-bold text-white text-base">{st.user?.name || 'Athlete'}</h4>
                            <p className="text-xs text-slate-400 font-mono mt-0.5">{st.rollNumber}</p>
                          </div>
                          <Badge variant={st.isEligible ? 'success' : 'danger'} size="sm">
                            {st.isEligible ? 'Eligible' : 'Ineligible'}
                          </Badge>
                        </div>

                        <div className="space-y-2 text-xs text-slate-300">
                          <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                            <span className="text-slate-400">Department:</span>
                            <span className="font-semibold px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-sportex-400">
                              {st.department}
                            </span>
                          </div>
                          <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                            <span className="text-slate-400">Semester & Batch:</span>
                            <span>Sem {st.semester || 1} • {st.batchYear}</span>
                          </div>
                          <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                            <span className="text-slate-400">Registered Squad:</span>
                            <span className="font-semibold text-emerald-400">
                              {st.teamMemberships?.[0]?.team?.name || 'Unassigned'}
                            </span>
                          </div>
                          {st.teamMemberships?.[0]?.team?.sport && (
                            <div className="flex items-center justify-between py-1">
                              <span className="text-slate-400">Sport Discipline:</span>
                              <span className="text-cyan-400 font-medium">
                                {st.teamMemberships[0].team.sport.name}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                        <div className="flex items-center gap-1.5 truncate">
                          <Mail className="w-3.5 h-3.5 text-slate-500" />
                          <span className="truncate">{st.user?.email}</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: COACHING STAFF */}
          {activeTab === 'coaches' && (
            <div className="space-y-4">
              {filteredCoaches.length === 0 ? (
                <Card variant="default" className="p-8 text-center text-slate-400 text-sm">
                  No coaching staff records matching criteria.
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCoaches.map((c) => (
                    <Card key={c.id} variant="glass" className="p-5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
                              {c.user?.name?.charAt(0) || 'C'}
                            </div>
                            <div>
                              <h4 className="font-bold text-white text-base">{c.user?.name}</h4>
                              <p className="text-xs text-emerald-400 font-semibold">{c.specialization} Coach</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 text-xs text-slate-300 mt-3">
                          <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                            <span className="text-slate-400">Licensing / Credential:</span>
                            <span className="font-semibold text-slate-200">
                              {c.qualification || 'Certified Collegiate Coach'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                            <span className="text-slate-400">Experience:</span>
                            <span>{c.experienceYears || 3} Years Active</span>
                          </div>
                          <div className="flex items-center justify-between py-1">
                            <span className="text-slate-400">Assigned Teams:</span>
                            <span className="font-semibold text-cyan-400">
                              {c.teams?.map((t: any) => t.name).join(', ') || 'Varsity Pool'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                        <div className="flex items-center gap-1.5 truncate">
                          <Mail className="w-3.5 h-3.5 text-slate-500" />
                          <span className="truncate">{c.user?.email}</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MATCH OFFICIALS & REFEREES */}
          {activeTab === 'referees' && (
            <div className="space-y-4">
              {filteredReferees.length === 0 ? (
                <Card variant="default" className="p-8 text-center text-slate-400 text-sm">
                  No match officials or referee records found.
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredReferees.map((r) => (
                    <Card key={r.id} variant="glass" className="p-5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-amber-950/80 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
                              {r.user?.name?.charAt(0) || 'R'}
                            </div>
                            <div>
                              <h4 className="font-bold text-white text-base">{r.user?.name}</h4>
                              <p className="text-xs text-amber-400 font-semibold">Match Official</p>
                            </div>
                          </div>
                          <Badge variant="warning" size="sm">
                            {r.officiatingLevel || 'COLLEGE'}
                          </Badge>
                        </div>

                        <div className="space-y-2 text-xs text-slate-300 mt-3">
                          <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                            <span className="text-slate-400">License Badge:</span>
                            <span className="font-mono text-slate-200">
                              {r.licenseNumber || 'PCTE-REF-2026'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                            <span className="text-slate-400">Matches Officiated:</span>
                            <span className="font-bold text-white">
                              {r._count?.matchesOfficiated || 0} Matches
                            </span>
                          </div>
                          <div className="py-1">
                            <span className="text-slate-400 block mb-1.5">Certified Disciplines:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {r.certifiedSports?.length > 0 ? (
                                r.certifiedSports.map((sp: string, idx: number) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-cyan-300 font-medium"
                                  >
                                    {sp}
                                  </span>
                                ))
                              ) : (
                                <span className="text-[11px] text-slate-500">General Athletics</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                        <div className="flex items-center gap-1.5 truncate">
                          <Mail className="w-3.5 h-3.5 text-slate-500" />
                          <span className="truncate">{r.user?.email}</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: IDENTITY & ACCESS ACCOUNTS */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              {filteredUsers.length === 0 ? (
                <Card variant="default" className="p-8 text-center text-slate-400 text-sm">
                  No user accounts found matching query.
                </Card>
              ) : (
                <Card variant="default" className="overflow-hidden p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                        <tr>
                          <th className="p-3.5">User</th>
                          <th className="p-3.5">Email</th>
                          <th className="p-3.5">System Role</th>
                          <th className="p-3.5">Account Status</th>
                          <th className="p-3.5">Phone</th>
                          <th className="p-3.5">Joined</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {filteredUsers.map((u) => (
                          <tr key={u.id} className="hover:bg-slate-900/40 transition-colors">
                            <td className="p-3.5 font-bold text-white">{u.name}</td>
                            <td className="p-3.5 text-slate-300 font-mono text-[11px]">{u.email}</td>
                            <td className="p-3.5">
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sportex-950 text-sportex-400 border border-sportex-800">
                                {u.roleEnum}
                              </span>
                            </td>
                            <td className="p-3.5">
                              {u.isActive ? (
                                <Badge variant="success" size="sm">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Active
                                </Badge>
                              ) : (
                                <Badge variant="danger" size="sm">
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Suspended
                                </Badge>
                              )}
                            </td>
                            <td className="p-3.5 text-slate-400">{u.phone || '—'}</td>
                            <td className="p-3.5 text-slate-400 text-[11px]">
                              {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
