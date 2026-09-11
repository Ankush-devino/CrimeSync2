import React from 'react';
import { motion } from 'framer-motion';
import { TopMetrics } from '../components/TopMetrics';
import { CriminalNetworkGraph } from '../components/CriminalNetworkGraph';
import { AiInsight } from '../components/AiInsight';
import { PriorityAlerts } from '../components/PriorityAlerts';
import { ThreatHeatmap } from '../components/ThreatHeatmap';
import { CrimeTimeMachine } from '../components/CrimeTimeMachine';
import { CyberDefenseSummary } from '../components/CyberDefenseSummary';
import { EvidenceIntegrity } from '../components/EvidenceIntegrity';
import { QuickActions } from '../components/QuickActions';
import type { NetworkNode, AlertItem } from '../types/dashboard';

interface CommandCenterPageProps {
  onSelectNode: (node: NetworkNode) => void;
  onSelectAlert: (alert: AlertItem) => void;
  onSelectAction: (action: string) => void;
  onOpenAnalysis: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const CommandCenterPage: React.FC<CommandCenterPageProps> = ({
  onSelectNode,
  onSelectAlert,
  onSelectAction,
  onOpenAnalysis,
  onNavigateTab,
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="p-3.5 sm:p-4 space-y-4 max-w-[1920px] mx-auto min-h-screen bg-[#050B18]"
    >
      {/* ─── SECTION 2: EXECUTIVE KPI ROW (5 CARDS) ────────────────────────── */}
      <section>
        <TopMetrics 
          onNavigateTab={onNavigateTab}
          onSelectMetric={(id) => onSelectAction(`Metric Drilldown: ${id}`)} 
        />
      </section>

      {/* ─── HERO ROW: LIVE CRIMINAL NETWORK (CENTERPIECE) + AI & SOC FEED ──── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
        
        {/* SECTION 3: LIVE CRIMINAL NETWORK (HERO WIDGET - 8 COLS) */}
        <div className="lg:col-span-8 min-h-[480px] xl:min-h-[520px] flex flex-col">
          <CriminalNetworkGraph
            onSelectNode={onSelectNode}
            onExploreGraph={() => {
              if (onNavigateTab) onNavigateTab('knowledge-graph');
              else onSelectAction('Full Interactive Knowledge Graph Engine');
            }}
          />
        </div>

        {/* RIGHT COLUMN: AI INSIGHT (PURPLE) & LIVE THREAT ALERTS (SOC FEED) (4 COLS) */}
        <div className="lg:col-span-4 flex flex-col gap-3.5">
          {/* SECTION 4: AI INVESTIGATION INSIGHT */}
          <div className="flex-1 min-h-[250px]">
            <AiInsight onViewAnalysis={onOpenAnalysis} />
          </div>

          {/* SECTION 7: LIVE THREAT ALERTS (SOCKET.IO SOC FEED) */}
          <div className="flex-1 min-h-[250px]">
            <PriorityAlerts
              onSelectAlert={onSelectAlert}
              onViewAll={() => {
                if (onNavigateTab) onNavigateTab('threat-alerts');
                else onSelectAction('High Priority Alerts Log');
              }}
            />
          </div>
        </div>

      </section>

      {/* ─── SECONDARY TACTICAL OPERATIONS ROW (4 EQUAL COLS) ────────────────── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 items-stretch">
        
        {/* SECTION 5: NATIONAL THREAT HEATMAP (MINI GIS) */}
        <div className="min-h-[280px]">
          <ThreatHeatmap onNavigateTab={onNavigateTab} />
        </div>

        {/* SECTION 6: CRIME TIME MACHINE PREVIEW */}
        <div className="min-h-[280px]">
          <CrimeTimeMachine 
            onNavigateTab={onNavigateTab}
            onOpenTimeMachine={() => {
              if (onNavigateTab) onNavigateTab('time-machine');
              else onSelectAction('Temporal Crime Event Scrubber');
            }}
          />
        </div>

        {/* SECTION 8: CYBER DEFENSE SUMMARY (IDENTITY DOPPELGÄNGER LINK) */}
        <div className="min-h-[280px]">
          <CyberDefenseSummary
            onNavigateTab={onNavigateTab}
            onOpenDefense={() => {
              if (onNavigateTab) onNavigateTab('identity-security');
              else onSelectAction('Identity Doppelgänger Threat Center');
            }}
          />
        </div>

        {/* SECTION 9: BLOCKCHAIN EVIDENCE INTEGRITY */}
        <div className="min-h-[280px]">
          <EvidenceIntegrity
            onNavigateTab={onNavigateTab}
            onOpenVault={() => {
              if (onNavigateTab) onNavigateTab('evidence-dna');
              else onSelectAction('Cryptographic Evidence DNA Vault');
            }}
          />
        </div>

      </section>

      {/* ─── SECTION 10: QUICK ACTIONS ROW ─────────────────────────────────── */}
      <section className="pt-1">
        <QuickActions 
          onActionClick={onSelectAction} 
          onNavigateTab={onNavigateTab}
        />
      </section>

    </motion.div>
  );
};
