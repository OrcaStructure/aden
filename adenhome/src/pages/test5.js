import Head from "next/head";

export default function Page() {
  return (
    <>
      <Head>
        <title>Kaleen Family Practice | Minimal Calm</title>
        <meta
          name="description"
          content="A crisp, minimal dental site with emphasis on clarity, comfort, and modern care."
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;600;700&display=swap"
        />
      </Head>
      <main className="page">
        <header className="hero">
          <div>
            <p className="eyebrow">Kaleen Family Practice</p>
            <h1>Modern dentistry, mindful pace.</h1>
            <p className="lede">
              Clean design, quiet rooms, and technology that keeps your visit short,
              clear, and comfortable.
            </p>
            <div className="cta-row">
              <button className="primary">Book appointment</button>
              <button className="ghost">Call (02) 5550 2100</button>
            </div>
          </div>
          <div className="summary">
            <div>
              <p className="label">Hours</p>
              <p>Mon–Thu 8-6 • Fri 8-4 • Sat 8:30-12</p>
            </div>
            <div>
              <p className="label">Location</p>
              <p>51 Baldwin Drive, Kaleen • On-site parking</p>
            </div>
            <div>
              <p className="label">Response</p>
              <p>Same-day emergency slots held daily</p>
            </div>
          </div>
        </header>

        <section className="panel grid">
          <div className="card">
            <p className="label">Prevent</p>
            <h3>Hygiene and gum health</h3>
            <p>Proactive care that keeps dentistry gentle and predictable.</p>
          </div>
          <div className="card">
            <p className="label">Restore</p>
            <h3>Same-day crowns</h3>
            <p>Digital scanning and milling, finished in a single visit.</p>
          </div>
          <div className="card">
            <p className="label">Smile</p>
            <h3>Whitening and aligners</h3>
            <p>Tailored plans, flexible pacing, confident results.</p>
          </div>
          <div className="card">
            <p className="label">Support</p>
            <h3>Family friendly</h3>
            <p>Kid friendly spaces, pacing breaks, and gentle clinicians.</p>
          </div>
        </section>

        <section className="panel layout">
          <div>
            <p className="eyebrow">Designed for ease</p>
            <h2>Three things we never compromise</h2>
            <ul>
              <li>Clear pricing and timelines before we begin.</li>
              <li>Comfort choices: blankets, headphones, breaks anytime.</li>
              <li>Time protection: fewer patients, longer appointments.</li>
            </ul>
          </div>
          <div className="timeline">
            <div className="step">
              <span className="dot" />
              <div>
                <p className="step-title">Arrival</p>
                <p className="copy">Check-in, tea or sparkling water, calm music.</p>
              </div>
            </div>
            <div className="step">
              <span className="dot" />
              <div>
                <p className="step-title">Clarity</p>
                <p className="copy">3D scans and photos you can see as we explain.</p>
              </div>
            </div>
            <div className="step">
              <span className="dot" />
              <div>
                <p className="step-title">Plan</p>
                <p className="copy">Same-day options and written next steps.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="panel contact">
          <div>
            <p className="eyebrow">Visit Kaleen Family Practice</p>
            <h2>Ready for a calmer appointment?</h2>
            <p className="copy">
              Parking on site • Step free access • Open Mon to Sat
            </p>
          </div>
          <div className="cta-row">
            <button className="primary">Book online</button>
            <button className="ghost">Email us</button>
          </div>
        </section>
      </main>

      <style jsx global>{`
        :root {
          --ink: #0f172a;
          --muted: #5f6b7a;
          --line: #e5e8ec;
          --card: #ffffff;
          --canvas: #f4f6f9;
          --accent: #6f9ccf;
        }
        body {
          margin: 0;
          font-family: "Work Sans", "Inter", system-ui, -apple-system, sans-serif;
          background: var(--canvas);
          color: var(--ink);
        }
        * {
          box-sizing: border-box;
        }
        button {
          font: inherit;
          cursor: pointer;
          border: none;
        }
      `}</style>

      <style jsx>{`
        .page {
          max-width: 1100px;
          margin: 0 auto;
          padding: 44px 18px 90px;
          display: grid;
          gap: 22px;
        }
        .hero {
          background: #fdfefe;
          border: 1px solid var(--line);
          border-radius: 22px;
          padding: 28px;
          display: grid;
          gap: 14px;
          box-shadow: 0 14px 38px rgba(0, 0, 0, 0.05);
        }
        .eyebrow {
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 700;
          color: #3a4a64;
          font-size: 13px;
        }
        h1 {
          margin: 0;
          font-size: clamp(32px, 5vw, 40px);
          line-height: 1.1;
        }
        .lede {
          margin: 0;
          color: var(--muted);
          line-height: 1.6;
          max-width: 640px;
        }
        .cta-row {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .primary {
          background: linear-gradient(135deg, var(--accent), #4c7bad);
          color: white;
          padding: 12px 16px;
          border-radius: 12px;
          font-weight: 700;
          box-shadow: 0 12px 30px rgba(79, 123, 173, 0.3);
        }
        .ghost {
          background: transparent;
          color: var(--ink);
          padding: 11px 15px;
          border-radius: 12px;
          border: 1px solid var(--line);
          font-weight: 600;
        }
        .summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
          padding-top: 4px;
        }
        .label {
          margin: 0;
          font-weight: 700;
          color: #3a4a64;
        }
        .summary p {
          margin: 4px 0 0;
          color: var(--muted);
        }
        .panel {
          border: 1px solid var(--line);
          border-radius: 18px;
          background: var(--card);
          padding: 22px;
          box-shadow: 0 10px 28px rgba(0, 0, 0, 0.04);
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }
        .card {
          border: 1px solid var(--line);
          border-radius: 12px;
          padding: 14px;
          background: #fafbfd;
          display: grid;
          gap: 6px;
        }
        h3 {
          margin: 0;
        }
        .layout {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 16px;
        }
        ul {
          margin: 0;
          padding-left: 16px;
          color: var(--muted);
          line-height: 1.6;
          display: grid;
          gap: 6px;
        }
        .timeline {
          display: grid;
          gap: 10px;
          padding: 12px;
          border: 1px dashed var(--line);
          border-radius: 12px;
          background: #f8fafc;
        }
        .step {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 10px;
          align-items: start;
        }
        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--accent);
          margin-top: 4px;
        }
        .step-title {
          margin: 0 0 4px;
          font-weight: 700;
        }
        .copy {
          margin: 0;
          color: var(--muted);
        }
        .contact {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 12px;
          align-items: center;
        }
        @media (max-width: 620px) {
          .page {
            padding: 26px 14px 70px;
          }
          .hero {
            padding: 22px;
          }
        }
      `}</style>
    </>
  );
}
