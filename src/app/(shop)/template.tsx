/**
 * Templates re-mount on every navigation, giving each page a subtle CSS
 * entrance. CSS (not JS) so it plays on first paint, before hydration.
 */
export default function ShopTemplate({ children }: { children: React.ReactNode }) {
  return <div className="animate-page-in">{children}</div>;
}
