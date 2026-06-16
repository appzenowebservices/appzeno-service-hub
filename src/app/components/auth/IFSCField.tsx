import { useState } from "react";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

export interface BankDetails {
  ifsc:        string;
  bankName:    string;
  bankBranch:  string;
  bankAddress: string;
  bankCity:    string;
  bankState:   string;
}

export const EMPTY_BANK: BankDetails = {
  ifsc: "", bankName: "", bankBranch: "", bankAddress: "", bankCity: "", bankState: "",
};

interface Props {
  value:    BankDetails;
  onChange: (details: BankDetails) => void;
  error?:   string;
}

type VerifyStatus = "idle" | "loading" | "success" | "error";

export default function IFSCField({ value, onChange, error }: Props) {
  const [status,  setStatus]  = useState<VerifyStatus>("idle");
  const [message, setMessage] = useState("");

  async function verifyIFSC(code: string) {
    if (code.length !== 11) return;
    setStatus("loading");
    setMessage("");
    try {
      const res  = await fetch(`https://ifsc.razorpay.com/${code.toUpperCase()}`);
      if (!res.ok) throw new Error("Invalid IFSC");
      const data = await res.json();
      onChange({
        ifsc:        code.toUpperCase(),
        bankName:    data.BANK    ?? "",
        bankBranch:  data.BRANCH  ?? "",
        bankAddress: data.ADDRESS ?? "",
        bankCity:    data.CITY    ?? "",
        bankState:   data.STATE   ?? "",
      });
      setStatus("success");
      setMessage(`${data.BANK} — ${data.BRANCH}`);
    } catch {
      onChange({ ...value, ifsc: code, bankName: "", bankBranch: "", bankAddress: "", bankCity: "", bankState: "" });
      setStatus("error");
      setMessage("Invalid IFSC code. Please check and retry.");
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const code = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 11);
    onChange({ ...EMPTY_BANK, ifsc: code });
    setStatus("idle");
    setMessage("");
    if (code.length === 11) verifyIFSC(code);
  }

  return (
    <div className="flex flex-col gap-2">
      {/* IFSC Input */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">
          IFSC Code <span className="text-danger">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={value.ifsc}
            onChange={handleChange}
            placeholder="e.g. SBIN0001234"
            maxLength={11}
            className={`w-full pl-4 pr-10 py-2.5 text-sm rounded-xl border bg-white font-mono uppercase
              focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all
              ${error || status === "error" ? "border-danger" : status === "success" ? "border-green-400" : "border-neutral-200"}`}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {status === "loading" && <Loader2 size={15} className="animate-spin text-primary-400" />}
            {status === "success" && <CheckCircle2 size={15} className="text-green-500" />}
            {status === "error"   && <XCircle      size={15} className="text-danger" />}
          </div>
        </div>

        {status === "success" && (
          <p className="text-xs text-green-600 font-semibold flex items-center gap-1">
            <CheckCircle2 size={11} /> {message}
          </p>
        )}
        {status === "error" && (
          <p className="text-xs text-danger font-medium">{message}</p>
        )}
        {status === "idle" && !error && (
          <p className="text-xs text-neutral-400">Bank details will auto-fill after IFSC verification</p>
        )}
        {error && <p className="text-xs text-danger font-medium">{error}</p>}
      </div>

      {/* Auto-filled bank details */}
      {status === "success" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-green-50 border border-green-100">
          <div>
            <p className="text-xs text-neutral-500 mb-0.5">Bank Name</p>
            <p className="text-sm font-bold text-neutral-800">{value.bankName}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 mb-0.5">Branch</p>
            <p className="text-sm font-bold text-neutral-800">{value.bankBranch}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs text-neutral-500 mb-0.5">Branch Address</p>
            <p className="text-sm text-neutral-700">{value.bankAddress}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 mb-0.5">City</p>
            <p className="text-sm font-bold text-neutral-800">{value.bankCity}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 mb-0.5">State</p>
            <p className="text-sm font-bold text-neutral-800">{value.bankState}</p>
          </div>
        </div>
      )}
    </div>
  );
}
