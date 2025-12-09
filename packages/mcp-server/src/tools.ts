import { z } from 'zod';
import { CalComClient } from 'caldotcom-api-v2-sdk';

export const listBookingsSchema = z.object({
  limit: z.number().optional().default(10),
  status: z.enum(['upcoming', 'recurring', 'past', 'cancelled', 'unconfirmed']).optional(),
});

export async function listBookings(args: z.infer<typeof listBookingsSchema>) {
  const apiKey = process.env.CAL_API_KEY;
  if (!apiKey) {
      throw new Error('CAL_API_KEY environment variable is required');
  }

  const client = new CalComClient({
    auth: {
      type: 'apiKey',
      apiKey,
    },
  });

  const { limit, status } = args;
  try {
    const bookings = await client.bookings.list({
      take: limit,
      // @ts-ignore - status type matching
      status: status as any,
    });
    return bookings;
  } catch (error) {
    throw new Error(`Error fetching bookings: ${error}`);
  }
}
