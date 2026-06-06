import React from "react";

export default function Resume() {
  return (
    <div className="resume-page w-full max-w-3xl mx-auto p-8 bg-gray-100">

      <div className="resume-grid grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* LEFT SIDEBAR */}
        <aside className="resume-sidebar md:col-span-1 bg-white shadow-lg rounded-xl p-6 space-y-6">
          
      

          {/* Name + Role */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Aden Power</h1>
            <p className="text-gray-700">Researcher in AI and Mathematics</p>
          </div>

          {/* Contact */}
          <SectionTitle>Contact</SectionTitle>
          <div className="text-sm space-y-1 text-gray-700">
            <p>Email: adenpower.work@gmail.com</p>
            <p>Phone: +61 426 051 560</p>
          </div>

          {/* Skills */}
          <SectionTitle>Technical Skills</SectionTitle>
          <ul className="list-disc ml-6 text-sm space-y-1 text-gray-700">
            <li>ML stack including PyTorch, TensorFlow, LangChain, CUDA, etc</li>
            <li>Web dev stack including ReactJS</li>
            <li>Research skills including theoretical (mathematical literature) and practical (designing and building AI/ML experiments)</li>
          </ul>

          {/* Awards */}
          <SectionTitle>Awards</SectionTitle>
          <ul className="list-disc ml-6 text-sm space-y-1 text-gray-700">
            <li>Australian Defence Force Future Innovators Award</li>
            <li>The Scholastic Excellence Mathematics Medallion</li>
            <li>Simon Marais Mathematics Competition Honour Roll</li>
            <li>Australian Institute of Physics Award for Excellence</li>
            <li>Academic Full Colours</li>
          </ul>

          {/* Projects */}
          <SectionTitle>Projects</SectionTitle>
          <ul className="list-disc ml-6 text-sm space-y-1 text-gray-700">
            <li>(2022) Created suburble.au viral web game which has accumulated over 400,000 plays and attracted media attention.</li>
            <li>(2023) Created innovative chess opening explorer tool</li>
            <li>(2025 - ongoing) Designing evolutionary and cellular automata simulations to make short-form educational content</li>
          </ul>

        </aside>

        {/* MAIN CONTENT */}
        <main className="resume-main md:col-span-2 bg-white shadow-lg rounded-xl p-8 space-y-10">

          {/* Education */}
          <MainSection title="Education">
            <EduItem
              degree="Sydney AI Safety Fellowship"
              school="AI Safety ANZ"
              years="2026"
              details="Ongoing research into misalignment in multi-agent dynamics."
            />

            <EduItem
              degree="Bachelor of Philosophy (Honours) - Science"
              school="Australian National University"
              years="2022–2025"
              details="First class honours in mathematics: 'Piecewise-flat Manifolds and their Ricci Flow'."
              extra="6.97/7.00 GPA"
            />

            <EduItem
              degree="National Mathematics Summer School"
              school="Australian National University"
              years="2021–2022"
              details="One of 72 students invited in the main cohort. One of 12 students reinvited in the experienced cohort."
              extra=""
            />

            <EduItem
              degree="ANU Extension in Specialist Mathematics"
              school="Australian National University"
              years="2020–2021"
              details="Completed extension course during years 11 and 12."
              extra="High distinction average"
            />

            <EduItem
              degree="Year 12 Certificate"
              school="Australian National University"
              years="2020–2021"
              details="Dux of the College, first in class in Mathematics, Physics, Chemistry and Religious Studies"
              extra="99.80 ATAR"
            />
          </MainSection>

          {/* Work Experience */}
          <MainSection title="Work Experience">
            <WorkItem
              title="Junior Research Engineer"
              company="ML Research Labs (A Trellis Data Company)"
              years="2024–Present"
              detailed
              bullets={[
                "Designed and implemented research experiments on model training, particularly for LLMs and related architectures using RLVR across various tasks and environments and performed distributed training on local and cloud GPU clusters.",
                "Built and implemented training pipelines for large generative, ASR and translation models",
                "Lead on Low-Resource Language Learning project, led two intern teams to build original agentic translation methods I designed.",
                "Quantitative trading using natural language processing to incorporate alternative data.",
              ]}
            />

            <WorkItem
              title="Cofounder"
              company="Devlock"
              years="2024–present"
              summary="Web development, software development and automation for local business."
            />

            <WorkItem
              title="Mathematics and Chess Teaching"
              company="Private, ACTJCL, Tutoring for Excellence, Marist College Canberra"
              years="2018–2025"
              summary="Extensive experience teaching students aged 5-19 across multiple disciplines, in both one-on-one and group formats."
            />
          </MainSection>

          

          

        </main>

      </div>
      <style jsx global>{`
        @page {
          size: A4;
          margin: 1.5cm;
        }
        .resume-page {
          max-width: 794px;
          min-height: 1123px;
        }
        @media print {
          body {
            background: white;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .resume-page {
            width: 100%;
            max-width: 794px;
            margin: 0 auto;
          }
          .resume-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 1.5rem;
          }
          .resume-sidebar {
            grid-column: 1 / span 1;
          }
          .resume-main {
            grid-column: 2 / span 2;
          }
        }
      `}</style>
    </div>
  );
}

/* -----------------------------------------------------
   Reusable UI Building Blocks
----------------------------------------------------- */

function SectionTitle({ children }) {
  return (
    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
      {children}
    </h3>
  );
}

function MainSection({ title, children }) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 border-b pb-1">
        {title}
      </h2>
      {children}
    </section>
  );
}

function EduItem({ degree, school, years, details, extra }) {
  return (
    <div>
      <div className="flex justify-between">
        <p className="font-semibold text-gray-800">{degree}</p>
        <p className="text-sm text-gray-700">{years}</p>
      </div>
      <p className="italic text-gray-800">{school}</p>
      {details && <p className="text-sm text-gray-700 mt-1">{details}</p>}
      {extra && <p className="text-sm text-gray-700">{extra}</p>}
    </div>
  );
}

function WorkItem({ title, company, years, summary, detailed, bullets }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between">
        <p className="font-semibold text-gray-900">{title}</p>
        <p className="text-sm text-gray-700">{years}</p>
      </div>
      <p className="italic text-gray-700">{company}</p>

      {detailed ? (
        <ul className="list-disc ml-6 mt-2 space-y-1 text-sm text-gray-700">
          {bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-700">{summary}</p>
      )}
    </div>
  );
}

function ProjectItem({ title, desc }) {
  return (
    <div>
      <p className="font-semibold text-gray-900">{title}</p>
      <p className="text-sm text-gray-700">{desc}</p>
    </div>
  );
}
