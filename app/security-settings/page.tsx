"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getStoredAuth, logout } from "@/lib/auth";
import { adminApi } from "@/lib/api-client";
import { useTheme } from "@/components/theme-provider";
import { BantAIWidget } from "@/components/bantai-widget";
import { isAdmin } from "@/lib/platform-apps";
import { Switch } from "@/components/ui/switch";
import { Sun, Moon } from "lucide-react";
import type { GlobalRole, UpdateUserRequest, UserProfile } from "@itoolbox/ui/types";

/* ── Types ───────────────────────────────────────────────────────────────── */
type Tab = "dashboard" | "users" | "access";

const SIDEBAR_TABS: { id: Tab; label: string; icon: string; desc: string }[] = [
  { id: "dashboard", label: "Dashboard",      icon: "⚙️", desc: "Security overview"     },
  { id: "users",     label: "Users",          icon: "👥", desc: "User management"       },
  { id: "access",    label: "Access Control", icon: "🔑", desc: "What each role can do" },
];

/* ── Roles — itoolbox-backend's four, highest first ──────────────────────── */
const ROLES: GlobalRole[] = ["super_admin", "admin", "analyst", "viewer"];

const ROLE_LABELS: Record<GlobalRole, string> = {
  super_admin: "Super Admin",
  admin:       "Admin",
  analyst:     "Analyst",
  viewer:      "Viewer",
};

const ROLE_DESCRIPTIONS: Record<GlobalRole, string> = {
  super_admin: "Full platform control — manages users, admins, and every module",
  admin:       "Manages users and model checks; sees everyone's investigations",
  analyst:     "Asks BantAI and runs read-only SQL on connected data",
  viewer:      "Asks BantAI and reads its own investigations",
};

const ROLE_COLORS: Record<GlobalRole, string> = {
  super_admin: "bg-red-500/20    text-red-500 dark:text-red-400       border-red-500/30",
  admin:       "bg-orange-500/20 text-orange-500 dark:text-orange-400 border-orange-500/30",
  analyst:     "bg-blue-500/20   text-blue-500 dark:text-blue-400     border-blue-500/30",
  viewer:      "bg-slate-500/20  text-slate-500 dark:text-slate-400   border-slate-500/30",
};

const ROLE_HEX: Record<GlobalRole, string> = {
  super_admin: "#f87171",
  admin:       "#fb923c",
  analyst:     "#60a5fa",
  viewer:      "#94a3b8",
};

// What the backend enforces per role (modules/*/router.py), for the Access tab.
const PERMISSIONS: { label: string; roles: GlobalRole[] }[] = [
  { label: "Ask BantAI, read own investigations", roles: ["super_admin", "admin", "analyst", "viewer"] },
  { label: "Browse data sources",                 roles: ["super_admin", "admin", "analyst", "viewer"] },
  { label: "Run read-only SQL on connected data", roles: ["super_admin", "admin", "analyst"] },
  { label: "See everyone's investigations",       roles: ["super_admin", "admin"] },
  { label: "Check model credentials",             roles: ["super_admin", "admin"] },
  { label: "Manage users",                        roles: ["super_admin", "admin"] },
  { label: "Security Settings and Docs",          roles: ["super_admin", "admin"] },
  { label: "Grant Super Admin",                   roles: ["super_admin"] },
];

// itoolbox-backend's CreateUserRequest minimum.
const MIN_PASSWORD = 10;

const INPUT_CLS = "w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm placeholder-gray-300 dark:placeholder-white/20 focus:outline-none focus:border-slate-400/50";
const SELECT_CLS = "w-full bg-white dark:bg-[#0a0f1e] border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-slate-400/50";
const MODAL_CLS = "bg-white dark:bg-[#0c1326] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-y-auto max-h-[90vh]";

/* ── Small components ────────────────────────────────────────────────────── */
function RoleBadge({ role }: { role: string }) {
  const cls = ROLE_COLORS[role as GlobalRole] ?? "bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white/50 border-gray-200 dark:border-white/20";
  const label = ROLE_LABELS[role as GlobalRole] ?? role;
  return (
    <span className={`inline-block text-[10px] font-black px-2 py-0.5 rounded-full border ${cls}`}>
      {label}
    </span>
  );
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: () => void; label?: string }) {
  return (
    <button type="button" onClick={onChange} aria-label={label ?? (on ? "Disable" : "Enable")}
      className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${on ? "bg-slate-500" : "bg-gray-200 dark:bg-white/10"}`}>
      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${on ? "translate-x-4" : "translate-x-0.5"}`}/>
    </button>
  );
}

