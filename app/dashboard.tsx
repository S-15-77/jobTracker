"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  Check,
  ChevronDown,
  ExternalLink,
  Filter,
  LayoutDashboard,
  Link2,
  Mail,
  MapPin,
  Plus,
  Search,
  Settings,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import type { ApplicationRecord, ApplicationStatus } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const statuses: ApplicationStatus[] = ["Applied", "Interview", "Selected", "Rejected"];
const demoApplications: ApplicationRecord[] = [
  {
    _id: "demo-1",
    company: "Linear",
    role: "Product Designer",
    location: "New York · Hybrid",
    url: "https://linear.app/careers",
    status: "Interview",
    resume: "Product design — v4",
    appliedAt: "2026-09-27T00:00:00.000Z",
    referral: { email: "maya@linear.app", referred: true },
  },
  {
    _id: "demo-2",
    company: "Vercel",
    role: "Senior Frontend Engineer",
    location: "Remote",
    url: "https://vercel.com/careers",
    status: "Applied",
    resume: "Frontend — v2",
    appliedAt: "2026-09-24T00:00:00.000Z",
    referral: { email: "", referred: false },
  },
  {
    _id: "demo-3",
    company: "Notion",
    role: "Design Engineer",
    location: "San Francisco · Hybrid",
    url: "https://notion.so/careers",
    status: "Selected",
    resume: "Design engineer — v1",
    appliedAt: "2026-09-18T00:00:00.000Z",
    referral: { email: "alex@notion.so", referred: true },
  },
];

function initials(company: string) {
  return company
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(
    new Date(date)
  );
}

