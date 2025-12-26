import Head from "next/head";

export default function Page() {
  return (
    <>
      <Head>
        <title>Kaleen Family Practice | Modern Dentistry</title>
        <meta
          name="description"
          content="Kaleen Family Practice provides calm, patient-first dental care with advanced technology in Canberra."
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;700&display=swap"
        />
      </Head>
      <main className="page">
        <section className="hero">
          <div className="halo" />
          <div className="hero-text">
            <div className="badge">Canberra • Family Dentistry</div>
            <h1>
              Kaleen Family Practice
              <span>Modern care for confident, healthy smiles.</span>
            </h1>
            <p className="lede">
              A calming dental home with gentle clinicians, same-day crowns, and
              technology that keeps every visit precise, quick, and comfortable.
            </p>
            <div className="cta-row">
              <button className="primary">Book a Visit</button>
              <button className="ghost">Call (02) 5550 2100</button>
            </div>
            <div className="stats">
              <div className="stat">
                <strong>30+</strong>
                <span>Years serving families in Kaleen</span>
              </div>
              <div className="stat">
                <strong>4.9★</strong>
                <span>Patient-rated for comfort & clarity</span>
              </div>
              <div className="stat">
                <strong>Zero</strong>
                <span>Rushed appointments or surprise fees</span>
              </div>
            </div>
          </div>
          <div className="hero-card">
            <div className="card-top">
              <div className="dot" />
              <div className="dot" />
              <div className="dot" />
            </div>
            <div className="card-body">
              <p className="card-label">Preview your visit</p>
              <div className="steps">
                <div className="step">
                  <div className="pill">01</div>
                  <div>
                    <p className="step-title">Personalised welcome</p>
                    <p className="step-copy">
                      We learn your goals, sensitivities, and preferences first.
                    </p>
                  </div>
                </div>
                <div className="step">
                  <div className="pill">02</div>
                  <div>
                    <p className="step-title">Guided diagnostics</p>
                    <p className="step-copy">
                      3D imaging and digital scans for precise, low-stress exams.
                    </p>
                  </div>
                </div>
                <div className="step">
                  <div className="pill">03</div>
                  <div>
                    <p className="step-title">Same-day solutions</p>
                    <p className="step-copy">
                      From whitening to crowns, we finish most treatments in one
                      visit.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="floating-card">
              <p className="floating-title">Comfort-first design</p>
              <p className="floating-copy">
                Warm lighting, noise-cancelling headphones, blankets, and
                pressure-free explanations at every step.
              </p>
            </div>
          </div>
        </section>

        <section className="panel services">
          <div className="panel-header">
            <p className="eyebrow">Everything you need</p>
            <h2>Complete dental care without referrals</h2>
            <p className="subtext">
              Preventative, restorative, cosmetic, and emergency care delivered
              by the clinicians you already trust.
            </p>
          </div>
          <div className="service-grid">
            <div className="service-card">
              <p className="service-title">Preventative & hygiene</p>
              <p>
                Thorough cleans, gum health checks, fluoride treatments, and
                custom night guards.
              </p>
              <span className="chip">Keep issues small</span>
            </div>
            <div className="service-card">
              <p className="service-title">Restorative precision</p>
              <p>
                Same-day crowns, tooth-colored fillings, and gentle root
                canals with digital guidance.
              </p>
              <span className="chip">Long-lasting</span>
            </div>
            <div className="service-card">
              <p className="service-title">Cosmetic confidence</p>
              <p>
                Whitening, clear aligners, and smile design plans tailored to
                your timeline and budget.
              </p>
              <span className="chip">Feel-your-best</span>
            </div>
            <div className="service-card">
              <p className="service-title">Family & kids</p>
              <p>
                Playful, gentle care for little ones, plus education that helps
                teens build great habits.
              </p>
              <span className="chip">Family-friendly</span>
            </div>
          </div>
        </section>

        <section className="panel experience">
          <div className="experience-copy">
            <p className="eyebrow">Designed to be calm</p>
            <h2>No white-knuckle appointments</h2>
            <ul className="benefits">
              <li>Quiet rooms with filtered air and natural light</li>
              <li>Clear pricing before treatment—no surprises</li>
              <li>Gentle numbing options plus sedation on request</li>
              <li>Extended hours for busy schedules and emergencies</li>
            </ul>
            <div className="cta-row">
              <button className="primary">Schedule a consultation</button>
              <button className="ghost">See available times</button>
            </div>
          </div>
          <div className="experience-card">
            <div className="quote">
              <p>
                "I've never felt so heard by a dentist. The team explained every
                option and made sure I was comfortable the entire time."
              </p>
              <span>— Priya, patient since 2016</span>
            </div>
            <div className="divider" />
            <div className="quick-facts">
              <div>
                <p className="fact-title">Digital-first</p>
                <p className="fact-copy">3D imaging, intraoral cameras, and AI diagnostics.</p>
              </div>
              <div>
                <p className="fact-title">Community-minded</p>
                <p className="fact-copy">Local, independent practice with flexible plans.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="panel contact">
          <div>
            <p className="eyebrow">Visit Kaleen Family Practice</p>
            <h2>Ready for a calmer dental experience?</h2>
            <p className="subtext">
              51 Baldwin Drive, Kaleen ACT • Open Mon–Sat • Emergency appointments reserved daily
            </p>
          </div>
          <div className="contact-grid">
            <div className="contact-card">
              <p className="contact-title">Booking</p>
              <p>(02) 5550 2100</p>
              <p>hello@kaleenfamilypractice.com</p>
              <button className="secondary">Book online</button>
            </div>
            <div className="contact-card">
              <p className="contact-title">Hours</p>
              <p>Mon–Thu: 8:00 – 18:00</p>
              <p>Fri: 8:00 – 16:00 • Sat: 8:30 – 12:00</p>
              <button className="secondary ghosted">Add to calendar</button>
            </div>
            <div className="contact-card">
              <p className="contact-title">Parking & access</p>
              <p>On-site parking, pram-friendly entrance, step-free access.</p>
              <button className="secondary ghosted">Get directions</button>
            </div>
          </div>
        </section>
      </main>

      <style jsx global>{`
        :root {
          --ink: #0d1b2a;
          --ink-soft: #233445;
          --canvas: #f4f7f9;
          --primary: #0ea5a3;
          --primary-dark: #0b8482;
          --card: #ffffff;
          --muted: #5b7083;
          --accent: #f6fbff;
        }
        * {
          box-sizing: border-box;
        }
        body {
          margin: 0;
          background: var(--canvas);
          color: var(--ink);
          font-family: "Manrope", "Helvetica Neue", "Segoe UI", sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        button {
          font: inherit;
          cursor: pointer;
          border: none;
          outline: none;
        }
      `}</style>

      <style jsx>{`
        .page {
          min-height: 100vh;
          padding: 40px 24px 120px;
          background: radial-gradient(circle at 15% 20%, #d9f5f4 0, rgba(255, 255, 255, 0) 35%),
            radial-gradient(circle at 85% 10%, #e1f0ff 0, rgba(255, 255, 255, 0) 30%),
            linear-gradient(135deg, #f7fbff 0%, #eef7f6 50%, #f8fbfe 100%);
        }
        .hero {
          position: relative;
          background: var(--card);
          border-radius: 28px;
          padding: 48px;
          overflow: hidden;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 32px;
          box-shadow: 0 20px 60px rgba(13, 27, 42, 0.08);
        }
        .halo {
          position: absolute;
          inset: -60px -80px auto auto;
          width: 380px;
          height: 380px;
          background: radial-gradient(circle, rgba(14, 165, 163, 0.25), rgba(14, 165, 163, 0));
          filter: blur(10px);
          z-index: 0;
        }
        .hero-text {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          background: #e7f8f7;
          color: #06615f;
          border-radius: 999px;
          font-weight: 700;
          width: fit-content;
          letter-spacing: 0.01em;
        }
        h1 {
          font-size: clamp(34px, 5vw, 46px);
          line-height: 1.1;
          margin: 0;
          color: var(--ink);
        }
        h1 span {
          display: block;
          font-weight: 400;
          color: var(--muted);
          margin-top: 10px;
          line-height: 1.4;
        }
        h2 {
          margin: 0;
          font-size: clamp(28px, 4vw, 36px);
          line-height: 1.2;
        }
        .lede {
          color: var(--muted);
          font-size: 18px;
          margin: 0;
          max-width: 640px;
        }
        .cta-row {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .primary {
          background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          color: white;
          padding: 14px 20px;
          border-radius: 12px;
          font-weight: 700;
          box-shadow: 0 12px 30px rgba(14, 165, 163, 0.25);
        }
        .ghost {
          background: transparent;
          color: var(--ink);
          padding: 12px 18px;
          border-radius: 12px;
          border: 1px solid #dbe3eb;
          font-weight: 600;
        }
        .stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
          margin-top: 10px;
        }
        .stat {
          padding: 16px;
          background: var(--accent);
          border-radius: 14px;
          border: 1px solid #e4eef5;
          display: grid;
          gap: 6px;
        }
        .stat strong {
          font-size: 22px;
        }
        .stat span {
          color: var(--muted);
          line-height: 1.4;
        }
        .hero-card {
          position: relative;
          background: #0f1f2d;
          color: white;
          border-radius: 20px;
          padding: 22px;
          overflow: hidden;
          min-height: 360px;
          box-shadow: 0 18px 40px rgba(13, 27, 42, 0.35);
        }
        .card-top {
          display: flex;
          gap: 8px;
          margin-bottom: 14px;
        }
        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.4);
        }
        .card-body {
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0));
          border-radius: 12px;
          padding: 14px;
        }
        .card-label {
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-size: 12px;
          margin: 0 0 10px;
          color: rgba(255, 255, 255, 0.7);
        }
        .steps {
          display: grid;
          gap: 12px;
        }
        .step {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 12px;
          align-items: start;
        }
        .pill {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(14, 165, 163, 0.25);
          display: grid;
          place-items: center;
          font-weight: 700;
        }
        .step-title {
          margin: 0 0 4px;
          font-weight: 700;
        }
        .step-copy {
          margin: 0;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.5;
        }
        .floating-card {
          position: absolute;
          inset: auto 16px 16px auto;
          max-width: 260px;
          background: #12283a;
          padding: 14px 16px;
          border-radius: 14px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .floating-title {
          margin: 0 0 6px;
          font-weight: 700;
        }
        .floating-copy {
          margin: 0;
          color: rgba(255, 255, 255, 0.75);
          line-height: 1.5;
        }
        .panel {
          margin-top: 48px;
          background: var(--card);
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 12px 36px rgba(13, 27, 42, 0.07);
        }
        .panel-header {
          max-width: 760px;
          display: grid;
          gap: 10px;
          margin-bottom: 28px;
        }
        .eyebrow {
          margin: 0;
          color: var(--primary-dark);
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-size: 13px;
        }
        .subtext {
          margin: 0;
          color: var(--muted);
          line-height: 1.6;
        }
        .service-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 18px;
        }
        .service-card {
          padding: 18px;
          border: 1px solid #e4eef5;
          border-radius: 14px;
          background: linear-gradient(180deg, #fbfefe, #f7fbff);
          display: grid;
          gap: 10px;
        }
        .service-title {
          margin: 0;
          font-weight: 700;
          font-size: 16px;
        }
        .service-card p {
          margin: 0;
          color: var(--ink-soft);
          line-height: 1.5;
        }
        .chip {
          align-self: flex-start;
          background: #e7f8f7;
          color: #06615f;
          padding: 6px 10px;
          border-radius: 999px;
          font-weight: 700;
          font-size: 12px;
        }
        .experience {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 28px;
        }
        .benefits {
          margin: 12px 0 0;
          padding: 0;
          list-style: none;
          display: grid;
          gap: 10px;
          color: var(--ink-soft);
        }
        .benefits li {
          padding-left: 16px;
          position: relative;
          line-height: 1.5;
        }
        .benefits li::before {
          content: "";
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--primary);
          position: absolute;
          left: 0;
          top: 9px;
        }
        .experience-card {
          border: 1px solid #e4eef5;
          border-radius: 16px;
          padding: 20px;
          background: #f7fbff;
          display: grid;
          gap: 16px;
        }
        .quote p {
          margin: 0;
          font-size: 16px;
          line-height: 1.6;
          color: var(--ink);
        }
        .quote span {
          display: block;
          margin-top: 8px;
          color: var(--muted);
          font-weight: 600;
        }
        .divider {
          width: 100%;
          height: 1px;
          background: #d8e4ee;
        }
        .quick-facts {
          display: grid;
          gap: 14px;
        }
        .fact-title {
          margin: 0;
          font-weight: 700;
        }
        .fact-copy {
          margin: 4px 0 0;
          color: var(--ink-soft);
          line-height: 1.5;
        }
        .contact {
          display: grid;
          gap: 22px;
        }
        .contact-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 16px;
        }
        .contact-card {
          border: 1px solid #e4eef5;
          border-radius: 14px;
          padding: 18px;
          background: #fbfefe;
          display: grid;
          gap: 8px;
        }
        .contact-title {
          margin: 0;
          font-weight: 700;
        }
        .contact-card p {
          margin: 0;
          color: var(--ink-soft);
        }
        .secondary {
          background: var(--primary);
          color: white;
          padding: 10px 14px;
          border-radius: 10px;
          font-weight: 700;
          border: 1px solid transparent;
        }
        .ghosted {
          background: transparent;
          color: var(--ink);
          border-color: #dbe3eb;
        }
        @media (max-width: 640px) {
          .hero,
          .panel {
            padding: 28px;
          }
          .page {
            padding: 24px 18px 72px;
          }
          .floating-card {
            position: relative;
            inset: auto;
            margin-top: 18px;
          }
        }
      `}</style>
    </>
  );
}
