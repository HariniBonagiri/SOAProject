import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { ErpProvider } from "@/components/erp/store";
import { Shell } from "@/components/erp/Shell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Student Academic ERP — Course Registration & Fees" },
      { name: "description", content: "Demo portal to register Semester V courses, track credits and simulate fee payment." },
      { property: "og:title", content: "Student Academic ERP — Course Registration & Fees" },
      { property: "og:description", content: "Demo portal to register Semester V courses, track credits and simulate fee payment." },
    ],
  }),
  component: () => (
    <ErpProvider>
      <Shell />
      <Toaster richColors position="top-right" />
    </ErpProvider>
  ),
});
