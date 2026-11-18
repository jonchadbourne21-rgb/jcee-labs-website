import {describe,expect,it} from "vitest";
import {publicCapabilities} from "./capabilities";
describe("JCEE public capability catalog",()=>{
it("holds the approved eight categories",()=>expect(publicCapabilities.map(c=>c.id)).toEqual(["authorization","consequence-control","durable-recovery","evidence-verification","receipts-and-audit","governed-knowledge","connected-workflows","qualification"]));
it("provides unique IDs, navigable details and bounded descriptions",()=>{expect(new Set(publicCapabilities.map(c=>c.id)).size).toBe(8); for(const c of publicCapabilities){expect(c.id).toMatch(/^[a-z]+(?:-[a-z]+)*$/);for(const f of ["summary","customerNeed","architecture","useCase","implemented","qualification"] as const)expect(c[f].length).toBeGreaterThan(30);expect(c.relatedHref).toMatch(/^\/(?!\/)[a-z/#-]+$/);}});
it("does not advertise universal safety or product certification",()=>{const s=JSON.stringify(publicCapabilities).toLowerCase();expect(s).not.toMatch(/production-certified|fully unbypassable|guaranteed zero failures/);expect(s).toContain("qualification");});
});
