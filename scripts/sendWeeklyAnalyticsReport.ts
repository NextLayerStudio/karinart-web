import dotenv from 'dotenv';
import { sendWeeklyAnalyticsReport } from '../src/app/lib/weeklyAnalyticsEmail.js';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

const result = await sendWeeklyAnalyticsReport();
console.log(result);

if (!result.success) {
  process.exit(1);
}
