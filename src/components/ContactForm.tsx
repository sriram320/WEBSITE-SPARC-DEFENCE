"use client";

import { useState } from "react";

/**
 * Contact form — BUILD_BRIEF §10, §12.
 *
 * Frontend only: validates client-side and shows a success state. Nothing is
 * transmitted, and the success copy says so rather than implying a message was
 * delivered — claiming otherwise would be the one genuinely dishonest thing on
 * a site whose whole copy discipline is about not overclaiming.
 *
 * Fields are hairline-underlined, not boxed, with mono labels.
 */
type Errors = Partial<Record<"name" | "organisation" | "email" | "message", string>>;

export default function ContactForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const next: Errors = {};

    if (!String(data.get("name") ?? "").trim()) next.name = "Please tell us your name.";
    if (!String(data.get("organisation") ?? "").trim())
      next.organisation = "Please tell us who you are with.";

    const email = String(data.get("email") ?? "").trim();
    if (!email) next.email = "Please give us an email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = "That does not look like an email address.";

    const message = String(data.get("message") ?? "").trim();
    if (message.length < 12) next.message = "A sentence or two about the problem, please.";

    setErrors(next);
    if (Object.keys(next).length === 0) setSent(true);
  };

  if (sent) {
    return (
      <div className="border-t border-rule pt-8" role="status">
        <p className="t-display-m mb-4 text-ink">Received.</p>
        <p className="t-body-dim max-w-[46ch]">
          This site is a frontend demonstration, so nothing has actually been
          transmitted. On the live site this would reach the team directly and we
          would come back to you within a few working days.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="t-label link-quiet mt-8 text-ink"
        >
          Write another →
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-9 border-t border-rule pt-8">
      <Field name="name" label="Name" error={errors.name} autoComplete="name" />
      <Field
        name="organisation"
        label="Organisation"
        error={errors.organisation}
        autoComplete="organization"
      />
      <Field name="email" label="Email" type="email" error={errors.email} autoComplete="email" />
      <Field name="message" label="What are you working on" error={errors.message} multiline />

      <button type="submit" className="t-label link-quiet self-start text-ink">
        Request a briefing →
      </button>

      <p className="t-data text-ink-faint">
        Nothing on this form is transmitted — frontend demonstration only.
      </p>
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  error,
  multiline,
  autoComplete,
}: {
  name: string;
  label: string;
  type?: string;
  error?: string;
  multiline?: boolean;
  autoComplete?: string;
}) {
  const shared =
    "w-full border-0 border-b border-rule-lit bg-transparent px-0 py-3 text-ink outline-none transition-colors duration-300 focus:border-ink";

  return (
    <div className="flex flex-col gap-3">
      <label htmlFor={`c-${name}`} className="t-label text-ink-faint">
        {label}
      </label>
      {multiline ? (
        <textarea
          id={`c-${name}`}
          name={name}
          rows={4}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `ce-${name}` : undefined}
          className={`${shared} resize-y`}
        />
      ) : (
        <input
          id={`c-${name}`}
          name={name}
          type={type}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `ce-${name}` : undefined}
          className={shared}
        />
      )}
      {error && (
        <p id={`ce-${name}`} className="t-data text-disrupt">
          {error}
        </p>
      )}
    </div>
  );
}
