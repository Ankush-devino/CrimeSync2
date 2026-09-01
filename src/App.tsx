import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { IntelligenceTicker } from './components/IntelligenceTicker';
import { SuspectModal } from './components/Modals/SuspectModal';
import { SearchModal } from './components/Modals/SearchModal';
import { ActionModal } from './components/Modals/ActionModal';
import { AnalysisModal } from './components/Modals/AnalysisModal';

// Pages
import { CommandCenterPage } from './pages/CommandCenterPage';
import { InvestigationsPage } from './pages/InvestigationsPage';
import { AiCopilotPage } from './pages/AiCopilotPage';
import { KnowledgeGraphPage } from './pages/KnowledgeGraphPage';
import { TimeMachinePage } from './pages/TimeMachinePage';
import { DeceptionNetworkPage } from './pages/DeceptionNetworkPage';
import { BlastRadiusPage } from './pages/BlastRadiusPage';
import { AiAgentSandboxPage } from './pages/AiAgentSandboxPage';
import { ThreatAlertsPage } from './pages/ThreatAlertsPage';
import { FinancialIntelligencePage } from './pages/FinancialIntelligencePage';
import { GeoIntelligencePage } from './pages/GeoIntelligencePage';
import { AttackGraphPage } from './pages/AttackGraphPage';
import { IdentitySecurityPage } from './pages/IdentitySecurityPage';
import { EvidenceDnaPage } from './pages/EvidenceDnaPage';
import { ChainOfCustodyPage } from './pages/ChainOfCustodyPage';
import { BlockchainExplorerPage } from './pages/BlockchainExplorerPage';
import { ReportsPage } from './pages/ReportsPage';
import { AuditTrailPage } from './pages/AuditTrailPage';
import { PlaceholderPage } from './pages/PlaceholderPage';

import type { NetworkNode, AlertItem } from './types/dashboard';
import {
  MapPin,
  CircleDollarSign,
  UserCheck,
  Zap,
  Box,
  Layers,
  Search,
  FileText,
  ClipboardCheck,
} from 'lucide-react';

// ─── Page definitions for placeholder pages ──────────────────────────────────
const PLACEHOLDER_PAGES: Record<
  string,
  {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    accentColor: string;
    glowColor: string;
    features: string[];
  }
