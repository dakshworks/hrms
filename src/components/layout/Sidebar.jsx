import { useState, useRef, useContext } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'

const NAV_SECTIONS = [
  {
    items: [
      { label: 'Dashboard', to: '/dashboard', icon: '/dashboard/team.png' },
    ],
  },
  {
    title: 'PEOPLE',
    items: [
      { label: 'Team', to: '/dashboard/team', icon: '/dashboard/team.png' },
      { label: 'Events', to: '/dashboard/events', icon: '/dashboard/events.png' },
    ],
  },
  {
    title: 'MANAGEMENT',
    items: [
      { label: 'Time off', to: '/dashboard/time-off', icon: '/dashboard/leave.png' },
      { label: 'Attendance', to: '/dashboard/attendance', icon: '/dashboard/time.png' },
      { label: 'Calendar', to: '/dashboard/calendar', icon: '/dashboard/calendar.png' },
    ],
  },
]

export default function Sidebar({ collapsed, onToggle }) {
  const { auth, setAuth } = useContext(AuthContext)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const navigate = useNavigate()

  const handleLogout = () => {
    setAuth({ username: null, email: null, role: null, token: null })
    localStorage.removeItem('auth')
    navigate('/login')
  }

  const linkBase = `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors`
  const linkActive = 'bg-[#e8f0fe] text-[#1565c0]'
  const linkInactive = 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'

  return (
    <aside
      className={`
        flex flex-col h-screen bg-white border-r border-gray-200
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-[68px]' : 'w-[240px]'}
      `}
    >
      {/* ── Header: Logo + collapse toggle ── */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-gray-100">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <img src="/HeroLogo.png" alt="HRMS" className="h-8 w-auto" />
          </div>
        )}
        <button
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer
            ${collapsed ? 'mx-auto' : ''}`}
        >
          <img
            src="/dashboard/hamburger.png"
            alt="Toggle"
            className={`w-5 h-5 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {NAV_SECTIONS.map((section, sIdx) => (
          <div key={sIdx}>
            {/* Section title */}
            {section.title && !collapsed && (
              <p className="px-3 mb-2 text-[0.65rem] font-semibold text-gray-400 uppercase tracking-widest">
                {section.title}
              </p>
            )}
            {section.title && collapsed && (
              <hr className="my-2 border-gray-200" />
            )}

            {/* Links */}
            <ul className="space-y-1">
              {section.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === '/dashboard'}
                    className={({ isActive }) =>
                      `${linkBase} ${isActive ? linkActive : linkInactive}
                       ${collapsed ? 'justify-center px-2' : ''}`
                    }
                    title={collapsed ? item.label : undefined}
                  >
                    {/* Icon placeholder — 20×20 box */}
                    <img
                      src={item.icon}
                      alt=""
                      className="shrink-0 w-5 h-5 grayscale opacity-70"
                    />
                    {!collapsed && <span>{item.label}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* ── Footer: User profile ── */}
      <div className="relative border-t border-gray-100 px-3 py-3" ref={menuRef}>
        {menuOpen && (
          <div className="absolute bottom-full left-3 right-3 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
            <button
              onClick={() => { setMenuOpen(false); navigate('/dashboard/profile') }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              Profile
            </button>
            <button
              onClick={() => { setMenuOpen(false); handleLogout() }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
            >
              Logout
            </button>
          </div>
        )}

        <button
          onClick={() => setMenuOpen((v) => !v)}
          className={`flex items-center gap-3 w-full rounded-lg px-2 py-2 hover:bg-gray-100 transition-colors cursor-pointer
            ${collapsed ? 'justify-center' : ''}`}
        >
          {/* Avatar */}
          <div className="shrink-0 w-8 h-8 rounded-full bg-[#1565c0] flex items-center justify-center text-white text-xs font-bold uppercase">
            {auth?.username ? auth.username.charAt(0) : 'U'}
          </div>
          {!collapsed && (
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {auth?.username || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {auth?.email || ''}
              </p>
            </div>
          )}
          {!collapsed && (
            /* Three-dot hamburger */
            <img src="/dashboard/threedot.png" alt="More" className="w-5 h-5 opacity-40 hover:opacity-70 transition-opacity" />
          )}
        </button>
      </div>
    </aside>
  )
}
