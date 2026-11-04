import React, { useState } from 'react';
import {
  Building,
  Save,
  Shield,
  Plus,
  CheckCircle,
  AlertTriangle,
  Globe,
  MapPin,
  Mail,
  Phone,
  Coins,
  X,
} from 'lucide-react';
import { useNewsroom } from '../contexts/NewsroomContext';
import { Organization, OrgType } from '../types';

export const OrganizationSettingsPage: React.FC = () => {
  const {
    currentOrg,
    allOrganizations,
    currentUser,
    updateOrganization,
    createOrganization,
    hasPermission,
  } = useNewsroom();

  const isPlatformAdmin = currentUser.role === 'platform_admin';

  // Active Org form
  const [name, setName] = useState(currentOrg.name);
  const [address, setAddress] = useState(currentOrg.address);
  const [province, setProvince] = useState(currentOrg.province);
  const [city, setCity] = useState(currentOrg.city);
  const [email, setEmail] = useState(currentOrg.email);
  const [phone, setPhone] = useState(currentOrg.phone);
  const [website, setWebsite] = useState(currentOrg.website);
  const [currency, setCurrency] = useState<'USD' | 'ZWG'>(
    currentOrg.settings?.currency || 'USD'
  );
  const [aiRetentionAllowed, setAiRetentionAllowed] = useState(
    currentOrg.settings?.aiRetentionAllowed || false
  );

  // New Org Registration Modal
  const [showNewOrgModal, setShowNewOrgModal] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgType, setNewOrgType] = useState<OrgType>('community_media');
  const [newOrgProvince, setNewOrgProvince] = useState('Bulawayo');
  const [newOrgCity, setNewOrgCity] = useState('Bulawayo');
  const [newOrgAddress, setNewOrgAddress] = useState('');
  const [newOrgEmail, setNewOrgEmail] = useState('');
  const [newOrgPhone, setNewOrgPhone] = useState('+263 29 ');
  const [newOrgWebsite, setNewOrgWebsite] = useState('https://');

  const zimbabweProvinces = [
    'Bulawayo',
    'Harare',
    'Matabeleland North',
    'Matabeleland South',
    'Midlands',
    'Manicaland',
    'Mashonaland Central',
    'Mashonaland East',
    'Mashonaland West',
    'Masvingo',
  ];

  const handleSaveCurrentOrg = (e: React.FormEvent) => {
    e.preventDefault();
    updateOrganization(currentOrg.id, {
      name,
      address,
      province,
      city,
      email,
      phone,
      website,
      settings: {
        defaultTimezone: 'Africa/Harare',
        currency,
        aiRetentionAllowed,
        autoArchiveDays: 90,
      },
    });
    alert('Organisation profile and newsroom settings updated!');
  };

  const handleCreateNewOrg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;

    createOrganization({
      name: newOrgName.trim(),
      type: newOrgType,
      province: newOrgProvince,
      city: newOrgCity,
      address: newOrgAddress.trim() || 'Central Business District',
      email: newOrgEmail.trim() || 'newsdesk@media.co.zw',
      phone: newOrgPhone.trim(),
      website: newOrgWebsite.trim(),
      status: 'active',
      settings: {
        defaultTimezone: 'Africa/Harare',
        currency: 'USD',
        aiRetentionAllowed: false,
        autoArchiveDays: 90,
      },
    });

    setShowNewOrgModal(false);
    alert(`New Media Organisation "${newOrgName}" onboarded to SmartNewsroom Zimbabwe!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600 text-white">
              <Building className="h-4 w-4" />
            </span>
            <h1 className="font-serif text-2xl font-bold text-slate-900">
              Media Organisation Settings
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Configure legal identity, local currency settings, and data retention policies for{' '}
            <strong>{currentOrg.name}</strong>.
          </p>
        </div>

        {isPlatformAdmin && (
          <button
            onClick={() => setShowNewOrgModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-teal-700 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Onboard Media Organisation</span>
          </button>
        )}
      </div>

      {/* Main Settings Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleSaveCurrentOrg} className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
          <h2 className="font-serif text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            Active Organisation Profile
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">Organisation Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Zimbabwe Province *</label>
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-hidden"
              >
                {zimbabweProvinces.map((prov) => (
                  <option key={prov} value={prov}>
                    {prov}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">City / District *</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Physical Address in Zimbabwe</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">Contact Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Phone (+263)</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-hidden font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Website URL</label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Localization & Policy Settings */}
          <div className="border-t border-slate-100 pt-4 space-y-3">
            <h3 className="font-serif text-xs font-bold text-slate-800">
              Newsroom Localization & Currency
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700">Default Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as any)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-hidden"
                >
                  <option value="USD">USD (United States Dollar)</option>
                  <option value="ZWG">ZWG (Zimbabwe Gold Structured Currency)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Timezone</label>
                <input
                  type="text"
                  disabled
                  value="Africa/Harare (CAT, UTC+2)"
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-xs text-slate-600 cursor-not-allowed"
                />
              </div>
            </div>

            {/* AI Confidentiality Control */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={aiRetentionAllowed}
                  onChange={(e) => setAiRetentionAllowed(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span>Allow Anonymized Model Improvement Telemetry</span>
              </label>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Default is <strong>DISABLED</strong>. Unpublished investigative drafts and confidential source materials are strictly isolated in memory and never used to train third-party foundation models.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-teal-700 transition"
            >
              <Save className="h-4 w-4" />
              <span>Save Settings</span>
            </button>
          </div>
        </form>

        {/* Platform Level Organisation Directory (For Platform Admin) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
          <h2 className="font-serif text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            ZMDTP Media Directory ({allOrganizations.length})
          </h2>
          <p className="text-[11px] text-slate-500">
            Registered Zimbabwean newsrooms operating isolated workspaces:
          </p>

          <div className="space-y-3">
            {allOrganizations.map((org) => (
              <div
                key={org.id}
                className={`rounded-xl border p-3 text-xs space-y-1 transition ${
                  org.id === currentOrg.id
                    ? 'border-teal-500 bg-teal-50/40 ring-1 ring-teal-500'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{org.name}</span>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600 capitalize">
                    {org.type.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {org.city}, {org.province}
                </p>
                <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                  <span>{org.phone}</span>
                  <span className="text-emerald-700 font-semibold uppercase">● Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Onboard New Media Organisation Modal */}
      {showNewOrgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-serif text-lg font-bold text-slate-900">
                Onboard Media Organisation
              </h3>
              <button
                onClick={() => setShowNewOrgModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewOrg} className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700">Organisation Name *</label>
                <input
                  type="text"
                  required
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  placeholder="e.g. Matabeleland News Network, Midlands Broadcasting..."
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Organisation Type</label>
                  <select
                    value={newOrgType}
                    onChange={(e) => setNewOrgType(e.target.value as OrgType)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-900 focus:outline-hidden"
                  >
                    <option value="radio">Radio Station</option>
                    <option value="television">Television Broadcaster</option>
                    <option value="newspaper">Newspaper Publisher</option>
                    <option value="online_publisher">Online Publisher</option>
                    <option value="community_media">Community Media</option>
                    <option value="multimedia_production">Multimedia Production</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Province</label>
                  <select
                    value={newOrgProvince}
                    onChange={(e) => setNewOrgProvince(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-900 focus:outline-hidden"
                  >
                    {zimbabweProvinces.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">City / Town</label>
                  <input
                    type="text"
                    value={newOrgCity}
                    onChange={(e) => setNewOrgCity(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-900 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Contact Telephone (+263)</label>
                  <input
                    type="text"
                    value={newOrgPhone}
                    onChange={(e) => setNewOrgPhone(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-900 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Editorial Contact Email</label>
                <input
                  type="email"
                  value={newOrgEmail}
                  onChange={(e) => setNewOrgEmail(e.target.value)}
                  placeholder="editorial@newsroom.co.zw"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-900 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewOrgModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-teal-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-teal-700"
                >
                  Onboard Organisation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
