// One source manifest (manifest.json, the Chrome / Edge / Brave one), two thin variants.
// Pure, so the build, the release checks and the tests all use the same function.
import { FIREFOX_MIN_VERSION, GECKO_ID } from "./build-config.mjs";

/**
 * Firefox has no `background.service_worker`: it runs the same file as an event page
 * (`background.scripts`). It also wants an add-on id and a declaration of what data the
 * extension collects. Louder collects and transmits nothing.
 */
export function manifestFor(base, target) {
  if (target === "chrome") return base;
  if (target !== "firefox") throw new Error(`Unknown target "${target}" (chrome | firefox)`);

  const { minimum_chrome_version: _chromeOnly, background, ...rest } = base;
  return {
    ...rest,
    background: { scripts: [background.service_worker] },
    browser_specific_settings: {
      gecko: {
        id: GECKO_ID,
        strict_min_version: FIREFOX_MIN_VERSION,
        data_collection_permissions: { required: ["none"] },
      },
    },
  };
}
