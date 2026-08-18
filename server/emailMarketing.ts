/**
 * Email Marketing Integration (Loops)
 * 
 * This module handles syncing leads to Loops (https://loops.so) for automated
 * email marketing campaigns. When LOOPS_API_KEY is configured, new leads are
 * automatically added to your Loops audience.
 * 
 * Setup instructions:
 * 1. Sign up at https://loops.so (free tier available)
 * 2. Get your API key from Settings → API
 * 3. Add LOOPS_API_KEY to your environment secrets
 * 4. (Optional) Create email campaigns in Loops dashboard
 * 
 * Features when connected:
 * - Auto-sync new leads to Loops audience
 * - Tag contacts by source (homepage, product page, etc.)
 * - Trigger welcome email sequences
 * - Send transactional emails (inquiry confirmations)
 */

interface LoopsContact {
  email: string;
  firstName?: string;
  lastName?: string;
  source?: string;
  userGroup?: string;
}

interface LoopsEventPayload {
  email: string;
  eventName: string;
  eventProperties?: Record<string, string | number | boolean>;
}

/**
 * Check if Loops integration is configured
 */
export function isLoopsConfigured(): boolean {
  return !!process.env.LOOPS_API_KEY;
}

/**
 * Add a contact to Loops audience
 */
export async function addContactToLoops(contact: LoopsContact): Promise<{ success: boolean; message: string }> {
  const apiKey = process.env.LOOPS_API_KEY;
  
  if (!apiKey) {
    console.info("[EmailMarketing] Loops not configured — skipping contact sync");
    return { success: false, message: "Loops API not configured" };
  }

  try {
    const response = await fetch("https://app.loops.so/api/v1/contacts/create", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: contact.email,
        firstName: contact.firstName ?? "",
        lastName: contact.lastName ?? "",
        source: contact.source ?? "website",
        userGroup: contact.userGroup ?? "leads",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // Loops returns 409 for duplicate contacts — that's fine
      if (response.status === 409) {
        return { success: true, message: "Contact already exists in Loops" };
      }
      console.warn("[EmailMarketing] Loops API error:", response.status, errorData);
      return { success: false, message: `Loops API error: ${response.status}` };
    }

    return { success: true, message: "Contact added to Loops" };
  } catch (err) {
    console.warn("[EmailMarketing] Failed to sync contact to Loops:", err);
    return { success: false, message: "Network error syncing to Loops" };
  }
}

/**
 * Send an event to Loops (triggers automations)
 */
export async function sendLoopsEvent(payload: LoopsEventPayload): Promise<{ success: boolean }> {
  const apiKey = process.env.LOOPS_API_KEY;
  
  if (!apiKey) {
    console.info("[EmailMarketing] Loops not configured — skipping event");
    return { success: false };
  }

  try {
    const response = await fetch("https://app.loops.so/api/v1/events/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: payload.email,
        eventName: payload.eventName,
        eventProperties: payload.eventProperties ?? {},
      }),
    });

    return { success: response.ok };
  } catch (err) {
    console.warn("[EmailMarketing] Failed to send Loops event:", err);
    return { success: false };
  }
}

/**
 * Sync a new lead to Loops and trigger welcome event
 */
export async function syncLeadToLoops(email: string, source: string): Promise<void> {
  // Add contact
  await addContactToLoops({
    email,
    source,
    userGroup: "leads",
  });

  // Trigger welcome event (can be used to start email sequence in Loops)
  await sendLoopsEvent({
    email,
    eventName: "new_lead_signup",
    eventProperties: { source },
  });
}

/**
 * Sync a business inquiry to Loops and trigger event
 */
export async function syncInquiryToLoops(
  email: string,
  contactName: string,
  companyName: string
): Promise<void> {
  const [firstName, ...lastParts] = contactName.split(" ");
  const lastName = lastParts.join(" ");

  // Add contact
  await addContactToLoops({
    email,
    firstName,
    lastName,
    source: "business_inquiry",
    userGroup: "prospects",
  });

  // Trigger inquiry event
  await sendLoopsEvent({
    email,
    eventName: "business_inquiry_submitted",
    eventProperties: { companyName },
  });
}
