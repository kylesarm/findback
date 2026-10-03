import Link from "next/link";
import Icon from "@/components/Icon";
import EmptyState from "@/components/EmptyState";
import PageHeader from "@/components/PageHeader";
import MatchComparison from "@/components/MatchComparison";
import { getPossibleMatches } from "@/lib/data/matches";

export const metadata = { title: "Possible Matches" };
export default async function MatchesPage() {
  const { matches, lostItemCount, minimumScore, error } =
    await getPossibleMatches();
  return (
    <>
      <PageHeader
        eyebrow="Weighted Similarity Matching"
        title="Connections worth a closer look."
        description="Compare your lost reports with available found items. See what is similar, what differs, and why each result appears."
        action={
          <Link href="/report-lost" className="btn-primary">
            <Icon name="found" />
            Report lost item
          </Link>
        }
      />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-100 bg-brand-50/50 p-4">
        <p className="flex max-w-2xl items-start gap-2 text-xs leading-6 text-brand-900">
          <Icon name="admin" className="mt-1 size-4 shrink-0" />A Possible Match
          is a starting point. Ownership is confirmed separately through private
          Claim Verification.
        </p>
        <span className="shrink-0 text-xs font-semibold text-brand-700">
          {minimumScore}% minimum score
        </span>
      </div>
      <div className="section-heading">
        <h2>
          {matches.length}{" "}
          {matches.length === 1 ? "Possible Match" : "Possible Matches"}
        </h2>
        <span className="text-xs text-slate-500">
          Highest Similarity Score first
        </span>
      </div>
      {error ? (
        <EmptyState
          icon="info"
          title="Matching is temporarily unavailable"
          description={error}
          error
        />
      ) : matches.length ? (
        <section className="space-y-5">
          {matches.map((match, index) => (
            <MatchComparison key={match.id} match={match} top={index === 0} />
          ))}
        </section>
      ) : (
        <EmptyState
          icon="matches"
          title={
            lostItemCount
              ? "No connections just yet."
              : "Start with a lost-item report."
          }
          description={
            lostItemCount
              ? `No found reports currently reach the ${minimumScore}% minimum. Check back as new items are reported, or explore the community listings.`
              : "Tell us what you lost. Findmatch will compare its recorded attributes with available found items."
          }
          href={lostItemCount ? "/browse" : "/report-lost"}
          action={lostItemCount ? "Browse items" : "Report a lost item"}
        />
      )}
    </>
  );
}
