import { VIP_BENEFITS } from '@/app/lib/loyaltyProgram';
import { VIP_VALIDITY_DAYS, VIP_WARNING_DAYS_BEFORE } from '@/app/lib/vipService';

export const vipProgramHeadline = {
  title: 'VIP karta',
  subtitle: 'Exkluzívne členstvo',
  intro:
    'VIP status je moja exkluzívna odmena pre najvernejších klientov. Program má limitovaný počet miest — nižšie nájdeš výhody, spôsob získania aj podmienky.',
};

export const vipFinePrintIntro =
  'Pre transparentnosť uvádzam kompletné podmienky VIP členstva. Odporúčam si ich prečítať pred registráciou alebo pred získaním statusu.';

export const vipFinePrintFootnotes = [
  '„Doživotná“ zľava 10 % platí počas trvania aktívneho VIP statusu.',
  'Prednostné rezervovanie sa uplatňuje v rámci dostupných termínov v kalendári.',
  'Sezónne darčeky a balíčky sú viazané na aktuálnu dostupnosť.',
  'VIP program má obmedzený počet miest.',
];

export const vipHowToGet = [
  {
    title: 'Cez vernostnú kartu',
    text: 'Dosiahni úroveň 10 na vernostnej karte. Vernostná karta aj VIP status z nej sú dostupné v limitovanom počte.',
  },
  {
    title: 'Cez letný ink program',
    text: 'Víťaz ink leaderboardu môže získať VIP status v rámci limitovaného počtu členov programu.',
  },
];

export const vipFinePrint: Array<{ label: string; text: string }> = [
  {
    label: 'Zľava 10 %',
    text: 'Zľava platí výhradne počas aktívneho VIP statusu. Bez zaznamenanej návštevy u mňa status po 365 dňoch zaniká a zľava prestáva platiť.',
  },
  {
    label: 'Platnosť VIP statusu',
    text: `VIP status je platný ${VIP_VALIDITY_DAYS} dní od poslednej zaznamenanej návštevy. Predĺženie je možné po každej návšteve, ktorú zaznamenám v systéme.`,
  },
  {
    label: 'Prednostné rezervovanie termínov',
    text: 'VIP členovia majú prednostu pri výbere termínu v rámci voľných miest v mojom kalendári. Nezaručuje to termín mimo dostupnosti.',
  },
  {
    label: 'Limitovaný počet VIP členov',
    text: 'VIP program je exkluzívny s obmedzeným počtom miest.',
  },
  {
    label: 'Vernostná karta',
    text: 'Vernostná karta je k dispozícii v limitovanom počte. Postup na úroveň 10 je možný len s aktivovanou kartou.',
  },
  {
    label: 'Overený a aktívny účet',
    text: 'Záznam návštevy a predĺženie VIP statusu je možné len pri overenom e-maile a aktívnom zákazníckom účte.',
  },
  {
    label: 'Upozornenie pred expiráciou',
    text: `O blížiacej sa expirácii ťa informujem e-mailom ${VIP_WARNING_DAYS_BEFORE} dní vopred. Po uplynutí platnosti VIP status automaticky zaniká.`,
  },
  {
    label: 'Tetovací set k narodeninám',
    text: 'Výhoda platí pri vyplnenom dátume narodenia v profile. Dátum doplním pri návšteve podľa dohody.',
  },
  {
    label: 'Mystery box a sezónne balíčky',
    text: 'Poskytujem ich podľa aktuálnej dostupnosti a sezónnych podmienok programu.',
  },
  {
    label: 'VIP dizajny',
    text: 'VIP dizajny nie sú verejne zverejnené na webe. Ich dostupnosť sa môže v čase meniť.',
  },
  {
    label: 'Krém na hojenie',
    text: 'Krém na hojenie poskytujem po tetovaní vykonanom u mňa v rámci VIP členstva.',
  },
  {
    label: 'Zmena podmienok',
    text: 'Vyhradzujem si právo upraviť výhody, limity a pravidlá VIP programu. O podstatných zmenách budem informovať v zákazníckej zóne alebo e-mailom.',
  },
];

export { VIP_BENEFITS };
