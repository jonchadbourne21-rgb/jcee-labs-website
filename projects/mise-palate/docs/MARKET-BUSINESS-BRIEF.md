# Mise — Market and Business Brief

**Author:** Manus AI  
**Evidence cutoff:** 12 September 2026  
**Decision:** **ITERATE**, not broad launch

## 1. Executive conclusion

**Fact.** The basic cooking workflow is crowded. Samsung Food spans recipe capture, personalization, planning, nutrition, collaboration, and connected appliances. SideChef provides guided cooking and grocery execution. Paprika provides durable recipe ownership. SuperCook provides ingredient-led discovery. ChefGPT and DishGen already sell AI recipe and planning experiences. America’s Test Kitchen sells trusted human-tested culinary instruction.[1] [2] [3] [4] [5] [6] [7]

**Inference.** An “AI recipe generator” is not a company thesis. It is a feature with abundant substitutes. Camera recognition is also not sufficient because correction burden can erase the convenience benefit.

**Hypothesis.** A product that connects **palate → recipe → modification → cooking result → rating → sensory adjustment** can become more useful than filters and favorites. The value is strongest when it improves a repeated dish, prevents an in-progress failure, or reconciles two diners without compromising the shared preparation.

**Recommendation.** Continue as a constrained product experiment. Position Mise as a **chef-guided cooking memory that learns how a person likes outcomes**, not as a comprehensive meal planner. Do not build retail, nutrition, social, or appliance breadth until repeated-cook behavior proves the learning loop.

## 2. Problem and first customer

Ambitious home cooks have access to recipes but lack the judgment required to adapt them. They struggle to connect ingredient condition, heat, timing, visual cues, texture, substitutions, and personal preferences. Generic recipes target an average reader. General AI can generate plausible text but often lacks durable household memory and clear separation between preference and safety.

The first customer cooks at least three times weekly, enjoys high-quality food, is willing to experiment, and has enough repetition for learning to compound. A strong recruitment cohort is one primary cook preparing meals for a partner or household with recurring preference conflicts.

## 3. Current competitor evidence

| Product | Documented strength | Public price at cutoff | Gap relevant to Mise |
|---|---|---:|---|
| Samsung Food | Broad recipe, planning, nutrition, household, camera and appliance suite | $6.99/month or $59.99/year | Public materials do not establish a deep outcome-learning model or chef-reviewed knowledge layer.[1] |
| SideChef | Guided cooking, retail fulfillment, recipe capture and classes | $4.99/month or $49.99/year | Public evidence does not establish durable sensory learning or transparent culinary reasoning.[2] |
| Paprika | Dependable recipe ownership, notes, cook mode, pantry and sync | $4.99 on iOS; Windows $29.99 sale price | No documented AI reasoning, vision, automated substitutions, or learned preference model.[3] |
| ChefGPT | Pantry generation, nutrition, macros and planning | Free plus ambiguous web and app upgrades | No first-party evidence of strong guided execution, household memory, chef review, or safety guarantees.[4] |
| DishGen | Chat-based generation, edits, substitutions and plans | $7.99/month or $79.99/year | No documented camera recognition, Cook Mode, household profiles, or human-reviewed knowledge.[5] |
| SuperCook | Large pantry-first recipe retrieval | Free | Little evidence of execution guidance, deep personalization, or outcome memory.[6] |
| America’s Test Kitchen | Trusted tested recipes, education, reviews and classes | $9.95/month; $49.95 introductory first year, then $79.95/year | Limited documented personalization, camera input, pantry intelligence, or adaptive AI.[7] |

The complete eight-product evidence matrix, caveats, and forty-seven source references are preserved in `docs/COMPETITOR-ANALYSIS.md`.

## 4. Market gap and differentiation

The most defensible gap is not recipe supply. It is a structured memory of what a particular person enjoyed, what changed during the cook, and which sensory adjustment should be carried into the next version. Mise combines three components:

| Component | Value | Evidence still required |
|---|---|---|
| Chef DNA | Improves execution through cues, sequencing, failure modes and recoveries | A/B evidence that reviewed knowledge improves meal outcomes versus generic instructions |
| Palate Twin | Turns real meal outcomes into a persistent sensory model | Evidence that users will provide enough lightweight feedback and notice better recommendations |
| Taste Forecast | Makes a proposed change legible before the user commits | Evidence that forecast use changes decisions or reduces failed adaptations |

The data moat is legitimate only if users consent and the loop improves outcomes. Raw prompts, photos, or recipe text are not a moat. The valuable record is a structured link between a prior preference estimate, a chosen recipe version, an actual modification, the cooked result, and the user’s post-meal signal.

## 5. Business model and pricing recommendation

**Fact.** Broad consumer products cluster between free and roughly $5–$8 per month, while ATK reaches roughly $10 per month through trusted editorial authority.[1] [2] [5] [7]

**Hypothesis.** Mise can support a premium price only after the user experiences several memory-backed wins. Charging for raw generations reinforces the wrong value proposition.

**Recommendation.** Launch a free research cohort. Test **$5.99/month or $49/year** after the user has completed at least three meals and received a recommendation tied to prior feedback. This price is below the original $7–$12 hypothesis because free suites are broad and AI recipe alternatives are abundant. A later $8.99–$11.99 household tier can bundle multi-palate matching, shared memory, and advanced recovery only after those capabilities show measured household value.

