
import { config } from 'dotenv';
config();

// AI features (application-specific flows) removed for MVP.
// Genkit core and plugins (like googleAI) remain in package.json for Firebase Studio's internal AI capabilities.
// No application-level AI flows are registered here for the MVP.
// The global `ai` object in `src/ai/genkit.ts` is still available for Firebase Studio's use.
