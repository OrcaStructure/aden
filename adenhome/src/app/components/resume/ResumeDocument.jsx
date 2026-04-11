function Section({ title, children }) {
  if (!children) {
    return null;
  }

  return (
    <section className="border-t border-[var(--line)] pt-5">
      <h2 className="mb-2 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
        {title}
      </h2>
      {children}
    </section>
  );
}

const HARD_CODED_PROFILE = {
  name: "Aden Power",
  location: "Canberra, Australia",
  email: "adenpower.work@gmail.com",
  phone: "0426051560",
};

export default function ResumeDocument({ resume, label }) {
  return (
    <article className="resume-sheet a4-sheet w-full max-w-[210mm] space-y-6 bg-[var(--sheet)] p-5 md:p-7">
      <section className="space-y-2">
        <div className="flex flex-col gap-2 border-b border-[var(--line)] pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl text-[var(--foreground)] md:text-4xl">
              {HARD_CODED_PROFILE.name}
            </h2>
            <p className="mt-1 max-w-xl text-sm leading-5 text-[var(--muted)]">
              {resume.profile.headline}
            </p>
          </div>
          <div className="text-xs leading-5 text-[var(--muted)] md:text-right">
            <p>{HARD_CODED_PROFILE.location}</p>
            <p>{HARD_CODED_PROFILE.email}</p>
            <p>{HARD_CODED_PROFILE.phone}</p>
          </div>
        </div>
        {label ? (
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            {label}
          </p>
        ) : null}
      </section>

      {resume.experience?.length ? (
        <Section title="Experience">
          <div className="space-y-5">
            {resume.experience.map((item) => (
              <div key={item.id} className="grid gap-2 md:grid-cols-[140px_1fr]">
                <div className="text-xs leading-5 text-[var(--muted)]">
                  <p>
                    {item.start} - {item.end}
                  </p>
                  <p>{item.location}</p>
                </div>
                <div>
                  <h3 className="text-base text-[var(--foreground)]">{item.title}</h3>
                  <p className="mt-0.5 text-xs leading-5 text-[var(--muted)]">
                    {item.organization}
                  </p>
                  <ul className="mt-1.5 space-y-1 text-sm leading-5 text-[var(--foreground)]">
                    {item.bullets?.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {resume.education?.length ? (
        <Section title="Education">
          <div className="space-y-5">
            {resume.education.map((item) => (
              <div key={item.id} className="grid gap-2 md:grid-cols-[140px_1fr]">
                <div className="text-xs leading-5 text-[var(--muted)]">
                  {item.start} - {item.end}
                </div>
                <div>
                  <h3 className="text-base text-[var(--foreground)]">{item.degree}</h3>
                  <p className="mt-0.5 text-xs leading-5 text-[var(--muted)]">
                    {item.institution}
                  </p>
                  <ul className="mt-1.5 space-y-1 text-sm leading-5 text-[var(--foreground)]">
                    {item.highlights?.map((highlight) => (
                      <li key={highlight}>{highlight}</li>
                    ))}
                    {item.details?.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {resume.projects?.length ? (
        <Section title="Mathematical Writing">
          <div className="space-y-2">
            {resume.projects.map((project) => (
              <div key={project.id} className="grid gap-2 md:grid-cols-[90px_1fr]">
                <div className="text-xs leading-4 text-[var(--muted)]">{project.year}</div>
                <div>
                  <h3 className="text-sm leading-4 text-[var(--foreground)]">
                    {project.title}
                  </h3>
                  {project.subtitle ? (
                    <p className="text-xs leading-4 text-[var(--muted)]">
                      {project.subtitle}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {resume.publications?.length ? (
        <Section title="Publications">
          <div className="space-y-2">
            {resume.publications.map((publication) => (
              <div key={publication.id} className="grid gap-2 md:grid-cols-[90px_1fr]">
                <div className="text-xs leading-4 text-[var(--muted)]">
                  {publication.year}
                </div>
                <div>
                  <h3 className="text-sm leading-4 text-[var(--foreground)]">
                    {publication.title}
                  </h3>
                  {publication.venue ? (
                    <p className="text-xs leading-4 text-[var(--muted)]">
                      {publication.venue}
                    </p>
                  ) : null}
                  {publication.description ? (
                    <p className="text-xs leading-4 text-[var(--muted)]">
                      {publication.description}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {resume.skills?.length ? (
        <Section title="Skills">
          <div className="space-y-4">
            {resume.skills.map((skill) => (
              <div key={skill.id}>
                <h3 className="text-base text-[var(--foreground)]">{skill.name}</h3>
                <ul className="mt-1.5 space-y-1 text-sm leading-5 text-[var(--foreground)]">
                  {skill.bullets?.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {resume.awards?.length ? (
        <Section title="Awards">
          <div className="grid gap-x-4 gap-y-1 md:grid-cols-2 text-sm leading-5 text-[var(--foreground)]">
            {resume.awards.map((award) => (
              <p key={award.id} className="flex items-start gap-2">
                <span className="mt-[6px] block h-1 w-1 bg-[var(--foreground)]" />
                <span>{award.title}</span>
              </p>
            ))}
          </div>
        </Section>
      ) : null}
    </article>
  );
}
