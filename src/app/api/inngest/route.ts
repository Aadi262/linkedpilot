import { serve } from "inngest/next";
import {
  inngest,
  runCampaignStep,
  campaignScheduler,
  resetDailyCounters,
  syncMessages,
  verifyLinkedInSession,
  weeklyStaleCleanup,
} from "@/inngest/functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    runCampaignStep,
    campaignScheduler,
    resetDailyCounters,
    syncMessages,
    verifyLinkedInSession,
    weeklyStaleCleanup,
  ],
});
