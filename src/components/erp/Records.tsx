import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatINR, STUDENT } from "@/lib/erp";
import { useErp } from "./store";
import { FeeTable, PageHead, StatusBadge } from "./ui";

export function Fees() {
  const erp = useErp();
  return (
    <div>
      <PageHead title="Fee Dues & Payments" />
      <div className="card-surface max-w-xl p-5">
        <div className="mb-3 flex justify-between"><span>Status</span><StatusBadge status={erp.registered ? "Paid" : "Due"} /></div>
        <FeeTable fees={erp.fees} emphasis={erp.registered ? "Amount Paid" : "Outstanding"} />
        {erp.registered && <Button className="mt-4" onClick={() => erp.openReceipt(erp.payment)}>View Payment Receipt</Button>}
      </div>
    </div>
  );
}

export function HistoryView() {
  const erp = useErp();
  return (
    <div>
      <PageHead title="Registration History" />
      <div className="card-surface overflow-x-auto p-4">
        {erp.history.length === 0 ? <p className="p-6 text-center text-sm text-muted-foreground">No records yet.</p> : (
          <table className="w-full min-w-[640px] text-sm">
            <thead><tr className="border-b text-left text-xs text-muted-foreground"><th className="py-2">Registration</th><th>Date</th><th>Credits</th><th>Amount</th><th>Status</th><th>Txn</th><th /></tr></thead>
            <tbody>{erp.history.map((h) => (
              <tr key={h.receiptNo} className="border-b">
                <td className="py-2 font-mono text-xs">{h.regId}</td><td>{new Date(h.timestamp).toLocaleDateString("en-IN")}</td>
                <td>{h.fees.credits}</td><td>{formatINR(h.fees.total)}</td><td><StatusBadge status={h.status} /></td>
                <td className="font-mono text-xs">{h.txn ?? "—"}</td>
                <td>{h.status === "Success" && <Button size="sm" variant="outline" onClick={() => erp.openReceipt(h)}>View Receipt</Button>}</td>
              </tr>))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export function Receipts() {
  const erp = useErp();
  const r = erp.receiptView ?? erp.payment;
  if (!r) return <div className="card-surface p-8 text-center text-sm">A final receipt is unavailable until payment succeeds.</div>;
  return (
    <div>
      <div className="no-print mb-4 flex gap-2">
        <Button onClick={() => window.print()}><Printer /> Download / Save as PDF</Button>
        <Button variant="outline" onClick={() => erp.go("dashboard")}>Back to Dashboard</Button>
      </div>
      <article className="print-area card-surface mx-auto max-w-3xl p-8 text-sm">
        <h1 className="text-lg font-bold">KL UNIVERSITY — Academic Services</h1>
        <h2 className="mb-4 font-semibold">Academic Course Registration and Fee Payment Receipt</h2>
        <p>Receipt {r.receiptNo} · Reg {r.regId} · Txn {r.txn}</p>
        <p>{erp.profile.name} ({STUDENT.id}) · {STUDENT.program} · {r.semester} · AY {r.year}</p>
        <p className="mb-4">Paid via {r.method} on {new Date(r.timestamp).toLocaleString("en-IN")} · Status: {r.status}</p>
        <table className="mb-4 w-full"><tbody>{r.courses.map((c) => <tr key={c.code} className="border-b"><td className="py-1 font-mono">{c.code}</td><td>{c.title}</td><td>{c.category}</td><td className="text-right">{c.credits}</td></tr>)}</tbody></table>
        <FeeTable fees={r.fees} emphasis="Total Amount Paid" />
        <p className="mt-4 text-xs">Demonstration receipt — not an official university document.</p>
      </article>
    </div>
  );
}
