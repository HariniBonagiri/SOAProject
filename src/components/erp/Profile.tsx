import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { COURSES, STUDENT } from "@/lib/erp";
import { useErp } from "./store";
import { PageHead, StatusBadge } from "./ui";

export function Catalog() {
  return (
    <div>
      <PageHead title="Available Courses" subtitle="Demonstration course catalogue." />
      <div className="card-surface overflow-x-auto p-4">
        <table className="w-full min-w-[600px] text-sm"><tbody>{COURSES.map((c) => (
          <tr key={c.code} className="border-b"><td className="py-2 font-mono text-xs font-bold">{c.code}</td><td>{c.title}</td><td>{c.category}</td><td>{c.faculty}</td><td>{c.credits} cr</td><td>{c.seats} seats</td></tr>))}</tbody></table>
      </div>
    </div>
  );
}

export function Profile() {
  const erp = useErp();
  const [f, setF] = useState(erp.profile);
  const valid = f.name.trim().length >= 2 && /\S+@\S+\.\S+/.test(f.email);
  return (
    <div>
      <PageHead title="Student Profile" />
      <div className="card-surface max-w-xl space-y-3 p-5 text-sm">
        <p>ID: <b>{STUDENT.id}</b> · {STUDENT.program} · {STUDENT.semester} · <StatusBadge status={erp.status} /></p>
        <label className="block">Name<Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
        <label className="block">Email<Input value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></label>
        <label className="block">Phone<Input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></label>
        <Button disabled={!valid} onClick={() => erp.updateProfile(f)}>Save</Button>
      </div>
    </div>
  );
}

export function Help() {
  return (
    <div>
      <PageHead title="Help & Support" />
      <div className="card-surface max-w-xl space-y-2 p-5 text-sm">
        <p><b>Credit limit:</b> up to 24 credits per semester.</p>
        <p><b>Payment:</b> all payments are simulated; no money moves.</p>
        <p><b>Reset:</b> use "Start new semester demo" in the profile menu.</p>
      </div>
    </div>
  );
}