> = {
  'geo-intelligence': {
    title: 'Geo Intelligence',
    subtitle: 'INVESTIGATE',
    icon: <MapPin className="w-9 h-9" />,
    accentColor: '#ef4444',
    glowColor: '#ef4444',
    features: [
      'Real-time satellite tracking',
      'Cell tower triangulation',
      'Crime hotspot heatmaps',
      'Geo-fence alerts',
      'Route reconstruction',
      'Multi-suspect location overlap',
    ],
  },
  'financial-intelligence': {
    title: 'Financial Intelligence',
    subtitle: 'INVESTIGATE',
    icon: <CircleDollarSign className="w-9 h-9" />,
    accentColor: '#10b981',
    glowColor: '#10b981',
    features: [
      'Hawala network mapping',
      'Layering detection',
      'Shell company tracing',
      'Crypto wallet analysis',
      'Transaction graph explorer',
      'Money mule network detection',
    ],
  },
  'identity-security': {
    title: 'Identity Security',
    subtitle: 'CYBER DEFENSE',
    icon: <UserCheck className="w-9 h-9" />,
    accentColor: '#3b82f6',
    glowColor: '#3b82f6',
    features: [
      'Doppelgänger detection',
      'Biometric verification',
      'Synthetic identity alerts',
      'Login anomaly tracking',
      'PKI certificate validation',
      'Insider threat profiling',
    ],
  },
  'attack-graph': {
    title: 'Attack Graph',
    subtitle: 'CYBER DEFENSE',
    icon: <Zap className="w-9 h-9" />,
    accentColor: '#8b5cf6',
    glowColor: '#8b5cf6',
    features: [
      'Intrusion kill-chain visualization',
      'Lateral movement tracking',
      'Zero-day exploit detection',
      'Network breach simulation',
      'Attack vector classification',
      'Automated remediation steps',
    ],
  },
  'evidence-dna': {
    title: 'Evidence DNA',
    subtitle: 'BLOCKCHAIN VAULT',
    icon: <Box className="w-9 h-9" />,
    accentColor: '#10b981',
    glowColor: '#10b981',
    features: [
      'SHA-256 hash verification',
      'Blockchain-sealed signatures',
      'Evidence tampering detection',
      'DNA sequence case linking',
      'Forensic integrity reports',
      'Admissibility certification',
    ],
  },
  'chain-of-custody': {
    title: 'Chain of Custody',
    subtitle: 'BLOCKCHAIN VAULT',
    icon: <Layers className="w-9 h-9" />,
    accentColor: '#00f0ff',
    glowColor: '#00f0ff',
    features: [
      'Immutable access logs',
      'Transfer event recording',
      'Custodian audit trail',
      'Multi-party verification',
      'Smart contract enforcement',
      'Court-ready export',
    ],
  },
  'blockchain-explorer': {
    title: 'Blockchain Explorer',
    subtitle: 'BLOCKCHAIN VAULT',
    icon: <Search className="w-9 h-9" />,
    accentColor: '#a855f7',
    glowColor: '#a855f7',
    features: [
      'Block-by-block evidence search',
      'Transaction hash lookup',
      'Ledger integrity dashboard',
      'Multi-chain support',
      'Smart contract viewer',
      'Public / Private chain explorer',
    ],
  },
  'reports': {
    title: 'Reports & Dossiers',
    subtitle: 'TOOLS',
    icon: <FileText className="w-9 h-9" />,
    accentColor: '#3b82f6',
    glowColor: '#3b82f6',
    features: [
      'One-click PDF dossier generation',
      'Suspect profile reports',
      'Case summary compilation',
      'Evidence manifest export',
      'Court-submission packages',
      'Intelligence briefing templates',
    ],
  },
  'audit-trail': {
    title: 'Audit Trail',
    subtitle: 'TOOLS',
    icon: <ClipboardCheck className="w-9 h-9" />,
    accentColor: '#64748b',
    glowColor: '#64748b',
    features: [
      'System access logging',
      'User activity timeline',
      'Sensitive file access tracker',
      'Login & session recording',
      'Anomalous behaviour flags',
      'GDPR / compliance export',
    ],
  },
};

