import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>NewsFoundry</title>

        <link rel="icon" href="/images/logo.png" type="image/png" />
      </head>

      <body className="antialiased">{children}</body>
    </html>
  );
}
