import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import {
  HiOutlineArrowRight,
  HiOutlineOfficeBuilding,
  HiOutlineHome,
  HiOutlineTruck,
  HiOutlineMoon,
  HiOutlineSun
} from 'react-icons/hi';

const roles = [
  { 
    id: 'donor', 
    label: 'Food Partners', 
    title: 'Post Surplus',
    body: 'Log end-of-day surplus in seconds. Our routing network ensures it reaches those who need it most, immediately.', 
    icon: HiOutlineOfficeBuilding
  },
  { 
    id: 'ngo', 
    label: 'Community Hubs', 
    title: 'Claim Food',
    body: 'Shelters and community centers can claim fresh, high-quality meals nearby to distribute to their local communities.', 
    icon: HiOutlineHome
  },
  { 
    id: 'driver', 
    label: 'Route Runners', 
    title: 'Transport',
    body: 'Use your spare time in the evening to transport claimed food. Real-time intelligence routing makes it seamless.', 
    icon: HiOutlineTruck
  },
];

export default function Landing() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-[var(--bg)]/90 backdrop-blur-md border-b border-[var(--border)]">
        <div className="max-w-[1280px] mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[var(--ink)] text-[var(--bg)] flex items-center justify-center text-[10px] font-bold uppercase tracking-widest">
              AH
            </div>
            <span className="font-semibold text-xl tracking-tight uppercase">
              AfterHour
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <button onClick={toggleTheme} className="text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors">
              {isDark ? <HiOutlineSun className="w-5 h-5" /> : <HiOutlineMoon className="w-5 h-5" />}
            </button>
            <div className="hidden sm:flex items-center gap-6">
              <Link to="/login" className="text-[11px] font-bold uppercase tracking-widest text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors">
                Log in
              </Link>
              <Link to="/register" className="btn btn-primary">
                Join Network
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="pt-40 pb-20 px-6 overflow-hidden">
          <div className="max-w-[1280px] mx-auto grid lg:grid-cols-2 gap-16 items-center">
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <div className="flex items-center gap-2 mb-8">
                <span className="w-2 h-2 rounded-full bg-[var(--ink)] animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--ink)]">Live in Mumbai, Delhi & Bangalore</span>
              </div>
              <h1 className="font-semibold text-5xl sm:text-6xl lg:text-[72px] leading-[1.05] tracking-tighter mb-8">
                Good food <br />
                should move, <br />
                not wait.
              </h1>
              <p className="text-lg text-[var(--ink-muted)] leading-relaxed mb-12 max-w-[500px]">
                AfterHour is the city's smartest food rescue network. We connect closing restaurants, local shelters, and volunteer drivers in real-time before the night is over.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register" className="btn btn-primary py-4 px-8">
                  Start Rescuing <HiOutlineArrowRight className="w-4 h-4 ml-2" />
                </Link>
                <a href="#how-it-works" className="btn btn-outline py-4 px-8">
                  See how it works
                </a>
              </div>
            </motion.div>

            {/* Abstract Hero Visual (Monochrome Editorial Style) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4 pt-12">
                  <div className="card-minimal p-8 flex flex-col justify-between h-[220px]">
                    <HiOutlineOfficeBuilding className="w-6 h-6 text-[var(--ink)]" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--ink-muted)] mb-2">Surplus Logged</p>
                      <p className="font-semibold text-5xl tracking-tighter">86<span className="text-xl text-[var(--ink-muted)] font-normal ml-2">meals</span></p>
                    </div>
                  </div>
                  <div className="card-minimal p-8 flex flex-col justify-between h-[220px]">
                    <HiOutlineTruck className="w-6 h-6 text-[var(--ink)]" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--ink-muted)] mb-2">Avg Handoff</p>
                      <p className="font-semibold text-5xl tracking-tighter">34<span className="text-xl text-[var(--ink-muted)] font-normal ml-2">mins</span></p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="card-minimal p-8 bg-[var(--ink)] text-[var(--bg)] flex flex-col justify-between h-[260px] border-[var(--ink)]">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--bg)] opacity-80">Live Impact</p>
                    <div>
                      <p className="font-semibold text-[80px] leading-none tracking-tighter mb-4">48k</p>
                      <p className="text-sm font-medium opacity-90 max-w-[200px]">Meals rerouted this month across active cities.</p>
                    </div>
                  </div>
                  <div className="card-minimal p-8 flex flex-col justify-between h-[180px]">
                    <HiOutlineHome className="w-6 h-6 text-[var(--ink)]" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--ink-muted)] mb-2">Hubs Active</p>
                      <p className="font-semibold text-5xl tracking-tighter">142</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Roles Section */}
        <section id="how-it-works" className="py-24 border-y border-[var(--border)]">
          <div className="max-w-[1280px] mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 mb-16 pb-8 border-b border-[var(--border)]">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--ink-muted)] mb-4">The Network</p>
                <h2 className="font-semibold text-4xl sm:text-5xl tracking-tight">Play your part.</h2>
              </div>
              <p className="text-lg text-[var(--ink-muted)] max-w-sm">
                The city needs a relay. Join where you can make the clearest difference.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {roles.map((role) => {
                const Icon = role.icon;
                return (
                  <div key={role.id} className="card-minimal p-8 hover:border-[var(--ink)] transition-colors group">
                    <div className="flex justify-between items-start mb-16">
                      <Icon className="w-6 h-6 text-[var(--ink)] group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--ink-faint)] group-hover:text-[var(--ink)] transition-colors">{role.label}</span>
                    </div>
                    <h3 className="font-semibold text-2xl tracking-tight mb-4">{role.title}</h3>
                    <p className="text-[14px] text-[var(--ink-muted)] leading-relaxed mb-8 h-[80px]">
                      {role.body}
                    </p>
                    <Link to="/register" className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest hover:gap-4 transition-all border-b border-[var(--ink)] pb-1">
                      Get started <HiOutlineArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--ink-muted)] mb-6">Join the Dispatch</p>
            <h2 className="font-semibold text-5xl sm:text-7xl tracking-tighter mb-12">
              The next rescue <br /> starts with you.
            </h2>
            <Link to="/register" className="btn btn-primary py-4 px-10 text-lg">
              Join AfterHour
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-12">
        <div className="max-w-[1280px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-[var(--ink)] text-[var(--bg)] flex items-center justify-center text-[8px] font-bold uppercase tracking-widest">AH</div>
            <span className="font-semibold text-lg tracking-tight uppercase">AfterHour</span>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--ink-muted)]">
            Mumbai · Delhi · Bangalore
          </p>
        </div>
      </footer>
    </div>
  );
}
