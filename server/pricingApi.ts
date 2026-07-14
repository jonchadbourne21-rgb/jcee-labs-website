/**
 * BidIndustrial Pricing API Service
 * 
 * This module provides the infrastructure to connect to external pricing data APIs.
 * When a pricing API key is configured (PRICING_API_KEY env var), it will fetch
 * real-time material pricing. Otherwise, it returns industry-standard baseline data.
 * 
 * Supported future integrations:
 * - RSMeans (construction cost data)
 * - Craftsman (national estimator)
 * - Custom supplier APIs
 */

import { ENV } from "./_core/env";

// Types for pricing data
export interface MaterialPrice {
  id: string;
  name: string;
  category: string;
  unit: string;
  unitPrice: number;
  lastUpdated: string;
  source: "live" | "baseline";
}

export interface LaborRate {
  trade: string;
  role: string;
  hourlyRate: number;
  overtimeRate: number;
  region: string;
  lastUpdated: string;
  source: "live" | "baseline";
}

export interface PricingResponse {
  materials: MaterialPrice[];
  labor: LaborRate[];
  dataSource: "live_api" | "baseline";
  lastUpdated: string;
}

// Check if a live pricing API is configured
function hasLivePricingApi(): boolean {
  return !!(process.env.PRICING_API_KEY && process.env.PRICING_API_URL);
}

