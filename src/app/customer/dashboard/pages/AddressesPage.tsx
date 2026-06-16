// src/pages/customer/dashboard/pages/AddressesPage.tsx

import { useState } from "react";
import {
  MapPin, Home, Briefcase, Plus, Edit3, Trash2,
  Check, Star, Navigation
} from "lucide-react";

interface Address {
  id:      string;
  label:   "Home" | "Office" | "Other";
  name:    string;
  line1:   string;
  line2:   string;
  area:    string;
  city:    string;
  pincode: string;
  isDefault: boolean;
}

const INITIAL_ADDRESSES: Address[] = [
  {
    id:"addr1", label:"Home", name:"Rahul Kumar",
    line1:"Flat 4B, Greenwood Apartments", line2:"Near City Mall",
    area:"Gomti Nagar", city:"Lucknow", pincode:"226010",
    isDefault:true,
  },
  {
    id:"addr2", label:"Office", name:"Rahul Kumar",
    line1:"3rd Floor, Tech Tower, Sector 15", line2:"",
    area:"Hazratganj", city:"Lucknow", pincode:"226001",
    isDefault:false,
  },
];

const LABEL_ICONS = { Home: Home, Office: Briefcase, Other: MapPin };
const LABEL_COLORS = {
  Home:   { bg:"bg-blue-50",   text:"text-blue-600",   border:"border-blue-200",   iconBg:"bg-blue-500" },
  Office: { bg:"bg-amber-50",  text:"text-amber-600",  border:"border-amber-200",  iconBg:"bg-amber-500" },
  Other:  { bg:"bg-purple-50", text:"text-purple-600", border:"border-purple-200", iconBg:"bg-purple-500" },
};

