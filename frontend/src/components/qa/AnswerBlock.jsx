import React from "react";

export function AnswerBlock({ answer }) {
  if (!answer) return null;

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col gap-3">
        <h4 className="text-xs uppercase tracking-wider font-bold text-[var(--text-muted)] select-none">
          Answer
        </h4>
        <div 
          className="text-base leading-relaxed font-sans text-[var(--text-primary)] max-w-3xl"
          dangerouslySetInnerHTML={{ __html: answer }}
        />
      </div>
      
      {/* Divider */}
      <div className="w-full border-t border-[var(--border)]" />
    </div>
  );
}

export default AnswerBlock;
