import test from "node:test";
import assert from "node:assert/strict";
import { AssetStateService } from "../src/lib/assetStateService";

test("allows the documented asset lifecycle transitions", () => {
  assert.equal(AssetStateService.canTransition("AVAILABLE", "ALLOCATED"), true);
  assert.equal(AssetStateService.canTransition("ALLOCATED", "AVAILABLE"), true);
  assert.equal(AssetStateService.canTransition("AVAILABLE", "UNDER_MAINTENANCE"), true);
  assert.equal(AssetStateService.canTransition("UNDER_MAINTENANCE", "AVAILABLE"), true);
  assert.equal(AssetStateService.canTransition("ALLOCATED", "LOST"), true);
  assert.equal(AssetStateService.canTransition("AVAILABLE", "DISPOSED"), false);
});

test("rejects transitions that are not explicitly allowed", () => {
  assert.equal(AssetStateService.canTransition("RETIRED", "ALLOCATED"), false);
  assert.equal(AssetStateService.canTransition("LOST", "AVAILABLE"), false);
});
