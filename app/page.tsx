import SceneLoader from "@/components/SceneLoader";
import { profile, projects, skills, stellarWork } from "@/lib/content";

const pad = (n: number) => String(n).padStart(2, "0");

export default function Home() {
  const contacts = [
    profile.email && { label: profile.email, href: `mailto:${profile.email}` },
    { label: "GitHub", href: profile.github },
    profile.linkedin && { label: "LinkedIn", href: profile.linkedin },
    profile.x && { label: "X", href: profile.x },
    profile.cv && { label: "CV", href: profile.cv },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <>
      <a className="skip" href="#work">
        Skip to work
      </a>
      <SceneLoader />

      <header className="nav">
        <a href="#top" className="nav-name">
          {profile.name}
        </a>
        <nav aria-label="Main">
          <a href="#work">Work</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <main>
        <section id="top" data-stop className="section hero">
          <div className="panel">
            <p className="kicker">{profile.title}</p>
            <h1>{profile.name}</h1>
            <p className="lede">{profile.intro}</p>
          </div>
          <p className="scroll-hint">Scroll to explore the work</p>
        </section>

        <div id="work">
          <h2 className="sr-only">Selected work</h2>
          {projects.map((p, i) => (
            <section
              key={p.id}
              id={p.id}
              data-stop
              className={`section project ${i % 2 === 0 ? "text-left" : "text-right"}`}
              aria-labelledby={`${p.id}-title`}
            >
              <div className="panel">
                <p className="kicker">
                  <span>
                    {pad(i + 1)} / {pad(projects.length)}
                  </span>
                  <span>{p.kicker}</span>
                </p>
                <h3 id={`${p.id}-title`}>{p.name}</h3>
                <p className="tagline">{p.tagline}</p>
                <p className="body">{p.description}</p>
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
                <ul className="chips" aria-label="Stack">
                  {p.stack.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
                <p className="links">
                  {p.links.map((l) => (
                    <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer">
                      {l.label} <span aria-hidden>↗</span>
                    </a>
                  ))}
                </p>
              </div>
            </section>
          ))}
        </div>

        <section data-stop className="section wide" aria-labelledby="stellar-title">
          <div className="panel">
            <p className="kicker">Also building</p>
            <h2 id="stellar-title">On Stellar</h2>
            <p className="lede">
              Frontend and backend work across a set of Stellar and Soroban projects: payments, escrow, trade finance and
              asset safety.
            </p>
            <ul className="list">
              {stellarWork.map((w) => (
                <li key={w.name}>
                  <a href={w.href} target="_blank" rel="noopener noreferrer">
                    <span className="list-name">{w.name}</span>
                    <span className="list-note">{w.note}</span>
                    <span aria-hidden>↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="about" data-stop className="section wide" aria-labelledby="about-title">
          <div className="panel">
            <p className="kicker">About</p>
            <h2 id="about-title">Problems with real constraints</h2>
            <p className="lede">
              Payments that work without internet. Payroll across five countries in one transaction. Inventory for shops
              that can&apos;t afford to lose stock to expiry. That&apos;s the kind of work I like: practical software for
              real conditions, built end to end.
            </p>
            <div className="skills">
              {skills.map((g) => (
                <div key={g.group}>
                  <h3>{g.group}</h3>
                  <ul>
                    {g.items.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" data-stop className="section contact" aria-labelledby="contact-title">
          <div className="panel">
            <p className="kicker">Contact</p>
            <h2 id="contact-title">Let&apos;s build something.</h2>
            <p className="lede">Open to junior software engineering roles, internships and collaborations.</p>
            <p className="links big">
              {contacts.map((c) => (
                <a
                  key={c.href}
                  href={c.href}
                  {...(c.href.startsWith("mailto:") ? {} : { target: "_blank", rel: "noopener noreferrer" })}
                >
                  {c.label} <span aria-hidden>↗</span>
                </a>
              ))}
            </p>
          </div>
          <footer className="foot">
            © {new Date().getFullYear()} {profile.name}
          </footer>
        </section>
      </main>
    </>
  );
}
