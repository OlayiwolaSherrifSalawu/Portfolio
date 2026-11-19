import ProjectIndex from "@/components/ProjectIndex";
import HighlightReveal from "@/components/HighlightReveal";
import Magnifier from "@/components/Magnifier";
import SceneLoader from "@/components/SceneLoader";
import ScrollCursor from "@/components/ScrollCursor";
import { profile, projects, secrets, skills, stellarWork } from "@/lib/content";

const pad = (n: number) => String(n).padStart(2, "0");

/** Hand-drawn red ring, used around section numbers. */
function Ring() {
  return (
    <svg className="ring" viewBox="0 0 120 80" aria-hidden focusable="false">
      <path d="M62 6C30 4 6 18 7 40c1 22 30 34 60 32 30-2 48-18 46-36C111 16 86 5 55 9" />
    </svg>
  );
}

/** Hand-drawn arrow for margin notes. */
function Arrow({ className }: { className?: string }) {
  return (
    <svg className={`arrow ${className ?? ""}`} viewBox="0 0 120 70" aria-hidden focusable="false">
      <path d="M6 10c30-6 70 2 96 40" />
      <path d="M86 46l16 6 2-17" />
    </svg>
  );
}

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
      <span aria-hidden className="ext">
        ↗
      </span>
    </a>
  );
}

/** A note that only shows up inside the magnifier. Decorative, so hidden from assistive tech. */
function Secret({ id }: { id: string }) {
  const s = secrets[id];
  if (!s) return null;
  return (
    <p className="secret" aria-hidden style={{ insetBlockStart: s.top, insetInlineStart: s.left }}>
      {s.text}
    </p>
  );
}

