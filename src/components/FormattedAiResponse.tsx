import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Zap,
  Info
} from 'lucide-react';

interface FormattedAiResponseProps {
  text: string;
  isUser?: boolean;
}

/**
 * Parses inline formatting tags:
 * - **bold** -> <strong>
 * - *italic* -> <em>
 * - `code`   -> <code>
 * - ₹Amount  -> <span class="text-emerald-400">
 * - Removes all raw asterisk / backtick characters
 */
function parseInline(text: string): React.ReactNode[] {
  if (!text) return [];

  // Regex matches:
  // 1) **bold**
  // 2) *italic*
  // 3) `code`
  // 4) Currency (₹...)
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|₹[\d,]+(?:\.\d+)?(?:\s*(?:Lakhs?|Crores?|Cr|L))?)/g;

  const nodes: React.ReactNode[] = [];
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      // Clean any stray single asterisks in raw text
      const rawPiece = text.substring(lastIdx, match.index).replace(/\*/g, '');
      if (rawPiece) nodes.push(rawPiece);
    }

    const token = match[0];

    if (token.startsWith('**') && token.endsWith('**')) {
      const inner = token.slice(2, -2);
      nodes.push(
        <strong key={match.index} className="font-bold text-white tracking-wide">
          {parseInline(inner)}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      const inner = token.slice(1, -1);
      nodes.push(
        <em key={match.index} className="italic text-cyan-200 font-medium not-italic font-sans">
          {inner}
        </em>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      const inner = token.slice(1, -1);
      nodes.push(
        <code
          key={match.index}
          className="px-1.5 py-0.5 mx-0.5 rounded bg-[#0b172a] text-cyan-300 border border-cyan-500/30 font-mono text-[11px] font-semibold tracking-tight"
        >
          {inner}
        </code>
      );
    } else if (token.startsWith('₹')) {
      nodes.push(
        <span key={match.index} className="text-emerald-400 font-mono font-bold">
          {token}
        </span>
      );
    }

    lastIdx = regex.lastIndex;
  }

  if (lastIdx < text.length) {
    const trailing = text.substring(lastIdx).replace(/\*/g, '');
    if (trailing) nodes.push(trailing);
  }

  return nodes.length > 0 ? nodes : [text.replace(/\*/g, '')];
}

export const FormattedAiResponse: React.FC<FormattedAiResponseProps> = ({ text, isUser = false }) => {
  if (!text) return null;

  if (isUser) {
    return <div className="whitespace-pre-wrap font-sans text-xs text-white">{text}</div>;
  }

  // Split into lines
  const lines = text.split('\n');

  return (
    <div className="space-y-2 text-xs text-slate-200 leading-relaxed font-sans">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        // 1. Headers: ### or ## or #
        if (trimmed.startsWith('#')) {
          const headerText = trimmed.replace(/^#+\s*/, '');
          return (
            <div
              key={idx}
              className="pb-1.5 mb-1.5 border-b border-cyan-500/20 text-xs sm:text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-200 to-indigo-300 flex items-center gap-1.5 tracking-wide"
            >
              {parseInline(headerText)}
            </div>
          );
        }

        // 2. Callout / Notice Boxes (starts with ⚠️, ✅, 🚨, 💡, 🛡️, ⚡)
        if (
          trimmed.startsWith('⚠️') ||
          trimmed.startsWith('✅') ||
          trimmed.startsWith('🚨') ||
          trimmed.startsWith('💡') ||
          trimmed.startsWith('🛡️') ||
          trimmed.startsWith('⚡')
        ) {
          const isWarning = trimmed.startsWith('⚠️') || trimmed.startsWith('🚨');
          const isSuccess = trimmed.startsWith('✅');
          return (
            <div
              key={idx}
              className={`p-2.5 rounded-xl border flex items-start gap-2 my-2 ${
                isWarning
                  ? 'bg-amber-950/40 border-amber-500/40 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                  : isSuccess
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                  : 'bg-blue-950/40 border-blue-500/40 text-blue-200 shadow-[0_0_12px_rgba(59,130,246,0.15)]'
              }`}
            >
              <div className="flex-1 text-[11px] leading-relaxed">
                {parseInline(trimmed)}
              </div>
            </div>
          );
        }

        // 3. Bullet Point (• or - or *)
        if (
          trimmed.startsWith('•') ||
          trimmed.startsWith('- ') ||
          (trimmed.startsWith('* ') && !trimmed.startsWith('**'))
        ) {
          const bulletText = trimmed.replace(/^[•\-\*]\s*/, '');
          return (
            <div key={idx} className="flex items-start gap-2 pl-1 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0 shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
              <div className="flex-1 text-slate-200 leading-snug">
                {parseInline(bulletText)}
              </div>
            </div>
          );
        }

        // 4. Numbered List Item: 1. 2. 3.
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (numMatch) {
          const num = numMatch[1];
          const content = numMatch[2];
          return (
            <div key={idx} className="flex items-start gap-2.5 pl-1 py-1">
              <span className="w-5 h-5 rounded-md bg-blue-600/30 border border-blue-500/50 text-blue-300 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 shadow-sm">
                {num}
              </span>
              <div className="flex-1 pt-0.5 text-slate-200 leading-snug">
                {parseInline(content)}
              </div>
            </div>
          );
        }

        // 5. Standard Paragraph
        return (
          <p key={idx} className="leading-relaxed text-slate-300">
            {parseInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
};
