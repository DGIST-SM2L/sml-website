"use client";

import { useState, useEffect, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────────
type Publication = {
  year: number;
  authors: string;
  title: string;
  journal: string;
  volume: string;
  doi: string;
  featured?: boolean;
};

type Member = {
  name: string;
  position: string;
  research: string;
  education: string;
  photo: string;
};

type Alumni = {
  name: string;
  position: string;
  currentAffiliation?: string;
};

type MembersData = {
  pi: {
    name: string;
    nameKo: string;
    title: string;
    department: string;
    email: string;
    phone: string;
    office: string;
    photo: string;
    education: { degree: string; field: string; institution: string; years: string }[];
    experience: { role: string; institution: string; years: string }[];
    awards: { name: string; year: number | string }[];
  };
  members: Member[];
  alumni: Alumni[];
};

type ResearchTopic = { title: string; description: string; image?: string };
type ResearchCategory = {
  id: string;
  title: string;
  description: string;
  topics: ResearchTopic[];
};
type ResearchData = { categories: ResearchCategory[] };

type NewsItem = {
  id: string;
  date: string;
  title: string;
  content: string;
  category: string;
  image: string | null;
  pinned: boolean;
};

type GalleryItem = {
  id: string;
  src: string;
  caption: string;
  album: string;
  date: string;
};

type Tab = "publications" | "members" | "research" | "news" | "gallery";

// ─── Helper ──────────────────────────────────────────────────────
async function api(path: string, options?: RequestInit) {
  const res = await fetch(path, { ...options, credentials: "include" });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return res.json();
}

// ─── Login Screen ────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      sessionStorage.setItem("admin_auth", "true");
      onLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl bg-white p-8 shadow-lg"
      >
        <h1 className="mb-6 text-2xl font-bold text-slate-900">Admin Login</h1>
        {error && (
          <p className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="mb-4 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          autoFocus
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}

// ─── Publications Tab ────────────────────────────────────────────
function PublicationsTab({
  data,
  onChange,
}: {
  data: Publication[];
  onChange: (d: Publication[]) => void;
}) {
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState<Publication>({
    year: new Date().getFullYear(),
    authors: "",
    title: "",
    journal: "",
    volume: "",
    doi: "",
    featured: false,
  });

  const sorted = [...data].sort((a, b) => b.year - a.year);

  const resetForm = () => {
    setForm({
      year: new Date().getFullYear(),
      authors: "",
      title: "",
      journal: "",
      volume: "",
      doi: "",
      featured: false,
    });
    setEditing(null);
  };

  const handleSave = () => {
    if (!form.title || !form.authors) return;
    if (editing !== null) {
      const updated = data.map((p, i) => (i === editing ? form : p));
      onChange(updated);
    } else {
      onChange([form, ...data]);
    }
    resetForm();
  };

  const handleEdit = (idx: number) => {
    const original = data.indexOf(sorted[idx]);
    setEditing(original);
    setForm({ ...sorted[idx] });
  };

  const handleDelete = (idx: number) => {
    const original = data.indexOf(sorted[idx]);
    onChange(data.filter((_, i) => i !== original));
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold">
          {editing !== null ? "Edit Publication" : "Add Publication"}
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            type="number"
            placeholder="Year"
            value={form.year}
            onChange={(e) => setForm({ ...form, year: +e.target.value })}
            className="rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <input
            placeholder="DOI / URL"
            value={form.doi}
            onChange={(e) => setForm({ ...form, doi: e.target.value })}
            className="rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <input
            placeholder="Authors"
            value={form.authors}
            onChange={(e) => setForm({ ...form, authors: e.target.value })}
            className="col-span-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="col-span-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <input
            placeholder="Journal"
            value={form.journal}
            onChange={(e) => setForm({ ...form, journal: e.target.value })}
            className="rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <input
            placeholder="Volume"
            value={form.volume}
            onChange={(e) => setForm({ ...form, volume: e.target.value })}
            className="rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <label className="col-span-full flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.featured || false}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
            />
            Featured publication
          </label>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={handleSave}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            {editing !== null ? "Update" : "Add"}
          </button>
          {editing !== null && (
            <button
              onClick={resetForm}
              className="rounded border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {sorted.map((pub, i) => (
          <div
            key={i}
            className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-900">
                {pub.featured && (
                  <span className="mr-2 inline-block rounded bg-yellow-100 px-1.5 py-0.5 text-xs text-yellow-700">
                    Featured
                  </span>
                )}
                {pub.title}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {pub.authors}
              </p>
              <p className="text-xs text-slate-400">
                {pub.journal}, {pub.volume} ({pub.year})
              </p>
            </div>
            <div className="flex shrink-0 gap-1">
              <button
                onClick={() => handleEdit(i)}
                className="rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(i)}
                className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Members Tab ─────────────────────────────────────────────────
function MembersTab({
  data,
  onChange,
}: {
  data: MembersData;
  onChange: (d: MembersData) => void;
}) {
  const [editingMember, setEditingMember] = useState<number | null>(null);
  const [memberForm, setMemberForm] = useState<Member>({
    name: "",
    position: "",
    research: "",
    education: "",
    photo: "",
  });

  const [piForm, setPiForm] = useState(data.pi);
  const [showPiEdit, setShowPiEdit] = useState(false);

  useEffect(() => {
    setPiForm(data.pi);
  }, [data.pi]);

  const savePi = () => {
    onChange({ ...data, pi: piForm });
    setShowPiEdit(false);
  };

  const resetMemberForm = () => {
    setMemberForm({ name: "", position: "", research: "", education: "", photo: "" });
    setEditingMember(null);
  };

  const saveMember = () => {
    if (!memberForm.name) return;
    if (editingMember !== null) {
      const updated = data.members.map((m, i) =>
        i === editingMember ? memberForm : m
      );
      onChange({ ...data, members: updated });
    } else {
      onChange({ ...data, members: [...data.members, memberForm] });
    }
    resetMemberForm();
  };

  const deleteMember = (idx: number) => {
    onChange({ ...data, members: data.members.filter((_, i) => i !== idx) });
  };

  const moveToAlumni = (idx: number) => {
    const member = data.members[idx];
    const alumnus: Alumni = {
      name: member.name,
      position: member.position,
    };
    onChange({
      ...data,
      members: data.members.filter((_, i) => i !== idx),
      alumni: [...data.alumni, alumnus],
    });
  };

  const removeAlumni = (idx: number) => {
    onChange({ ...data, alumni: data.alumni.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-6">
      {/* PI Section */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Principal Investigator</h3>
          <button
            onClick={() => setShowPiEdit(!showPiEdit)}
            className="text-sm text-blue-600 hover:underline"
          >
            {showPiEdit ? "Cancel" : "Edit"}
          </button>
        </div>
        {showPiEdit ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input
              placeholder="Name"
              value={piForm.name}
              onChange={(e) => setPiForm({ ...piForm, name: e.target.value })}
              className="rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            <input
              placeholder="Name (Korean)"
              value={piForm.nameKo}
              onChange={(e) => setPiForm({ ...piForm, nameKo: e.target.value })}
              className="rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            <input
              placeholder="Title"
              value={piForm.title}
              onChange={(e) => setPiForm({ ...piForm, title: e.target.value })}
              className="rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            <input
              placeholder="Department"
              value={piForm.department}
              onChange={(e) =>
                setPiForm({ ...piForm, department: e.target.value })
              }
              className="rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            <input
              placeholder="Email"
              value={piForm.email}
              onChange={(e) => setPiForm({ ...piForm, email: e.target.value })}
              className="rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            <input
              placeholder="Phone"
              value={piForm.phone}
              onChange={(e) => setPiForm({ ...piForm, phone: e.target.value })}
              className="rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            <input
              placeholder="Office"
              value={piForm.office}
              onChange={(e) => setPiForm({ ...piForm, office: e.target.value })}
              className="rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            <input
              placeholder="Photo path"
              value={piForm.photo}
              onChange={(e) => setPiForm({ ...piForm, photo: e.target.value })}
              className="rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />

            {/* Education */}
            <div className="col-span-full mt-2">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-700">Education</h4>
                <button
                  onClick={() =>
                    setPiForm({
                      ...piForm,
                      education: [
                        ...piForm.education,
                        { degree: "", field: "", institution: "", years: "" },
                      ],
                    })
                  }
                  className="text-xs text-blue-600 hover:underline"
                >
                  + Add
                </button>
              </div>
              <div className="space-y-2">
                {piForm.education.map((edu, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      placeholder="Degree (e.g. Ph.D.)"
                      value={edu.degree}
                      onChange={(e) => {
                        const updated = [...piForm.education];
                        updated[i] = { ...edu, degree: e.target.value };
                        setPiForm({ ...piForm, education: updated });
                      }}
                      className="w-24 rounded border border-slate-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                    />
                    <input
                      placeholder="Field"
                      value={edu.field}
                      onChange={(e) => {
                        const updated = [...piForm.education];
                        updated[i] = { ...edu, field: e.target.value };
                        setPiForm({ ...piForm, education: updated });
                      }}
                      className="flex-1 rounded border border-slate-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                    />
                    <input
                      placeholder="Institution"
                      value={edu.institution}
                      onChange={(e) => {
                        const updated = [...piForm.education];
                        updated[i] = { ...edu, institution: e.target.value };
                        setPiForm({ ...piForm, education: updated });
                      }}
                      className="flex-1 rounded border border-slate-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                    />
                    <input
                      placeholder="Years"
                      value={edu.years}
                      onChange={(e) => {
                        const updated = [...piForm.education];
                        updated[i] = { ...edu, years: e.target.value };
                        setPiForm({ ...piForm, education: updated });
                      }}
                      className="w-24 rounded border border-slate-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        const updated = piForm.education.filter((_, j) => j !== i);
                        setPiForm({ ...piForm, education: updated });
                      }}
                      className="text-red-400 hover:text-red-600"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div className="col-span-full mt-2">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-700">Experience</h4>
                <button
                  onClick={() =>
                    setPiForm({
                      ...piForm,
                      experience: [
                        ...piForm.experience,
                        { role: "", institution: "", years: "" },
                      ],
                    })
                  }
                  className="text-xs text-blue-600 hover:underline"
                >
                  + Add
                </button>
              </div>
              <div className="space-y-2">
                {piForm.experience.map((exp, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      placeholder="Role"
                      value={exp.role}
                      onChange={(e) => {
                        const updated = [...piForm.experience];
                        updated[i] = { ...exp, role: e.target.value };
                        setPiForm({ ...piForm, experience: updated });
                      }}
                      className="w-28 rounded border border-slate-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                    />
                    <input
                      placeholder="Institution"
                      value={exp.institution}
                      onChange={(e) => {
                        const updated = [...piForm.experience];
                        updated[i] = { ...exp, institution: e.target.value };
                        setPiForm({ ...piForm, experience: updated });
                      }}
                      className="flex-1 rounded border border-slate-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                    />
                    <input
                      placeholder="Years"
                      value={exp.years}
                      onChange={(e) => {
                        const updated = [...piForm.experience];
                        updated[i] = { ...exp, years: e.target.value };
                        setPiForm({ ...piForm, experience: updated });
                      }}
                      className="w-24 rounded border border-slate-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        const updated = piForm.experience.filter((_, j) => j !== i);
                        setPiForm({ ...piForm, experience: updated });
                      }}
                      className="text-red-400 hover:text-red-600"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Awards */}
            <div className="col-span-full mt-2">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-700">Awards</h4>
                <button
                  onClick={() =>
                    setPiForm({
                      ...piForm,
                      awards: [...piForm.awards, { name: "", year: "" }],
                    })
                  }
                  className="text-xs text-blue-600 hover:underline"
                >
                  + Add
                </button>
              </div>
              <div className="space-y-2">
                {piForm.awards.map((award, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      placeholder="Award name"
                      value={award.name}
                      onChange={(e) => {
                        const updated = [...piForm.awards];
                        updated[i] = { ...award, name: e.target.value };
                        setPiForm({ ...piForm, awards: updated });
                      }}
                      className="flex-1 rounded border border-slate-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                    />
                    <input
                      placeholder="Year"
                      value={String(award.year)}
                      onChange={(e) => {
                        const updated = [...piForm.awards];
                        updated[i] = { ...award, year: e.target.value };
                        setPiForm({ ...piForm, awards: updated });
                      }}
                      className="w-24 rounded border border-slate-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        const updated = piForm.awards.filter((_, j) => j !== i);
                        setPiForm({ ...piForm, awards: updated });
                      }}
                      className="text-red-400 hover:text-red-600"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-full">
              <button
                onClick={savePi}
                className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Save PI Info
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-3 text-sm text-slate-600">
            <p className="font-medium text-slate-900">
              {data.pi.name} ({data.pi.nameKo})
            </p>
            <p>{data.pi.title}</p>
            <p>{data.pi.email}</p>
          </div>
        )}
      </div>

      {/* Add/Edit Member Form */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold">
          {editingMember !== null ? "Edit Member" : "Add Member"}
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            placeholder="Name"
            value={memberForm.name}
            onChange={(e) =>
              setMemberForm({ ...memberForm, name: e.target.value })
            }
            className="rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <input
            placeholder="Position (e.g. Postdoc, Ph.D. student)"
            value={memberForm.position}
            onChange={(e) =>
              setMemberForm({ ...memberForm, position: e.target.value })
            }
            className="rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <input
            placeholder="Research areas"
            value={memberForm.research}
            onChange={(e) =>
              setMemberForm({ ...memberForm, research: e.target.value })
            }
            className="col-span-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <input
            placeholder="Education"
            value={memberForm.education}
            onChange={(e) =>
              setMemberForm({ ...memberForm, education: e.target.value })
            }
            className="rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <input
            placeholder="Photo path (e.g. /images/members/name.jpg)"
            value={memberForm.photo}
            onChange={(e) =>
              setMemberForm({ ...memberForm, photo: e.target.value })
            }
            className="rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={saveMember}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            {editingMember !== null ? "Update" : "Add Member"}
          </button>
          {editingMember !== null && (
            <button
              onClick={resetMemberForm}
              className="rounded border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Current Members */}
      <div>
        <h3 className="mb-3 text-lg font-semibold">
          Current Members ({data.members.length})
        </h3>
        <div className="space-y-2">
          {data.members.map((m, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4"
            >
              <div>
                <p className="text-sm font-medium text-slate-900">{m.name}</p>
                <p className="text-xs text-slate-500">
                  {m.position} &middot; {m.research}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  onClick={() => {
                    setEditingMember(i);
                    setMemberForm({ ...m });
                  }}
                  className="rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => moveToAlumni(i)}
                  className="rounded px-2 py-1 text-xs text-amber-600 hover:bg-amber-50"
                >
                  Move to Alumni
                </button>
                <button
                  onClick={() => deleteMember(i)}
                  className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alumni */}
      {data.alumni.length > 0 && (
        <div>
          <h3 className="mb-3 text-lg font-semibold">
            Alumni ({data.alumni.length})
          </h3>
          <div className="space-y-2">
            {data.alumni.map((a, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">{a.name}</p>
                  <p className="text-xs text-slate-500">{a.position}</p>
                </div>
                <button
                  onClick={() => removeAlumni(i)}
                  className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Research Tab ────────────────────────────────────────────────
function ResearchTab({
  data,
  onChange,
}: {
  data: ResearchData;
  onChange: (d: ResearchData) => void;
}) {
  const [editingCat, setEditingCat] = useState<number | null>(null);
  const [newTopic, setNewTopic] = useState<{ title: string; description: string; image?: string }>({
    title: "",
    description: "",
    image: "",
  });
  const [topicUploading, setTopicUploading] = useState<string | null>(null); // "new" | "ci-ti"

  const uploadTopicImage = async (
    file: File,
    key: string,
    onDone: (url: string) => void
  ) => {
    setTopicUploading(key);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd, credentials: "include" });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      onDone(url);
    } catch {
      alert("Image upload failed");
    } finally {
      setTopicUploading(null);
    }
  };

  const updateCategory = (idx: number, updates: Partial<ResearchCategory>) => {
    const cats = data.categories.map((c, i) =>
      i === idx ? { ...c, ...updates } : c
    );
    onChange({ categories: cats });
  };

  const addTopic = (catIdx: number) => {
    if (!newTopic.title) return;
    const cat = data.categories[catIdx];
    updateCategory(catIdx, { topics: [...cat.topics, { title: newTopic.title, description: newTopic.description, image: newTopic.image || "" }] });
    setNewTopic({ title: "", description: "", image: "" });
  };

  const removeTopic = (catIdx: number, topicIdx: number) => {
    const cat = data.categories[catIdx];
    updateCategory(catIdx, {
      topics: cat.topics.filter((_, i) => i !== topicIdx),
    });
  };

  return (
    <div className="space-y-6">
      {data.categories.map((cat, ci) => (
        <div
          key={cat.id}
          className="rounded-lg border border-slate-200 bg-white p-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {editingCat === ci ? (
                <div className="space-y-3">
                  <input
                    value={cat.title}
                    onChange={(e) =>
                      updateCategory(ci, { title: e.target.value })
                    }
                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm font-semibold focus:border-blue-500 focus:outline-none"
                  />
                  <textarea
                    value={cat.description}
                    onChange={(e) =>
                      updateCategory(ci, { description: e.target.value })
                    }
                    rows={2}
                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    onClick={() => setEditingCat(null)}
                    className="rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {cat.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {cat.description}
                  </p>
                </>
              )}
            </div>
            {editingCat !== ci && (
              <button
                onClick={() => setEditingCat(ci)}
                className="shrink-0 text-sm text-blue-600 hover:underline"
              >
                Edit
              </button>
            )}
          </div>

          <div className="mt-4 space-y-2">
            {cat.topics.map((topic, ti) => (
              <div
                key={ti}
                className="flex items-start justify-between gap-3 rounded border border-slate-100 bg-slate-50 p-3"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">
                    {topic.title}
                  </p>
                  <p className="text-xs text-slate-500">{topic.description}</p>
                  <div className="mt-2 flex items-center gap-3">
                    {topic.image && (
                      <img
                        src={topic.image}
                        alt={topic.title}
                        className="h-14 w-20 rounded object-cover border border-slate-200"
                      />
                    )}
                    <label className="cursor-pointer rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-600 hover:bg-slate-50">
                      {topicUploading === `${ci}-${ti}` ? "Uploading..." : topic.image ? "Change Figure" : "Add Figure"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={topicUploading !== null}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          uploadTopicImage(file, `${ci}-${ti}`, (url) => {
                            const updated = cat.topics.map((t, i) =>
                              i === ti ? { ...t, image: url } : t
                            );
                            updateCategory(ci, { topics: updated });
                          });
                        }}
                      />
                    </label>
                    {topic.image && (
                      <button
                        onClick={() => {
                          const updated = cat.topics.map((t, i) =>
                            i === ti ? { ...t, image: "" } : t
                          );
                          updateCategory(ci, { topics: updated });
                        }}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Remove figure
                      </button>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => removeTopic(ci, ti)}
                  className="shrink-0 rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Add topic */}
          <div className="mt-4 border-t border-slate-100 pt-4">
            <p className="mb-2 text-xs font-medium text-slate-500">
              Add Topic
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                placeholder="Topic title"
                value={newTopic.title}
                onChange={(e) =>
                  setNewTopic({ ...newTopic, title: e.target.value })
                }
                className="rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
              <input
                placeholder="Description"
                value={newTopic.description}
                onChange={(e) =>
                  setNewTopic({ ...newTopic, description: e.target.value })
                }
                className="rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="mt-2 flex items-center gap-3">
              <label className="cursor-pointer rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-600 hover:bg-slate-50">
                {topicUploading === "new" ? "Uploading..." : newTopic.image ? "✓ Figure selected" : "Add Figure"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={topicUploading !== null}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    uploadTopicImage(file, "new", (url) => {
                      setNewTopic((t) => ({ ...t, image: url }));
                    });
                  }}
                />
              </label>
              {newTopic.image && (
                <img src={newTopic.image} alt="preview" className="h-10 w-14 rounded object-cover border border-slate-200" />
              )}
            </div>
            <button
              onClick={() => addTopic(ci)}
              className="mt-2 rounded bg-slate-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700"
            >
              Add Topic
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── News Tab ─────────────────────────────────────────────────────
const NEWS_CATEGORIES = ["Paper", "Award", "Conference", "Member", "General"];

function NewsTab({
  data,
  onChange,
}: {
  data: NewsItem[];
  onChange: (d: NewsItem[]) => void;
}) {
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState<NewsItem>({
    id: "",
    date: new Date().toISOString().split("T")[0],
    title: "",
    content: "",
    category: "General",
    image: null,
    pinned: false,
  });
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(false);

  const sorted = [...data].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.date.localeCompare(a.date);
  });

  const resetForm = () => {
    setForm({
      id: "",
      date: new Date().toISOString().split("T")[0],
      title: "",
      content: "",
      category: "General",
      image: null,
      pinned: false,
    });
    setEditing(null);
    setPreview(false);
  };

  const generateId = (title: string, date: string) => {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40);
    return `${date}-${slug}`;
  };

  const handleSave = () => {
    if (!form.title || !form.content) return;
    const item = {
      ...form,
      id: form.id || generateId(form.title, form.date),
    };
    if (editing !== null) {
      onChange(data.map((n, i) => (i === editing ? item : n)));
    } else {
      onChange([item, ...data]);
    }
    resetForm();
  };

  const handleEdit = (idx: number) => {
    const original = data.indexOf(sorted[idx]);
    setEditing(original);
    setForm({ ...sorted[idx] });
  };

  const handleDelete = (idx: number) => {
    const original = data.indexOf(sorted[idx]);
    onChange(data.filter((_, i) => i !== original));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "news");
      const res = await fetch("/api/upload", { method: "POST", body: fd, credentials: "include" });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      setForm({ ...form, image: url });
    } catch {
      alert("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const renderMarkdownPreview = (text: string) => {
    let html = text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(
        /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
        '<a href="$2" class="text-blue-600 underline">$1</a>'
      );
    const lines = html.split("\n");
    let inList = false;
    const processed: string[] = [];
    for (const line of lines) {
      if (line.trimStart().startsWith("- ")) {
        if (!inList) { processed.push('<ul class="list-disc pl-5 mt-1">'); inList = true; }
        processed.push(`<li>${line.trimStart().slice(2)}</li>`);
      } else {
        if (inList) { processed.push("</ul>"); inList = false; }
        processed.push(line);
      }
    }
    if (inList) processed.push("</ul>");
    return processed.join("\n");
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold">
          {editing !== null ? "Edit News Post" : "Add News Post"}
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            {NEWS_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="col-span-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <div className="col-span-full">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-xs text-slate-500">Content (supports **bold**, [links](url), - lists)</span>
              <button
                type="button"
                onClick={() => setPreview(!preview)}
                className="text-xs text-blue-600 hover:underline"
              >
                {preview ? "Edit" : "Preview"}
              </button>
            </div>
            {preview ? (
              <div
                className="min-h-[120px] rounded border border-slate-200 bg-slate-50 p-3 text-sm"
                dangerouslySetInnerHTML={{ __html: renderMarkdownPreview(form.content) }}
              />
            ) : (
              <textarea
                placeholder="Content (markdown supported)"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={5}
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            )}
          </div>
          <div className="col-span-full flex items-center gap-4">
            <label className="text-sm text-slate-600">
              Image:
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleImageUpload}
                className="ml-2 text-sm"
                disabled={uploading}
              />
            </label>
            {uploading && <span className="text-xs text-slate-500">Uploading...</span>}
            {form.image && (
              <div className="flex items-center gap-2">
                <img src={form.image} alt="" className="h-10 w-10 rounded object-cover" />
                <button
                  onClick={() => setForm({ ...form, image: null })}
                  className="text-xs text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
          <label className="col-span-full flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.pinned}
              onChange={(e) => setForm({ ...form, pinned: e.target.checked })}
            />
            Pin to top
          </label>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={handleSave}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            {editing !== null ? "Update" : "Add"}
          </button>
          {editing !== null && (
            <button
              onClick={resetForm}
              className="rounded border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {sorted.map((item, i) => (
          <div
            key={item.id}
            className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-900">
                {item.pinned && (
                  <span className="mr-2 inline-block rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-700">
                    Pinned
                  </span>
                )}
                <span className="mr-2 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">
                  {item.category}
                </span>
                {item.title}
              </p>
              <p className="mt-1 text-xs text-slate-500">{item.date}</p>
              <p className="mt-1 text-xs text-slate-400 line-clamp-2">{item.content}</p>
            </div>
            <div className="flex shrink-0 gap-1">
              <button
                onClick={() => handleEdit(i)}
                className="rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(i)}
                className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Gallery Tab ──────────────────────────────────────────────────
const GALLERY_ALBUMS = ["Lab Life", "Conference", "Group Photo", "Research", "Event"];

function GalleryTab({
  data,
  onChange,
}: {
  data: GalleryItem[];
  onChange: (d: GalleryItem[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const [album, setAlbum] = useState("Lab Life");
  const [customAlbum, setCustomAlbum] = useState("");
  const [showCustomAlbum, setShowCustomAlbum] = useState(false);

  const existingAlbums = Array.from(
    new Set([...GALLERY_ALBUMS, ...data.map((p) => p.album)])
  );

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const selectedAlbum = showCustomAlbum && customAlbum ? customAlbum : album;
    const newItems: GalleryItem[] = [];

    for (const file of Array.from(files)) {
      try {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", "gallery");
        const res = await fetch("/api/upload", { method: "POST", body: fd, credentials: "include" });
        if (!res.ok) continue;
        const { url } = await res.json();
        newItems.push({
          id: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          src: url,
          caption: caption || file.name.replace(/\.[^.]+$/, ""),
          album: selectedAlbum,
          date: new Date().toISOString().split("T")[0],
        });
      } catch {
        // skip failed uploads
      }
    }

    if (newItems.length > 0) {
      onChange([...newItems, ...data]);
    }
    setUploading(false);
    setCaption("");
    e.target.value = "";
  };

  const handleDelete = (idx: number) => {
    onChange(data.filter((_, i) => i !== idx));
  };

  const updateCaption = (idx: number, newCaption: string) => {
    onChange(data.map((p, i) => (i === idx ? { ...p, caption: newCaption } : p)));
  };

  const updateAlbum = (idx: number, newAlbum: string) => {
    onChange(data.map((p, i) => (i === idx ? { ...p, album: newAlbum } : p)));
  };

  return (
    <div className="space-y-6">
      {/* Upload form */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold">Upload Photos</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            placeholder="Caption (optional, defaults to filename)"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <div className="flex gap-2">
            {showCustomAlbum ? (
              <input
                placeholder="New album name"
                value={customAlbum}
                onChange={(e) => setCustomAlbum(e.target.value)}
                className="flex-1 rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            ) : (
              <select
                value={album}
                onChange={(e) => setAlbum(e.target.value)}
                className="flex-1 rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                {existingAlbums.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            )}
            <button
              type="button"
              onClick={() => setShowCustomAlbum(!showCustomAlbum)}
              className="rounded border border-slate-300 px-3 py-2 text-xs hover:bg-slate-50"
            >
              {showCustomAlbum ? "Existing" : "New Album"}
            </button>
          </div>
          <div className="col-span-full">
            <label className="text-sm text-slate-600">
              Select images (multiple allowed):
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                onChange={handleUpload}
                className="ml-2 text-sm"
                disabled={uploading}
              />
            </label>
            {uploading && <span className="ml-2 text-xs text-slate-500">Uploading...</span>}
          </div>
        </div>
      </div>

      {/* Photo list */}
      <div>
        <h3 className="mb-3 text-lg font-semibold">Photos ({data.length})</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((photo, i) => (
            <div
              key={photo.id}
              className="overflow-hidden rounded-lg border border-slate-200 bg-white"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={photo.src}
                  alt={photo.caption}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-3 space-y-2">
                <input
                  value={photo.caption}
                  onChange={(e) => updateCaption(i, e.target.value)}
                  className="w-full rounded border border-slate-200 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                />
                <div className="flex items-center gap-2">
                  <select
                    value={photo.album}
                    onChange={(e) => updateAlbum(i, e.target.value)}
                    className="flex-1 rounded border border-slate-200 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                  >
                    {existingAlbums.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleDelete(i)}
                    className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
                <p className="text-xs text-slate-400">{photo.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────
function Dashboard() {
  const [tab, setTab] = useState<Tab>("publications");
  const [publications, setPublications] = useState<Publication[]>([]);
  const [members, setMembers] = useState<MembersData | null>(null);
  const [research, setResearch] = useState<ResearchData | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [pubs, mem, res, nws, gal] = await Promise.all([
        api("/api/content/publications"),
        api("/api/content/members"),
        api("/api/content/research"),
        api("/api/content/news"),
        api("/api/content/gallery"),
      ]);
      setPublications(pubs);
      setMembers(mem);
      setResearch(res);
      setNews(nws);
      setGallery(gal);
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to load data",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const markDirty = (type: string) => {
    setDirty((prev) => new Set(prev).add(type));
  };

  const saveAll = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const promises = [];
      if (dirty.has("publications")) {
        promises.push(
          api("/api/content/publications", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(publications),
          })
        );
      }
      if (dirty.has("members") && members) {
        promises.push(
          api("/api/content/members", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(members),
          })
        );
      }
      if (dirty.has("research") && research) {
        promises.push(
          api("/api/content/research", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(research),
          })
        );
      }
      if (dirty.has("news")) {
        promises.push(
          api("/api/content/news", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(news),
          })
        );
      }
      if (dirty.has("gallery")) {
        promises.push(
          api("/api/content/gallery", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(gallery),
          })
        );
      }
      await Promise.all(promises);
      setMessage({ type: "success", text: "Changes saved locally." });
      setDirty(new Set());
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Save failed",
      });
    } finally {
      setSaving(false);
    }
  };

  const commitToGithub = async () => {
    setCommitting(true);
    setMessage(null);
    try {
      const files: Record<string, unknown> = {};
      if (publications) files.publications = publications;
      if (members) files.members = members;
      if (research) files.research = research;
      if (news) files.news = news;
      if (gallery) files.gallery = gallery;

      await api("/api/github/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Update content via admin dashboard",
          files,
        }),
      });
      setMessage({
        type: "success",
        text: "Committed to GitHub. Deploy will start automatically.",
      });
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Commit failed",
      });
    } finally {
      setCommitting(false);
    }
  };

  const logout = () => {
    sessionStorage.removeItem("admin_auth");
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "publications", label: "Publications" },
    { key: "members", label: "Members" },
    { key: "research", label: "Research" },
    { key: "news", label: "News" },
    { key: "gallery", label: "Gallery" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900">
            SML Admin Dashboard
          </h1>
          <div className="flex items-center gap-3">
            {dirty.size > 0 && (
              <span className="text-xs text-amber-600">Unsaved changes</span>
            )}
            <button
              onClick={saveAll}
              disabled={saving || dirty.size === 0}
              className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={commitToGithub}
              disabled={committing}
              className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {committing ? "Committing..." : "Commit & Deploy"}
            </button>
            <button
              onClick={logout}
              className="rounded border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Message */}
      {message && (
        <div
          className={`border-b px-6 py-3 text-sm ${
            message.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          <div className="mx-auto max-w-6xl">{message.text}</div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl gap-0">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`border-b-2 px-6 py-3 text-sm font-medium transition-colors ${
                tab === t.key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-6 py-6">
        {tab === "publications" && (
          <PublicationsTab
            data={publications}
            onChange={(d) => {
              setPublications(d);
              markDirty("publications");
            }}
          />
        )}
        {tab === "members" && members && (
          <MembersTab
            data={members}
            onChange={(d) => {
              setMembers(d);
              markDirty("members");
            }}
          />
        )}
        {tab === "research" && research && (
          <ResearchTab
            data={research}
            onChange={(d) => {
              setResearch(d);
              markDirty("research");
            }}
          />
        )}
        {tab === "news" && (
          <NewsTab
            data={news}
            onChange={(d) => {
              setNews(d);
              markDirty("news");
            }}
          />
        )}
        {tab === "gallery" && (
          <GalleryTab
            data={gallery}
            onChange={(d) => {
              setGallery(d);
              markDirty("gallery");
            }}
          />
        )}
      </div>
    </div>
  );
}

// ─── Page Component ──────────────────────────────────────────────
export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const auth = sessionStorage.getItem("admin_auth");
    setAuthenticated(auth === "true");
    setChecking(false);
  }, []);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  if (!authenticated) {
    return <LoginScreen onLogin={() => setAuthenticated(true)} />;
  }

  return <Dashboard />;
}
