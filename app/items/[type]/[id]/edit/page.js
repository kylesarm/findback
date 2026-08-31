import Link from "next/link";
import { notFound } from "next/navigation";
import AppShell from "@/components/AppShell";
import Icon from "@/components/Icon";
import PageHeader from "@/components/PageHeader";
import ReportEditForm from "@/components/ReportEditForm";
import { getCurrentProfile, getCurrentUserRole, getUserDisplay, requireUser } from "@/lib/auth";
import { getManageableReport } from "@/lib/data/activity";

export const metadata = { title: "Edit report" };

const ITEM_TYPES = new Set(["lost", "found"]);
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function EditReportPage({ params }) {
  const { type, id } = await params;
  if (!ITEM_TYPES.has(type) || !UUID_PATTERN.test(id)) notFound();

  const user = await requireUser();
  const [{ report, error }, profile, role] = await Promise.all([
    getManageableReport(type, id),
    getCurrentProfile(),
    getCurrentUserRole(),
  ]);

  if (!report && !error) notFound();

  const content = error ? (
    <section className="mx-auto max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center sm:p-9">
      <span className="mx-auto grid size-12 place-items-center rounded-xl bg-white text-amber-700 shadow-sm"><Icon name="info" className="size-5" /></span>
      <h1 className="mt-5 text-2xl font-bold text-amber-950">Report editor unavailable</h1>
      <p className="mt-2 text-sm leading-6 text-amber-800">{error}</p>
      <Link className="btn-secondary mt-6" href="/profile">Back to profile</Link>
    </section>
  ) : (
    <>
      <PageHeader eyebrow="Report management" title={`Edit ${report.type} report`} description="Update the report information while keeping ownership, status, and claim workflow fields protected." />
      <ReportEditForm report={report} />
    </>
  );

  return <AppShell user={getUserDisplay(user, profile)} role={role}>{content}</AppShell>;
}
