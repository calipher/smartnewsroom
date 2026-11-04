import React, { useState } from 'react';
import {
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  Building,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  KeyRound,
  Radio,
  FileText,
} from 'lucide-react';
import { useNewsroom } from '../contexts/NewsroomContext';

interface LoginPageProps {
  onSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const { login, allUsers, allOrganizations } = useNewsroom();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [selectedUserRole, setSelectedUserRole] = useState<string>('user_platform_admin');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const demoRoles = [
    {
      id: 'user_platform_admin',
      name: 'Dumisani Moyo',
      role: 'Platform Administrator',
      org: '',
      badge: 'Admin',
    },
    {
      id: 'user_editor_in_chief',
      name: 'Sipho Sibanda',
      role: 'Editor-in-Chief',
      org: 'Bulawayo Digital Media',
      badge: 'Editor',
    },
    {
      id: 'user_section_editor',
      name: 'Ruvimbo Chidzero',
      role: 'Section Editor (Business & Politics)',
      org: 'Bulawayo Digital Media',
      badge: 'Desk Head',
    },
    {
      id: 'user_journalist_1',
      name: 'Tariro Marange',
      role: 'Senior Investigative Reporter',
      org: 'Bulawayo Digital Media',
      badge: 'Reporter',
    },
    {
      id: 'user_producer',
      name: 'Bheki Khumalo',
      role: 'Multimedia Producer',
      org: 'Bulawayo Digital Media',
      badge: 'Producer',
    },
  ];

  const handleFillAdmin = () => {
    setUsername('admin');
    setPassword('admin');
    setErrorMessage('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const res = login(username, password, selectedUserRole);
      setIsLoading(false);
      if (!res.success) {
        setErrorMessage(res.error || 'Authentication failed. Please verify credentials.');
      } else if (onSuccess) {
        onSuccess();
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#0E1A2B] text-slate-100 flex flex-col justify-between selection:bg-teal-500/20 selection:text-teal-300">
      {/* Top Program Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/40 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 font-serif text-xl font-bold text-white shadow-md shadow-teal-900/40">
              S
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-base font-bold tracking-tight text-white">
                  SmartNewsroom Zimbabwe
                </span>
                <span className="rounded bg-teal-500/20 px-1.5 py-0.5 text-[9px] font-bold text-teal-300">
                  ZIM
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Zimbabwe Media Digital Transformation Programme (ZMDTP)
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 rounded-full bg-slate-800/80 px-3 py-1 border border-slate-700/60">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Pilot Deployment: <strong>Bulawayo, Zimbabwe</strong></span>
            </span>
            <span className="text-slate-500">•</span>
            <span> </span>
          </div>
        </div>
      </header>

      {/* Main Login Canvas */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl border border-slate-800 bg-slate-900/70 shadow-2xl backdrop-blur-xl overflow-hidden">
          
          {/* Left Hero & Program Overview (5 cols) */}
          <div className="lg:col-span-5 p-6 sm:p-8 bg-gradient-to-br from-[#14243A] to-slate-950 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/10 px-3 py-1 text-[11px] font-semibold text-teal-300 border border-teal-500/20">
                <Sparkles className="h-3.5 w-3.5 text-teal-400" />
                <span>Next-Gen Editorial Platform</span>
              </div>

              <h2 className="mt-4 font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white leading-snug">
                Transforming Newsrooms. Empowering Journalists.
              </h2>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                An integrated newsroom management system and Google Gemini-powered journalism workspace designed for Zimbabwean media houses.
              </p>

              <div className="mt-6 space-y-3 text-xs">
                <div className="flex items-start gap-2.5 text-slate-300">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-teal-500/20 text-teal-400">
                    ✓
                  </div>
                  <span>Strict multi-tenant media organisation workspace isolation.</span>
                </div>
                <div className="flex items-start gap-2.5 text-slate-300">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-teal-500/20 text-teal-400">
                    ✓
                  </div>
                  <span>Real-time audio transcription in English, isiNdebele & Shona.</span>
                </div>
                <div className="flex items-start gap-2.5 text-slate-300">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-teal-500/20 text-teal-400">
                    ✓
                  </div>
                  <span>Fact-anchored AI article assistant & verification checklists.</span>
                </div>
                <div className="flex items-start gap-2.5 text-slate-300">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-teal-500/20 text-teal-400">
                    ✓
                  </div>
                  <span>Multi-stage editorial approval Kanban & immutable audit trail.</span>
                </div>
              </div>
            </div>

            {/* Fictional Pilot Media Partners preview */}
            <div className="mt-8 pt-4 border-t border-slate-800/80">
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                Participating Pilot Media
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {allOrganizations.map((o) => (
                  <span
                    key={o.id}
                    className="rounded-md bg-slate-800/80 px-2 py-0.5 text-[10px] text-slate-300 border border-slate-700/60"
                  >
                    {o.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Form Card (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-10 bg-slate-900/90 flex flex-col justify-center space-y-6">
            <div>
              <h3 className="font-serif text-xl font-bold text-white">Sign In to Newsroom</h3>
              <p className="mt-1 text-xs text-slate-400">
                Enter your authorized credentials to access the editorial workspace.
              </p>
            </div>

            {/* Quick Admin Credentials Helper Box */}
            <div className="rounded-2xl border border-teal-500/30 bg-teal-950/30 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white shrink-0">
                  <KeyRound className="h-4 w-4" />
                </div>
                
              </div>
              <button
                type="button"
                onClick={handleFillAdmin}
                className="rounded-lg bg-teal-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-teal-500 transition shrink-0"
              >
                1-Click Auto Fill
              </button>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="rounded-xl border border-rose-500/40 bg-rose-950/40 p-3 text-xs text-rose-200 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Input */}
              <div>
                <label className="text-xs font-semibold text-slate-300">Username</label>
                <div className="relative mt-1">
                  <UserIcon className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username (admin)"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-teal-500 focus:outline-hidden focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Password Input with show/hide */}
              <div>
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password (admin)"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-2.5 pl-10 pr-10 text-xs text-white placeholder-slate-500 focus:border-teal-500 focus:outline-hidden focus:ring-1 focus:ring-teal-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Select Initial Test Role */}
              <div>
                <label className="text-xs font-semibold text-slate-300">
                  Login Persona / Demonstrated Role
                </label>
                <select
                  value={selectedUserRole}
                  onChange={(e) => setSelectedUserRole(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-hidden"
                >
                  {demoRoles.map((dr) => (
                    <option key={dr.id} value={dr.id}>
                      {dr.role} — {dr.name} ({dr.org})
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-[10px] text-slate-500">
                  You can also switch roles anytime inside the app using the demo switcher.
                </p>
              </div>

              {/* Remember me & forgot */}
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-800 text-teal-600 focus:ring-teal-500"
                  />
                  <span>Remember session on this device</span>
                </label>
                <button
                  type="button"
                  onClick={handleFillAdmin}
                  className="text-teal-400 hover:underline text-[11px]"
                >
                  Reset to default credentials
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 text-xs font-bold text-white shadow-lg shadow-teal-900/40 hover:bg-teal-500 transition disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Authenticating...</span>
                  </span>
                ) : (
                  <>
                    <span>Enter SmartNewsroom Workspace</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 text-center text-[11px] text-slate-500 border-t border-slate-800">
              Bulawayo Digital Transformation Hub • Zimbabwe Media Commission (ZMC) Code Compliant
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/40 py-3 text-center text-xs text-slate-500">
         • Zimbabwe Media Digital Transformation Programme (ZMDTP)
      </footer>
    </div>
  );
};