/* ── Edit user modal ─────────────────────────────────────────────────────── */
function EditUserModal({
  user, canGrantSuperAdmin, onClose, onSave,
}: {
  user: UserProfile;
  canGrantSuperAdmin: boolean;
  onClose: () => void;
  onSave: (u: UserProfile) => void;
}) {
  const [form, setForm] = useState({
    full_name:   user.full_name ?? "",
    global_role: user.global_role as GlobalRole,
    is_active:   user.is_active,
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  async function handleSave() {
    setSaving(true);
    setError("");
    // Send only what changed: resending an unchanged super_admin role is a
    // grant the API refuses from a plain admin.
    const changes: UpdateUserRequest = {};
    if (form.full_name !== (user.full_name ?? "")) changes.full_name = form.full_name;
    if (form.global_role !== user.global_role) changes.global_role = form.global_role;
    if (form.is_active !== user.is_active) changes.is_active = form.is_active;
    try {
      const updated = await adminApi.updateUser(user.id, changes);
      onSave(updated);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={MODAL_CLS}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-white/10">
          <div className="min-w-0">
            <h3 className="text-gray-900 dark:text-white font-black text-sm">Edit User</h3>
            <p className="text-gray-400 dark:text-white/40 text-[11px] truncate">{user.email}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="text-gray-400 dark:text-white/30 hover:text-gray-900 dark:hover:text-white transition-colors text-lg leading-none">✕</button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label htmlFor="edit-full-name" className="text-gray-500 dark:text-white/50 text-[11px] mb-1 block">Full Name</label>
            <input id="edit-full-name" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
              className={INPUT_CLS}/>
          </div>

          <div>
            <label htmlFor="edit-role" className="text-gray-500 dark:text-white/50 text-[11px] mb-1 block">Global Role</label>
            <select id="edit-role" value={form.global_role} onChange={e => setForm(f => ({ ...f, global_role: e.target.value as GlobalRole }))}
              className={SELECT_CLS}>
              {ROLES.filter(r => r !== "super_admin" || canGrantSuperAdmin || user.global_role === "super_admin").map(r =>
                <option key={r} value={r} title={ROLE_DESCRIPTIONS[r]}>{ROLE_LABELS[r]}</option>)}
            </select>
            <p className="text-gray-400 dark:text-white/30 text-[10px] mt-1">{ROLE_DESCRIPTIONS[form.global_role]}</p>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-gray-200 dark:border-white/[0.06]">
            <span className="text-gray-600 dark:text-white/60 text-xs pt-3">Account Active</span>
            <div className="pt-3">
              <Toggle on={form.is_active} onChange={() => setForm(f => ({ ...f, is_active: !f.is_active }))}/>
            </div>
          </div>

          {error && <p className="text-red-500 dark:text-red-400 text-xs bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/50 text-xs hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-white/30 transition-colors">
              Cancel
            </button>
            <button type="button" onClick={handleSave} disabled={saving}
              className="flex-1 py-2 rounded-lg bg-slate-600 hover:bg-slate-500 text-white text-xs font-black transition-colors disabled:opacity-50">
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Create user modal ───────────────────────────────────────────────────── */
function CreateUserModal({
  canGrantSuperAdmin, onClose, onCreate,
}: {
  canGrantSuperAdmin: boolean;
  onClose: () => void;
  onCreate: (u: UserProfile) => void;
}) {
  const [form, setForm] = useState({ full_name: "", email: "", password: "", global_role: "analyst" as GlobalRole });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  async function handleCreate() {
    if (!form.full_name || !form.email || !form.password) { setError("All fields are required"); return; }
    if (form.password.length < MIN_PASSWORD) { setError(`Password must be at least ${MIN_PASSWORD} characters`); return; }
    setSaving(true);
    setError("");
    try {
      const created = await adminApi.createUser(form);
      onCreate(created);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Create failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={MODAL_CLS}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-white/10">
          <h3 className="text-gray-900 dark:text-white font-black text-sm">Create User</h3>
          <button type="button" onClick={onClose} aria-label="Close" className="text-gray-400 dark:text-white/30 hover:text-gray-900 dark:hover:text-white transition-colors text-lg leading-none">✕</button>
        </div>
        <div className="p-5 space-y-4">
          {[
            { key: "full_name", label: "Full Name", type: "text",     placeholder: "Juan dela Cruz"                   },
            { key: "email",     label: "Email",     type: "email",    placeholder: "juan@company.com"                 },
            { key: "password",  label: "Password",  type: "password", placeholder: `min. ${MIN_PASSWORD} characters` },
          ].map(f => (
            <div key={f.key}>
              <label htmlFor={`create-${f.key}`} className="text-gray-500 dark:text-white/50 text-[11px] mb-1 block">{f.label}</label>
              <input id={`create-${f.key}`} type={f.type} placeholder={f.placeholder}
                autoComplete={f.key === "password" ? "new-password" : "off"}
                value={form[f.key as "full_name" | "email" | "password"]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                className={INPUT_CLS}/>
            </div>
          ))}
          <div>
            <label htmlFor="create-role" className="text-gray-500 dark:text-white/50 text-[11px] mb-1 block">Global Role</label>
            <select id="create-role" value={form.global_role} onChange={e => setForm(p => ({ ...p, global_role: e.target.value as GlobalRole }))}
              className={SELECT_CLS}>
              {ROLES.filter(r => r !== "super_admin" || canGrantSuperAdmin).map(r =>
                <option key={r} value={r} title={ROLE_DESCRIPTIONS[r]}>{ROLE_LABELS[r]}</option>)}
            </select>
            <p className="text-gray-400 dark:text-white/30 text-[10px] mt-1">{ROLE_DESCRIPTIONS[form.global_role]}</p>
          </div>

          {error && <p className="text-red-500 dark:text-red-400 text-xs bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/50 text-xs hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-white/30 transition-colors">
              Cancel
            </button>
            <button type="button" onClick={handleCreate} disabled={saving}
              className="flex-1 py-2 rounded-lg bg-slate-600 hover:bg-slate-500 text-white text-xs font-black transition-colors disabled:opacity-50">
              {saving ? "Creating…" : "Create User"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────────────────── */
export default function SecurityPage() {
  const router = useRouter();
  const { dark, toggleTheme } = useTheme();
  const [activeUser, setActiveUser] = useState<UserProfile | null>(null);
  const [tab,         setTab]        = useState<Tab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* users */
  const [users,        setUsers]        = useState<UserProfile[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError,   setUsersError]   = useState("");
  const [editingUser,  setEditingUser]  = useState<UserProfile | null>(null);
  const [creating,     setCreating]     = useState(false);
  const [search,       setSearch]       = useState("");
  const [roleFilter,   setRoleFilter]   = useState("all");

  /* auth guard */
  useEffect(() => {
    const { token, user } = getStoredAuth();
    if (!token) { router.replace("/login?page=secure"); return; }
    if (!isAdmin(user)) { router.replace("/dashboard"); return; }
    setActiveUser(user);
  }, [router]);

  /* load users */
  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    setUsersError("");
    try {
      setUsers(await adminApi.listUsers());
    } catch (e: unknown) {
      setUsersError(e instanceof Error ? e.message : "Failed to load users");
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeUser) loadUsers();
  }, [activeUser, loadUsers]);

  function replaceUser(updated: UserProfile) {
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
  }

  async function toggleActive(u: UserProfile) {
    setUsersError("");
    try {
      replaceUser(await adminApi.updateUser(u.id, { is_active: !u.is_active }));
    } catch (e: unknown) {
      setUsersError(e instanceof Error ? e.message : "Update failed");
    }
  }

  if (!activeUser) return null;

  const canGrantSuperAdmin = activeUser.global_role === "super_admin";

  const q = search.toLowerCase();
  const filteredUsers = users.filter(u =>
    (!q || (u.full_name ?? "").toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) &&
    (roleFilter === "all" || u.global_role === roleFilter)
  );

  const stats = {
    total:  users.length,
    active: users.filter(u => u.is_active).length,
    admins: users.filter(u => isAdmin(u)).length,
  };

  const card = "bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.07] rounded-xl";

  return (
    <div className={`min-h-screen flex transition-colors ${dark ? "bg-[#0a0f1e]" : "bg-gray-50"}`}>

      {/* modals */}
      {editingUser && (
        <EditUserModal user={editingUser} canGrantSuperAdmin={canGrantSuperAdmin}
          onClose={() => setEditingUser(null)}
          onSave={u => { replaceUser(u); setEditingUser(null); }}/>
      )}
      {creating && (
        <CreateUserModal canGrantSuperAdmin={canGrantSuperAdmin}
          onClose={() => setCreating(false)}
          onCreate={u => { setUsers(prev => [u, ...prev]); setCreating(false); }}/>
      )}

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 flex flex-col transition-transform transition-colors ${dark ? "bg-[#0c1326] border-r border-white/[0.06]" : "bg-white border-r border-gray-200"} ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 md:static md:flex`}>

        <div className={`flex items-center gap-3 px-5 py-5 border-b ${dark ? "border-white/[0.06]" : "border-gray-200"}`}>
          <div className="w-8 h-8 bg-slate-500/20 rounded-lg flex items-center justify-center text-lg shrink-0">🔒</div>
          <div className="min-w-0">
            <p className="text-gray-900 dark:text-white font-black text-sm">Security Settings</p>
            <p className="text-slate-500 dark:text-slate-400/60 text-[10px]">Admin Control Center</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {SIDEBAR_TABS.map(t => (
            <button key={t.id} type="button"
              onClick={() => { setTab(t.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                tab === t.id
                  ? dark ? "bg-slate-500/20 text-white" : "bg-slate-100 text-gray-900"
                  : dark ? "text-white/40 hover:text-white/70 hover:bg-white/5" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              }`}>
              <span className="text-base shrink-0">{t.icon}</span>
              <div className="min-w-0">
                <p className="text-xs font-black">{t.label}</p>
                <p className="text-[10px] opacity-60 truncate">{t.desc}</p>
              </div>
            </button>
          ))}
        </nav>

        <div className={`p-4 border-t space-y-3 ${dark ? "border-white/[0.06]" : "border-gray-200"}`}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-slate-500/30 flex items-center justify-center shrink-0">
              <span className="text-[11px] text-slate-600 dark:text-slate-300 font-black">
                {(activeUser.full_name || "A")[0].toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-gray-900 dark:text-white text-xs font-black truncate">{activeUser.full_name || "Admin"}</p>
              <RoleBadge role={activeUser.global_role}/>
            </div>
          </div>
          <label className="flex items-center justify-between gap-2 px-1 cursor-pointer" title="Toggle theme">
            <span className="flex items-center gap-1.5 text-[10px] text-gray-400 dark:text-white/40">
              {dark ? <Moon className="size-3.5" /> : <Sun className="size-3.5" />}
              {dark ? "Dark" : "Light"} mode
            </span>
            <Switch checked={dark} onCheckedChange={() => toggleTheme()} className="scale-90" />
          </label>
          <div className="flex gap-2">
            <Link href="/dashboard" className="flex-1 text-center text-[10px] text-gray-400 dark:text-white/30 hover:text-gray-700 dark:hover:text-white/60 py-1.5 border border-gray-200 dark:border-white/[0.06] rounded-lg transition-colors">
              Dashboard
            </Link>
            <button type="button" onClick={() => logout()}
              className="flex-1 text-[10px] text-gray-400 dark:text-white/30 hover:text-red-500 dark:hover:text-red-400 py-1.5 border border-gray-200 dark:border-white/[0.06] rounded-lg transition-colors">
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* sidebar overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)}/>
      )}

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* top bar */}
        <header className={`flex items-center gap-3 px-5 py-4 border-b shrink-0 ${dark ? "border-white/[0.06] bg-black/20" : "border-gray-200 bg-white/90"}`}>
          <button type="button" onClick={() => setSidebarOpen(o => !o)} aria-label="Open menu"
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white text-lg">
            ☰
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-gray-900 dark:text-white font-black">{SIDEBAR_TABS.find(t => t.id === tab)?.label}</p>
            <p className="text-gray-400 dark:text-white/30 text-[11px]">{SIDEBAR_TABS.find(t => t.id === tab)?.desc}</p>
          </div>
        </header>

        {/* content */}
        <main className="flex-1 overflow-y-auto p-5 space-y-4 text-gray-900 dark:text-white">

          {/* ── DASHBOARD ─────────────────────────────────────────────── */}
          {tab === "dashboard" && (
            <>
              {/* KPI row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Total Users", value: stats.total,                color: "#94a3b8", icon: "👥" },
                  { label: "Active",      value: stats.active,               color: "#22c55e", icon: "✅" },
                  { label: "Inactive",    value: stats.total - stats.active, color: "#f87171", icon: "⏸️" },
                  { label: "Admins",      value: stats.admins,               color: "#f59e0b", icon: "🔑" },
                ].map(k => (
                  <div key={k.label} className={`${card} p-4`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xl">{k.icon}</span>
                      {usersLoading && (
                        <div className="w-3 h-3 border border-gray-300 dark:border-white/20 border-t-gray-600 dark:border-t-white/60 rounded-full animate-spin"/>
                      )}
                    </div>
                    <p className="text-2xl font-black" style={{ color: k.color }}>{k.value}</p>
                    <p className="text-gray-400 dark:text-white/40 text-[11px] mt-0.5">{k.label}</p>
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Role distribution */}
                <div className={`${card} p-4`}>
                  <p className="text-gray-500 dark:text-white/50 text-[11px] font-black uppercase tracking-widest mb-3">Role Distribution</p>
                  <div className="space-y-2.5">
                    {ROLES.map(r => ({ role: r, count: users.filter(u => u.global_role === r).length })).map(({ role, count }) => (
                      <div key={role} className="flex items-center gap-3">
                        <span className="text-gray-500 dark:text-white/50 text-[11px] w-24 shrink-0">{ROLE_LABELS[role]}</span>
                        <div className="flex-1 h-1.5 bg-gray-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all"
                            style={{ width: `${stats.total ? (count / stats.total) * 100 : 0}%`, background: ROLE_HEX[role] }}/>
                        </div>
                        <span className="text-gray-400 dark:text-white/40 text-[11px] w-4 text-right">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Security status */}
                <div className={`${card} p-4`}>
                  <p className="text-gray-500 dark:text-white/50 text-[11px] font-black uppercase tracking-widest mb-3">Security Status</p>
                  <div className="space-y-2.5">
                    {[
                      { label: "Auth Method",     value: "Signed JWT, bearer header", ok: true  },
                      { label: "Password Policy", value: `${MIN_PASSWORD}+ characters`, ok: true },
                      { label: "Rate Limiting",   value: "Login and password change", ok: true  },
                      { label: "Role Gating",     value: "Checked on every route",    ok: true  },
                      { label: "SQL Guard",       value: "Read-only, per query",      ok: true  },
                      { label: "Audit Logging",   value: "Not yet",                   ok: false },
                      { label: "2FA",             value: "Not configured",            ok: false },
                    ].map(s => (
                      <div key={s.label} className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-white/50 text-xs">{s.label}</span>
                        <span className={`text-[10px] font-bold ${s.ok ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-yellow-400"}`}>
                          {s.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── USERS ─────────────────────────────────────────────────── */}
          {tab === "users" && (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name or email…" aria-label="Search users"
                  className={`${INPUT_CLS} flex-1 min-w-[160px] w-auto`}/>
                <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
                  aria-label="Filter by role"
                  className="bg-white dark:bg-[#0a0f1e] border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-slate-400/50 shrink-0">
                  <option value="all">All roles</option>
                  {ROLES.map(r => <option key={r} value={r} title={ROLE_DESCRIPTIONS[r]}>{ROLE_LABELS[r]}</option>)}
                </select>
                <button type="button" onClick={() => setCreating(true)}
                  className="flex items-center gap-1.5 bg-slate-600 hover:bg-slate-500 text-white text-xs font-black px-3 py-2 rounded-lg transition-colors shrink-0">
                  + Add User
                </button>
                <button type="button" onClick={loadUsers} disabled={usersLoading}
                  className="text-gray-400 dark:text-white/30 hover:text-gray-900 dark:hover:text-white text-base px-2 py-1.5 transition-colors disabled:opacity-30"
                  title="Refresh" aria-label="Refresh">
                  ↺
                </button>
              </div>

              {usersError && (
                <p className="text-red-500 dark:text-red-400 text-xs bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-xl">{usersError}</p>
              )}

              {usersLoading && !users.length ? (
                <div className="text-center py-16 text-gray-400 dark:text-white/30 text-sm">Loading users…</div>
              ) : (
                <div className={`${card} overflow-x-auto`}>
                  <table className="w-full text-left min-w-[640px]">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-white/[0.06] text-[10px] text-gray-400 dark:text-white/30 font-black uppercase tracking-widest">
                        <th className="px-4 py-3 w-56">User</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3 text-center w-20">Status</th>
                        <th className="px-4 py-3 text-center w-48">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
                      {filteredUsers.map(u => (
                        <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                          <td className="px-4 py-3">
                            <p className="text-gray-900 dark:text-white text-sm font-medium truncate">{u.full_name || "—"}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <RoleBadge role={u.global_role}/>
                              <span className="text-gray-300 dark:text-white/20 text-[10px] font-mono hidden sm:block">{u.id.slice(0, 8)}…</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-gray-500 dark:text-white/50 text-xs font-mono truncate max-w-[220px] block">{u.email}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-[10px] font-bold ${u.is_active ? "text-green-600 dark:text-green-400" : "text-red-500/70 dark:text-red-400/60"}`}>
                              {u.is_active ? "Active" : "Off"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1 justify-center flex-wrap">
                              <button type="button" onClick={() => setEditingUser(u)}
                                className="text-[10px] text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white px-2 py-1 rounded border border-gray-200 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/30 transition-colors">
                                Edit
                              </button>
                              {u.id !== activeUser.id && (
                                <button type="button" onClick={() => toggleActive(u)}
                                  className={`text-[10px] px-2 py-1 rounded border transition-colors ${
                                    u.is_active
                                      ? "text-red-500/70 dark:text-red-400/60 border-red-500/20 hover:border-red-500/50 hover:text-red-500 dark:hover:text-red-400"
                                      : "text-green-600/70 dark:text-green-400/60 border-green-500/20 hover:border-green-500/50 hover:text-green-600 dark:hover:text-green-400"
                                  }`}>
                                  {u.is_active ? "Deactivate" : "Activate"}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {!filteredUsers.length && !usersLoading && (
                        <tr><td colSpan={4} className="text-center py-10 text-gray-400 dark:text-white/30 text-sm">
                          {search ? "No users match your search" : "No users found"}
                        </td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* ── ACCESS CONTROL ────────────────────────────────────────── */}
          {tab === "access" && (
            <>
              <p className="text-gray-500 dark:text-white/40 text-xs">
                Access follows each user&apos;s role, enforced by the API on every request. Change a user&apos;s role under Users.
              </p>

              <div className={`${card} overflow-x-auto`}>
                <table className="w-full text-left min-w-[600px]">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-white/[0.06]">
                      <th className="text-[10px] text-gray-400 dark:text-white/30 font-black uppercase tracking-widest px-4 py-3">Capability</th>
                      {ROLES.map(r => (
                        <th key={r} className="text-[10px] font-black uppercase tracking-widest px-4 py-3 text-center" style={{ color: ROLE_HEX[r] }}>
                          {ROLE_LABELS[r]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
                    {PERMISSIONS.map(p => (
                      <tr key={p.label} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3 text-xs text-gray-700 dark:text-white/80">{p.label}</td>
                        {ROLES.map(r => (
                          <td key={r} className="px-4 py-3 text-center text-sm">
                            {p.roles.includes(r)
                              ? <span className="text-green-600 dark:text-green-400" aria-label="Allowed">✓</span>
                              : <span className="text-gray-300 dark:text-white/15" aria-label="Not allowed">—</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {ROLES.map(r => (
                  <div key={r} className={`${card} p-4`}>
                    <RoleBadge role={r}/>
                    <p className="text-gray-500 dark:text-white/50 text-[11px] mt-2 leading-relaxed">{ROLE_DESCRIPTIONS[r]}</p>
                    <p className="text-gray-400 dark:text-white/30 text-[10px] mt-2">
                      {users.filter(u => u.global_role === r).length} user{users.filter(u => u.global_role === r).length === 1 ? "" : "s"}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
      <BantAIWidget/>
    </div>
  );
}
