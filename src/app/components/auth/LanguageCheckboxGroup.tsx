const LANGUAGES = [
  { value: "hindi",    label: "Hindi",    native: "हिन्दी" },
  { value: "english",  label: "English",  native: "English" },
  { value: "urdu",     label: "Urdu",     native: "اردو" },
  { value: "bhojpuri", label: "Bhojpuri", native: "भोजपुरी" },
  { value: "marathi",  label: "Marathi",  native: "मराठी" },
  { value: "tamil",    label: "Tamil",    native: "தமிழ்" },
  { value: "telugu",   label: "Telugu",   native: "తెలుగు" },
  { value: "kannada",  label: "Kannada",  native: "ಕನ್ನಡ" },
  { value: "bengali",  label: "Bengali",  native: "বাংলা" },
  { value: "gujarati", label: "Gujarati", native: "ગુજરાતી" },
  { value: "punjabi",  label: "Punjabi",  native: "ਪੰਜਾਬੀ" },
];

interface Props {
  selected: string[];
  onChange: (langs: string[]) => void;
  error?:   string;
}

export default function LanguageCheckboxGroup({ selected, onChange, error }: Props) {
  function toggle(val: string) {
    onChange(
      selected.includes(val) ? selected.filter((v) => v !== val) : [...selected, val]
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">
        Preferred Languages <span className="text-danger">*</span>
      </label>
      <div className="flex flex-wrap gap-2">
        {LANGUAGES.map((lang) => {
          const sel = selected.includes(lang.value);
          return (
            <button
              key={lang.value}
              type="button"
              onClick={() => toggle(lang.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
                border-2 transition-all cursor-pointer
                ${sel
                  ? "bg-primary-600 border-primary-600 text-white"
                  : "bg-white border-neutral-200 text-neutral-600 hover:border-primary-300"
                }`}
            >
              {sel && (
                <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              {lang.label}
              <span className="opacity-60">{lang.native}</span>
            </button>
          );
        })}
      </div>
      {error && <p className="text-xs text-danger font-medium">{error}</p>}
    </div>
  );
}
