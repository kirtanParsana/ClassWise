import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-timetable-improvements.ts';
import '@/ai/flows/resolve-scheduling-conflicts.ts';
import '@/ai/flows/generate-timetable';