const EMPTY_ADDR: Address = {
  id:"", label:"Home", name:"", line1:"", line2:"",
  area:"", city:"", pincode:"", isDefault:false,
};

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>(INITIAL_ADDRESSES);
  const [editing,   setEditing]   = useState<Address|null>(null);
  const [isNew,     setIsNew]     = useState(false);
  const [deleteId,  setDeleteId]  = useState<string|null>(null);

  function saveAddress(addr: Address) {
    if (isNew) {
      setAddresses(prev => [...prev, { ...addr, id:`addr${Date.now()}` }]);
    } else {
      setAddresses(prev => prev.map(a => a.id === addr.id ? addr : a));
    }
    setEditing(null);
    setIsNew(false);
  }

  function deleteAddress(id: string) {
    setAddresses(prev => prev.filter(a => a.id !== id));
    setDeleteId(null);
  }

  function setDefault(id: string) {
    setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
  }

  return (
    <div className="mx-auto space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800">Saved Addresses</h2>
          <p className="text-sm text-slate-400 mt-0.5">{addresses.length} saved · Used for service bookings</p>
        </div>
        <button onClick={() => { setEditing({ ...EMPTY_ADDR }); setIsNew(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-bold
                     hover:bg-emerald-600 transition-all shadow-md shadow-emerald-100 hover:-translate-y-0.5 active:translate-y-0">
          <Plus size={16} /> Add Address
        </button>
      </div>

      {/* ── Address Cards ── */}
      {addresses.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MapPin size={24} className="text-slate-400" />
          </div>
          <p className="text-slate-600 font-semibold">No addresses saved</p>
          <p className="text-sm text-slate-400 mt-1 mb-4">Add your home or office for faster booking.</p>
          <button onClick={() => { setEditing({ ...EMPTY_ADDR }); setIsNew(true); }}
            className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-colors">
            Add First Address
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {addresses.map(addr => {
        const colors = LABEL_COLORS[addr.label];
        const LabelIcon = LABEL_ICONS[addr.label];
        return (
          <div key={addr.id}
            className={`bg-white rounded-2xl border-2 shadow-sm overflow-hidden transition-all hover:shadow-md
              ${addr.isDefault ? colors.border : "border-slate-100"}`}>

            {/* Top bar */}
            <div className={`flex items-center gap-3 px-5 py-3 border-b ${addr.isDefault ? colors.border : "border-slate-100"} ${addr.isDefault ? colors.bg : "bg-slate-50"}`}>
              <div className={`w-8 h-8 rounded-lg ${addr.isDefault ? colors.iconBg : "bg-slate-200"} flex items-center justify-center flex-shrink-0`}>
                <LabelIcon size={14} className={addr.isDefault ? "text-white" : "text-slate-500"} />
              </div>
              <span className={`text-sm font-bold ${addr.isDefault ? colors.text : "text-slate-600"}`}>{addr.label}</span>
              {addr.isDefault && (
                <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} border ${colors.border} flex items-center gap-1`}>
                  <Star size={10} fill="currentColor" /> Default
                </span>
              )}
            </div>

            {/* Address content */}
            <div className="px-5 py-4">
              <p className="text-sm font-bold text-slate-800 mb-1">{addr.name}</p>
              <p className="text-sm text-slate-600 leading-relaxed">
                {addr.line1}
                {addr.line2 && `, ${addr.line2}`}
              </p>
              <p className="text-sm text-slate-500 mt-0.5">
                {addr.area}, {addr.city} — {addr.pincode}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4 flex-wrap">
                {!addr.isDefault && (
                  <button onClick={() => setDefault(addr.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white text-slate-600 rounded-lg text-xs font-semibold hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
                    <Check size={12} /> Set Default
                  </button>
                )}
                <button onClick={() => { setEditing({ ...addr }); setIsNew(false); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white text-slate-600 rounded-lg text-xs font-semibold hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all">
                  <Edit3 size={12} /> Edit
                </button>
                <button onClick={() => setDeleteId(addr.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white text-slate-600 rounded-lg text-xs font-semibold hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-all ml-auto">
                  <Trash2 size={12} /> Remove
                </button>
              </div>
            </div>
          </div>
        );
      })}
      </div>

      {/* ── Use Current Location tip ── */}
      <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
        <Navigation size={18} className="text-emerald-600 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-emerald-800">Tip: Use GPS during booking</p>
          <p className="text-xs text-emerald-600 mt-0.5">During booking, you can also pin your exact location on the map for accurate dispatch.</p>
        </div>
      </div>

      {/* ── Edit / Add Modal ── */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => { setEditing(null); setIsNew(false); }} />
          <div className="relative bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl z-10 max-h-[90vh] overflow-y-auto">

            <h3 className="text-lg font-black text-slate-800 mb-4">{isNew ? "Add New Address" : "Edit Address"}</h3>

            {/* Label selector */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Address Type</label>
              <div className="flex gap-3">
                {(["Home","Office","Other"] as const).map(l => {
                  const Icon = LABEL_ICONS[l];
                  const col  = LABEL_COLORS[l];
                  return (
                    <button key={l} onClick={() => setEditing(e => e ? {...e, label:l} : e)}
                      className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all
                        ${editing.label === l ? `${col.border} ${col.bg} ${col.text}` : "border-slate-200 text-slate-500 hover:border-slate-300"}`}>
                      <Icon size={16} />
                      <span className="text-xs font-bold">{l}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              {[
                { label:"Full Name",            key:"name",    placeholder:"Your name" },
                { label:"House / Flat No.",     key:"line1",   placeholder:"e.g. Flat 4B, Tower A" },
                { label:"Building / Street",    key:"line2",   placeholder:"Optional" },
                { label:"Area / Locality",      key:"area",    placeholder:"e.g. Gomti Nagar" },
                { label:"City",                 key:"city",    placeholder:"e.g. Lucknow" },
                { label:"PIN Code",             key:"pincode", placeholder:"6-digit PIN" },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">{label}</label>
                  <input
                    value={editing[key as keyof Address] as string}
                    onChange={e => setEditing(prev => prev ? { ...prev, [key]: e.target.value } : prev)}
                    placeholder={placeholder}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800
                               focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 transition-all"
                  />
                </div>
              ))}
            </div>

            <label className="flex items-center gap-3 mt-4 cursor-pointer">
              <input type="checkbox" checked={editing.isDefault}
                onChange={e => setEditing(prev => prev ? { ...prev, isDefault: e.target.checked } : prev)}
                className="w-4 h-4 accent-emerald-600" />
              <span className="text-sm text-slate-700">Set as default address</span>
            </label>

            <div className="flex gap-3 mt-5">
              <button onClick={() => { setEditing(null); setIsNew(false); }}
                className="flex-1 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button onClick={() => editing && saveAddress(editing)}
                className="flex-1 py-3 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-colors">
                {isNew ? "Add Address" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl z-10 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <h3 className="text-base font-black text-slate-800 mb-2">Remove Address?</h3>
            <p className="text-sm text-slate-400 mb-5">This address will be permanently deleted.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button onClick={() => deleteAddress(deleteId)}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-colors">
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
