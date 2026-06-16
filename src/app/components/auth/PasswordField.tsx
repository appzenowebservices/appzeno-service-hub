import { useState, useCallback } from "react";
import { Eye, EyeOff, RefreshCw, Info } from "lucide-react";

interface Props {
  label?:     string;
  value:      string;
  onChange:   (val: string) => void;
  error?:     string;
  required?:  boolean;
  showConfirm?: boolean;
  confirmValue?: string;
  onConfirmChange?: (val: string) => void;
  confirmError?: string;
}

interface Strength {
  score: number;     // 0-4
  label: string;
  color: string;
  bg:    string;
  tips:  string[];
}

function getStrength(pwd: string): Strength {
  if (!pwd) return { score: 0, label: "", color: "", bg: "", tips: [] };

  const tips: string[] = [];
  let score = 0;

  if (pwd.length >= 8)  score++; else tips.push("At least 8 characters");
  if (pwd.length >= 12) score++; else if (pwd.length >= 8) tips.push("12+ chars = stronger");
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++; else tips.push("Mix upper & lowercase");
  if (/\d/.test(pwd)) score++; else tips.push("Add numbers");
  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd)) score++; else tips.push("Add special chars (!@#...)");

  const cap = Math.min(score, 4);

  const map = [
    { label: "Too Weak",  color: "text-red-500",    bg: "bg-red-400" },
    { label: "Weak",      color: "text-orange-500",  bg: "bg-orange-400" },
    { label: "Fair",      color: "text-yellow-600",  bg: "bg-yellow-400" },
    { label: "Strong",    color: "text-blue-600",    bg: "bg-blue-500" },
    { label: "Very Strong", color: "text-green-600", bg: "bg-green-500" },
  ];

  return { score: cap, tips, ...map[cap] };
}

function generateStrongPassword(): string {
  const upper   = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower   = "abcdefghjkmnpqrstuvwxyz";
  const digits  = "23456789";
  const special = "!@#$%^&*";
  const all     = upper + lower + digits + special;

  const rand = (str: string) => str[Math.floor(Math.random() * str.length)];
  let pwd = rand(upper) + rand(lower) + rand(digits) + rand(special);
  for (let i = 0; i < 8; i++) pwd += rand(all);

  // shuffle
  return pwd.split("").sort(() => Math.random() - 0.5).join("");
}

export default function PasswordField({
  label = "Password",
  value,
  onChange,
  error,
  required,
  showConfirm,
  confirmValue = "",
  onConfirmChange,
  confirmError,
}: Props) {
  const [show,        setShow]        = useState(false);
  const [showC,       setShowC]       = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [copied,      setCopied]      = useState(false);

  const strength = getStrength(value);

  const generate = useCallback(() => {
    const pwd = generateStrongPassword();
    onChange(pwd);
    if (onConfirmChange) onConfirmChange(pwd);
    setShow(true);
  }, [onChange, onConfirmChange]);

  function copyToClipboard() {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Password Field */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">
            {label} {required && <span className="text-danger">*</span>}
          </label>
          <button
            type="button"
            onClick={generate}
            className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-800 font-semibold transition-colors"
          >
            <RefreshCw size={11} /> Generate Strong Password
          </button>
        </div>

        <div className="relative">
          <input
            type={show ? "text" : "password"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Min 8 characters"
            className={`w-full pl-4 pr-20 py-2.5 text-sm rounded-xl border bg-white
              focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400
              transition-all font-mono tracking-wider
              ${error ? "border-danger focus:ring-danger/20" : "border-neutral-200"}`}
          />

          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {/* Tooltip trigger */}
            {value && (
              <div className="relative">
                <button
                  type="button"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  className={`p-1 rounded-lg transition-colors ${strength.color}`}
                >
                  <Info size={14} />
                </button>

                {showTooltip && strength.tips.length > 0 && (
                  <div className="absolute right-0 bottom-full mb-2 w-52 bg-neutral-900 text-white
                                  rounded-xl p-3 text-xs shadow-xl z-50">
                    <p className="font-semibold mb-1.5">Improve your password:</p>
                    <ul className="flex flex-col gap-1">
                      {strength.tips.map((t, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-neutral-300">
                          <span className="text-yellow-400 mt-0.5">→</span> {t}
                        </li>
                      ))}
                    </ul>
                    {/* Arrow */}
                    <div className="absolute right-2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4
                                    border-l-transparent border-r-transparent border-t-neutral-900" />
                  </div>
                )}
              </div>
            )}

            {/* Show/hide */}
            <button type="button" onClick={() => setShow(!show)} className="p-1 text-neutral-400 hover:text-neutral-600">
              {show ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {/* Strength Bar */}
        {value && (
          <div className="flex items-center gap-2 mt-0.5">
            <div className="flex gap-1 flex-1">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300
                    ${i < strength.score ? strength.bg : "bg-neutral-200"}`}
                />
              ))}
            </div>
            <span className={`text-xs font-semibold ${strength.color}`}>{strength.label}</span>
            {show && (
              <button type="button" onClick={copyToClipboard} className="text-xs text-neutral-400 hover:text-primary-600 transition-colors">
                {copied ? "Copied!" : "Copy"}
              </button>
            )}
          </div>
        )}

        {error && <p className="text-xs text-danger font-medium">{error}</p>}
      </div>

      {/* Confirm Password */}
      {showConfirm && (
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">
            Confirm Password {required && <span className="text-danger">*</span>}
          </label>
          <div className="relative">
            <input
              type={showC ? "text" : "password"}
              value={confirmValue}
              onChange={(e) => onConfirmChange?.(e.target.value)}
              placeholder="Re-enter your password"
              onPaste={(e) => e.preventDefault()}
              className={`w-full pl-4 pr-10 py-2.5 text-sm rounded-xl border bg-white
                focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400
                transition-all font-mono tracking-wider
                ${confirmError ? "border-danger focus:ring-danger/20" : "border-neutral-200"}`}
            />
            <button type="button" onClick={() => setShowC(!showC)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
              {showC ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          <p className="text-xs text-neutral-400">Paste is disabled — type manually to confirm</p>
          {confirmError && <p className="text-xs text-danger font-medium">{confirmError}</p>}
        </div>
      )}
    </div>
  );
}
