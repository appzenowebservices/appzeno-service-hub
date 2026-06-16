// src/pages/admin/dashboard/components/SetSectionCard.tsx

interface Props {
  title:     string;
  subtitle?: string;
  action?:   React.ReactNode;
  children:  React.ReactNode;
  danger?:   boolean;
}

export default function SetSectionCard({ title, subtitle, action, children, danger }: Props) {
  return (
    <div className={`bg-white rounded-2xl border overflow-hidden
      ${danger ? "border-red-200" : "border-slate-100"}`}>
      <div className={`flex items-start justify-between gap-3 px-5 py-4 border-b flex-wrap
        ${danger ? "border-red-100 bg-red-50/40" : "border-slate-100"}`}>
        <div>
          <p className={`text-sm font-black ${danger ? "text-red-800" : "text-slate-800"}`}>{title}</p>
          {subtitle && (
            <p className={`text-xs mt-0.5 ${danger ? "text-red-500" : "text-slate-400"}`}>{subtitle}</p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
      <div className="px-5 py-5">{children}</div>
    </div>
  );
}
