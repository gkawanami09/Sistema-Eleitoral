import { Vote } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';

const tabs = [
  { to: '/', label: 'Candidatura' },
  { to: '/votacao', label: 'Votação' },
  { to: '/admin', label: 'Admin' }
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white">
      <header className="border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between p-4">
          <Link to="/" className="flex items-center gap-2 text-xl font-black text-primary">
            <Vote className="size-6" /> Sistema Eleitoral
          </Link>
          <nav className="flex gap-2">
            {tabs.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-semibold ${
                    isActive ? 'bg-primary text-white' : 'bg-slate-100 text-slate-700'
                  }`
                }
              >
                {tab.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl p-4">{children}</main>
    </div>
  );
}
