import { useState } from "react";
import { Loader2, X, MapPin } from "lucide-react";

export interface PincodeInfo {
  pincode: string;
  district: string;
  state:    string;
}

interface Props {
  value:    PincodeInfo[];
  onChange: (pins: PincodeInfo[]) => void;
  error?:   string;
}

export default function PincodeField({ value, onChange, error }: Props) {
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const [apiErr,  setApiErr]  = useState("");

  async function lookupAndAdd(pin: string) {
    const trimmed = pin.trim();
    if (!/^\d{6}$/.test(trimmed)) {
      setApiErr("Enter a valid 6-digit PIN code");
      return;
    }
    if (value.find((p) => p.pincode === trimmed)) {
      setApiErr("PIN code already added");
      return;
    }

    setLoading(true);
    setApiErr("");
    try {
      const res  = await fetch(`https://api.postalpincode.in/pincode/${trimmed}`);
      const data = await res.json();

      if (!data?.[0]?.PostOffice?.length) throw new Error("Not found");

      const po       = data[0].PostOffice[0];
      const district = po.District ?? po.Division ?? "";
      const state    = po.State ?? "";

      onChange([...value, { pincode: trimmed, district, state }]);
      setInput("");
    } catch {
      setApiErr(`No area found for PIN ${trimmed}. Please check.`);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      lookupAndAdd(input);
    }
  }

  function remove(pin: string) {
    onChange(value.filter((p) => p.pincode !== pin));
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">
        Service Area PIN Codes
      </label>

      {/* Input row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={input}
            onChange={(e) => { setInput(e.target.value.replace(/\D/g, "").slice(0, 6)); setApiErr(""); }}
            onKeyDown={handleKeyDown}
            placeholder="Enter 6-digit PIN code"
            maxLength={6}
            className={`w-full pl-4 pr-4 py-2.5 text-sm rounded-xl border bg-white font-mono
              focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all
              ${apiErr ? "border-danger" : "border-neutral-200"}`}
          />
        </div>
        <button
          type="button"
          onClick={() => lookupAndAdd(input)}
          disabled={loading || input.length !== 6}
          className="px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold
                     hover:bg-primary-700 disabled:opacity-50 transition-all flex items-center gap-1.5"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <MapPin size={14} />}
          Add
        </button>
      </div>

      <p className="text-xs text-neutral-400">Press Enter or click Add after each PIN code</p>

      {apiErr && <p className="text-xs text-danger font-medium">{apiErr}</p>}
      {error  && <p className="text-xs text-danger font-medium">{error}</p>}

      {/* Added PIN tags */}
      {value.length > 0 && (
        <div className="flex flex-col gap-2 mt-1">
          {value.map((p) => (
            <div key={p.pincode}
              className="flex items-center justify-between px-3 py-2 rounded-xl bg-primary-50 border border-primary-100">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-primary-700 font-mono">{p.pincode}</span>
                <span className="text-xs text-neutral-500">
                  — {p.district}, {p.state}
                </span>
              </div>
              <button type="button" onClick={() => remove(p.pincode)}
                className="text-neutral-400 hover:text-danger transition-colors ml-2">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
