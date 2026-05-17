// Placeholder per Next 15 + output: 'export' (richiede almeno un param).
export function generateStaticParams() {
  return [{ id: '_' }];
}
export const dynamicParams = false;

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