export default function Dashboard() {
  const [applications, setApplications] = useState<ApplicationRecord[]>(demoApplications);
  const [activeStatus, setActiveStatus] = useState<"All" | ApplicationStatus>("All");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [databaseError, setDatabaseError] = useState("");

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/applications`)
      .then(async (response) => {
        if (!response.ok) throw new Error((await response.json()).error);
        return response.json();
      })
      .then((data) => setApplications(data.applications))
      .catch((error: Error) => setDatabaseError(error.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredApplications = useMemo(
    () =>
      applications.filter((application) => {
        const matchesStatus = activeStatus === "All" || application.status === activeStatus;
        const query = search.toLowerCase();
        return (
          matchesStatus &&
          (!query ||
            application.company.toLowerCase().includes(query) ||
            application.role.toLowerCase().includes(query))
        );
      }),
    [applications, activeStatus, search]
  );

  async function addApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      company: form.get("company"),
      role: form.get("role"),
      location: form.get("location"),
      url: form.get("url"),
      resume: form.get("resume"),
      referral: { email: form.get("referralEmail"), referred: form.get("referred") === "on" },
    };
    const response = await fetch(`${API_BASE_URL}/api/applications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      setDatabaseError((await response.json()).error);
      return;
    }
    const data = await response.json();
    setApplications((current) => [data.application, ...current]);
    setModalOpen(false);
  }

  async function updateStatus(id: string, status: ApplicationStatus) {
    if (id.startsWith("demo-")) {
      setApplications((current) => current.map((item) => (item._id === id ? { ...item, status } : item)));
      return;
    }
    const response = await fetch(`${API_BASE_URL}/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) setDatabaseError((await response.json()).error);
    else setApplications((current) => current.map((item) => (item._id === id ? { ...item, status } : item)));
  }

  const countFor = (status: "All" | ApplicationStatus) =>
    status === "All" ? applications.length : applications.filter((app) => app.status === status).length;

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark"><Sparkles size={16} /></span> applyly</div>
        <div className="workspace"><div className="avatar">JD</div><div><strong>Jordan Davis</strong><span>Personal workspace</span></div><ChevronDown size={15} /></div>
        <nav><p className="nav-label">Workspace</p><button className="nav-item active"><LayoutDashboard size={17} /> Overview</button><button className="nav-item"><BriefcaseBusiness size={17} /> Applications <span className="nav-count">{applications.length}</span></button><button className="nav-item"><Users size={17} /> Referrals</button></nav>
        <div className="sidebar-bottom"><button className="nav-item"><Settings size={17} /> Settings</button><div className="upgrade"><Sparkles size={16} /><div><strong>Make your job search calmer</strong><span>Upgrade to Pro <ExternalLink size={12} /></span></div></div></div>
      </aside>
      <section className="content">
        <header className="topbar"><div className="breadcrumbs">Workspace <span>/</span> <strong>Overview</strong></div><div className="top-actions"><button className="icon-button" aria-label="Settings"><Settings size={18} /></button><div className="avatar small">JD</div></div></header>
        <div className="page-header"><div><p className="eyebrow">Wednesday, September 30, 2026</p><h1>Your job search, organized.</h1><p className="subtitle">Keep every opportunity moving forward, without the spreadsheet chaos.</p></div><button className="primary-button" onClick={() => setModalOpen(true)}><Plus size={18} /> Add application</button></div>
        {databaseError && <div className="notice"><span>{databaseError}</span><button onClick={() => setDatabaseError("")}><X size={15} /></button></div>}
        <div className="stats"><div className="stat-card"><span>Total applications</span><strong>{applications.length}</strong><small>All time</small></div><div className="stat-card"><span>In progress</span><strong>{countFor("Applied") + countFor("Interview")}</strong><small className="green">+2 this week</small></div><div className="stat-card"><span>Interviews</span><strong>{countFor("Interview")}</strong><small>Keep it up</small></div><div className="stat-card"><span>Referral rate</span><strong>{applications.length ? Math.round((applications.filter((app) => app.referral.referred).length / applications.length) * 100) : 0}%</strong><small>Of applications</small></div></div>
        <div className="section-heading"><div><h2>Applications</h2><p>{loading ? "Syncing with your workspace..." : "Your latest opportunities and their next steps."}</p></div><button className="secondary-button"><Filter size={16} /> Filters</button></div>
        <div className="toolbar"><div className="tabs">{(["All", ...statuses] as const).map((status) => <button key={status} className={activeStatus === status ? "tab active" : "tab"} onClick={() => setActiveStatus(status)}>{status}<span>{countFor(status)}</span></button>)}</div><label className="search"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search applications..." /></label></div>
        <div className="application-list">{filteredApplications.map((application) => <article className="application-card" key={application._id}><div className="company-logo">{initials(application.company)}</div><div className="application-main"><div className="application-title"><div><h3>{application.role}</h3><p>{application.company}</p></div><span className={`status ${application.status.toLowerCase()}`}>{application.status}</span></div><div className="application-meta"><span><MapPin size={14} /> {application.location}</span><span><Link2 size={14} /> {application.resume}</span><span>Applied {formatDate(application.appliedAt)}</span></div>{application.referral.email && <div className="referral"><Mail size={14} /><span>Referral: {application.referral.email}</span>{application.referral.referred && <span className="referred"><Check size={12} /> Referred</span>}</div>}</div><div className="card-actions"><select value={application.status} onChange={(event) => updateStatus(application._id, event.target.value as ApplicationStatus)} aria-label={`Update status for ${application.role}`}>{statuses.map((status) => <option key={status}>{status}</option>)}</select><a href={application.url} target="_blank" rel="noreferrer" className="open-link" aria-label={`Open ${application.role} listing`}><ExternalLink size={17} /></a></div></article>)}{!filteredApplications.length && <div className="empty"><BriefcaseBusiness size={28} /><h3>No applications found</h3><p>Try another search or add your next opportunity.</p></div>}</div>
      </section>
      {modalOpen && <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setModalOpen(false)}><form className="modal" onSubmit={addApplication}><div className="modal-heading"><div><p className="eyebrow">New opportunity</p><h2>Add an application</h2></div><button type="button" className="close-button" onClick={() => setModalOpen(false)}><X size={18} /></button></div><p className="modal-copy">Paste a job link and keep the details you need close at hand.</p><div className="form-grid"><label>Company<input name="company" placeholder="e.g. Acme Inc." required /></label><label>Role title<input name="role" placeholder="e.g. Product Designer" required /></label><label>Job link<div className="input-icon"><Link2 size={15} /><input name="url" type="url" placeholder="https://..." required /></div></label><label>Location<input name="location" placeholder="Remote, New York..." /></label><label>Resume used<input name="resume" placeholder="e.g. Product design — v4" /></label><label>Referral email<div className="input-icon"><Mail size={15} /><input name="referralEmail" type="email" placeholder="name@company.com" /></div></label></div><label className="checkbox"><input name="referred" type="checkbox" /> <span>They referred me for this role</span></label><div className="modal-footer"><button type="button" className="secondary-button" onClick={() => setModalOpen(false)}>Cancel</button><button className="primary-button" type="submit"><Plus size={17} /> Save application</button></div></form></div>}
    </main>
  );
}
