import PageHeader from "@/components/PageHeader";
import ReportForm from "@/components/ReportForm";

export const metadata = { title: "Report a found item" };

export default function ReportFoundPage() {
  return <><PageHeader eyebrow="New report" title="Report a found item" description="Provide public listing details while keeping ownership evidence private for Claim Verification." /><ReportForm type="found" /></>;
}
