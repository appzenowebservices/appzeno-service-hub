// src/pages/customer/booking/Step2Issue.tsx
import { useState } from "react";
import { Check, AlertTriangle, Camera, Video, X, Info, Clock, Zap } from "lucide-react";
import type { Step1Data, Step2Data } from "./types";
import { CATEGORY_DATA } from "./data";

interface Props {
  step1:   Step1Data;
  data:    Step2Data;
  errors:  Record<string,string>;
  onChange:(d: Step2Data) => void;
}

function toggle<T>(arr: T[], val: T): T[] {
  return arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];
}

function ImageUploader({ images, onChange }: { images: File[]; onChange: (imgs: File[]) => void }) {
  function handleFiles(files: FileList | null) {
    if (!files) return;
    const valid = Array.from(files)
      .filter(f => f.type.startsWith("image/") && f.size <= 5 * 1024 * 1024)
      .slice(0, 5 - images.length);
    onChange([...images, ...valid]);
  }
  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-3">
        {images.map((img, i) => (
          <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-slate-200 group">
            <img src={URL.createObjectURL(img)} className="w-full h-full object-cover" alt="" />
            <button onClick={() => onChange(images.filter((_,j) => j !== i))}
              className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-white rounded-xl">
              <X size={18} />
            </button>
          </div>
        ))}
        {images.length < 5 && (
          <label className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-all gap-1">
            <Camera size={20} className="text-slate-400" />
            <p className="text-xs text-slate-400">Add</p>
            <input type="file" accept="image/*" multiple className="hidden"
              onChange={e => handleFiles(e.target.files)} />
          </label>
        )}
      </div>
      <p className="text-xs text-slate-400">{images.length}/5 images · Max 5MB each</p>
    </div>
  );
}

