# Packaged-Food Barcode Provider Notes

**Captured:** 12 September 2026

Mise uses the public [Open Food Facts API](https://openfoodfacts.github.io/openfoodfacts-server/api/tutorial-off-api/) for non-authenticated product lookups by barcode. The official tutorial documents `GET https://world.openfoodfacts.net/api/v2/product/{barcode}` and confirms that the response includes a `status` field identifying whether a product was found. It also documents requesting a restricted `fields` set and returning nutriments alongside product information.

A live validation request to `https://world.openfoodfacts.org/api/v2/product/3017620422003.json` returned a product record with barcode, product name, brands, serving size, nutrient fields, ingredient text, allergen tags, product front image, state tags, and completeness. The selected product was Nutella (EAN 3017620422003).

The service is a collaborative product database rather than a regulatory label registry. Mise therefore stores a **source snapshot** and displays “as listed in Open Food Facts” with source link and completeness indicator. It never calls third-party values laboratory-exact, nor treats allergy tags as safety guarantees. Users can review the saved product details and explicitly choose a serving count before it enters daily totals. If a barcode is not found, no nutrition is fabricated; the UI offers manual label entry.

No dedicated packaged-food connector was enabled in the session configuration, so the protected application server calls the public API directly with an identifying User-Agent. The integration has a short timeout and database cache; network failure returns a structured unavailable state rather than stale or invented nutrition.

## Sources

1. [Open Food Facts API tutorial: Get a Product by Barcode](https://openfoodfacts.github.io/openfoodfacts-server/api/tutorial-off-api/)
2. [Open Food Facts data, API and SDKs](https://world.openfoodfacts.org/data)
