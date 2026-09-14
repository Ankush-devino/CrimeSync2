import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { IntelligenceTicker } from './components/IntelligenceTicker';
import { SuspectModal } from './components/Modals/SuspectModal';
import { SearchModal } from './components/Modals/SearchModal';
import { ActionModal } from './components/Modals/ActionModal';
import { AnalysisModal } from './components/Modals/AnalysisModal';
import { CaseProvider } from './context/CaseContext';
import { FIRProvider } from './context/FIRContext';
import { AuthProvider } from './context/AuthContext';
import { DbProvider, useDbContext } from './context/DbContext';
import { ThemeProvider } from './context/ThemeContext';
import { useAuditLog } from './hooks/useAuditLog';
import { logOfficerAction } from './services/activityLogger';

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

// ─── Main App Content Component ────────────────────────────────────────────────
const AppContent: React.FC = () => {
  const { logEvent } = useAuditLog();
  const [activeTab, setActiveTab] = useState('command-center');
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const handleNavigateTab = (tab: string) => {
    setActiveTab(tab);
    logEvent('TAB_SWITCH', { tabId: tab }, { module: 'Navigation', category: 'NAVIGATION', details: `Officer navigated to ${tab}` });
    const moduleActions: Record<string, { action: string; module: string; details: string; category: any }> = {
      'command-center': {
        action: 'Supervised Central Command Center',
        module: 'Command Center',
        details: 'Monitored real-time network topology, active suspect centrality, and priority live alerts',
        category: 'CASES'
      },
      'investigations': {
        action: 'Reviewed Active Case Dossier',
        module: 'Investigations',
        details: 'Audited evidence manifest, suspect timeline, and legal penal codes for Case #CR-2026-0417',
        category: 'CASES'
      },
      'ai-copilot': {
        action: 'Consulted AI Copilot Intelligence',
        module: 'AI Copilot',
        details: 'Prompted neural copilot for Hawala syndicate financial link synthesis and case strategy',
        category: 'COPILOT'
      },
      'knowledge-graph': {
        action: 'Queried Neo4j Knowledge Graph',
        module: 'Knowledge Graph',
        details: 'Traversed multi-degree entity links connecting suspect burner CDRs to offshore shell accounts',
        category: 'GRAPH'
      },
      'time-machine': {
        action: 'Reconstructed 4D Crime Time Machine',
        module: 'Time Machine',
        details: 'Cross-referenced minute-by-minute CDR tower handoffs with synchronized CCTV footage',
        category: 'TIMELINE'
      },
      'geo-intelligence': {
        action: 'Executed Satellite Geo-Intelligence Sweep',
        module: 'Geo Intelligence',
        details: 'Triangulated cell tower clusters and suspect GPS tracking coordinates in South Delhi',
        category: 'GEO'
      },
      'financial-intelligence': {
        action: 'Analyzed Hawala Transaction Trails',
        module: 'Financial Intelligence',
        details: 'Audited layered suspicious money transfers exceeding ₹50,00,000 threshold',
        category: 'CASES'
      },
      'identity-security': {
        action: 'Audited Biometric Identity Profiles',
        module: 'Identity Security',
        details: 'Verified facial biometric records and detected synthetic duplicate identity flags',
        category: 'CASES'
      },
      'attack-graph': {
        action: 'Inspected Adversary Attack Kill-Chain',
        module: 'Attack Graph',
        details: 'Traced MITRE lateral movement vectors and unauthorized socket egress pathways',
        category: 'CASES'
      },
      'deception-network': {
        action: 'Monitored Active Honeypot Tripwires',
        module: 'Deception Network',
        details: 'Checked AWS canary tokens, decoy FIR documents, and unauthorized access alarms',
        category: 'CASES'
      },
      'blast-radius': {
        action: 'Simulated Threat Blast Radius',
        module: 'Blast Radius',
        details: 'Ran 3-hop cascade propagation risk simulation for compromised server nodes',
        category: 'CASES'
      },
      'ai-sandbox': {
        action: 'Evaluated AI Agent Sandbox Attack Tests',
        module: 'AI Sandbox',
        details: 'Supervised gVisor microVM containerized agent prompt injection security suite',
        category: 'COPILOT'
      },
      'threat-alerts': {
        action: 'Triaged High-Severity SIEM Alerts',
        module: 'Threat Alerts',
        details: 'Reviewed Suricata IDS and Wazuh EDR automated incident response alerts',
        category: 'CASES'
      },
      'evidence-dna': {
        action: 'Verified Evidence DNA & Blockchain Hash',
        module: 'Evidence DNA',
        details: 'Computed SHA-256 digital fingerprint match for seized hard drive NAND image EV-1246',
        category: 'EVIDENCE'
      },
      'chain-of-custody': {
        action: 'Supervised Chain of Custody Handover',
        module: 'Chain of Custody',
        details: 'Approved digital custody sign-off for physical evidence transfer to Central Lab',
        category: 'EVIDENCE'
      },
      'reports': {
        action: 'Generated Section 65B Forensic Dossier',
        module: 'Reports & Dossiers',
        details: 'Exported signed court-ready electronic evidence compliance package',
        category: 'REPORT'
      }
    };

    const actionItem = moduleActions[tab];
    if (actionItem && tab !== 'audit-trail') {
      logOfficerAction({
        action: actionItem.action,
        module: actionItem.module,
        caseId: 'CR-2026-0417',
        status: 'Success',
        category: actionItem.category,
        details: actionItem.details
      });
    }
  };

  const handleAction = (actionName: string | null) => {
    setSelectedAction(actionName);
    if (actionName) {
      logOfficerAction({
        action: actionName,
        module: 'Command Center',
        caseId: 'CR-2026-0417',
        status: 'Success',
        details: `ACP Raj Verma initiated ${actionName}`
      });
    }
  };

  const handleSelectAlert = (alert: AlertItem) => {
    handleAction(`Alert Inspection: ${alert.title}`);
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
          onNavigateTab={setActiveTab}
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
    activeTab === 'reports' ||
    activeTab === 'audit-trail';

  return (
    <div className="h-screen bg-[#050811] text-slate-100 flex flex-col font-sans overflow-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      <div className="flex flex-1 overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={handleNavigateTab} />

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

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <DbProvider>
        <AuthProvider>
          <CaseProvider>
            <FIRProvider>
              <AppContent />
            </FIRProvider>
          </CaseProvider>
        </AuthProvider>
      </DbProvider>
    </ThemeProvider>
  );
};

export default App;
