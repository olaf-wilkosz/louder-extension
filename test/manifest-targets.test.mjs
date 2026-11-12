// The Chrome manifest is the source; the Firefox one is derived from it (scripts/manifest-targets.mjs).
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { CHROME_MIN_VERSION, FIREFOX_ANDROID_MIN_VERSION, FIREFOX_MIN_VERSION, GECKO_ID } from "../scripts/build-config.mjs";
import { manifestFor } from "../scripts/manifest-targets.mjs";

const base = JSON.parse(readFileSync(new URL("../manifest.json", import.meta.url), "utf8"));

describe("manifestFor", () => {
  test("chrome: the source manifest, untouched", () => {
    assert.deepEqual(manifestFor(base, "chrome"), base);
  });

  test("the source manifest is the Chrome one: service worker, minimum Chrome version from the config", () => {
    assert.equal(base.background.service_worker, "background.js");
    assert.equal(base.minimum_chrome_version, String(CHROME_MIN_VERSION));
  });

  test("firefox: an event page instead of a service worker", () => {
    const firefox = manifestFor(base, "firefox");
    assert.deepEqual(firefox.background, { scripts: ["background.js"] });
  });

  test("firefox: add-on id, minimum version, and an explicit 'collects nothing' declaration", () => {
    const { gecko, gecko_android } = manifestFor(base, "firefox").browser_specific_settings;
    assert.deepEqual(gecko_android, { strict_min_version: FIREFOX_ANDROID_MIN_VERSION });
    assert.deepEqual(gecko, {
      id: GECKO_ID,
      strict_min_version: FIREFOX_MIN_VERSION,
      data_collection_permissions: { required: ["none"] },
    });
  });

  test("firefox: no Chrome-only key; everything else is identical to the source", () => {
    const firefox = manifestFor(base, "firefox");
    assert.ok(!("minimum_chrome_version" in firefox));
    for (const [key, value] of Object.entries(base)) {
      if (key === "background" || key === "minimum_chrome_version") continue;
      assert.deepEqual(firefox[key], value, `${key} must not differ between the builds`);
    }
  });

  test("the source manifest is not modified", () => {
    const before = JSON.stringify(base);
    manifestFor(base, "firefox");
    assert.equal(JSON.stringify(base), before);
  });

  test("an unknown target is an error", () => {
    assert.throws(() => manifestFor(base, "safari"), /Unknown target/);
  });
});