// Fetch live pricing from external API (when configured)
async function fetchLivePricing(trade: string, _region?: string): Promise<PricingResponse | null> {
  const apiKey = process.env.PRICING_API_KEY;
  const apiUrl = process.env.PRICING_API_URL;

  if (!apiKey || !apiUrl) return null;

  try {
    const response = await fetch(`${apiUrl}/v1/pricing?trade=${encodeURIComponent(trade)}`, {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.warn(`[PricingAPI] Live API returned ${response.status}`);
      return null;
    }

    const data = await response.json();
    return {
      materials: data.materials ?? [],
      labor: data.labor ?? [],
      dataSource: "live_api",
      lastUpdated: new Date().toISOString(),
    };
  } catch (err) {
    console.warn("[PricingAPI] Failed to fetch live pricing:", err);
    return null;
  }
}

// Industry-standard baseline pricing data (used when no live API is configured)
const BASELINE_MATERIALS: Record<string, MaterialPrice[]> = {
  hvac: [
    { id: "hvac-001", name: "Copper Refrigerant Line Set (3/8\" x 3/4\")", category: "Piping", unit: "linear ft", unitPrice: 8.50, lastUpdated: "2026-07-01", source: "baseline" },
    { id: "hvac-002", name: "Sheet Metal Ductwork (26 gauge)", category: "Ductwork", unit: "lb", unitPrice: 3.75, lastUpdated: "2026-07-01", source: "baseline" },
    { id: "hvac-003", name: "R-410A Refrigerant", category: "Refrigerant", unit: "lb", unitPrice: 12.00, lastUpdated: "2026-07-01", source: "baseline" },
    { id: "hvac-004", name: "Flex Duct (8\" insulated)", category: "Ductwork", unit: "linear ft", unitPrice: 4.25, lastUpdated: "2026-07-01", source: "baseline" },
    { id: "hvac-005", name: "Programmable Thermostat", category: "Controls", unit: "each", unitPrice: 185.00, lastUpdated: "2026-07-01", source: "baseline" },
  ],
  electrical: [
    { id: "elec-001", name: "THHN Wire #12 AWG", category: "Wire", unit: "linear ft", unitPrice: 0.45, lastUpdated: "2026-07-01", source: "baseline" },
    { id: "elec-002", name: "3/4\" EMT Conduit", category: "Conduit", unit: "10 ft stick", unitPrice: 12.80, lastUpdated: "2026-07-01", source: "baseline" },
    { id: "elec-003", name: "200A Main Breaker Panel", category: "Panels", unit: "each", unitPrice: 425.00, lastUpdated: "2026-07-01", source: "baseline" },
    { id: "elec-004", name: "LED Troffer 2x4 (40W)", category: "Lighting", unit: "each", unitPrice: 95.00, lastUpdated: "2026-07-01", source: "baseline" },
    { id: "elec-005", name: "20A GFCI Receptacle", category: "Devices", unit: "each", unitPrice: 22.50, lastUpdated: "2026-07-01", source: "baseline" },
  ],
  plumbing: [
    { id: "plmb-001", name: "3/4\" Copper Pipe Type L", category: "Piping", unit: "linear ft", unitPrice: 6.80, lastUpdated: "2026-07-01", source: "baseline" },
    { id: "plmb-002", name: "4\" PVC DWV Pipe", category: "Drainage", unit: "10 ft stick", unitPrice: 28.50, lastUpdated: "2026-07-01", source: "baseline" },
    { id: "plmb-003", name: "Water Heater 50 gal (Commercial)", category: "Equipment", unit: "each", unitPrice: 1850.00, lastUpdated: "2026-07-01", source: "baseline" },
    { id: "plmb-004", name: "Backflow Preventer (1\")", category: "Valves", unit: "each", unitPrice: 320.00, lastUpdated: "2026-07-01", source: "baseline" },
    { id: "plmb-005", name: "Floor Drain (4\" cast iron)", category: "Drainage", unit: "each", unitPrice: 145.00, lastUpdated: "2026-07-01", source: "baseline" },
  ],
  mechanical: [
    { id: "mech-001", name: "Steam Trap (1/2\" thermodynamic)", category: "Steam", unit: "each", unitPrice: 185.00, lastUpdated: "2026-07-01", source: "baseline" },
    { id: "mech-002", name: "Schedule 40 Black Steel Pipe (2\")", category: "Piping", unit: "linear ft", unitPrice: 9.50, lastUpdated: "2026-07-01", source: "baseline" },
    { id: "mech-003", name: "Butterfly Valve (4\" wafer)", category: "Valves", unit: "each", unitPrice: 275.00, lastUpdated: "2026-07-01", source: "baseline" },
    { id: "mech-004", name: "Pipe Insulation (2\" fiberglass)", category: "Insulation", unit: "linear ft", unitPrice: 8.75, lastUpdated: "2026-07-01", source: "baseline" },
    { id: "mech-005", name: "Pressure Gauge (0-200 PSI)", category: "Instrumentation", unit: "each", unitPrice: 65.00, lastUpdated: "2026-07-01", source: "baseline" },
  ],
  general: [
    { id: "gen-001", name: "5/8\" Drywall (4x8 sheet)", category: "Drywall", unit: "sheet", unitPrice: 18.50, lastUpdated: "2026-07-01", source: "baseline" },
    { id: "gen-002", name: "Metal Stud (3-5/8\" x 10')", category: "Framing", unit: "each", unitPrice: 8.75, lastUpdated: "2026-07-01", source: "baseline" },
    { id: "gen-003", name: "Acoustic Ceiling Tile (2x4)", category: "Ceiling", unit: "each", unitPrice: 6.50, lastUpdated: "2026-07-01", source: "baseline" },
    { id: "gen-004", name: "Commercial Door Frame (HM)", category: "Doors", unit: "each", unitPrice: 425.00, lastUpdated: "2026-07-01", source: "baseline" },
    { id: "gen-005", name: "VCT Floor Tile (12x12)", category: "Flooring", unit: "sq ft", unitPrice: 3.25, lastUpdated: "2026-07-01", source: "baseline" },
  ],
  commercial: [
    { id: "comm-001", name: "T-Bar Grid System (Main Runner)", category: "Ceiling", unit: "linear ft", unitPrice: 2.85, lastUpdated: "2026-07-01", source: "baseline" },
    { id: "comm-002", name: "Glass Storefront (1\" insulated)", category: "Glazing", unit: "sq ft", unitPrice: 45.00, lastUpdated: "2026-07-01", source: "baseline" },
    { id: "comm-003", name: "Fire Rated Door (90 min)", category: "Doors", unit: "each", unitPrice: 1250.00, lastUpdated: "2026-07-01", source: "baseline" },
    { id: "comm-004", name: "Epoxy Floor Coating", category: "Flooring", unit: "sq ft", unitPrice: 8.50, lastUpdated: "2026-07-01", source: "baseline" },
    { id: "comm-005", name: "ADA Compliant Restroom Package", category: "Fixtures", unit: "each", unitPrice: 4500.00, lastUpdated: "2026-07-01", source: "baseline" },
  ],
};

const BASELINE_LABOR: Record<string, LaborRate[]> = {
  hvac: [
    { trade: "HVAC", role: "Journeyman", hourlyRate: 65.00, overtimeRate: 97.50, region: "National Avg", lastUpdated: "2026-07-01", source: "baseline" },
    { trade: "HVAC", role: "Apprentice", hourlyRate: 38.00, overtimeRate: 57.00, region: "National Avg", lastUpdated: "2026-07-01", source: "baseline" },
    { trade: "HVAC", role: "Foreman", hourlyRate: 78.00, overtimeRate: 117.00, region: "National Avg", lastUpdated: "2026-07-01", source: "baseline" },
  ],
  electrical: [
    { trade: "Electrical", role: "Journeyman", hourlyRate: 72.00, overtimeRate: 108.00, region: "National Avg", lastUpdated: "2026-07-01", source: "baseline" },
    { trade: "Electrical", role: "Apprentice", hourlyRate: 40.00, overtimeRate: 60.00, region: "National Avg", lastUpdated: "2026-07-01", source: "baseline" },
    { trade: "Electrical", role: "Foreman", hourlyRate: 85.00, overtimeRate: 127.50, region: "National Avg", lastUpdated: "2026-07-01", source: "baseline" },
  ],
  plumbing: [
    { trade: "Plumbing", role: "Journeyman", hourlyRate: 68.00, overtimeRate: 102.00, region: "National Avg", lastUpdated: "2026-07-01", source: "baseline" },
    { trade: "Plumbing", role: "Apprentice", hourlyRate: 36.00, overtimeRate: 54.00, region: "National Avg", lastUpdated: "2026-07-01", source: "baseline" },
    { trade: "Plumbing", role: "Foreman", hourlyRate: 80.00, overtimeRate: 120.00, region: "National Avg", lastUpdated: "2026-07-01", source: "baseline" },
  ],
  mechanical: [
    { trade: "Mechanical", role: "Journeyman", hourlyRate: 70.00, overtimeRate: 105.00, region: "National Avg", lastUpdated: "2026-07-01", source: "baseline" },
    { trade: "Mechanical", role: "Apprentice", hourlyRate: 38.00, overtimeRate: 57.00, region: "National Avg", lastUpdated: "2026-07-01", source: "baseline" },
    { trade: "Mechanical", role: "Foreman", hourlyRate: 82.00, overtimeRate: 123.00, region: "National Avg", lastUpdated: "2026-07-01", source: "baseline" },
  ],
  general: [
    { trade: "General", role: "Journeyman", hourlyRate: 55.00, overtimeRate: 82.50, region: "National Avg", lastUpdated: "2026-07-01", source: "baseline" },
    { trade: "General", role: "Laborer", hourlyRate: 32.00, overtimeRate: 48.00, region: "National Avg", lastUpdated: "2026-07-01", source: "baseline" },
    { trade: "General", role: "Superintendent", hourlyRate: 90.00, overtimeRate: 135.00, region: "National Avg", lastUpdated: "2026-07-01", source: "baseline" },
  ],
  commercial: [
    { trade: "Commercial", role: "Journeyman", hourlyRate: 60.00, overtimeRate: 90.00, region: "National Avg", lastUpdated: "2026-07-01", source: "baseline" },
    { trade: "Commercial", role: "Laborer", hourlyRate: 30.00, overtimeRate: 45.00, region: "National Avg", lastUpdated: "2026-07-01", source: "baseline" },
    { trade: "Commercial", role: "Project Manager", hourlyRate: 95.00, overtimeRate: 142.50, region: "National Avg", lastUpdated: "2026-07-01", source: "baseline" },
  ],
};

/**
 * Get pricing data for a specific trade.
 * Attempts live API first (if configured), falls back to baseline data.
 */
export async function getPricing(trade: string, region?: string): Promise<PricingResponse> {
  const normalizedTrade = trade.toLowerCase().replace(/\s+/g, "");

  // Try live API first
  if (hasLivePricingApi()) {
    const liveData = await fetchLivePricing(normalizedTrade, region);
    if (liveData) return liveData;
  }

  // Fall back to baseline data
  const tradeKey = normalizedTrade === "commercialbuild-out" ? "commercial" : normalizedTrade;
  const materials = BASELINE_MATERIALS[tradeKey] ?? BASELINE_MATERIALS.general ?? [];
  const labor = BASELINE_LABOR[tradeKey] ?? BASELINE_LABOR.general ?? [];

  return {
    materials,
    labor,
    dataSource: "baseline",
    lastUpdated: "2026-07-01T00:00:00Z",
  };
}

/**
 * Get all available trades
 */
export function getAvailableTrades(): string[] {
  return ["hvac", "electrical", "plumbing", "mechanical", "general", "commercial"];
}
