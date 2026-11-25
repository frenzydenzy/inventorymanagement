import { useLocation } from "react-router-dom";

const titles: Record<string, string> = {
  "/": "Dashboard",
  "/products": "Products",
  "/categories": "Categories",
  "/suppliers": "Suppliers",
  "/inventory": "Inventory",
};

export function Topbar() {
  const location = useLocation();
  const title = titles[location.pathname] ?? "Inventory Manager";

  return (
    <header className="app-topbar flex h-20 items-center justify-between px-6 lg:px-10">
      <div>
        <p className="eyebrow">Workspace / Inventory</p>
        <h1 className="page-title">{title}</h1>
      </div>
      <div className="status-chip">
        <span className="status-dot" aria-hidden="true" />
        Live workspace
      </div>
    </header>
  );
}
