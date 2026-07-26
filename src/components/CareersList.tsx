"use client";

import { useEffect, useRef, useState } from "react";
import { animate, stagger } from "animejs";
import type { Job } from "@/data/jobs";

/**
 * Role listing — REVISION_BRIEF §4, motion per §3.
 *
 * Hairline-separated rows, mono labels, no cards (BUILD_BRIEF §4.3). Rows
 * stagger in on scroll; expanding a role animates only opacity and transform,
 * with the height handled by a grid-template-rows transition so nothing on the
 * layout path is animated frame by frame.
 */
export default function CareersList({ jobs }: { jobs: Job[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const [applying, setApplying] = useState<Job | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const rows = Array.from(el.querySelectorAll<HTMLElement>("li"));
    if (!rows.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    for (const r of rows) {
      r.style.opacity = "0";
      r.style.willChange = "opacity, transform";
    }

    let anim: ReturnType<typeof animate> | null = null;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        anim = animate(rows, {
          opacity: [0, 1],
          translateY: [20, 0],
          delay: stagger(70),
          duration: 720,
          ease: "outCubic",
          onComplete: () => {
            for (const r of rows) {
              r.style.willChange = "";
              r.style.opacity = "";
              r.style.transform = "";
            }
          },
        });
      },
      { threshold: 0.1 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      anim?.pause();
    };
  }, [jobs]);

  if (!jobs.length) {
    return (
      <section className="shell pb-24" aria-label="Open roles">
        <p className="t-body-dim border-t border-rule pt-8">
          No roles are open right now. Write to us anyway if you think you should
          be here.
        </p>
      </section>
    );
  }

  return (
    <>
      <section className="shell pb-24" aria-label="Open roles">
        <p className="t-label mb-8 text-ink-faint">
          {jobs.length} open {jobs.length === 1 ? "role" : "roles"}
        </p>

        <ul ref={listRef} className="border-t border-rule">
          {jobs.map((job, i) => {
            const isOpen = open === job.id;
            return (
              <li key={job.id} className="border-b border-rule">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : job.id)}
                  aria-expanded={isOpen}
                  aria-controls={`job-${job.id}`}
                  className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-x-6 py-7 text-left"
                >
                  <span className="t-data text-ink-faint">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex flex-col gap-1">
                    <span className="t-display-m text-ink">{job.title}</span>
                    <span className="t-label text-ink-faint">
                      {job.team} · {job.location} · {job.mode}
                    </span>
                  </span>
                  <span
                    className="t-data text-ink-faint transition-transform duration-500"
                    style={{
                      transform: isOpen ? "rotate(45deg)" : "none",
                      transitionTimingFunction: "var(--ease-slow)",
                    }}
                    aria-hidden="true"
                  >
                    +
                  </span>
                </button>

                {/* grid-rows 0fr -> 1fr animates open without animating height */}
                <div
                  id={`job-${job.id}`}
                  className="grid transition-[grid-template-rows] duration-700"
                  style={{
                    gridTemplateRows: isOpen ? "1fr" : "0fr",
                    transitionTimingFunction: "var(--ease-slow)",
                  }}
                >
                  <div className="overflow-hidden">
                    <div className="grid gap-10 pb-10 md:grid-cols-12">
                      <p className="t-body md:col-span-5">{job.summary}</p>

                      <div className="md:col-span-3">
                        <p className="t-label mb-4 text-ink-faint">The work</p>
                        <ul className="flex flex-col gap-3">
                          {job.responsibilities.map((r) => (
                            <li key={r} className="t-body-dim text-[0.9rem]">
                              {r}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="md:col-span-3">
                        <p className="t-label mb-4 text-ink-faint">
                          What we look for
                        </p>
                        <ul className="flex flex-col gap-3">
                          {job.looking.map((r) => (
                            <li key={r} className="t-body-dim text-[0.9rem]">
                              {r}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="md:col-span-12">
                        <button
                          type="button"
                          onClick={() => setApplying(job)}
                          className="t-label link-quiet text-ink"
                        >
                          Apply for this role →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {applying && (
        <ApplyModal job={applying} onClose={() => setApplying(null)} />
      )}
    </>
  );
}

/* -------------------------------------------------------------- apply modal */

function ApplyModal({ job, onClose }: { job: Job; onClose: () => void }) {
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const first = useRef<HTMLInputElement>(null);

  useEffect(() => {
    first.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const next: Record<string, string> = {};
    if (!String(d.get("name") ?? "").trim()) next.name = "Please tell us your name.";
    const email = String(d.get("email") ?? "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "A valid email address, please.";
    const cv = String(d.get("cv") ?? "").trim();
    if (!cv) next.cv = "A link to your CV, portfolio or GitHub.";
    setErrors(next);
    // Frontend only for now — Slice 3 posts this to the applications API.
    if (!Object.keys(next).length) setSent(true);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-void/90 p-5"
      role="dialog"
      aria-modal="true"
      aria-label={`Apply for ${job.title}`}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg border border-rule bg-void p-8">
        <div className="mb-8 flex items-start justify-between gap-6">
          <div>
            <p className="t-label mb-3 text-ink-faint">Application</p>
            <p className="t-display-m text-ink">{job.title}</p>
          </div>
          <button type="button" onClick={onClose} className="t-label text-ink-faint hover:text-ink">
            Close
          </button>
        </div>

        {sent ? (
          <div role="status">
            <p className="t-body text-ink">Received — thank you.</p>
            <p className="t-body-dim mt-3 text-[0.9rem]">
              This form is not yet connected to a backend, so nothing has been
              transmitted. Until it is, please send your application through the
              contact page so it actually reaches us.
            </p>
            <a href="/contact/" className="t-label link-quiet mt-6 inline-block text-ink">
              Contact page →
            </a>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="flex flex-col gap-6">
            <Field ref={first} name="name" label="Name" error={errors.name} />
            <Field name="email" label="Email" type="email" error={errors.email} />
            <Field name="cv" label="CV, portfolio or GitHub link" error={errors.cv} />
            <Field name="note" label="Why this role" optional />
            <button type="submit" className="t-label link-quiet self-start text-ink">
              Send application →
            </button>
            <p className="t-data text-ink-faint">
              Not yet transmitted — the applications backend is not built.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({
  ref,
  name,
  label,
  type = "text",
  error,
  optional,
}: {
  ref?: React.Ref<HTMLInputElement>;
  name: string;
  label: string;
  type?: string;
  error?: string;
  optional?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={`a-${name}`} className="t-label text-ink-faint">
        {label}
        {optional && <span className="ml-2 normal-case tracking-normal">(optional)</span>}
      </label>
      <input
        ref={ref}
        id={`a-${name}`}
        name={name}
        type={type}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `ae-${name}` : undefined}
        className="border-0 border-b border-rule-lit bg-transparent px-0 py-2 text-ink outline-none transition-colors duration-300 focus:border-ink"
      />
      {error && (
        <p id={`ae-${name}`} className="t-data text-disrupt">
          {error}
        </p>
      )}
    </div>
  );
}
