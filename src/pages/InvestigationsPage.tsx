import React from 'react';
import { TopMetrics } from '../components/TopMetrics';
import { CriminalNetworkGraph } from '../components/CriminalNetworkGraph';
import { AiInsight } from '../components/AiInsight';
import { PriorityAlerts } from '../components/PriorityAlerts';
import { CaseTimeline } from '../components/CaseTimeline';
import { ActiveCasesList } from '../components/ActiveCasesList';
import { TopSuspectsList } from '../components/TopSuspectsList';
import { CaseFooterBar } from '../components/CaseFooterBar';
import type { NetworkNode, AlertItem } from '../types/dashboard';

interface InvestigationsPageProps {
  onSelectNode: (node: NetworkNode) => void;
  onSelectAlert: (alert: AlertItem) => void;
  onSelectAction: (action: string) => void;
  onOpenAnalysis: () => void;
}

export const InvestigationsPage: React.FC<InvestigationsPageProps> = ({
  onSelectNode,
  onSelectAlert,
  onSelectAction,
  onOpenAnalysis,
}) => {
  return (
    <div className="flex flex-col h-full">
      {/* Scrollable main content */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-[#030814] cyber-grid-bg">
        {/* Top 6 KPI Metric Cards */}
        <section>
          <TopMetrics onSelectMetric={(id) => onSelectAction(`Metric Drilldown: ${id}`)} />
        </section>

        {/* Middle Section: Live Criminal Network Snapshot + AI Insight & Recent Alerts */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
          {/* Live Criminal Network Graph (Span 7 cols) */}
          <div className="lg:col-span-7 h-full min-h-[380px]">
            <CriminalNetworkGraph
              onSelectNode={onSelectNode}
              onExploreGraph={() => onSelectAction('Interactive Entity Knowledge Graph')}
            />
          </div>

          {/* Right Stack: AI Investigation Insight + Recent Alerts (Span 5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <div className="flex-1">
              <AiInsight onViewAnalysis={onOpenAnalysis} />
            </div>
            <div className="flex-1">
              <PriorityAlerts
                onSelectAlert={onSelectAlert}
                onViewAll={() => onSelectAction('All System Security Alerts')}
              />
            </div>
          </div>
        </section>

        {/* Bottom Section: 3 Columns (Case Timeline + Active Cases + Top High Risk Suspects) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-3 items-stretch">
          {/* Column 1: Case Timeline (Last 7 Days) */}
          <div>
            <CaseTimeline
              onViewTimeline={() => onSelectAction('Complete Temporal Case Timeline')}
            />
          </div>

          {/* Column 2: Active Cases */}
          <div>
            <ActiveCasesList
              onViewAllCases={() => onSelectAction('Active Criminal Investigations Registry')}
            />
          </div>

          {/* Column 3: Top High Risk Suspects */}
          <div>
            <TopSuspectsList
              onViewAllSuspects={() => onSelectAction('High Risk Criminal Suspects Index')}
              onSelectSuspect={(name) => onSelectAction(`Suspect Dossier: ${name}`)}
            />
          </div>
        </section>
      </div>

      {/* Persistent Case Status Footer Bar */}
      <CaseFooterBar />
    </div>
  );
};
