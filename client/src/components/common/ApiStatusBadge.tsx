import React, { useEffect, useState } from 'react';
import { systemApi } from '../../services/api';
import { getSocket } from '../../services/socket';
import { HealthStatus } from '../../types';
import { Activity, Database, Radio, RefreshCw, Server } from 'lucide-react';

export const ApiStatusBadge: React.FC = () => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await systemApi.getHealth();
      setHealth(data);
    } catch (err: any) {
      setError(err.message || 'API Unreachable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 15000);

    const socket = getSocket();
    setSocketConnected(socket.connected);

    const handleConnect = () => setSocketConnected(true);
    const handleDisconnect = () => setSocketConnected(false);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    return () => {
      clearInterval(interval);
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-2 p-2.5 px-4 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-lg text-xs font-medium">
      {/* REST API Status */}
      <div className="flex items-center gap-1.5">
        <Server className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-400">API:</span>
        {loading && !health ? (
          <span className="inline-flex items-center gap-1 text-amber-400">
            <RefreshCw className="w-3 h-3 animate-spin" /> Connecting...
          </span>
        ) : error ? (
          <span className="inline-flex items-center gap-1 text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" /> Offline
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> v{health?.version}
          </span>
        )}
      </div>

      <div className="h-3 w-[1px] bg-slate-800" />

      {/* Database Status */}
      <div className="flex items-center gap-1.5">
        <Database className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-400">DB:</span>
        {health?.database.status === 'CONNECTED' ? (
          <span className="text-emerald-400 font-mono">
            {health.database.provider.split(' ')[0]} ({health.database.latencyMs}ms)
          </span>
        ) : (
          <span className="text-amber-400 font-mono">Postgres Ready</span>
        )}
      </div>

      <div className="h-3 w-[1px] bg-slate-800" />

      {/* Socket.IO Real-time */}
      <div className="flex items-center gap-1.5">
        <Radio className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-400">Live WS:</span>
        {socketConnected ? (
          <span className="inline-flex items-center gap-1 text-cyan-400">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" /> Synchronized
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-slate-400">
            <Activity className="w-3 h-3 text-slate-500 animate-pulse" /> Standby
          </span>
        )}
      </div>

      <button
        onClick={fetchHealth}
        title="Refresh System Health"
        className="ml-auto p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
      >
        <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
};
