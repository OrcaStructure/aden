import HanziApp from "./HanziApp";

export const metadata = {
  title: "Hanzi",
  manifest: "/hanzi.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "汉字",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function HanziPage() {
  return <HanziApp />;
}
