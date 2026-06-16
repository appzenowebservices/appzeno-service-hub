import FormField from "./FormField";

export interface ReferencePerson {
  name:     string;
  mobile:   string;
  relation: string;
  address:  string;
}

export const EMPTY_REFERENCE: ReferencePerson = { name: "", mobile: "", relation: "", address: "" };

const RELATIONS = [
  { value: "friend",    label: "Friend" },
  { value: "colleague", label: "Colleague" },
  { value: "neighbor",  label: "Neighbor" },
  { value: "relative",  label: "Relative" },
  { value: "employer",  label: "Employer / Manager" },
  { value: "other",     label: "Other" },
];

interface Props {
  refs:     [ReferencePerson, ReferencePerson];
  onChange: (index: 0 | 1, updated: ReferencePerson) => void;
  errors?:  Partial<Record<string, string>>;
}

export default function ReferencePersonForm({ refs, onChange, errors = {} }: Props) {
  function set(index: 0 | 1, field: keyof ReferencePerson) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      onChange(index, { ...refs[index], [field]: e.target.value });
    };
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
        🛡️ <strong>Fraud Prevention:</strong> Provide 2 references who can vouch for you. Our team may contact them during verification.
      </div>

      {([0, 1] as const).map((i) => (
        <div key={i} className="rounded-2xl border border-neutral-100 overflow-hidden">
          <div className="bg-neutral-50 px-4 py-2.5 border-b border-neutral-100">
            <p className="text-xs font-black text-neutral-600 uppercase tracking-wide">
              Reference {i + 1}
            </p>
          </div>
          <div className="p-4 flex flex-col gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField
                label="Full Name" required
                placeholder="Reference person's full name"
                value={refs[i].name}
                onChange={set(i, "name")}
                error={errors[`ref${i}_name`]}
              />
              <FormField
                label="Mobile Number" required type="tel"
                placeholder="10-digit mobile number"
                value={refs[i].mobile}
                onChange={set(i, "mobile")}
                error={errors[`ref${i}_mobile`]}
              />
            </div>
            <FormField
              as="select"
              label="Relation" required
              options={RELATIONS}
              value={refs[i].relation}
              onChange={(e) => onChange(i, { ...refs[i], relation: e.target.value })}
              placeholder="Select relation"
              error={errors[`ref${i}_relation`]}
            />
            <FormField
              as="textarea"
              label="Complete Address" required
              placeholder="House No., Street, Area, City, State, PIN"
              value={refs[i].address}
              onChange={(e) => onChange(i, { ...refs[i], address: (e.target as HTMLTextAreaElement).value })}
              error={errors[`ref${i}_address`]}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
