"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import CardNav, { CardNavItem } from './components/CardNav';

export const dynamic = 'force-dynamic';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const items: CardNavItem[] = [
    {
      label: 'Termíny',
      bgColor: '#0D0716',
      textColor: '#fff',
      links: [
        { label: 'Správa termínov', href: '/admin/appointments', ariaLabel: 'Správa termínov' },
        { label: 'Kalendár', href: '/admin/calendar', ariaLabel: 'Kalendár' },
      ],
    },
    {
      label: 'Galéria',
      bgColor: '#170D27',
      textColor: '#fff',
      links: [
        { label: 'Portfólio', href: '/admin/portfolio?tab=tattoo', ariaLabel: 'Portfólio' },
        { label: 'Beauty', href: '/admin/portfolio?tab=beauty', ariaLabel: 'Beauty' },
        { label: 'Voľné návrhy', href: '/admin/flash-designs', ariaLabel: 'Voľné návrhy' },
      ],
    },
    {
      label: 'Marketing',
      bgColor: '#271E37',
      textColor: '#fff',
      links: [
        { label: 'Marketing', href: '/admin/marketing', ariaLabel: 'Marketing' },
        { label: 'Súťaž', href: '/admin/giveaway', ariaLabel: 'Súťaž' },
        { label: 'Letný program', href: '/admin/summer-program', ariaLabel: 'Letný program' },
      ],
    },
    {
      label: 'Beauty',
      bgColor: '#1B1428',
      textColor: '#fff',
      links: [
        { label: 'Cenník služieb', href: '/admin/beauty-pricing', ariaLabel: 'Beauty cenník' },
      ],
    },
  ];

  const showNav = pathname !== '/admin/login';

  return (
    <div className="relative min-h-screen">
      {showNav && (
        <CardNav
          items={items}
          baseColor="#ffffff"
          menuColor="#000000"
          buttonBgColor="#111111"
          buttonTextColor="#ffffff"
        />
      )}
      <div className="pt-24 bg-black min-h-screen">
        {children}
      </div>
    </div>
  );
}


