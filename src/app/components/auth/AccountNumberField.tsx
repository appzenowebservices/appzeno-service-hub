import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface Props {
  value:          string;
  confirmValue:   string;
  onChange:       (val: string) => void;
  onConfirmChange:(val: string) => void;
  error?:         string;
  confirmError?:  string;
}

export default function AccountNumberField({
  value, confirmValue, onChange, onConfirmChange, error, confirmError,
}: Props) {
  const [show,  setShow]  = useState(false);
  const [showC, setShowC] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      {/* Account Number */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">
          Account Number <span className="text-danger">*</span>
        </label>
        <div className="relative">
          <input
            type={show ? "text" : "password"}
            value={value}
            onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
            placeholder="Enter account number"
            className={`w-full pl-4 pr-10 py-2.5 text-sm rounded-xl border bg-white font-mono
              focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all
              ${error ? "border-danger" : "border-neutral-200"}`}
          />
          <button type="button" onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        {error && <p className="text-xs text-danger font-medium">{error}</p>}
      </div>

      {/* Confirm Account Number */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">
          Confirm Account Number <span className="text-danger">*</span>
        </label>
        <div className="relative">
          <input
            type={showC ? "text" : "password"}
            value={confirmValue}
            onChange={(e) => onConfirmChange(e.target.value.replace(/\D/g, ""))}
            onPaste={(e) => e.preventDefault()}
            placeholder="Re-enter account number"
            className={`w-full pl-4 pr-10 py-2.5 text-sm rounded-xl border bg-white font-mono
              focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all
              ${confirmError ? "border-danger" : confirmValue && confirmValue === value ? "border-green-400" : "border-neutral-200"}`}
          />
          <button type="button" onClick={() => setShowC(!showC)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
            {showC ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        <p className="text-xs text-neutral-400">Paste is disabled — type manually to confirm</p>
        {confirmValue && confirmValue === value && (
          <p className="text-xs text-green-600 font-medium">✓ Account numbers match</p>
        )}
        {confirmError && <p className="text-xs text-danger font-medium">{confirmError}</p>}
      </div>
    </div>
  );
}
