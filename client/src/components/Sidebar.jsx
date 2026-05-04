import { NavLink } from 'react-router-dom';

const linkClass = ({ isActive }) =>
  `block rounded-md px-4 py-3 text-sm font-semibold transition ${
    isActive ? 'bg-brand text-white' : 'text-slate-600 hover:bg-white hover:text-ink'
  }`;

export default function Sidebar() {
  return (
    <aside className="hidden w-56 shrink-0 lg:block">
      <nav className="sticky top-20 space-y-2 rounded-lg border border-slate-200 bg-slate-100 p-2">
        <NavLink to="/" className={linkClass}>
          Dashboard
        </NavLink>
        <a href="#projects" className="block rounded-md px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-white hover:text-ink">
          Projects
        </a>
      </nav>
    </aside>
  );
}
