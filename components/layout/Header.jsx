'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useTranslation } from '@/lib/i18n';
import NotificationsBell from '@/components/espace/NotificationsBell';
import { CATEGORIES, SIMULATORS } from '@/lib/simulators/registry';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const pathname = usePathname();
  const { user, isLoading } = useUser();
  const timeoutRef = useRef(null);
  const { t } = useTranslation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const solutions = [
    { name: t('nav.solutions.creditBail'), icon: 'fa-handshake', desc: t('nav.solutions.creditBailDesc'), path: '/solutions/credit-bail' },
    { name: t('nav.solutions.loa'), icon: 'fa-file-contract', desc: t('nav.solutions.loaDesc'), path: '/solutions/loa' },
    { name: t('nav.solutions.creditPro'), icon: 'fa-coins', desc: t('nav.solutions.creditProDesc'), path: '/solutions/credit-pro' },
    { name: t('nav.solutions.insurancePro'), icon: 'fa-shield-halved', desc: t('nav.solutions.insuranceProDesc'), path: '/assurance' },
    { name: t('comparator.navLabel'), icon: 'fa-scale-balanced', desc: t('comparator.subtitle'), path: '/comparateur' }
  ];

  const sectors = [
    { name: t('nav.sectors.btp'), icon: 'fa-hard-hat', path: '/sectors/btp' },
    { name: t('nav.sectors.medical'), icon: 'fa-user-doctor', path: '/sectors/medical' },
    { name: t('nav.sectors.it'), icon: 'fa-laptop-code', path: '/sectors/it' },
    { name: t('nav.sectors.transport'), icon: 'fa-truck', path: '/sectors/transport' }
  ];

  const isOverDarkHero = pathname === '/' && !isScrolled;

  // Les espaces admin/partenaire/assureur ont leur propre chrome (sidebar + topbar)
  if (pathname?.startsWith('/admin')) return null;

  const navLinkClass = (href) => {
    const isActive = pathname === href || pathname.startsWith(href + '/');
    const base = isOverDarkHero ? 'text-white/90 hover:text-white' : 'text-gray-600 hover:text-primary';
    const active = isOverDarkHero ? 'text-white' : 'text-primary';
    return `${isActive ? active : base} text-[15px] font-medium transition-colors relative`;
  };

  const handleDropdownEnter = (name) => {
    clearTimeout(timeoutRef.current);
    setOpenDropdown(name);
  };

  const handleDropdownLeave = () => {
    timeoutRef.current = setTimeout(() => setOpenDropdown(null), 150);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-white/90 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] border-b border-gray-100/50'
          : isOverDarkHero
            ? 'bg-transparent'
            : 'bg-white/80 backdrop-blur-md'
      }`}
    >
      <nav className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-[72px]">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <div className="h-10 sm:h-11 w-auto rounded-lg overflow-hidden bg-white shadow-sm">
              <img
                src="/finarent-logo.jpg"
                alt="Finassur"
                className="h-full w-auto object-contain"
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {/* Solutions Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleDropdownEnter('solutions')}
              onMouseLeave={handleDropdownLeave}
            >
              <button className={`${navLinkClass('/solutions')} flex items-center gap-1.5 px-4 py-2 rounded-lg hover:bg-white/10`}>
                <span>{t('nav.solutions')}</span>
                <i className={`fa-solid fa-chevron-down text-[10px] transition-transform duration-200 ${openDropdown === 'solutions' ? 'rotate-180' : ''}`}></i>
              </button>
              <div className={`absolute top-full left-1/2 -translate-x-1/2 pt-3 transition-all duration-200 ${openDropdown === 'solutions' ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}>
                <div className="w-[320px] bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden">
                  <div className="p-2">
                    {solutions.map((s, i) => (
                      <Link key={i} href={s.path} className="flex items-start gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors group">
                        <div className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0 group-hover:bg-secondary/20 transition-colors">
                          <i className={`fa-solid ${s.icon} text-secondary text-sm`}></i>
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-gray-900">{s.name}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{s.desc}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="border-t border-gray-100 p-3">
                    <Link href="/solutions" className="flex items-center justify-center gap-2 text-sm font-semibold text-secondary hover:text-secondary/80 transition-colors py-1.5">
                      <span>{t('nav.viewAllSolutions')}</span>
                      <i className="fa-solid fa-arrow-right text-xs"></i>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Sectors Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleDropdownEnter('sectors')}
              onMouseLeave={handleDropdownLeave}
            >
              <button className={`${navLinkClass('/sectors')} flex items-center gap-1.5 px-4 py-2 rounded-lg hover:bg-white/10`}>
                <span>{t('nav.sectors')}</span>
                <i className={`fa-solid fa-chevron-down text-[10px] transition-transform duration-200 ${openDropdown === 'sectors' ? 'rotate-180' : ''}`}></i>
              </button>
              <div className={`absolute top-full left-1/2 -translate-x-1/2 pt-3 transition-all duration-200 ${openDropdown === 'sectors' ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}>
                <div className="w-[260px] bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden">
                  <div className="p-2">
                    {sectors.map((s, i) => (
                      <Link key={i} href={s.path} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors group">
                        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                          <i className={`fa-solid ${s.icon} text-accent text-sm`}></i>
                        </div>
                        <span className="font-medium text-sm text-gray-900">{s.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Simulateurs Dropdown (mega-menu) */}
            <div
              className="relative"
              onMouseEnter={() => handleDropdownEnter('simulateurs')}
              onMouseLeave={handleDropdownLeave}
            >
              <button className={`${navLinkClass('/simulateurs')} flex items-center gap-1.5 px-4 py-2 rounded-lg hover:bg-white/10`}>
                <span>Simulateurs</span>
                <i className={`fa-solid fa-chevron-down text-[10px] transition-transform duration-200 ${openDropdown === 'simulateurs' ? 'rotate-180' : ''}`}></i>
              </button>
              <div className={`absolute top-full right-0 pt-3 transition-all duration-200 ${openDropdown === 'simulateurs' ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}>
                <div className="w-[640px] bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden">
                  <div className="grid grid-cols-2 p-3 gap-x-3">
                    {CATEGORIES.map((cat) => {
                      const items = SIMULATORS.filter((s) => s.category === cat.slug);
                      const available = items.filter((s) => s.available).length;
                      return (
                        <Link
                          key={cat.slug}
                          href={`/simulateurs#${cat.slug}`}
                          className="group flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-${cat.color}-50 group-hover:bg-${cat.color}-100 transition-colors`}>
                            <i className={`fa-solid ${cat.icon} text-${cat.color}-600 text-sm`}></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                              {cat.name}
                              {available > 0 && (
                                <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">{available} actif{available > 1 ? 's' : ''}</span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">{items.length} simulateurs disponibles</div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                  <div className="border-t border-gray-100 p-3 bg-gradient-to-br from-gray-50 to-white">
                    <Link href="/simulateurs" className="flex items-center justify-center gap-2 text-sm font-bold text-secondary hover:text-secondary/80 transition-colors py-1.5">
                      <i className="fa-solid fa-calculator text-xs"></i>
                      <span>Voir les {SIMULATORS.length} simulateurs</span>
                      <i className="fa-solid fa-arrow-right text-xs"></i>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <Link href="/assurance" className={`${navLinkClass('/assurance')} px-4 py-2 rounded-lg hover:bg-white/10`}>{t('nav.insurance')}</Link>
            <Link href="/why-leasing" className={`${navLinkClass('/why-leasing')} px-4 py-2 rounded-lg hover:bg-white/10`}>{t('nav.whyFinassur')}</Link>
            <Link href="/blog" className={`${navLinkClass('/blog')} px-4 py-2 rounded-lg hover:bg-white/10`}>{t('nav.blog')}</Link>
            <Link href="/contact" className={`${navLinkClass('/contact')} px-4 py-2 rounded-lg hover:bg-white/10`}>{t('nav.contact')}</Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user && !isLoading && <NotificationsBell isOverDarkHero={isOverDarkHero} />}
            {user ? (
              <Link href="/espace" className={`hidden sm:flex items-center gap-3 pl-1.5 pr-4 py-1.5 rounded-full transition-all duration-300 group ${
                isOverDarkHero
                  ? 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                  : 'bg-gray-50 hover:bg-gray-100 text-primary border border-gray-200'
              }`}>
                {user.picture ? (
                  <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full ring-2 ring-accent/30" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                    <i className="fa-solid fa-user text-sm"></i>
                  </div>
                )}
                <div className="text-left hidden xl:block">
                  <div className="text-sm font-semibold leading-tight line-clamp-1">{user.name}</div>
                  <div className={`text-[11px] ${isOverDarkHero ? 'text-white/60' : 'text-gray-400'}`}>{t('nav.mySpace')}</div>
                </div>
              </Link>
            ) : (
              <Link href="/api/auth/login" className={`hidden sm:flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 ${
                isOverDarkHero
                  ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                  : 'bg-primary text-white hover:bg-primary/90 shadow-sm hover:shadow-md'
              }`}>
                <i className="fa-solid fa-user text-xs"></i>
                <span>{t('nav.mySpace')}</span>
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden w-10 h-10 flex items-center justify-center rounded-xl transition-colors ${
                isOverDarkHero ? 'text-white hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'
              }`}
              aria-label="Menu"
            >
              <i className={`fa-solid ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden overflow-hidden transition-all duration-300 ${isMobileMenuOpen ? 'max-h-[500px] opacity-100 pb-6' : 'max-h-0 opacity-0'}`}>
          <div className={`pt-4 border-t space-y-1 ${isOverDarkHero ? 'border-white/10' : 'border-gray-100'}`}>
            {[
              { label: t('nav.solutions'), href: '/solutions' },
              { label: t('nav.sectors'), href: '/sectors' },
              { label: t('nav.insurance'), href: '/assurance' },
              { label: t('nav.whyFinassur'), href: '/why-leasing' },
              { label: t('nav.blog'), href: '/blog' },
              { label: t('nav.contact'), href: '/contact' },
              { label: t('comparator.navLabel'), href: '/comparateur' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-4 py-3 rounded-xl font-medium transition-colors ${
                  pathname === item.href
                    ? isOverDarkHero ? 'bg-white/10 text-white' : 'bg-secondary/5 text-secondary'
                    : isOverDarkHero ? 'text-white/80 hover:bg-white/5 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
                }`}
              >
                {item.label}
              </Link>
            ))}

            <div className="pt-3">
              {user ? (
                <Link href="/espace" className={`flex items-center gap-3 p-3 rounded-xl ${isOverDarkHero ? 'bg-white/10 text-white' : 'bg-gray-50 text-primary'}`}>
                  {user.picture ? (
                    <img src={user.picture} alt="" className="w-10 h-10 rounded-full" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                      <i className="fa-solid fa-user"></i>
                    </div>
                  )}
                  <div>
                    <div className="font-bold">{user.name}</div>
                    <div className="text-xs opacity-70">{t('nav.dashboard')}</div>
                  </div>
                </Link>
              ) : (
                <Link href="/api/auth/login" className="flex items-center justify-center gap-2 px-5 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors">
                  <i className="fa-solid fa-user text-sm"></i>
                  <span>{t('nav.accessSpace')}</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
