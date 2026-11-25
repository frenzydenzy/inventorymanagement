import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Dashboard", icon: "📊", end: true },
  { to: "/products", label: "Products", icon: "📦" },
  { to: "/categories", label: "Categories", icon: "🏷️" },
  { to: "/suppliers", label: "Suppliers", icon: "🚚" },
  { to: "/inventory", label: "Inventory", icon: "🔄" },
];

export function Sidebar() {
  return (
    <aside className="app-sidebar hidden w-60 shrink-0 md:flex md:flex-col">
      <div className="brand-mark flex h-20 items-center gap-3 px-5">
        <span className="brand-symbol" aria-hidden="true">IM</span>
        <span className="text-sm font-semibold tracking-tight">Inventory Manager</span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `sidebar-link flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "is-active"
                  : ""
              }`
            }
          >
            <span className="sidebar-icon" aria-hidden="true">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
