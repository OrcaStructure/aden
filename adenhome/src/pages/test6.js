import Head from "next/head";

export default function Page() {
  return (
    <>
      <Head>
        <title>Kaleen Family Practice | Elevated Care</title>
        <meta
          name="description"
          content="An elevated, editorial design for a calm, expert dental practice."
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;600;700&display=swap"
        />
      </Head>
      <main className="page">
        <section className="hero">
          <div className="hero-left">
            <p className="eyebrow">Kaleen Family Practice</p>
            <h1>Expert dentistry, human warmth.</h1>
            <p className="lede">
              A boutique, patient-first dental studio with advanced imaging,
              clear pricing, and appointments that feel unhurried.
            </p>
            <div className="cta-row">
              <button className="primary">Book a consultation</button>
              <button className="ghost">Call (02) 5550 2100</button>
            </div>
            <div className="badges">
              <span>Digital scans</span>
              <span>Same-day crowns</span>
              <span>Aligners</span>
              <span>Emergency</span>
            </div>
          </div>
          <div className="hero-card">
            <p className="card-title">Next available</p>
            <div className="slots">
              <div className="slot">
                <div>
                  <p className="day">Today</p>
                  <p className="time">4:15 PM</p>
                </div>
                <button className="secondary">Hold</button>
              </div>
              <div className="slot">
                <div>
                  <p className="day">Tomorrow</p>
                  <p className="time">9:45 AM</p>
                </div>
                <button className="secondary">Hold</button>
              </div>
            </div>
            <div className="divider" />
            <div className="quick">
              <div>
                <p className="label">Address</p>
                <p>51 Baldwin Drive, Kaleen</p>
              </div>
              <div>
                <p className="label">Access</p>
                <p>Parking, step free, pram friendly</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section duo">
          <div>
            <p className="eyebrow">Approach</p>
            <h2>Less clinic. More calm.</h2>
            <p className="copy">
              Warm lighting, soft textures, and clinicians who lead with empathy.
              We invest in longer appointments so you never feel rushed.
            </p>
            <ul>
              <li>Comfort menu: blankets, headphones, aromatherapy.</li>
              <li>Digital diagnostics you can see on screen.</li>
              <li>Transparent plans with timelines and itemized fees.</li>
            </ul>
          </div>
          <div className="feature-card">
            <p className="eyebrow">Services</p>
            <div className="list">
              <div>
                <h3>Preventative</h3>
                <p>Hygiene, gum therapy, fluoride, night guards.</p>
              </div>
              <div>
                <h3>Restorative</h3>
                <p>Same-day crowns, fillings, root canals with digital guides.</p>
              </div>
              <div>
                <h3>Cosmetic</h3>
                <p>Whitening, aligners, smile design previews.</p>
              </div>
              <div>
                <h3>Family</h3>
                <p>Kid friendly rooms, pacing breaks, weekend options.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section trio">
          <div className="pill-card">
            <p className="pill-title">Comfort-first</p>
            <p className="copy">
              Quiet air, soft seating, and a team that checks in often.
            </p>
          </div>
          <div className="pill-card">
            <p className="pill-title">Clear pricing</p>
            <p className="copy">
              Plans are written, itemized, and agreed before care begins.
            </p>
          </div>
          <div className="pill-card">
            <p className="pill-title">Responsive</p>
            <p className="copy">
              Same-day whitening, crowns, and reserved emergency time daily.
            </p>
          </div>
        </section>

        <section className="section footer">
          <div>
            <p className="eyebrow">Visit Kaleen Family Practice</p>
            <h2>Ready for a calmer appointment?</h2>
            <p className="copy">Open Mon to Sat • Parking on site</p>
          </div>
          <div className="cta-row">
            <button className="primary">Book online</button>
            <button className="ghost">Email us</button>
          </div>
        </section>
      </main>

      <style jsx global>{`
        :root {
          --ink: #0f1f1a;
          --muted: #4c5c55;
          --canvas: #f3f4f2;
          --card: #0e201c;
          --line: #d8e0db;
          --accent: #8fb7a2;
          --accent-strong: #5f9077;
        }
        body {
          margin: 0;
          background: var(--canvas);
          font-family: "Cabinet Grotesk", "Inter", system-ui, -apple-system,
            sans-serif;
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
          padding: 48px 18px 90px;
          display: grid;
          gap: 24px;
        }
        .hero {
          background: #fdfdfc;
          border: 1px solid var(--line);
          border-radius: 26px;
          padding: 32px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.05);
        }
        .hero-left {
          display: grid;
          gap: 12px;
        }
        .eyebrow {
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.09em;
          font-weight: 700;
          color: var(--accent-strong);
          font-size: 13px;
        }
        h1 {
          margin: 0;
          font-size: clamp(32px, 5vw, 42px);
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
          background: linear-gradient(135deg, var(--accent), var(--accent-strong));
          color: white;
          padding: 12px 16px;
          border-radius: 12px;
          font-weight: 700;
          box-shadow: 0 14px 30px rgba(95, 144, 119, 0.28);
        }
        .ghost {
          background: transparent;
          color: var(--ink);
          padding: 11px 15px;
          border-radius: 12px;
          border: 1px solid var(--line);
          font-weight: 600;
        }
        .badges {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          color: var(--muted);
        }
        .badges span {
          padding: 8px 12px;
          border-radius: 999px;
          background: #eef2ef;
          border: 1px solid var(--line);
          font-weight: 600;
        }
        .hero-card {
          border-radius: 18px;
          background: var(--card);
          color: #e6f0eb;
          padding: 18px;
          border: 1px solid #143229;
          display: grid;
          gap: 12px;
        }
        .card-title {
          margin: 0;
          font-weight: 700;
        }
        .slots {
          display: grid;
          gap: 10px;
        }
        .slot {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .day {
          margin: 0;
          color: #b6d2c4;
          font-weight: 700;
        }
        .time {
          margin: 4px 0 0;
          font-size: 20px;
          font-weight: 700;
          color: white;
        }
        .secondary {
          background: transparent;
          color: #e6f0eb;
          border: 1px solid rgba(255, 255, 255, 0.4);
          padding: 8px 12px;
          border-radius: 10px;
          font-weight: 700;
        }
        .divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.1);
          width: 100%;
        }
        .quick {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 10px;
        }
        .label {
          margin: 0;
          font-weight: 700;
          color: #b6d2c4;
        }
        .quick p {
          margin: 4px 0 0;
          color: #dbe8e2;
        }
        .section {
          border: 1px solid var(--line);
          border-radius: 18px;
          background: #ffffff;
          padding: 22px;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.04);
        }
        .duo {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 16px;
          align-items: start;
        }
        h2 {
          margin: 0;
          font-size: 24px;
        }
        .copy {
          margin: 8px 0 0;
          color: var(--muted);
          line-height: 1.6;
        }
        ul {
          margin: 8px 0 0;
          padding-left: 16px;
          color: var(--muted);
          line-height: 1.6;
          display: grid;
          gap: 6px;
        }
        .feature-card {
          background: #f6f8f6;
          border: 1px dashed var(--line);
          border-radius: 14px;
          padding: 16px;
          display: grid;
          gap: 10px;
        }
        .list {
          display: grid;
          gap: 10px;
        }
        h3 {
          margin: 0 0 6px;
        }
        .trio {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 12px;
        }
        .pill-card {
          padding: 14px;
          border-radius: 14px;
          border: 1px solid var(--line);
          background: #fdfdfc;
        }
        .pill-title {
          margin: 0 0 6px;
          font-weight: 700;
        }
        .footer {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 12px;
          align-items: center;
        }
        @media (max-width: 620px) {
          .page {
            padding: 28px 14px 70px;
          }
          .hero {
            padding: 24px;
          }
        }
      `}</style>
    </>
  );
}