// ─── Main App Component ───────────────────────────────────────────────────────
export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('command-center');
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const handleSelectAlert = (alert: AlertItem) => {
    setSelectedAction(`Alert Inspection: ${alert.title}`);
  };

  const renderPage = () => {
    if (activeTab === 'command-center') {
      return (
        <CommandCenterPage
          onSelectNode={setSelectedNode}
          onSelectAlert={handleSelectAlert}
          onSelectAction={setSelectedAction}
          onOpenAnalysis={() => setIsAnalysisOpen(true)}
          onNavigateTab={setActiveTab}
        />
      );
    }

    if (activeTab === 'investigations') {
      return (
        <InvestigationsPage
          onSelectNode={setSelectedNode}
          onSelectAlert={handleSelectAlert}
          onSelectAction={setSelectedAction}
          onOpenAnalysis={() => setIsAnalysisOpen(true)}
        />
      );
    }

    if (activeTab === 'ai-copilot') {
      return (
        <AiCopilotPage
          onSelectAction={setSelectedAction}
        />
      );
    }

    if (activeTab === 'knowledge-graph') {
      return (
        <KnowledgeGraphPage
          onSelectAction={setSelectedAction}
        />
      );
    }

    if (activeTab === 'time-machine') {
      return (
        <TimeMachinePage
          onSelectAction={setSelectedAction}
        />
      );
    }

    if (activeTab === 'deception-network') {
      return (
        <DeceptionNetworkPage
          onSelectAction={setSelectedAction}
        />
      );
    }

    if (activeTab === 'blast-radius') {
      return (
        <BlastRadiusPage
          onSelectAction={setSelectedAction}
        />
      );
    }

    if (activeTab === 'ai-sandbox') {
      return (
        <AiAgentSandboxPage
          onSelectAction={setSelectedAction}
        />
      );
    }

    if (activeTab === 'threat-alerts') {
      return (
        <ThreatAlertsPage
          onSelectAction={setSelectedAction}
        />
      );
    }

    if (activeTab === 'financial-intelligence') {
      return (
        <FinancialIntelligencePage
          onSelectAction={setSelectedAction}
        />
      );
    }

    if (activeTab === 'geo-intelligence') {
      return (
        <GeoIntelligencePage
          onSelectAction={setSelectedAction}
        />
      );
    }

    if (activeTab === 'attack-graph') {
      return (
        <AttackGraphPage
          onSelectAction={setSelectedAction}
        />
      );
    }

    if (activeTab === 'identity-security') {
      return (
        <IdentitySecurityPage
          onSelectAction={setSelectedAction}
        />
      );
    }

    if (activeTab === 'evidence-dna') {
      return (
        <EvidenceDnaPage
          onSelectAction={setSelectedAction}
        />
      );
    }

    if (activeTab === 'chain-of-custody') {
      return (
        <ChainOfCustodyPage
          onSelectAction={setSelectedAction}
          onNavigateTab={setActiveTab}
        />
      );
    }

    if (activeTab === 'blockchain-explorer') {
      return (
        <BlockchainExplorerPage
          onSelectAction={setSelectedAction}
          onNavigateTab={setActiveTab}
        />
      );
    }

    if (activeTab === 'reports') {
      return (
        <ReportsPage
          onSelectAction={setSelectedAction}
          onNavigateTab={setActiveTab}
        />
      );
    }

    if (activeTab === 'audit-trail') {
      return (
        <AuditTrailPage
          onSelectAction={setSelectedAction}
          onNavigateTab={setActiveTab}
        />
      );
    }

    // Placeholder pages for the remaining sections
    const placeholder = PLACEHOLDER_PAGES[activeTab];
    if (placeholder) {
      return (
        <PlaceholderPage
          title={placeholder.title}
          subtitle={placeholder.subtitle}
          icon={placeholder.icon}
          accentColor={placeholder.accentColor}
          glowColor={placeholder.glowColor}
          features={placeholder.features}
        />
      );
    }

    return null;
  };

  // Does this page use its own internal scrolling? (InvestigationsPage, AiCopilotPage, KnowledgeGraphPage, TimeMachinePage, DeceptionNetworkPage, BlastRadiusPage, AiAgentSandboxPage, ThreatAlertsPage do)
  const pageHandlesOwnScroll =
    activeTab === 'investigations' ||
    activeTab === 'ai-copilot' ||
    activeTab === 'knowledge-graph' ||
    activeTab === 'time-machine' ||
    activeTab === 'deception-network' ||
    activeTab === 'blast-radius' ||
    activeTab === 'ai-sandbox' ||
    activeTab === 'threat-alerts' ||
    activeTab === 'financial-intelligence' ||
    activeTab === 'geo-intelligence' ||
    activeTab === 'attack-graph' ||
    activeTab === 'identity-security' ||
    activeTab === 'evidence-dna' ||
    activeTab === 'chain-of-custody' ||
    activeTab === 'blockchain-explorer' ||
    activeTab === 'reports' ||
    activeTab === 'audit-trail';

  return (
    <div className="h-screen bg-[#050811] text-slate-100 flex flex-col font-sans overflow-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      <div className="flex flex-1 overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Right Column: Header + Main Content + Footer */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Sticky Header */}
          <Header
            activeTab={activeTab}
            onOpenSearch={() => setIsSearchOpen(true)}
            onOpenAlerts={() => setSelectedAction('Security Alerts Audit')}
          />

          {/* Page Content */}
          <main
            className={`flex-1 min-h-0 bg-[#050811] cyber-grid-bg ${
              pageHandlesOwnScroll ? 'overflow-hidden flex flex-col' : 'overflow-y-auto'
            }`}
          >
            {renderPage()}
          </main>

          {/* Bottom Sticky Intelligence Feed Ticker (only on Command Center) */}
          {activeTab === 'command-center' && (
            <IntelligenceTicker onViewAll={() => setSelectedAction('Global Intelligence Wire')} />
          )}
        </div>
      </div>

      {/* Interactive Modals */}
      <SuspectModal node={selectedNode} onClose={() => setSelectedNode(null)} />
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectNode={(node) => setSelectedNode(node)}
      />
      <ActionModal actionName={selectedAction} onClose={() => setSelectedAction(null)} />
      <AnalysisModal isOpen={isAnalysisOpen} onClose={() => setIsAnalysisOpen(false)} />
    </div>
  );
};

export default App;
