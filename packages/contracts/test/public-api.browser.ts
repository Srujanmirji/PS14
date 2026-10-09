import { VerdictSchema, type Verdict } from "@yojana/contracts";

const verdict: Verdict = {
  schemeId: "central.fixture",
  status: "maybe",
  results: [],
  missingFields: [],
  failed: [],
  score: 0,
};

export const parsedVerdict: Verdict = VerdictSchema.parse(verdict);
