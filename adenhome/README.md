# adenhome

The homepage is a simple landing page for Aden Power with links to the resume builder and PDF outputs.

## Resume builder

1. Edit `content/resume.md` to store the full inventory of resume material.
2. Use the builder pages (`/` -> `/manual`) to assemble and export resumes.
3. All rendered resume text is copied directly from `content/resume.md`; the model does not write resume copy.

## Run locally

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## Outputs (article PDFs)

Drop article PDFs into `public/outputs/`.

- They appear automatically on the home page under `outputs`.
- Each file gets a dedicated viewer page at `/outputs/<slug>`.
- The viewer embeds the PDF and also provides a direct open link.
- Optional metadata lives in `content/outputs.json` so you can set a custom `title` and `description` per PDF filename.

## Environment

Set these in `.env.local` to enable AI selection:

```bash
OPENROUTER_API_KEY=your_key_here
OPENROUTER_MODEL=openai/gpt-4o-mini
OPENROUTER_SITE_URL=http://localhost:3000
OPENROUTER_SITE_NAME=adenhome
```

If `OPENROUTER_API_KEY` is missing, the site still works using the local fallback selector.

## Important

The text currently in `content/resume.md` is just the present inventory file. If you want the site to always use your exact wording, replace that file's entries with your own final text.

## Content format

`content/resume.md` is organized by markdown headings:

- `## profile` for top-level contact details
- `## summary`, `## experience`, `## projects`, `## education`, `## skills`, `## awards` for item collections
- `### item-id` for each selectable item
- `- key: value` for fields
- `- bullets:` or similar keys followed by indented `- list item` lines for lists

## Lint

Project-wide `npm run lint` currently fails because of pre-existing issues in unrelated files like `src/app/checklist/page.js` and `src/pages/test.js`. The redesign files can be checked directly with:

```bash
npx eslint src/app/page.js src/app/layout.js src/app/globals.css src/app/api/resume/route.js src/app/components/resume/ResumeHome.jsx src/lib/resumeContent.js
```
