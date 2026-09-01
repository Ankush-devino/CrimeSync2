import React from 'react';
import { TopMetrics } from '../components/TopMetrics';
import { InvestigationOverview } from '../components/InvestigationOverview';
import { CriminalNetworkGraph } from '../components/CriminalNetworkGraph';
import { AiInsight } from '../components/AiInsight';
import { PriorityAlerts } from '../components/PriorityAlerts';
import { ThreatHeatmap } from '../components/ThreatHeatmap';
import { CrimeTimeMachine } from '../components/CrimeTimeMachine';
import { GeoIntelligence } from '../components/GeoIntelligence';
import { DeceptionNetwork } from '../components/DeceptionNetwork';
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
    <div className="p-3.5 space-y-3.5">
      {/* Top 6 Metric Stat Cards */}
      <section>
        <TopMetrics onSelectMetric={(id) => onSelectAction(`Metric Drilldown: ${id}`)} />
      </section>

      {/* Row 1: Investigation Overview + Criminal Network Graph + AI Insight & Priority Alerts */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
        {/* Investigation Overview (approx 3 cols) */}
        <div className="lg:col-span-3">
          <InvestigationOverview
            onViewAnalytics={() => onSelectAction('Comprehensive Investigation Analytics')}
          />
        </div>

        {/* Live Criminal Network Graph (approx 5 cols) */}
        <div className="lg:col-span-5">
          <CriminalNetworkGraph
            onSelectNode={onSelectNode}
            onExploreGraph={() => onSelectAction('Full Interactive Knowledge Graph Engine')}
          />
        </div>

        {/* Right Column: AI Insight & High Priority Alerts Stack (approx 4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-3.5">
          <div className="flex-1">
            <AiInsight onViewAnalysis={onOpenAnalysis} />
          </div>
          <div className="flex-1">
            <PriorityAlerts
              onSelectAlert={onSelectAlert}
              onViewAll={() => onSelectAction('High Priority Alerts Log')}
            />
          </div>
        </div>
      </section>

      {/* Row 2: Threat Heatmap + Crime Time Machine + Geo Intelligence Overview */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
        {/* Threat Heatmap (India) */}
        <div className="lg:col-span-4">
          <ThreatHeatmap />
        </div>

        {/* Crime Time Machine */}
        <div className="lg:col-span-4">
          <CrimeTimeMachine
            onOpenTimeMachine={() => onSelectAction('Temporal Crime Event Scrubber')}
          />
        </div>

        {/* Geo Intelligence Overview */}
        <div className="lg:col-span-4">
          <GeoIntelligence
            onOpenGeo={() => onSelectAction('Geo-Spatial Tracking Satellite System')}
          />
        </div>
      </section>

      {/* Row 3: Deception Network + Cyber Defense + Evidence Integrity + Quick Actions */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 items-stretch">
        {/* Deception Network Status */}
        <div>
          <DeceptionNetwork
            onViewDeception={() => {
              if (onNavigateTab) {
                onNavigateTab('deception-network');
              } else {
                onSelectAction('Honeypot Deception Sensor Grid');
              }
            }}
          />
        </div>

        {/* Cyber Defense Summary */}
        <div>
          <CyberDefenseSummary
            onOpenDefense={() => onSelectAction('Full Cyber Perimeter Defense')}
          />
        </div>

        {/* Evidence Integrity (Blockchain Verified) */}
        <div>
          <EvidenceIntegrity
            onOpenVault={() => onSelectAction('Immutable Blockchain Evidence Vault')}
          />
        </div>

        {/* Quick Actions & AI Agents Status */}
        <div>
          <QuickActions onActionClick={(action) => onSelectAction(action)} />
        </div>
      </section>
    </div>
  );
};
