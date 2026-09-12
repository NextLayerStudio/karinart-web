import { NextResponse } from 'next/server';
import { getSummerLeaderboard } from '@/app/lib/inviteProgramService';
import { SUMMER_PROGRAM_YEAR, INK_CREDITS_PER_ACTIVATION } from '@/app/lib/summerInviteProgram';

export async function GET() {
  try {
    const leaderboard = await getSummerLeaderboard(25);

    return NextResponse.json({
      ...leaderboard,
      program: {
        year: SUMMER_PROGRAM_YEAR,
        creditsPerActivation: INK_CREDITS_PER_ACTIVATION,
        discountPerActivationEuros: 10,
        vipPrize: 'VIP status pre víťaza leaderboardu — limitovaný program',
      },
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json(
      { error: 'Nastala chyba pri načítaní leaderboardu' },
      { status: 500 }
    );
  }
}
