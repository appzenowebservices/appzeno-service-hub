import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "../../../../utils/cn";

interface BaseProps {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
}

interface InputProps extends BaseProps, InputHTMLAttributes<HTMLInputElement> {
  as?: "input";
}

interface TextareaProps extends BaseProps, TextareaHTMLAttributes<HTMLTextAreaElement> {
  as: "textarea";
}

interface SelectProps extends BaseProps {
  as: "select";
  options: { value: string; label: string }[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  placeholder?: string;
}

type FormFieldProps = InputProps | TextareaProps | SelectProps;

const baseClass = `
  w-full px-4 py-2.5 text-sm rounded-xl border bg-white
  focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400
  transition-all placeholder:text-neutral-400 text-neutral-800
`;

export default function FormField(props: FormFieldProps) {
  const { label, error, required, hint, as = "input", ...rest } = props;

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">
        {label} {required && <span className="text-danger">*</span>}
      </label>

      {as === "textarea" ? (
        <textarea
          {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          rows={3}
          className={cn(baseClass, "resize-none", error && "border-danger focus:ring-danger/20 focus:border-danger")}
        />
      ) : as === "select" ? (
        <select
          value={(props as SelectProps).value}
          onChange={(props as SelectProps).onChange}
          className={cn(baseClass, "cursor-pointer", error && "border-danger focus:ring-danger/20 focus:border-danger")}
        >
          {(props as SelectProps).placeholder && (
            <option value="">{(props as SelectProps).placeholder}</option>
          )}
          {(props as SelectProps).options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : (
        <input
          {...(rest as InputHTMLAttributes<HTMLInputElement>)}
          className={cn(baseClass, error && "border-danger focus:ring-danger/20 focus:border-danger", (rest as InputHTMLAttributes<HTMLInputElement>).className)}
        />
      )}

      {hint && !error && <p className="text-xs text-neutral-400">{hint}</p>}
      {error && <p className="text-xs text-danger font-medium">{error}</p>}
    </div>
  );
}
