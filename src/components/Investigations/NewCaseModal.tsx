import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, FileText, MapPin, UserCheck, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api';

interface NewCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCaseCreated: (newCase: any) => void;
}

export const NewCaseModal: React.FC<NewCaseModalProps> = ({ isOpen, onClose, onCaseCreated }) => {
  const [firNumber, setFirNumber] = useState(`FIR/DEL/2026/${Math.floor(1000 + Math.random() * 9000)}`);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [crimeCategory, setCrimeCategory] = useState('FINANCIAL_FRAUD');
  const [priority, setPriority] = useState('CRITICAL');
  const [status, setStatus] = useState('INVESTIGATING');
  const [jurisdictionCity, setJurisdictionCity] = useState('New Delhi');
  const [leadInvestigatorId, setLeadInvestigatorId] = useState('USR-101');
  const [officers, setOfficers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      api.auth.getOfficers()
        .then((data) => {
          setOfficers(data || []);
          if (data && data.length > 0) {
            setLeadInvestigatorId(data[0].id);
          }
        })
        .catch(() => {
          // Fallback static list if network error
          setOfficers([
            { id: 'USR-101', full_name: 'ACP Rajeshwar Sharma', badge_number: 'DEL-IPS-8821', department: 'Special Cell' },
            { id: 'USR-102', full_name: 'Inspector Priya Kulkarni', badge_number: 'MUM-CYB-4091', department: 'Cyber Crime' },
            { id: 'USR-103', full_name: 'DSP Arvind Swaminathan', badge_number: 'BLR-INT-1102', department: 'FSL' },
          ]);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a descriptive Case Title');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const created = await api.cases.create({
        fir_number: firNumber,
        title,
        description,
        crime_category: crimeCategory,
        priority,
        status,
        jurisdiction_city: jurisdictionCity,
        lead_investigator_id: leadInvestigatorId,
      });
      onCaseCreated(created);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to lodge FIR in PostgreSQL database');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#070e1e] border border-blue-500/30 rounded-xl shadow-[0_0_40px_rgba(37,99,235,0.25)] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#040813]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                LODGE NEW INVESTIGATION FIR
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950/80 text-blue-400 border border-blue-800">
                  NEON CLOUD SYNC
                </span>
              </h2>
              <p className="text-xs text-slate-400">Indian Law Enforcement Central Case Registry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-800/80 rounded-lg text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* FIR Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                FIR Registration Number <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={firNumber}
                  onChange={(e) => setFirNumber(e.target.value)}
                  className="w-full bg-[#030712] border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
                  placeholder="e.g. FIR/DEL/2026/0891"
                />
              </div>
            </div>

            {/* Jurisdiction City */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Jurisdiction City <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <select
                  value={jurisdictionCity}
                  onChange={(e) => setJurisdictionCity(e.target.value)}
                  className="w-full bg-[#030712] border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="New Delhi">New Delhi • Special Cell</option>
                  <option value="Mumbai">Mumbai • Cyber Crime</option>
                  <option value="Bengaluru">Bengaluru • CID FSL</option>
                  <option value="Hyderabad">Hyderabad • Cyber Security</option>
                  <option value="Kolkata">Kolkata • CBI Economic</option>
                  <option value="Ahmedabad">Ahmedabad • CID Crime</option>
                  <option value="Pune">Pune • Cyber Crime</option>
                  <option value="Chennai">Chennai • Cyber Crime</option>
                </select>
              </div>
            </div>
          </div>

          {/* Case Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5">
              Case Operation Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#030712] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="e.g. Operation Trishul: Coordinated Hawala & Phishing Syndicate"
            />
          </div>

          {/* Crime Category & Priority */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">Category</label>
              <select
                value={crimeCategory}
                onChange={(e) => setCrimeCategory(e.target.value)}
                className="w-full bg-[#030712] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="FINANCIAL_FRAUD">Financial Fraud & Hawala</option>
                <option value="CYBER_ATTACK">Cyber Attack & Ransomware</option>
                <option value="ORGANIZED_SYNDICATE">Organized Syndicate</option>
                <option value="IDENTITY_THEFT">Identity Theft & AePS</option>
                <option value="TERROR_FINANCE">Terror Finance</option>
                <option value="NARCOTICS">Narcotics Logistics</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-[#030712] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="CRITICAL">Critical • Immediate Action</option>
                <option value="HIGH">High Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="LOW">Low • Routine</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">Initial Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-[#030712] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="INVESTIGATING">INVESTIGATING</option>
                <option value="OPEN">OPEN</option>
                <option value="UNDER_REVIEW">UNDER REVIEW</option>
              </select>
            </div>
          </div>

          {/* Lead Investigator */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5">
              Assigned Lead Investigator
            </label>
            <div className="relative">
              <UserCheck className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <select
                value={leadInvestigatorId}
                onChange={(e) => setLeadInvestigatorId(e.target.value)}
                className="w-full bg-[#030712] border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                {officers.map((officer) => (
                  <option key={officer.id} value={officer.id}>
                    {officer.full_name} • {officer.badge_number} • {officer.department}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Case Description / FIR Narrative */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5">
              FIR Incident Narrative & Intelligence Briefing
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#030712] border border-slate-700/80 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none font-sans"
              placeholder="Provide complete details regarding the breach, modus operandi, targeted entities, and initial forensics..."
            />
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.4)] disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {loading ? 'Submitting to PostgreSQL...' : 'Register FIR Case'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
