import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <title>NewsFoundry</title>
        <link rel="icon" href="/images/logo.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