The free tier should include calibration, camera confirmation, Cook Mode, five active saved recipes, and a small number of live structured recipes per month. The paid tier should emphasize unlimited cooking memory, Taste Forecast, advanced recovery, versions, export, and household profiles. It should not advertise token limits.

## 6. Acquisition paths

| Path | Why it fits | Early test |
|---|---|---|
| Chef-advisor content | Demonstrates real judgment without building a creator marketplace | Publish short “why this fails” technique breakdowns tied to the product’s recovery flow |
| Ambitious home-cook communities | Concentrates users who already adapt recipes | Recruit 30–50 testers who cook three or more times weekly |
| Recipe-import wedge | Lets users bring trusted meals rather than accept a cold-start generator | Test URL and manual import after the memory loop is validated |
| Couple/household referrals | Makes multi-palate value concrete | Give testers one shareable “how we resolved this dish” summary |
| Search around urgent failures | Recovery has clear intent and urgency | Create focused landing pages for common sauce, browning, and substitution problems |

Paid acquisition should wait. The first acquisition target is research density, not top-of-funnel volume.

## 7. Major risks

The largest product risk is **feedback starvation**. If users do not complete cooking sessions and leave a useful signal, Palate Twin becomes a decorative profile. The second risk is **unreliable AI at moments of trust**. Ingredient identity, allergens, substitutions, and doneness can cause harm or destroy confidence. The third risk is **incumbent response**. Larger products can copy a radar chart or “personal taste” label; defensibility must come from outcome history and better application of that history.

Inference economics are manageable in the base model at $0.04705 per completed cook, but they become dangerous if retries, long histories, or premium-model usage expand without control. At 100,000 active users and four completed cooks per month, the base model estimates $21,643 in monthly model cost before hosting, storage, support, payments, and tax. The complete assumptions are in `docs/cost-model.json`.

## 8. What could stop retention

Users will stop if correction takes longer than typing ingredients, options are merely generic recipes with flattering explanations, Cook Mode is slower than a printed recipe, forecasts feel obvious or inconsistent, the system asks for too much feedback, or the learned profile does not visibly affect the next meal. AI food imagery, large recipe counts, nutrition dashboards, and social features may attract curiosity but are unlikely to rescue a weak repeat-cook loop.

## 9. Kill criteria

| Kill or pivot condition | Measurement window | Action |
|---|---:|---|
| Fewer than 25% of activated users complete a first cook | First 14 days | Simplify the path or pivot away from generation-first discovery |
| Fewer than 35% of first-cook users complete a second cook | 30 days | Challenge whether the memory adds enough value to return |
| Fewer than 50% of completed meals receive a lightweight rating | First 100 cooks | Redesign or partially infer feedback; if still low, weaken the Palate Twin thesis |
| Users cannot identify a better recommendation after three signals | Qualitative test after three cooks | Pivot toward narrow rescue/technique support rather than persistent personalization |
| More than 15% of image items require correction and users prefer manual entry | First 100 clear-image scans | Demote camera from the primary CTA |
| Any severe unsafe recommendation escapes the fixed safety boundary | Continuous | Stop the affected domain, audit, and narrow supported techniques |
| Inference and support costs exceed 25% of tested subscription revenue without higher retention | Three paid cohorts | Reduce model scope or reject the subscription model |

## 10. Recommendation

**ITERATE.** The technical prototype proves that Chef DNA, Palate Twin, and Taste Forecast can coexist in one coherent experience with real models and fixed safety boundaries. It does not prove that people will repeatedly cook with it. The next investment should be a measured concierge cohort, not more feature development.

## 11. Three fastest experiments

1. **Personalization value A/B test.** Give 30 cooks the same ingredient set. Half receive a generic high-quality recipe; half receive a Palate Twin version with the same safety constraints. Blind-rate expected appeal before cooking and outcome after cooking. Repeat with a second meal to test whether one feedback signal changes perceived fit.
2. **Second-cook retention test.** Recruit 50 target users for four weeks. Require only one-tap completion feedback plus one optional adjustment. Measure first cook, second cook, third cook, and whether the second recommendation cites and applies prior evidence.
3. **Chef DNA causal test.** Run matched recipes with standard instructions versus reasons, sensory cues, failure modes, and recovery. Measure completion, recovery success, confidence, and meal rating. If reviewed guidance does not materially improve outcomes, the most expensive knowledge strategy is not justified.

## References

[1]: https://samsungfood.com/food-plus/ "Samsung Food+"
[2]: https://www.sidechef.com/premium/ "SideChef Premium"
[3]: https://www.paprikaapp.com/ "Paprika Recipe Manager"
[4]: https://www.chefgpt.xyz/ "ChefGPT"
[5]: https://www.dishgen.com/premium "DishGen Premium"
[6]: https://www.supercook.com/ "SuperCook"
[7]: https://support.americastestkitchen.com/hc/en-us/articles/20476195789211-Essential-Membership-Pricing-and-Plans "America’s Test Kitchen Essential Membership Pricing and Plans"
