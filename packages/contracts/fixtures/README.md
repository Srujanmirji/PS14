# Contract fixtures

Every exported JSON schema has a `.valid.json` and `.invalid.json` pair. These are synthetic contract examples, not verified scheme facts, citizen profiles, persona labels or evaluation results. The `example.invalid` links intentionally point to no real scheme.

Schemas are exported from the package root; the fixture tests verify that every schema has both files and that no extra fixture pairs are silently skipped.
