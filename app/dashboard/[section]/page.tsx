import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getSite, sectionStatus } from "@/lib/site";
import { SECTIONS, type SectionId } from "@/lib/types";
import { Editor } from "./editor";

export default function SectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ section: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  return (
    <Suspense fallback={<SectionFallback />}>
      <SectionContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

function SectionFallback() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true">
      <div className="h-6 w-40 rounded-lg bg-dash-line-soft" />
      <div className="flex gap-1.5">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-8 w-24 rounded-full border border-dash-line bg-dash-surface" />
        ))}
      </div>
      <div className="h-64 rounded-[14px] border border-dash-line bg-dash-surface" />
    </div>
  );
}

async function SectionContent({
  params,
  searchParams,
}: {
  params: Promise<{ section: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { section } = await params;
  const query = await searchParams;
  const known = SECTIONS.find((item) => item.id === section);
  if (!known) notFound();
  const site = await getSite();
  const status = sectionStatus(site);

  return (
    <Editor
      section={known.id}
      label={known.label}
      hint={known.hint}
      initial={site[known.id as SectionId]}
      sections={status.map((item) => ({ id: item.id, label: item.label, empty: item.empty }))}
      saved={query.saved === "1"}
      failed={query.error === "1"}
    />
  );
}
