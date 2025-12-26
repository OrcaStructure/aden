import Head from "next/head";

export default function Page() {
  return (
    <>
      <Head>
        <title>Kaleen Family Practice | Calming Care</title>
        <meta
          name="description"
          content="A clean, confident dental experience with clear pricing and gentle clinicians."
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap"
        />
      </Head>
      <main className="page">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Kaleen Family Practice</p>
            <h1>Care that feels like a breath out.</h1>
            <p className="lede">
              Quiet rooms, soft lighting, same-day solutions, and clinicians who
              explain every option before they start.
            </p>
            <div className="cta-row">
              <button className="primary">Book a calm visit</button>
              <button className="ghost">Talk to a clinician</button>
            </div>
            <div className="trust">
              <div>
                <strong>4.9</strong>
                <span>Patient rating</span>
              </div>
              <div>
                <strong>Same day</strong>
                <span>Whitening and crowns</span>
              </div>
              <div>
                <strong>No surprises</strong>
                <span>Upfront, itemized pricing</span>
              </div>
            </div>
          </div>
          <div className="hero-card">
            <div className="card-top">
              <p>Tomorrow, 10:30 AM</p>
              <span className="pill">2 slots</span>
            </div>
            <div className="card-body">
              <p className="card-title">What you can expect</p>
              <ul>
                <li>Scan and diagnose with 3D imaging</li>
                <li>Guided explanation of findings</li>
                <li>Same-day treatment plans</li>
                <li>Comfort menu: blankets, headphones, movies</li>
              </ul>
              <button className="secondary">Hold this time</button>
            </div>
          </div>
        </section>

        <section className="panel services">
          <div className="panel-header">
            <h2>Everything in one calm space</h2>
            <p>
              Preventative, restorative, cosmetic, and emergency dentistry under
              one roof. No bouncing between referrals.
            </p>
          </div>
          <div className="grid">
            <div className="card">
              <p className="label">Prevent</p>
              <h3>Hygiene and gum health</h3>
              <p>Gentle cleans, gum checks, and proactive care plans.</p>
            </div>
            <div className="card">
              <p className="label">Restore</p>
              <h3>Same-day crowns</h3>
              <p>Digital scanning and milling that fits in a single visit.</p>
            </div>
            <div className="card">
              <p className="label">Smile</p>
              <h3>Whitening and aligners</h3>
              <p>Custom trays or in-chair whitening. Clear aligners for adults.</p>
            </div>
            <div className="card">
              <p className="label">Support</p>
              <h3>Family first</h3>
              <p>Kid friendly rooms, patient pacing, weekend options.</p>
            </div>
          </div>
        </section>

        <section className="panel highlights">
          <div className="list">
            <div className="item">
              <h4>Zero rush appointments</h4>
              <p>We block generous time so you never feel hurried.</p>
            </div>
            <div className="item">
              <h4>Transparent pricing</h4>
              <p>Every plan is itemized before we begin. No last minute adds.</p>
            </div>
            <div className="item">
              <h4>Comfort menu</h4>
              <p>Warm blankets, headphones, and aromatherapy on request.</p>
            </div>
          </div>
          <div className="contact-card">
            <p className="eyebrow">Visit us</p>
            <h3>51 Baldwin Drive, Kaleen</h3>
            <p>Parking on site • Step free access • Open Mon to Sat</p>
            <div className="cta-row">
              <button className="primary">Book online</button>
              <button className="ghost">Call (02) 5550 2100</button>
            </div>
          </div>
        </section>
      </main>

      <style jsx global>{`
        :root {
          --ink: #111827;
          --muted: #4b5563;
          --canvas: #f6f7f9;
          --card: #ffffff;
          --line: #e5e7eb;
          --accent: #7ac3c0;
          --accent-dark: #4c9a98;
        }
        body {
          margin: 0;
          font-family: "Space Grotesk", "Inter", system-ui, -apple-system,
            sans-serif;
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
          padding: 42px 22px 90px;
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          gap: 28px;
        }
        .hero {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 22px;
          background: linear-gradient(135deg, #fdfefe, #f3f6f8);
          border: 1px solid var(--line);
          border-radius: 24px;
          padding: 30px;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.06);
        }
        .hero-copy {
          display: grid;
          gap: 14px;
        }
        .eyebrow {
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 700;
          color: var(--accent-dark);
          margin: 0;
        }
        h1 {
          margin: 0;
          font-size: clamp(32px, 5vw, 44px);
          line-height: 1.1;
        }
        .lede {
          margin: 0;
          color: var(--muted);
          line-height: 1.6;
          max-width: 560px;
        }
        .cta-row {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items: center;
        }
        .primary {
          background: linear-gradient(135deg, var(--accent), var(--accent-dark));
          color: white;
          padding: 12px 16px;
          border-radius: 12px;
          font-weight: 700;
          box-shadow: 0 12px 30px rgba(74, 144, 140, 0.25);
        }
        .ghost {
          background: transparent;
          color: var(--ink);
          padding: 11px 15px;
          border-radius: 12px;
          border: 1px solid var(--line);
          font-weight: 600;
        }
        .trust {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 12px;
        }
        .trust div {
          padding: 14px;
          border: 1px solid var(--line);
          border-radius: 12px;
          background: #ffffff;
          display: grid;
          gap: 6px;
        }
        .trust strong {
          font-size: 18px;
        }
        .trust span {
          color: var(--muted);
        }
        .hero-card {
          border: 1px solid var(--line);
          border-radius: 18px;
          background: var(--card);
          padding: 18px;
          display: grid;
          gap: 12px;
        }
        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: var(--muted);
          font-weight: 600;
        }
        .pill {
          display: inline-block;
          padding: 6px 10px;
          border-radius: 999px;
          background: #eef6f6;
          color: var(--accent-dark);
          font-weight: 700;
          border: 1px solid #d7e8e8;
        }
        .card-body {
          display: grid;
          gap: 10px;
        }
        .card-title {
          margin: 0;
          font-weight: 700;
          font-size: 16px;
        }
        ul {
          margin: 0;
          padding-left: 16px;
          color: var(--muted);
          line-height: 1.5;
          display: grid;
          gap: 6px;
        }
        .secondary {
          justify-self: start;
          background: #0f172a;
          color: white;
          padding: 11px 15px;
          border-radius: 12px;
          font-weight: 700;
        }
        .panel {
          border: 1px solid var(--line);
          border-radius: 20px;
          padding: 26px;
          background: var(--card);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
        }
        .panel-header h2 {
          margin: 0 0 8px;
        }
        .panel-header p {
          margin: 0;
          color: var(--muted);
          max-width: 640px;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 14px;
          margin-top: 16px;
        }
        .card {
          border: 1px solid var(--line);
          border-radius: 14px;
          padding: 16px;
          background: linear-gradient(180deg, #ffffff, #f9fbfb);
          display: grid;
          gap: 6px;
        }
        .label {
          margin: 0;
          font-weight: 700;
          color: var(--accent-dark);
          letter-spacing: 0.02em;
        }
        h3 {
          margin: 0;
          font-size: 17px;
        }
        .highlights {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 16px;
          align-items: start;
        }
        .list {
          display: grid;
          gap: 12px;
        }
        .item {
          padding: 14px;
          border: 1px solid var(--line);
          border-radius: 12px;
          background: #f9fbfb;
        }
        .item h4 {
          margin: 0 0 6px;
        }
        .item p {
          margin: 0;
          color: var(--muted);
        }
        .contact-card {
          border: 1px solid var(--line);
          border-radius: 14px;
          padding: 16px;
          background: #0f172a;
          color: white;
          display: grid;
          gap: 8px;
        }
        .contact-card p {
          margin: 0;
          color: #cbd5e1;
        }
        .contact-card h3 {
          margin: 0;
          color: white;
        }
        @media (max-width: 600px) {
          .page {
            padding: 24px 16px 70px;
          }
          .hero {
            padding: 22px;
          }
        }
      `}</style>
    </>
  );
}
