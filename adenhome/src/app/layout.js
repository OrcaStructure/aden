import "./globals.css";

export const metadata = {
  title: "Aden Power",
  description: "Home page, resume builder, and output PDFs.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
