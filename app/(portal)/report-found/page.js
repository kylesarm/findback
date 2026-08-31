import PageHeader from "@/components/PageHeader";
import ReportForm from "@/components/ReportForm";

export const metadata = { title: "Report a found item" };

export default function ReportFoundPage() {
  return <><PageHeader eyebrow="New report" title="Report a found item" description="Provide a few public details while keeping identifying information private for claim verification." /><ReportForm type="found" /></>;
}
