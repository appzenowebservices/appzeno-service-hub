import { useRef } from "react";
import { Upload, X, CheckCircle2, FileText, Image } from "lucide-react";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
const MAX_MB = 4;

interface Props {
  label:      string;
  file:       File | null;
  onChange:   (f: File | null) => void;
  error?:     string;
  required?:  boolean;
  accept?:    string;  // override
}

export default function FileUploadField({ label, file, onChange, error, required, accept }: Props) {
  const ref = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;

    if (!ALLOWED_TYPES.includes(f.type)) {
      alert("Only JPG, PNG, PDF, DOC, DOCX files are allowed.");
      return;
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      alert(`File too large. Maximum size is ${MAX_MB}MB.`);
      return;
    }
    onChange(f);
    if (ref.current) ref.current.value = "";
  }

  const isImage = file && file.type.startsWith("image/");
  const previewUrl = isImage ? URL.createObjectURL(file) : null;

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">
        {label} {required && <span className="text-danger">*</span>}
      </label>

      {file ? (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2
          ${error ? "border-danger bg-danger-light" : "border-green-300 bg-green-50"}`}>
          {previewUrl ? (
            <img src={previewUrl} alt="preview" className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-green-200" />
          ) : file.type === "application/pdf" ? (
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
              <FileText size={18} className="text-red-500" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Image size={18} className="text-blue-500" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-green-700 truncate">{file.name}</p>
            <p className="text-xs text-neutral-400">{(file.size / 1024).toFixed(1)} KB</p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <CheckCircle2 size={15} className="text-green-500" />
            <button type="button" onClick={() => onChange(null)}
              className="text-neutral-400 hover:text-danger transition-colors">
              <X size={14} />
            </button>
          </div>
        </div>
      ) : (
        <label className={`flex items-center gap-3 px-4 py-4 rounded-xl border-2 border-dashed cursor-pointer transition-all
          ${error ? "border-danger bg-red-50" : "border-neutral-200 bg-neutral-50 hover:border-primary-300 hover:bg-primary-50"}`}>
          <input
            ref={ref}
            type="file"
            accept={accept ?? ".jpg,.jpeg,.png,.pdf,.doc,.docx"}
            className="hidden"
            onChange={handleChange}
          />
          <Upload size={18} className="text-neutral-400 flex-shrink-0" />
          <div>
            <p className="text-xs text-neutral-600 font-medium">Click to upload</p>
            <p className="text-xs text-neutral-400">JPG, PNG, PDF, DOC, DOCX — max {MAX_MB}MB</p>
          </div>
        </label>
      )}

      {error && <p className="text-xs text-danger font-medium">{error}</p>}
    </div>
  );
}
