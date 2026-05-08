import assert from "node:assert/strict";
import { getMinuteKey, matchesCron } from "./cron";

const date = new Date("2026-05-10T20:00:00");

assert.equal(matchesCron("0 20 * * 0", date), true);
assert.equal(matchesCron("0 18 * * 2", date), false);
assert.equal(matchesCron("0 20 * * 0,3", date), true);
assert.equal(matchesCron("0 19-21 * * 0", date), true);
assert.equal(getMinuteKey(date), "2026-5-10-20-0");

console.log("cron tests passed");
