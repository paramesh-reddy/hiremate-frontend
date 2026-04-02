import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ExternalLink, MoreVertical, Edit2, 
  Trash2, Briefcase, Calendar, 
  ChevronRight, AlertCircle 
} from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';

const STATUS_CONFIG = {
  applied: { bg: "bg-[var(--light-blue-bg-08)]", text: "text-[var(--primary)]", dot: "bg-[var(--primary)]" },
  acknowledged: { bg: "bg-[var(--light-blue-bg-08)]", text: "text-[var(--primary)]", dot: "bg-[var(--primary)]" },
  in_review: { bg: "bg-[var(--light-blue-bg-08)]", text: "text-[var(--primary)]", dot: "bg-[var(--primary)]" },
  interview_scheduled: { bg: "bg-[var(--light-blue-bg-08)]", text: "text-[var(--primary)]", dot: "bg-[var(--primary)]" },
  interview_completed: { bg: "bg-[var(--light-blue-bg-08)]", text: "text-[var(--primary)]", dot: "bg-[var(--primary)]" },
  offer_received: { bg: "bg-[var(--light-blue-bg-08)]", text: "text-[var(--primary)]", dot: "bg-[var(--primary)]" },
  rejected: { bg: "bg-[var(--light-blue-bg-08)]", text: "text-[var(--primary)]", dot: "bg-[var(--primary)]" },
  ghosted: { bg: "bg-[var(--light-blue-bg-08)]", text: "text-[var(--primary)]", dot: "bg-[var(--primary)]" },
  withdrawn: { bg: "bg-[var(--light-blue-bg-08)]", text: "text-[var(--primary)]", dot: "bg-[var(--primary)]" },
};

function JobCard({ job, onEdit, onDelete, index = 0 }) {
  const appliedDate = job.applied_date || job.created_at
    ? format(new Date(job.applied_date || job.created_at), 'MMM d, yyyy')
    : 'Unknown Date';

  const status = STATUS_CONFIG[job.current_status] || STATUS_CONFIG.applied;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="card p-6 flex flex-col justify-between gap-6 cursor-pointer group relative overflow-hidden transition-all hover:shadow-xl hover:shadow-[var(--brand)]/5"
      onClick={() => onEdit?.(job)}
    >
      <div className="flex items-start justify-between">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black text-[var(--brand)] shadow-sm" style={{ backgroundColor: "var(--brand-tint)" }}>
          {(job.company || '?')[0].toUpperCase()}
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <div className={clsx("status-badge", status.bg, status.text)}>
            <div className={clsx("status-dot", status.dot)} />
            {job.current_status?.replace(/_/g, ' ') || 'applied'}
          </div>
          {job.low_confidence && (
            <div className="flex items-center gap-1 text-[9px] font-bold text-amber-600 uppercase tracking-widest">
              <AlertCircle size={10} /> Low Confidence
            </div>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
           <h3 className="text-xl font-black text-[var(--text-primary)] tracking-tight group-hover:text-[var(--primary)] transition-colors line-clamp-1">
            {job.company || 'Unknown Company'}
          </h3>
          {job.job_url && (
            <a 
              href={job.job_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-1.5 hover:bg-[var(--grey-5)] rounded-lg text-[var(--text-muted)] hover:text-[var(--primary)] transition-all flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={14} />
            </a>
          )}
        </div>
        <p className="text-sm font-bold text-[var(--text-secondary)] line-clamp-1">
          {job.role || 'Untitled Role'}
        </p>
      </div>

      <div className="pt-4 border-t border-[var(--divider)] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
            <Calendar size={12} />
            {appliedDate}
          </div>
          {job.location && (
             <div className="flex items-center gap-1.5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                <Briefcase size={12} />
                {job.location}
             </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
           <button 
             onClick={(e) => {
               e.stopPropagation();
               onDelete?.(job.id);
             }}
             className="p-2 hover:bg-rose-50 hover:text-rose-600 rounded-xl text-[var(--text-muted)] transition-all opacity-0 group-hover:opacity-100"
             title="Remove Tracker"
           >
             <Trash2 size={16} />
           </button>
           <div className="p-2 bg-[var(--grey-5)] group-hover:bg-[var(--primary)] group-hover:text-white rounded-xl transition-all text-[var(--text-muted)]">
             <ChevronRight size={16} />
           </div>
        </div>
      </div>
    </motion.div>
  );
}

export default memo(JobCard);
