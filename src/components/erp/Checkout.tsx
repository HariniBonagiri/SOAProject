import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatINR, STUDENT } from "@/lib/erp";
import { useErp, type PayMethod } from "./store";
import { FeeTable, PageHead } from "./ui";

const METHODS: PayMethod[] = ["UPI", "Net Banking", "Card", "Wallet"];

export function Checkout() {
  const erp = useErp();
  if (!erp.locked) return <div className="card-surface p-8 text-center text-sm">Review and lock your selection first. <Button variant="link" onClick={() => erp.go("registration")}>Go to registration</Button></div>;
  const walletShort = erp.method === "Wallet" && erp.wallet < erp.fees.total;
  return (
    <div>
      <PageHead title="Fee Payment Checkout" subtitle="All payments are simulated. No real money is transferred." />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card-surface p-5 text-sm">
          <p>Student ID: <b>{STUDENT.id}</b> · Ref: <b className="font-mono">{erp.regRef}</b></p>
          <p className="mb-3">{erp.selected.length} courses · {erp.fees.credits} credits</p>
          <FeeTable fees={erp.fees} />
        </section>
        <section className="card-surface space-y-4 p-5">
          <div className="grid grid-cols-2 gap-2">
            {METHODS.map((m) => <Button key={m} variant={erp.method === m ? "default" : "outline"} onClick={() => erp.setMethod(m)}>{m}</Button>)}
          </div>
          {erp.method === "Wallet" && <p className="text-sm">Demo wallet balance: <b>{formatINR(erp.wallet)}</b></p>}
          <p className="text-xs text-muted-foreground">Demonstration only — never enter real card or bank details.</p>
          <div className="grid gap-2">
            <Button disabled={erp.registered || walletShort} onClick={() => erp.pay(erp.method, true)}>Simulate Successful Payment</Button>
            <Button variant="outline" disabled={erp.registered} onClick={() => erp.pay(erp.method, false)}>Simulate Failed Payment</Button>
          </div>
        </section>
      </div>
    </div>
  );
}

export function Success() {
  const erp = useErp();
  const p = erp.payment;
  if (!p) return null;
  return (
    <div className="card-surface mx-auto max-w-xl p-8 text-center">
      <CheckCircle2 className="mx-auto size-14 text-success" />
      <h1 className="mt-3 text-2xl font-bold">Registration Successful</h1>
      <p className="mt-2 text-sm text-muted-foreground">{p.regId} · {p.txn} · {p.method} · {new Date(p.timestamp).toLocaleString("en-IN")}</p>
      <p className="mt-2 font-semibold">{p.courses.length} courses · {p.fees.credits} credits · {formatINR(p.fees.total)}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button onClick={() => erp.openReceipt(p)}>View / Print Receipt</Button>
        <Button variant="outline" onClick={() => erp.go("dashboard")}>Dashboard</Button>
      </div>
    </div>
  );
}
