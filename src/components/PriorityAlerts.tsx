import React from 'react';
import { Lock, Database, ShieldAlert, Key, UserCheck } from 'lucide-react';
import type { AlertItem } from '../types/dashboard';

interface PriorityAlertsProps {
  onSelectAlert?: (alert: AlertItem) => void;
  onViewAll?: () => void;
}

export const PriorityAlerts: React.FC<PriorityAlertsProps> = ({ onSelectAlert, onViewAll }) => {
  const alerts: AlertItem[] = [
    {
      id: 'alt-1',
      title: 'Unusual Login Detected',
      target: 'New device login for ACP Raj Verma',
      time: '10:31 PM',
      severity: 'HIGH',
      iconType: 'lock',
    },
    {
      id: 'alt-2',
      title: 'Bulk Data Export Attempt',
      target: 'Evidence DB',
      time: '09:58 PM',
      severity: 'HIGH',
      iconType: 'export',
    },
    {
      id: 'alt-3',
      title: 'Honey Evidence Accessed',
      target: 'FIR_999_HONEY.pdf',
      time: '09:21 PM',
      severity: 'HIGH',
      iconType: 'shield',
    },
    {
      id: 'alt-4',
      title: 'New Device Login',
      target: 'Unknown IP',
      time: '09:12 PM',
      severity: 'MEDIUM',
      iconType: 'key',
    },
    {
      id: 'alt-5',
      title: 'Multiple Failed Logins',
      target: 'Inspector ID: 2147',
      time: '08:45 PM',
      severity: 'LOW',
      iconType: 'user',
    },
  ];

  const renderIcon = (type: string, severity: string) => {
    switch (type) {
      case 'lock':
        return <Lock className="w-3.5 h-3.5 text-red-400" />;
      case 'export':
        return <Database className="w-3.5 h-3.5 text-red-400" />;
      case 'shield':
        return <ShieldAlert className="w-3.5 h-3.5 text-red-400" />;
      case 'key':
        return <Key className="w-3.5 h-3.5 text-amber-400" />;
      case 'user':
      default:
        return <UserCheck className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  const getSeverityStyle = (sev: string) => {
    switch (sev) {
      case 'HIGH':
        return 'bg-red-950/70 border border-red-500/50 text-red-400';
      case 'MEDIUM':
        return 'bg-amber-950/70 border border-amber-500/50 text-amber-400';
      case 'LOW':
      default:
        return 'bg-emerald-950/70 border border-emerald-500/50 text-emerald-400';
    }
  };

  return (
    <div className="p-3.5 rounded-lg bg-[#050b18] border border-[#111e33] flex flex-col justify-between h-full shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#111e33]/80">
        <span className="text-xs font-bold text-white tracking-wider uppercase">
          RECENT ALERTS
        </span>
        <button
          onClick={onViewAll}
          className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors font-medium"
        >
          View All
        </button>
      </div>

      {/* Alert List */}
      <div className="space-y-1.5 my-2">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            onClick={() => onSelectAlert && onSelectAlert(alert)}
            className="p-1.5 rounded-lg bg-[#081021]/80 hover:bg-[#0c1830] border border-[#14233c] transition-all cursor-pointer flex items-center justify-between gap-2 group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-1 rounded bg-[#0f1d38] border border-[#1a3055] flex-shrink-0">
                {renderIcon(alert.iconType, alert.severity)}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-white group-hover:text-blue-300 transition-colors truncate leading-tight">
                  {alert.title}
                </span>
                <span className="text-[10px] text-slate-400 truncate leading-tight">
                  {alert.target}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-[10px] text-slate-400 font-mono">{alert.time}</span>
              <span
                className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${getSeverityStyle(
                  alert.severity
                )}`}
              >
                {alert.severity}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
