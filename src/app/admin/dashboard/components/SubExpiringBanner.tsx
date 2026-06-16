// src/pages/admin/dashboard/components/SubExpiringBanner.tsx

import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";
import { EXPIRING_RENEWALS } from "../mockAdminData";

export default function SubExpiringBanner() {
  const [dismissed, setDismissed] = useState(false);
  const urgent = EXPIRING_RENEWALS.filter(r => r.daysLeft <= 7 && !r.autoRenew);

  if (urgent.length === 0 || dismissed) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4
      flex items-start gap-3">
      <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <AlertTriangle size={18} className="text-amber-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-black text-amber-800">
          {urgent.length} subscription{urgent.length > 1 ? "s" : ""} expiring — no auto-renew
        </p>
        <p className="text-xs text-amber-600 mt-1">
          {urgent.map(r => r.vendorName).join(", ")} — contact vendors to avoid churn
        </p>
      </div>
      <button onClick={() => setDismissed(true)}
        className="p-1.5 rounded-lg hover:bg-amber-100 text-amber-400 hover:text-amber-600 transition-colors flex-shrink-0">
        <X size={14} />
      </button>
    </div>
  );
}
