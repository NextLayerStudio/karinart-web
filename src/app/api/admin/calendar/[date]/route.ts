import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { getAdminUser } from '@/app/lib/auth';
import { generateAllTimeSlots } from '@/app/lib/calendarUtils';

interface TimeSlotData {
  time: string;
  isAvailable: boolean;
}

function getDateParam(request: NextRequest): string | null {
  const url = new URL(request.url);
  const match = url.pathname.match(/\/api\/admin\/calendar\/([^\/]+)/);
  return match ? match[1] : null;
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const user = await getAdminUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const date = getDateParam(request);
    if (!date) {
      return NextResponse.json({ error: 'Invalid date parameter' }, { status: 400 });
    }

    // Find day availability for the given date
    const dayAvailability = await prisma.dayAvailability.findUnique({
      where: { date: new Date(date) },
      include: {
        timeSlots: {
          orderBy: { time: 'asc' }
        }
      }
    });

    if (dayAvailability) {
      // Return existing day availability
      return NextResponse.json(dayAvailability);
    } else {
      // No explicit day availability record exists - check if it's a weekend
      const dayOfWeek = new Date(date).getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const defaultTimeSlots = generateAllTimeSlots();
      
      // Return default state based on weekday/weekend
      return NextResponse.json({
        id: '',
        date: date,
        isAvailable: !isWeekend, // Weekdays available, weekends unavailable by default
        timeSlots: defaultTimeSlots.map(time => ({
          id: '',
          time,
          isAvailable: !isWeekend // Weekdays available, weekends unavailable by default
        }))
      });
    }
  } catch (error) {
    console.error('Error fetching day availability:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const user = await getAdminUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const date = getDateParam(request);
    if (!date) {
      return NextResponse.json({ error: 'Invalid date parameter' }, { status: 400 });
    }
    const body = await request.json();
    const { isAvailable, timeSlots } = body;

    // Use provided time slots or generate default ones
    const slotsToCreate = timeSlots || generateAllTimeSlots().map(time => ({
      time,
      isAvailable: false // Default to unavailable
    }));

    // Upsert day availability
    const dayAvailability = await prisma.dayAvailability.upsert({
      where: { date: new Date(date) },
      update: {
        isAvailable,
        timeSlots: {
          deleteMany: {},
          create: slotsToCreate.map((slot: TimeSlotData) => ({
            time: slot.time,
            isAvailable: slot.isAvailable
          }))
        }
      },
      create: {
        date: new Date(date),
        isAvailable,
        timeSlots: {
          create: slotsToCreate.map((slot: TimeSlotData) => ({
            time: slot.time,
            isAvailable: slot.isAvailable
          }))
        }
      },
      include: {
        timeSlots: {
          orderBy: { time: 'asc' }
        }
      }
    });

    return NextResponse.json(dayAvailability);
  } catch (error) {
    console.error('Error creating day availability:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify admin authentication
    const user = await getAdminUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const date = getDateParam(request);
    if (!date) {
      return NextResponse.json({ error: 'Invalid date parameter' }, { status: 400 });
    }
    const body = await request.json();
    const { isAvailable, timeSlots } = body;

    // Use provided time slots or generate default ones
    const slotsToCreate = timeSlots || generateAllTimeSlots().map(time => ({
      time,
      isAvailable: false // Default to unavailable
    }));

    // Update or create day availability
    const dayAvailability = await prisma.dayAvailability.upsert({
      where: { date: new Date(date) },
      update: {
        isAvailable,
        timeSlots: {
          deleteMany: {},
          create: slotsToCreate.map((slot: TimeSlotData) => ({
            time: slot.time,
            isAvailable: slot.isAvailable
          }))
        }
      },
      create: {
        date: new Date(date),
        isAvailable,
        timeSlots: {
          create: slotsToCreate.map((slot: TimeSlotData) => ({
            time: slot.time,
            isAvailable: slot.isAvailable
          }))
        }
      },
      include: {
        timeSlots: {
          orderBy: { time: 'asc' }
        }
      }
    });

    return NextResponse.json(dayAvailability);
  } catch (error) {
    console.error('Error updating day availability:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Verify admin authentication
    const user = await getAdminUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const date = getDateParam(request);
    if (!date) {
      return NextResponse.json({ error: 'Invalid date parameter' }, { status: 400 });
    }

    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    if (!action || (action !== 'setAllAvailable' && action !== 'setAllUnavailable')) {
      return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 });
    }

    const isAvailable = action === 'setAllAvailable';

    // Get or create day availability
    let dayAvailability = await prisma.dayAvailability.findUnique({
      where: { date: new Date(date) },
      include: { timeSlots: true }
    });

    if (!dayAvailability) {
      // Create new day availability if it doesn't exist
      dayAvailability = await prisma.dayAvailability.create({
        data: {
          date: new Date(date),
          isAvailable,
          timeSlots: {
            create: generateAllTimeSlots().map(time => ({
              time,
              isAvailable
            }))
          }
        },
        include: { timeSlots: true }
      });
    } else {
      // Update existing day availability and all time slots
      await prisma.dayAvailability.update({
        where: { date: new Date(date) },
        data: { isAvailable }
      });

      // Update all time slots to the same availability
      await prisma.timeSlot.updateMany({
        where: { dayAvailabilityId: dayAvailability.id },
        data: { isAvailable }
      });

      // Refresh the data
      dayAvailability = await prisma.dayAvailability.findUnique({
        where: { date: new Date(date) },
        include: {
          timeSlots: {
            orderBy: { time: 'asc' }
          }
        }
      });
    }

    return NextResponse.json(dayAvailability);
  } catch (error) {
    console.error('Error updating bulk availability:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 