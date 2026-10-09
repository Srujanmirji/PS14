import { expect, test } from "vitest";
import * as scaffold from "../src/index";

test("scaffold exports no implementation yet", () => {
  expect(Object.keys(scaffold)).toEqual([]);
});
