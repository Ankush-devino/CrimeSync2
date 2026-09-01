import React from 'react';
import { Construction, Rocket } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  accentColor: string;
  glowColor: string;
  features?: string[];
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  title,
  subtitle,
  icon,
  accentColor,
  glowColor,
  features = [],
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center min-h-[80vh]">
      {/* Central Card */}
      <div
        className="w-full max-w-2xl rounded-2xl bg-[#060c1a] border p-10 flex flex-col items-center text-center shadow-2xl relative overflow-hidden"
        style={{ borderColor: accentColor + '55' }}
      >
        {/* Ambient Glow */}
        <div
          className="absolute inset-0 rounded-2xl opacity-5 pointer-events-none"
          style={{ background: `radial-gradient(circle at 50% 0%, ${glowColor}, transparent 70%)` }}
        />

        {/* Page Icon */}
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5 relative"
          style={{ background: accentColor + '22', border: `1px solid ${accentColor}44` }}
        >
          <div style={{ color: accentColor }}>{icon}</div>
          {/* Glow ring */}
          <div
            className="absolute -inset-1.5 rounded-2xl opacity-30 blur-sm"
            style={{ background: accentColor + '55' }}
          />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-black text-white tracking-wide mb-2">{title}</h1>
        <p className="text-sm text-slate-400 font-medium mb-6">{subtitle}</p>

        {/* Under Construction badge */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-8">
          <Construction className="w-4 h-4" />
          <span>This Page is Under Development</span>
        </div>

        {/* Features / Upcoming */}
        {features.length > 0 && (
          <div className="w-full text-left">
            <div className="flex items-center gap-2 mb-3">
              <Rocket className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Upcoming Features
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {features.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[#0b1526] border border-[#162744] text-xs text-slate-300"
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: accentColor }}
                  />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
