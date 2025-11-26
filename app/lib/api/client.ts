export function backendUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!base) throw new Error("NEXT_PUBLIC_BACKEND_URL not defined");

  return `${base}${path}`;
}
