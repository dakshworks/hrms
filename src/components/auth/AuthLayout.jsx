export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen w-full font-sans">
      <div className="flex flex-1 flex-col items-center justify-center bg-[#f5f5f5] px-8 py-12 lg:px-16">
        <div className="w-full max-w-[400px] flex flex-col gap-8">
          {/* Logo */}
          <div className="flex flex-col items-center gap-3">
            <img src="/HeroLogo.png" alt="HRMS Logo" style={{ height: '72px', width: 'auto' }} />
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
