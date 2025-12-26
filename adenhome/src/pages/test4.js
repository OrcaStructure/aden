import Head from "next/head";

export default function Page() {
  return (
    <>
      <Head>
        <title>Kaleen Family Practice | Warm Welcome</title>
        <meta
          name="description"
          content="A warm, design-forward dental experience with attentive clinicians and clear communication."
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap"
        />
      </Head>
      <main className="page">
        <section className="top">
          <div className="intro">
            <p className="eyebrow">Kaleen Family Practice</p>
            <h1>Gentle dentistry, beautifully delivered.</h1>
            <p className="lede">
              Human-centered care with digital precision. We protect your time,
              comfort, and confidence from the first hello.
            </p>
            <div className="cta-row">
              <button className="primary">Book a visit</button>
              <button className="ghost">Call (02) 5550 2100</button>
            </div>
            <div className="chips">
              <span>Same-day crowns</span>
              <span>Clear aligners</span>
              <span>Preventative care</span>
            </div>
          </div>
          <div className="tiles">
            <div className="tile">
              <p className="label">Atmosphere</p>
              <h3>Calm rooms</h3>
              <p className="copy">Natural light, soft textiles, quiet air.</p>
            </div>
            <div className="tile">
              <p className="label">Approach</p>
              <h3>Zero surprises</h3>
              <p className="copy">Transparent pricing and timelines.</p>
            </div>
            <div className="tile">
              <p className="label">Experience</p>
              <h3>Patient-first</h3>
              <p className="copy">You set the pace. We keep you informed.</p>
            </div>
          </div>
        </section>

        <section className="section highlights">
          <div className="block">
            <p className="eyebrow">Your visit</p>
            <h2>Predictable and calm from start to finish</h2>
            <ol>
              <li>
                Arrive to warm lighting, friendly faces, and tea or sparkling water.
              </li>
              <li>Digital scans and imaging that you can see in real time.</li>
              <li>Step-by-step options with timelines and clear pricing.</li>
              <li>Comfort menu: blankets, headphones, aromatherapy, pacing breaks.</li>
            </ol>
          </div>
          <div className="block card">
            <p className="eyebrow">Availability</p>
            <div className="slots">
              <div>
                <p className="slot-day">Today</p>
                <p className="slot-time">4:30 PM</p>
                <button className="secondary">Hold slot</button>
              </div>
              <div>
                <p className="slot-day">Tomorrow</p>
                <p className="slot-time">10:00 AM</p>
                <button className="secondary">Hold slot</button>
              </div>
            </div>
            <p className="note">Need something sooner? We reserve emergency time daily.</p>
          </div>
        </section>

        <section className="section services">
          <div className="header">
            <p className="eyebrow">Services</p>
            <h2>Everything in one practice</h2>
          </div>
          <div className="grid">
            <div className="service">
              <h3>Preventative</h3>
              <p>Comprehensive exams, hygiene, gum therapy, fluoride.</p>
            </div>
            <div className="service">
              <h3>Restorative</h3>
              <p>Same-day crowns, fillings, root canals, night guards.</p>
            </div>
            <div className="service">
              <h3>Cosmetic</h3>
              <p>Whitening, aligners, smile design with digital previews.</p>
            </div>
            <div className="service">
              <h3>Family</h3>
              <p>Kid friendly rooms, patient pacing, weekend appointments.</p>
            </div>
          </div>
        </section>

        <section className="section contact">
          <div>
            <p className="eyebrow">Visit Kaleen Family Practice</p>
            <h2>51 Baldwin Drive, Kaleen</h2>
            <p className="copy">
              Parking on site • Step free access • Open Mon to Sat
            </p>
          </div>
          <div className="cta-row">
            <button className="primary">Book online</button>
            <button className="ghost">Call (02) 5550 2100</button>
          </div>
        </section>
      </main>

      <style jsx global>{`
        :root {
          --ink: #1f2933;
          --muted: #5c6c7a;
          --canvas: #f7f3ef;
          --card: #ffffff;
          --line: #e3d8cf;
          --accent: #d6a567;
          --accent-dark: #b78543;
        }
        body {
          margin: 0;
          background: var(--canvas);
          font-family: "DM Sans", "Inter", system-ui, -apple-system, sans-serif;
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
          padding: 46px 18px 90px;
          display: grid;
          gap: 26px;
        }
        .top {
          background: linear-gradient(135deg, #fffaf5, #f1ebe4);
          border: 1px solid var(--line);
          border-radius: 24px;
          padding: 32px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          box-shadow: 0 18px 50px rgba(43, 30, 15, 0.06);
        }
        .intro {
          display: grid;
          gap: 12px;
        }
        .eyebrow {
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 700;
          color: var(--accent-dark);
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
          max-width: 620px;
        }
        .cta-row {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .primary {
          background: linear-gradient(135deg, var(--accent), var(--accent-dark));
          color: white;
          padding: 12px 16px;
          border-radius: 12px;
          font-weight: 700;
          box-shadow: 0 12px 30px rgba(214, 165, 103, 0.35);
        }
        .ghost {
          background: transparent;
          color: var(--ink);
          padding: 11px 15px;
          border-radius: 12px;
          border: 1px solid var(--line);
          font-weight: 600;
        }
        .chips {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          color: var(--muted);
        }
        .chips span {
          padding: 8px 12px;
          border-radius: 999px;
          background: #fff;
          border: 1px solid var(--line);
          font-weight: 600;
        }
        .tiles {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }
        .tile {
          border: 1px solid var(--line);
          border-radius: 14px;
          padding: 14px;
          background: #fff;
          display: grid;
          gap: 6px;
        }
        .label {
          margin: 0;
          font-weight: 700;
          color: var(--accent-dark);
        }
        h3 {
          margin: 0;
        }
        .copy {
          margin: 0;
          color: var(--muted);
        }
        .section {
          border: 1px solid var(--line);
          border-radius: 18px;
          padding: 24px;
          background: var(--card);
          display: grid;
          gap: 14px;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.04);
        }
        .highlights {
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        }
        .block {
          display: grid;
          gap: 10px;
        }
        ol {
          margin: 0;
          padding-left: 16px;
          color: var(--muted);
          line-height: 1.6;
          display: grid;
          gap: 6px;
        }
        .card {
          background: #fbf6ef;
          border-color: #e7d8c9;
          border-radius: 14px;
        }
        .slots {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 10px;
        }
        .slot-day {
          margin: 0;
          font-weight: 700;
          color: var(--accent-dark);
        }
        .slot-time {
          margin: 4px 0 10px;
          font-size: 20px;
          font-weight: 700;
        }
        .secondary {
          background: transparent;
          color: var(--ink);
          border: 1px solid var(--line);
          padding: 9px 13px;
          border-radius: 10px;
          font-weight: 700;
        }
        .note {
          margin: 6px 0 0;
          color: var(--muted);
        }
        .services .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 12px;
        }
        .service {
          padding: 14px;
          border: 1px dashed var(--line);
          border-radius: 12px;
          background: #fffdfa;
          display: grid;
          gap: 6px;
        }
        .contact {
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          align-items: center;
        }
        .contact .copy {
          color: var(--muted);
        }
        @media (max-width: 620px) {
          .page {
            padding: 28px 14px 70px;
          }
          .top {
            padding: 24px;
          }
        }
      `}</style>
    </>
  );
}
