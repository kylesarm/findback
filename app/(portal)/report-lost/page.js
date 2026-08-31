import PageHeader from "@/components/PageHeader";
import ReportForm from "@/components/ReportForm";

export const metadata = { title: "Report a lost item" };

export default function ReportLostPage() {
  return <><PageHeader eyebrow="New report" title="Report a lost item" description="Share the details you remember. FindBack will use them to surface possible matches." /><ReportForm type="lost" /></>;
}
