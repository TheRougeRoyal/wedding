import "./globals.css";

export const metadata = {
  title: "Shaadi Guest Tracker | Wedding Guest Management",
  description:
    "Track your wedding guests, their travel details, PNR status, and set arrival reminders. A beautiful dashboard to manage your big day.",
  keywords: ["wedding", "guest tracker", "PNR", "travel", "reminders"],
  openGraph: {
    title: "Shaadi Guest Tracker",
    description: "Track wedding guests, travel PNRs, and arrival reminders",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <div className="relative z-10 min-h-screen">{children}</div>
      </body>
    </html>
  );
}