export default function Home() {
  const contacts = [
    profile.email && { label: "GitHub", href: profile.github },
    profile.linkedin && { label: "LinkedIn", href: profile.linkedin },
    profile.x && { label: "X", href: profile.x },
    profile.cv && { label: "Download CV", href: profile.cv },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <>
      <a className="skip" href="#work">
        Skip to projects
      </a>
      <SceneLoader />

      <header className="nav">
        <a href="#top" className="wordmark">
          <span className="full">{profile.name}</span>
          <span className="short" aria-hidden>
            {profile.shortName}
          </span>
          <span className="dot" aria-hidden>
            .
          </span>
        </a>
        <ProjectIndex />
        <div className="nav-end">
          <a href="#about" className="nav-link">
            About
          </a>
          <a href={profile.email ? `mailto:${profile.email}` : "#contact"} className="btn btn-primary btn-sm">
            Get in touch
          </a>
        </div>
      </header>

      <main>
        <section id="top" data-stop className="section hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="label">
              {profile.name} · {profile.title}
            </p>
            <h1 id="hero-title" className="display">
              {profile.headline.before}
              <mark className="hl">{profile.headline.highlight}</mark>
              {profile.headline.after}
            </h1>
            <p className="lede">
              {profile.intro}
            </p>
            <div className="actions">
              <a href="#work" className="btn btn-primary">
                See my work
              </a>
              <a href={profile.github} className="btn btn-secondary" target="_blank" rel="noopener noreferrer">
                View GitHub<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </div>
          </div>
          <p className="note hero-note" aria-hidden>
            five projects, floating on the right.
            <br />
            hidden notes too. drag the magnifying glass over the page
            <Arrow />
          </p>
          <Secret id="top" />
        </section>

        <div id="work" aria-label="Selected work" role="region">
          {projects.map((p, i) => (
            <section
              key={p.id}
              id={p.id}
              data-stop
              className={`section project ${i % 2 === 0 ? "start" : "end"}`}
              aria-labelledby={`${p.id}-title`}
            >
              <article className="card">
                <header className="card-head">
                  <span className="num" aria-hidden>
                    {pad(i + 1)}
                    <Ring />
                  </span>
                  <p className="label">
                    <span className="sr-only">
                      Project {i + 1} of {projects.length}.{" "}
                    </span>
                    {p.kicker}
                  </p>
                </header>
                <h2 id={`${p.id}-title`} className="title">
                  {p.name}
                </h2>
                <p className="tagline">
                  {p.tagline}
                </p>
                <p className="body">
                  {p.description}
                </p>
                <dl className="meta">
                  <div>
                    <dt>Role</dt>
                    <dd>{p.role}</dd>
                  </div>
                  {p.status && (
                    <div>
                      <dt>Status</dt>
                      <dd>{p.status}</dd>
                    </div>
                  )}
                </dl>
                <ul className="chips" aria-label={`${p.name} stack`}>
                  {p.stack.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
                <p className="links">
                  {p.links.map((l) => (
                    <ExternalLink key={l.href} href={l.href}>
                      {l.kind === "site" ? "Live site" : l.kind === "prs" ? `${l.count} merged PRs` : "Source code"}
                      <span className="sr-only"> for {p.name}</span>
                    </ExternalLink>
                  ))}
                </p>
              </article>
              <p className="note project-note" aria-hidden>
                {p.note}
              </p>
              <Secret id={p.id} />
            </section>
          ))}
        </div>

        <section id="stellar" data-stop className="section wide" aria-labelledby="stellar-title">
          <div className="card card-wide">
            <p className="label">Also building</p>
            <h2 id="stellar-title" className="title">
              On Stellar
            </h2>
            <p className="body">
              Merged pull requests across six Stellar and Soroban projects: payments, escrow, trade finance and
              asset safety.
            </p>
            <ul className="list">
              {stellarWork.map((w) => (
                <li key={w.name}>
                  <a href={w.href} target="_blank" rel="noopener noreferrer">
                    <span className="list-name">{w.name}</span>
                    <span className="list-note">{w.note}</span>
                    <span className="list-count">{w.prs} merged PRs</span>
                    <span className="sr-only"> (opens in a new tab)</span>
                    <span aria-hidden className="ext">
                      ↗
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <Secret id="stellar" />
        </section>

        <section id="about" data-stop className="section wide" aria-labelledby="about-title">
          <div className="card card-wide">
            <p className="label">About</p>
            <h2 id="about-title" className="title">
              Problems with <mark className="hl">real constraints</mark>
            </h2>
            <p className="body">
              Payments that work without internet. Payroll across five countries in one transaction. Inventory for shops
              that can’t afford to lose stock to expiry. That’s the work I like most: practical software for real
              conditions, built end to end.
            </p>
            <div className="skills">
              {skills.map((g) => (
                <div key={g.group}>
                  <h3 className="label">{g.group}</h3>
                  <ul className="chips">
                    {g.items.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <Secret id="about" />
        </section>

        <section id="contact" data-stop className="section contact" aria-labelledby="contact-title">
          <div className="contact-copy">
            <p className="label">Contact</p>
            <h2 id="contact-title" className="display">
              Hiring a junior engineer? <mark className="hl">Let’s talk.</mark>
            </h2>
            <p className="lede">Open to junior software engineering roles, internships and collaborations.</p>
            <div className="actions">
              {profile.email ? (
                <a href={`mailto:${profile.email}`} className="btn btn-primary">
                  Email me
                </a>
              ) : (
                <a href={profile.github} className="btn btn-primary" target="_blank" rel="noopener noreferrer">
                  View GitHub<span className="sr-only"> (opens in a new tab)</span>
                </a>
              )}
              {contacts.map((c) => (
                <a key={c.href} href={c.href} className="btn btn-secondary" target="_blank" rel="noopener noreferrer">
                  {c.label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              ))}
            </div>
            {profile.email && (
              <p className="small">
                Or write to <a href={`mailto:${profile.email}`}>{profile.email}</a>
              </p>
            )}
          </div>
          <Secret id="contact" />
          <footer className="foot">
            <span>
              © {new Date().getFullYear()} {profile.name}
            </span>
            <a href="#top">Back to top</a>
          </footer>
        </section>
      </main>
      <Magnifier />
      <HighlightReveal />
      <ScrollCursor />
    </>
  );
}
