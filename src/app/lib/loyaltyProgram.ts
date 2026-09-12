/** Max zákazníkov s pridelenou vernostnou kartou (iba Karin) */
export const MAX_LOYALTY_CARD_HOLDERS = 20;
/** Max VIP získaných cez úroveň 10 vernostnej karty */
export const MAX_LOYALTY_VIP_SLOTS = 20;
/** Celkový max VIP členov (karta + letná akcia a pod.) */
export const MAX_TOTAL_VIP = 25;

export interface LoyaltyReward {
  tier: number;
  threshold: number;
  title: string;
  isVip?: boolean;
}

export const LOYALTY_REWARDS: LoyaltyReward[] = [
  { tier: 1, threshold: 50, title: 'Krém na hojenie tetovania' },
  { tier: 2, threshold: 50, title: 'Malý darček' },
  { tier: 3, threshold: 50, title: 'Letný / zimný balíček' },
  { tier: 4, threshold: 50, title: 'Malý darček' },
  { tier: 5, threshold: 50, title: '20 % zľava' },
  { tier: 6, threshold: 100, title: 'Krém na hojenie tetovania' },
  { tier: 7, threshold: 100, title: 'Poukaz 50 €' },
  { tier: 8, threshold: 100, title: 'Krém na hojenie tetovania' },
  { tier: 9, threshold: 100, title: 'Tetovanie v hodnote 70 € zadarmo' },
  { tier: 10, threshold: 100, title: 'VIP STATUS', isVip: true },
];

export const VIP_BENEFITS = [
  '10 % doživotná zľava',
  'Prednostné rezervovanie termínov',
  'Tetovací set k narodeninám (vyžaduje dátum narodenia v profile)',
  'Mystery box na Vianoce',
  'VIP dizajny dostupné len pre VIP členov',
  'Letný balíček',
  'Krém na hojenie po každom tetovaní',
];

export function getThresholdForTier(tier: number): number {
  const reward = LOYALTY_REWARDS.find((r) => r.tier === tier);
  return reward?.threshold ?? 100;
}

export function getNextTierInfo(currentTier: number) {
  if (currentTier >= 10) {
    return null;
  }

  const nextTier = currentTier + 1;
  const reward = LOYALTY_REWARDS.find((r) => r.tier === nextTier);

  if (!reward) {
    return null;
  }

  return {
    tier: nextTier,
    threshold: reward.threshold,
    title: reward.title,
    isVip: reward.isVip ?? false,
  };
}

export function formatLoyaltyVisitSpendHint(threshold: number): string {
  return `Pri najbližšej návšteve nad ${threshold} €`;
}

export interface TierUnlockSimulation {
  newTier: number;
  tiersUnlocked: number[];
  redundantAmount: number;
  vipSlotBlocked: boolean;
}

export function simulateTierUnlocks(
  currentTier: number,
  amountSpent: number,
  loyaltyVipSlotsRemaining: number
): TierUnlockSimulation {
  let remaining = amountSpent;
  let tier = currentTier;
  const unlocked: number[] = [];
  let vipSlotBlocked = false;
  let slotsLeft = loyaltyVipSlotsRemaining;

  while (tier < 10 && remaining > 0) {
    const nextReward = LOYALTY_REWARDS[tier];

    if (!nextReward) {
      break;
    }

    if (nextReward.isVip && slotsLeft <= 0) {
      if (remaining >= nextReward.threshold) {
        vipSlotBlocked = true;
      }
      break;
    }

    if (remaining < nextReward.threshold) {
      break;
    }

    remaining -= nextReward.threshold;
    tier += 1;
    unlocked.push(tier);

    if (nextReward.isVip) {
      slotsLeft -= 1;
    }
  }

  return {
    newTier: tier,
    tiersUnlocked: unlocked,
    redundantAmount: Math.round(remaining * 100) / 100,
    vipSlotBlocked,
  };
}
