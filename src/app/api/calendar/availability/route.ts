import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { generateAllTimeSlots } from '@/app/lib/calendarUtils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Start date and end date are required' }, { status: 400 });
    }

    // Get all day availabilities within the date range (regardless of isAvailable)
    const dayAvailabilities = await prisma.dayAvailability.findMany({
      where: {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      include: {
        timeSlots: {
          where: {
            isAvailable: true
          },
          orderBy: { time: 'asc' }
        }
      }
    });

    // Build a map for quick lookup
    const dayMap = new Map(
      dayAvailabilities.map(day => [day.date.toISOString().split('T')[0], day])
    );

    // Generate all dates in the range
    const allDates: string[] = [];
    const currentDate = new Date(startDate);
    const lastDate = new Date(endDate);
    while (currentDate <= lastDate) {
      allDates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Build the response for each day in the range
    const availability = allDates.map(dateStr => {
      const day = dayMap.get(dateStr);
      if (day) {
        // Day has explicit availability settings
        return {
          date: dateStr,
          isAvailable: day.isAvailable,
          timeSlots: day.timeSlots.map(slot => slot.time)
        };
      } else {
        // Day has no explicit settings - use default logic
        const date = new Date(dateStr);
        const dayOfWeek = date.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const defaultTimeSlots = generateAllTimeSlots();
        
        return {
          date: dateStr,
          isAvailable: !isWeekend, // Weekdays available, weekends unavailable by default
          timeSlots: !isWeekend ? defaultTimeSlots : [] // All time slots available for weekdays, none for weekends
        };
      }
    });

    return NextResponse.json(availability);
  } catch (error) {
    console.error('Error fetching calendar availability:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 