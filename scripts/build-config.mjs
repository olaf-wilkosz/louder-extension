// Numbers and ids shared by the build, the release checks and the tests. One place, so the
// bundle target, the manifest, the README and the store listing cannot drift apart.

/** Oldest Chrome / Edge / Brave the extension supports. Also the esbuild syntax target. */
export const CHROME_MIN_VERSION = 112;

/**
 * Oldest Firefox the extension supports: the first release with the CSS Custom Highlight API
 * (what the highlighting is built on) and with `data_collection_permissions`.
 */
export const FIREFOX_MIN_VERSION = "140.0";

/**
 * Oldest Firefox for Android that understands `data_collection_permissions` (it arrived there two
 * releases after desktop). Declared so the manifest does not claim a Firefox for Android older
 * than the keys it uses; the extension itself targets desktop Firefox and Zen.
 */
export const FIREFOX_ANDROID_MIN_VERSION = "142.0";

/** Firefox add-on id (AMO needs a stable one; it is an id, not a real address). */
export const GECKO_ID = "louder@olaf-wilkosz.github.io";

/** File-name prefix of the packages: dist/<slug>-<version>-<target>.zip */
export const SLUG = "louder";

/** Where each package is built. Same layout as the sibling project: everything lives under dist/. */
export const OUT_DIRS = { chrome: "dist/chrome", firefox: "dist/firefox" };

/** The store zips go next to the unpacked builds. */
export const ZIP_DIR = "dist";
