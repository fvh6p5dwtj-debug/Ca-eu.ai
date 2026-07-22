'use client';

import { useState, useEffect } from 'react';
import { Menu, X, LogOut, User } from 'lucide-react';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Characters', href: '/#characters' },
  { label: 'Features', href: '/#features' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'Video', href: '/video' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-[rgba(147,51,234,0.1)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <a href="/" className="flex items-center gap-2">
          <span className="text-3xl font-bold gradient-text tracking-tight">
            Candy<span style={{ color: '#ec4899' }}>.</span>ai
          </span>
        </a>

        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-text-muted hover:text-magenta-light transition-colors duration-200 font-medium text-sm"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <a href="/dashboard" className="flex items-center gap-2 text-text-secondary hover:text-magenta-light transition-colors text-sm font-medium px-3 py-2 rounded-lg hover:bg-[rgba(147,51,234,0.1)]">
                <User size={16} />
                {user.name}
              </a>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-text-secondary hover:text-red-400 transition-colors font-medium px-3 py-2 text-sm"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <>
              <a href="/auth/signin" className="text-text-secondary hover:text-magenta-light transition-colors font-medium px-4 py-2 text-sm">
                Log in
              </a>
              <a href="/auth/signup" className="btn-gradient text-white font-semibold px-5 py-2 rounded-full text-sm">
                Sign Up
              </a>
            </>
          )}
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-text-primary p-2 hover:text-magenta-light transition-colors"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-[rgba(147,51,234,0.1)] bg-[#0f0f24]/95 backdrop-blur-lg">
          <div className="px-4 py-4 flex flex-col gap-3">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-text-secondary hover:text-magenta-light transition-colors font-medium py-2 px-3 rounded-lg hover:bg-[rgba(147,51,234,0.1)]"
              >
                {link.label}
              </a>
            ))}
            <div className="flex flex-col gap-2 pt-2 border-t border-[rgba(147,51,234,0.1)]">
              {user ? (
                <>
                  <a href="/dashboard" onClick={() => setOpen(false)} className="text-text-secondary hover:text-magenta-light text-center py-2 font-medium">
                    Dashboard ({user.name})
                  </a>
                  <button
                    onClick={() => { handleLogout(); setOpen(false); }}
                    className="text-red-400 hover:text-red-300 transition-colors font-medium py-2 text-center"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <a href="/auth/signin" onClick={() => setOpen(false)} className="text-text-secondary hover:text-magenta-light transition-colors font-medium py-2 text-center">
                    Log in
                  </a>
                  <a href="/auth/signup" onClick={() => setOpen(false)} className="btn-gradient text-white font-semibold px-5 py-2.5 rounded-full text-center">
                    Sign Up
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
