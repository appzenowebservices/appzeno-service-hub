// src/pages/admin/dashboard/components/VendorKycBadge.tsx

interface Props {
  aadhaar: boolean;
  pan:     boolean;
  photo:   boolean;
  address: boolean;
  compact?: boolean;
}

const DOCS = [
  { key: "aadhaar" as const, label: "Aadhaar" },
  { key: "pan"     as const, label: "PAN"     },
  { key: "photo"   as const, label: "Photo"   },
  { key: "address" as const, label: "Address" },
];

export default function VendorKycBadge({ aadhaar, pan, photo, address, compact = false }: Props) {
  const values = { aadhaar, pan, photo, address };
  const allOk  = aadhaar && pan && photo && address;

  if (compact) {
    return allOk
      ? <span className="text-xs font-bold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-lg">✓ KYC Done</span>
      : <span className="text-xs font-bold px-2 py-0.5 bg-amber-100 text-amber-700 rounded-lg">⚠ KYC Pending</span>;
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {DOCS.map(({ key, label }) => (
        <div key={key}
          className={`flex items-center justify-between rounded-xl px-3 py-2 border
            ${values[key]
              ? "bg-emerald-50 border-emerald-200"
              : "bg-red-50 border-red-200"}`}>
          <span className="text-xs font-bold text-slate-700">{label}</span>
          {values[key]
            ? <span className="text-xs font-black text-emerald-600">✓</span>
            : <span className="text-xs font-black text-red-500">✗</span>}
        </div>
      ))}
    </div>
  );
}
