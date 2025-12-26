import Head from "next/head";

export default function Page() {
  return (
    <>
      <Head>
        <title>Kaleen Family Practice | Gentle Dentistry</title>
        <meta
          name="description"
          content="Professional, tech-forward dentistry with a calm, premium feel."
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=General+Sans:wght@400;500;600;700&display=swap"
        />
      </Head>
      <main className="page">
        <section className="hero">
          <div className="overlay" />
          <div className="hero-inner">
            <div className="tag">Modern family dentistry</div>
            <h1>Precision care in a serene setting.</h1>
            <p>
              Digital scans, low-radiation imaging, and clinicians who guide you
              through every choice. Clear prices, calm visits, lasting results.
            </p>
            <div className="cta-row">
              <button className="primary">Book now</button>
              <button className="ghost">Download fee guide</button>
            </div>
            <div className="metrics">
              <div>
                <span className="metric">35 yrs</span>
                <span className="label">Serving Kaleen</span>
              </div>
              <div>
                <span className="metric">3D</span>
                <span className="label">Imaging & scanning</span>
              </div>
              <div>
                <span className="metric">Zero</span>
                <span className="label">Rushed appointments</span>
              </div>
            </div>
          </div>
          <div className="hero-card">
            <p className="card-title">Same-day care options</p>
            <div className="pill-row">
              <span className="pill">Whitening</span>
              <span className="pill">Crowns</span>
              <span className="pill">Emergency</span>
            </div>
            <div className="timeline">
              <div className="node">
                <span className="dot" />
                <div>
                  <p className="node-title">Arrival</p>
                  <p className="node-copy">Check-in with coffee and filtered air.</p>
                </div>
              </div>
              <div className="node">
                <span className="dot" />
                <div>
                  <p className="node-title">Diagnostics</p>
                  <p className="node-copy">3D scans and photos to see what you see.</p>
                </div>
              </div>
              <div className="node">
                <span className="dot" />
                <div>
                  <p className="node-title">Plan</p>
                  <p className="node-copy">Transparent pricing, honest timelines.</p>
                </div>
              </div>
            </div>
            <button className="secondary">See next available</button>
          </div>
        </section>

        <section className="section services">
          <div className="section-header">
            <p className="eyebrow">Services</p>
            <h2>Thoughtful care for every stage</h2>
          </div>
          <div className="service-grid">
            <div className="service">
              <h3>Preventative</h3>
              <p>Routine cleans, gum therapy, sealants, night guards.</p>
            </div>
            <div className="service">
              <h3>Restorative</h3>
              <p>Same-day crowns, tooth colored fillings, root canals.</p>
            </div>
            <div className="service">
              <h3>Cosmetic</h3>
              <p>Whitening, clear aligners, veneer planning with 3D previews.</p>
            </div>
            <div className="service">
              <h3>Family</h3>
              <p>Kid friendly rooms, patient pacing, weekend visits.</p>
            </div>
          </div>
        </section>

        <section className="section cards">
          <div className="card">
            <p className="eyebrow">Comfort-first</p>
            <h3>Spaces that calm</h3>
            <p>
              Soothing lighting, quiet air systems, blankets, headphones, and a
              team that checks in before every step.
            </p>
          </div>
          <div className="card">
            <p className="eyebrow">Transparent</p>
            <h3>Clarity before care</h3>
            <p>Every treatment has a written, itemized plan with timelines.</p>
          </div>
          <div className="card">
            <p className="eyebrow">Flexible</p>
            <h3>Care that fits life</h3>
            <p>Early and late hours, payment options, and responsive follow-up.</p>
          </div>
        </section>

        <section className="section footer-card">
          <div>
            <p className="eyebrow">Visit Kaleen Family Practice</p>
            <h2>51 Baldwin Drive, Kaleen</h2>
            <p>Parking on site • Step free access • Open Mon to Sat</p>
          </div>
          <div className="actions">
            <button className="primary dark">Book now</button>
            <button className="ghost dark">Call (02) 5550 2100</button>
          </div>
        </section>
      </main>

      <style jsx global>{`
        :root {
          --ink: #0d1b2a;
          --muted: #3b4a5a;
          --card: #0f172a;
          --surface: #111c2e;
          --line: #223049;
          --accent: #9ac7ff;
        }
        body {
          margin: 0;
          font-family: "General Sans", "Inter", system-ui, -apple-system,
            sans-serif;
          background: #0b1627;
          color: #e5ecf6;
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
          max-width: 1200px;
          margin: 0 auto;
          padding: 48px 20px 90px;
          display: grid;
          gap: 24px;
        }
        .hero {
          position: relative;
          border-radius: 28px;
          background: radial-gradient(circle at 20% 20%, rgba(154, 199, 255, 0.16), transparent 45%),
            radial-gradient(circle at 80% 0%, rgba(122, 195, 192, 0.16), transparent 40%),
            linear-gradient(135deg, #121f34 0%, #0e1828 100%);
          overflow: hidden;
          border: 1px solid var(--line);
          padding: 32px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 20px;
        }
        .overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(12, 22, 36, 0.2), rgba(12, 22, 36, 0.6));
          pointer-events: none;
        }
        .hero-inner {
          position: relative;
          z-index: 1;
          display: grid;
          gap: 12px;
        }
        .tag {
          display: inline-flex;
          align-items: center;
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(154, 199, 255, 0.15);
          color: #cde2ff;
          font-weight: 700;
          letter-spacing: 0.05em;
        }
        h1 {
          margin: 0;
          font-size: clamp(32px, 5vw, 46px);
          line-height: 1.1;
          color: #f6fbff;
        }
        .hero p {
          margin: 0;
          color: var(--muted);
          line-height: 1.6;
          max-width: 600px;
        }
        .cta-row {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .primary {
          background: #9ac7ff;
          color: #0f172a;
          padding: 12px 16px;
          border-radius: 12px;
          font-weight: 700;
          box-shadow: 0 14px 36px rgba(154, 199, 255, 0.35);
        }
        .ghost {
          background: transparent;
          color: #e5ecf6;
          padding: 11px 15px;
          border-radius: 12px;
          border: 1px solid var(--line);
          font-weight: 600;
        }
        .metrics {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 10px;
        }
        .metrics div {
          padding: 12px;
          border: 1px solid var(--line);
          border-radius: 12px;
          background: rgba(17, 28, 46, 0.6);
          display: grid;
          gap: 4px;
        }
        .metric {
          font-size: 18px;
          font-weight: 700;
          color: #f6fbff;
        }
        .label {
          color: var(--muted);
        }
        .hero-card {
          position: relative;
          z-index: 1;
          border-radius: 18px;
          background: var(--card);
          padding: 18px;
          border: 1px solid var(--line);
          display: grid;
          gap: 12px;
        }
        .card-title {
          margin: 0;
          font-weight: 700;
          color: #e5ecf6;
        }
        .pill-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .pill {
          padding: 6px 10px;
          border-radius: 999px;
          background: #111c2e;
          border: 1px solid var(--line);
          color: #dbe9ff;
          font-weight: 600;
        }
        .timeline {
          display: grid;
          gap: 10px;
        }
        .node {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 10px;
          align-items: start;
        }
        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #9ac7ff;
          margin-top: 4px;
        }
        .node-title {
          margin: 0 0 4px;
          color: #f6fbff;
          font-weight: 700;
        }
        .node-copy {
          margin: 0;
          color: var(--muted);
        }
        .secondary {
          justify-self: start;
          background: transparent;
          color: #9ac7ff;
          border: 1px solid #9ac7ff;
          padding: 10px 14px;
          border-radius: 12px;
          font-weight: 700;
        }
        .section {
          border: 1px solid var(--line);
          border-radius: 18px;
          padding: 22px;
          background: var(--surface);
          display: grid;
          gap: 14px;
        }
        .section-header {
          display: grid;
          gap: 6px;
        }
        .eyebrow {
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #9ac7ff;
          font-weight: 700;
        }
        h2 {
          margin: 0;
          color: #f6fbff;
        }
        .service-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 12px;
        }
        .service {
          padding: 14px;
          border-radius: 12px;
          border: 1px dashed var(--line);
          background: rgba(17, 28, 46, 0.7);
        }
        .service h3 {
          margin: 0 0 6px;
          color: #f6fbff;
        }
        .service p {
          margin: 0;
          color: var(--muted);
        }
        .cards {
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        }
        .card {
          border-radius: 14px;
          border: 1px solid var(--line);
          padding: 16px;
          background: #0f172a;
        }
        .card h3 {
          margin: 4px 0 6px;
          color: #f6fbff;
        }
        .card p {
          margin: 0;
          color: var(--muted);
        }
        .footer-card {
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          align-items: center;
        }
        .footer-card p {
          margin: 4px 0;
          color: var(--muted);
        }
        .footer-card h2 {
          margin: 4px 0;
        }
        .actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: flex-start;
        }
        .dark.primary {
          background: #9ac7ff;
          color: #0f172a;
        }
        .dark.ghost {
          color: #e5ecf6;
          border-color: var(--line);
        }
        @media (max-width: 640px) {
          .page {
            padding: 30px 16px 70px;
          }
          .hero {
            padding: 24px;
          }
        }
      `}</style>
    </>
  );
}
