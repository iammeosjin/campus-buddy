// components/Header.tsx
import { useEffect, useState } from 'preact/hooks';

export default function Header(params: { activePage: string }) {
  const [activePage, setActivePage] = useState(params.activePage);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setActivePage(window.location.pathname); // Track the current page path
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header class='header shadow-md'>
      <div class='container mx-auto px-4 py-4 flex justify-between items-center'>
        <h1 class='header-title'>CampusBuddy Admin</h1>

        {/* Menu Toggle Button for Mobile */}
        <button
          class='menu-toggle sm:hidden text-white'
          onClick={toggleMenu}
          aria-label='Toggle navigation menu'
        >
          ☰
        </button>

        <nav
          class={`nav-links ${
            isMenuOpen ? 'block' : 'hidden'
          } sm:flex sm:space-x-6`}
        >
          <ul class='flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 mt-4 sm:mt-0'>
            <li>
              <a
                href='/dashboard'
                class={`nav-link ${
                  activePage === '/dashboard' ? 'active' : ''
                }`}
              >
                Dashboard
              </a>
            </li>
            <li>
              <a
                href='/users'
                class={`nav-link ${activePage === '/users' ? 'active' : ''}`}
              >
                Users
              </a>
            </li>
            <li>
              <a
                href='/resources'
                class={`nav-link ${
                  activePage === '/resources' ? 'active' : ''
                }`}
              >
                Resources
              </a>
            </li>
            <li>
              <a
                href='/reservations'
                class={`nav-link ${
                  activePage === '/reservations' ? 'active' : ''
                }`}
              >
                Reservations
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