export default function Step2Issue({ step1, data, errors, onChange }: Props) {
  const selectedCatData = step1.categoryIds.map(id => CATEGORY_DATA[id]).filter(Boolean);
  const allProblems = [...new Set(selectedCatData.flatMap(d => d.problems))];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-slate-800">Describe the Issue</h2>
        <p className="text-sm text-slate-400 mt-0.5">More details = faster & better service</p>
      </div>

      {/* ── Problem Type (MULTIPLE) ── */}
      <div data-field="problemTypes">
        <label className="text-xs font-black text-slate-500 uppercase tracking-wide block mb-2">
          Problem Type <span className="text-red-400">*</span>
          <span className="ml-2 text-slate-400 font-normal normal-case text-xs">(Select all that apply)</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {allProblems.map(prob => {
            const selected = data.problemTypes.includes(prob);
            return (
              <button key={prob} type="button"
                onClick={() => onChange({ ...data, problemTypes: toggle(data.problemTypes, prob) })}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium text-left transition-all
                  ${selected
                    ? "border-red-400 bg-red-50 text-red-700"
                    : "border-slate-200 bg-white text-slate-700 hover:border-red-200"}`}>
                {selected
                  ? <Check size={13} className="text-red-500 flex-shrink-0" />
                  : <AlertTriangle size={13} className="text-slate-300 flex-shrink-0" />}
                {prob}
              </button>
            );
          })}
        </div>
        {data.problemTypes.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {data.problemTypes.map(p => (
              <span key={p} className="flex items-center gap-1 text-xs bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full">
                {p}
                <button onClick={() => onChange({ ...data, problemTypes: data.problemTypes.filter(x => x !== p) })}>
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        )}
        {errors.problemTypes && <p className="text-xs text-red-500 mt-1">{errors.problemTypes}</p>}
      </div>

      {/* ── Description ── */}
      <div data-field="description">
        <label className="text-xs font-black text-slate-500 uppercase tracking-wide block mb-2">
          Describe in Detail <span className="text-red-400">*</span>
        </label>
        <textarea
          value={data.description}
          onChange={e => onChange({ ...data, description: e.target.value })}
          rows={4}
          placeholder="Describe the problem clearly... e.g., 'AC is not cooling even after running for 2 hours. Ice forming on the coils...'"
          className={`w-full px-4 py-3 text-sm rounded-xl border-2 resize-none bg-white
            focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all
            ${errors.description ? "border-red-300" : "border-slate-200 focus:border-emerald-400"}`}
        />
        <div className="flex items-center justify-between mt-1">
          {errors.description
            ? <p className="text-xs text-red-500">{errors.description}</p>
            : <p className="text-xs text-slate-400">Min 30 characters</p>}
          <p className={`text-xs font-bold ${data.description.length >= 30 ? "text-emerald-500" : "text-slate-400"}`}>
            {data.description.length}/30+
          </p>
        </div>
      </div>

      {/* ── Photos ── */}
      <div>
        <label className="text-xs font-black text-slate-500 uppercase tracking-wide block mb-2">
          Upload Photos <span className="text-slate-400 font-normal normal-case">(optional, max 5)</span>
        </label>
        <ImageUploader images={data.images} onChange={imgs => onChange({ ...data, images: imgs })} />
      </div>

      {/* ── Video ── */}
      <div>
        <label className="text-xs font-black text-slate-500 uppercase tracking-wide block mb-2">
          Upload Short Video <span className="text-slate-400 font-normal normal-case">(optional, max 30 sec)</span>
        </label>
        {data.video ? (
          <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
            <Video size={18} className="text-blue-500 flex-shrink-0" />
            <p className="text-xs font-semibold text-blue-700 flex-1 truncate">{data.video.name}</p>
            <button onClick={() => onChange({ ...data, video: null })}>
              <X size={16} className="text-blue-400 hover:text-red-500" />
            </button>
          </div>
        ) : (
          <label className="flex items-center gap-3 p-3 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all">
            <Video size={20} className="text-slate-400" />
            <div>
              <p className="text-sm text-slate-600 font-medium">Add a video</p>
              <p className="text-xs text-slate-400">MP4, MOV · Max 30 seconds</p>
            </div>
            <input type="file" accept="video/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) onChange({ ...data, video: f }); }} />
          </label>
        )}
      </div>

      {/* ── Urgency ── */}
      <div>
        <label className="text-xs font-black text-slate-500 uppercase tracking-wide block mb-2">
          Urgency Level
        </label>
        <div className="flex gap-3">
          {[
            { level:"standard",  label:"Standard",  time:"Within 24 hours", icon:Clock,       iconColor:"text-blue-500",  bg:"bg-blue-50",  border:"border-blue-300",  textColor:"text-blue-700",  surge:null },
            { level:"priority",  label:"Priority",  time:"Within 4 hours",  icon:Zap,         iconColor:"text-amber-500", bg:"bg-amber-50", border:"border-amber-300", textColor:"text-amber-700", surge:15 },
            { level:"emergency", label:"Emergency", time:"Within 1 hour",   icon:AlertTriangle,iconColor:"text-red-500",   bg:"bg-red-50",   border:"border-red-300",   textColor:"text-red-700",   surge:30 },
          ].map(({ level, label, time, icon: Icon, iconColor, bg, border, textColor, surge }) => {
            const selected = data.urgency === level;
            return (
              <button key={level} type="button"
                onClick={() => onChange({ ...data, urgency: level as Step2Data["urgency"] })}
                className={`relative flex flex-col gap-2 p-4 rounded-2xl border-2 text-left transition-all flex-1
                  ${selected ? `${border} ${bg} shadow-md` : "border-slate-200 bg-white hover:border-slate-300"}`}>
                <div className="flex items-center justify-between">
                  <Icon size={16} className={iconColor} />
                  {selected && <Check size={13} className={textColor} />}
                </div>
                <p className={`text-sm font-black ${selected ? textColor : "text-slate-700"}`}>{label}</p>
                <p className={`text-xs ${selected ? textColor : "text-slate-400"}`}>{time}</p>
                {surge && (
                  <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full w-fit">
                    +{surge}% surge
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {data.urgency !== "standard" && (
          <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700">
            <Info size={13} className="flex-shrink-0 mt-0.5" />
            {data.urgency === "emergency"
              ? "Emergency booking mein 30% surge charge extra lagega. Vendor 1 hour mein pahunchega."
              : "Priority booking mein 15% surge charge extra lagega. Vendor 4 hours mein pahunchega."}
          </div>
        )}
      </div>
    </div>
  );
}
