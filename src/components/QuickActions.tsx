import React, { useState } from 'react';
import { 
  FolderPlus, 
  Upload, 
  FileBadge, 
  Crosshair, 
  ClipboardCheck, 
  Sparkles,
  Command
} from 'lucide-react';
import { NewInvestigationModal } from './Modals/NewInvestigationModal';
import { EvidenceIngestionModal } from './Modals/EvidenceIngestionModal';
import { CourtDossierModal } from './Modals/CourtDossierModal';
import { ThreatHuntModal } from './Modals/ThreatHuntModal';
import { AuditTrailDrawer } from './Modals/AuditTrailDrawer';

interface QuickActionsProps {
  onActionClick?: (actionName: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onActionClick, onNavigateTab }) => {
  const [activeModal, setActiveModal] = useState<'NEW_CASE' | 'UPLOAD_EVIDENCE' | 'COURT_DOSSIER' | 'THREAT_HUNT' | 'AUDIT_TRAIL' | null>(null);

  const actions = [
    {
      id: 'new_investigation',
      label: 'New Investigation',
      sub: 'Register FIR & Scope Case',
      icon: FolderPlus,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/30 hover:border-cyan-400/80',
      action: () => setActiveModal('NEW_CASE'),
    },
    {
      id: 'upload_evidence',
      label: 'Upload Evidence',
      sub: 'Ingest PCAP / CCTV / Hashes',
      icon: Upload,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30 hover:border-blue-400/80',
      action: () => setActiveModal('UPLOAD_EVIDENCE'),
    },
    {
      id: 'generate_court_dossier',
      label: 'Generate Court Dossier',
      sub: 'Section 65B BSA 2023 Package',
      icon: FileBadge,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30 hover:border-emerald-400/80',
      action: () => setActiveModal('COURT_DOSSIER'),
    },
    {
      id: 'threat_hunt',
      label: 'Threat Hunt',
      sub: 'Unified Phone / Plate / IMEI Query',
      icon: Crosshair,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30 hover:border-amber-400/80',
      action: () => setActiveModal('THREAT_HUNT'),
    },
    {
      id: 'view_audit_trail',
      label: 'View Activity Log',
      sub: 'Officer Action History',
      icon: ClipboardCheck,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/30 hover:border-purple-400/80',
      action: () => setActiveModal('AUDIT_TRAIL'),
    },
  ];

  return (
    <>
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#060f22]/95 via-[#040a18]/95 to-[#060f22]/95 border border-blue-500/30 shadow-[0_12px_40px_rgba(0,0,0,0.6)] select-none">
        <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <Command className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-black text-white tracking-wider uppercase font-mono">
              OPERATIONAL COMMAND PALETTE
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            Interactive Law Enforcement Action Center
          </span>
        </div>

        {/* 5 Prominent Action Buttons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.id}
                onClick={act.action}
                className={`p-3.5 rounded-xl bg-[#040916]/95 border ${act.border} transition-all duration-200 flex flex-col items-start gap-2.5 group shadow-sm hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] text-left cursor-pointer`}
              >
                <div className={`p-2.5 rounded-xl ${act.bg} border border-white/10 ${act.color} group-hover:scale-110 transition-transform shadow-md`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 w-full">
                  <div className="text-xs font-black text-white group-hover:text-cyan-200 transition-colors truncate font-sans">
                    {act.label}
                  </div>
                  <div className="text-[9.5px] text-slate-400 truncate mt-0.5 font-sans">
                    {act.sub}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── 5 OPERATIONAL MODALS & DRAWERS ───────────────────────────────── */}
      <NewInvestigationModal
        isOpen={activeModal === 'NEW_CASE'}
        onClose={() => setActiveModal(null)}
      />

      <EvidenceIngestionModal
        isOpen={activeModal === 'UPLOAD_EVIDENCE'}
        onClose={() => setActiveModal(null)}
      />

      <CourtDossierModal
        isOpen={activeModal === 'COURT_DOSSIER'}
        onClose={() => setActiveModal(null)}
        onNavigateToReports={() => onNavigateTab && onNavigateTab('reports')}
      />

      <ThreatHuntModal
        isOpen={activeModal === 'THREAT_HUNT'}
        onClose={() => setActiveModal(null)}
      />

      <AuditTrailDrawer
        isOpen={activeModal === 'AUDIT_TRAIL'}
        onClose={() => setActiveModal(null)}
        onNavigateToAuditPage={() => onNavigateTab && onNavigateTab('audit-trail')}
      />
    </>
  );
};
