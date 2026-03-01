# Phase 2 Audit Report

Date: 2026-03-01
Scope: Internal consistency/completeness audit only (no feature additions)

## Checks performed

1. Verified every `path` in `manifest.json` exists.
2. Checked for wildcard/glob patterns in manifest paths.
3. Compared repository files against manifest-referenced files/directories to identify unreferenced files.
4. Verified `/app` rule consistency across:
   - `scaffolds/standard-planning-plus-code/app/README.md`
   - `agent-packs/core/OUTPUT_RULES.md`
   - `tech-stacks/*/recipe.md`
   - `agent-packs/core/core-system-prompt.md`
5. Compared `OUTPUT_RULES.md` against:
   - `agent-packs/core/file-placement-rules.md`
   - `agent-packs/core/documentation-rules.md`
6. Checked ecommerce pack (`agent-packs/product-types/ecommerce/pack.md`) for rule conflicts with core pack files.
7. Verified all file templates include:
   - Output location
   - Definition of Done
   - Next Actions
8. Checked docs scaffold folder names in `scaffolds/standard-planning-plus-code/docs/README.md` against actual scaffold directories.
9. Checked for framework scaffolding outside `/app`.

## Inconsistencies found

- None found in policy/rules consistency for the requested rule checks.

## Missing references

The following repository files are not covered by any `manifest.json` path (directly or by a referenced directory prefix):

- `.gitignore`
- `.gitkeep`
- `CONTRIBUTING.md`
- `README.md`
- `USAGE.md`
- `examples/.keep`
- `manifest-schema.md`
- `manifest.json`
- `prompts/system/.keep`
- `prompts/workflows/.keep`

Notes:
- Some of these appear intentionally repository-local (for example `.gitignore`, `.gitkeep`, `.keep` placeholders).
- However, `README.md`, `USAGE.md`, and `manifest-schema.md` are core registry docs and are currently not listed in `registry_docs`.

## Redundant files

Potentially redundant/unconsumed placeholders (not referenced by manifest and with no functional content):

- `examples/.keep`
- `prompts/system/.keep`
- `prompts/workflows/.keep`

## Ambiguities that could cause agent drift

1. `skills/status-and-changelog/skill.md` says:
   - "Save under `/docs/07-status` (**or equivalent status template outputs**)."
   - "Equivalent" is ambiguous and could allow non-canonical output locations.

2. `agent-packs/core/file-placement-rules.md` uses broad language:
   - "place planning artifacts in `/docs/*` folders based on content type."
   - This is less specific than `OUTPUT_RULES.md` numbered folder taxonomy and may allow inconsistent placement.

3. `manifest-schema.md` says:
   - "If this registry is materialized in full, it SHOULD also include: `manifest.json`, `manifest-schema.md`, `CONTRIBUTING.md`."
   - The current `manifest.json` `registry_docs` only includes `project-contract.md`, which may cause ambiguity about what "full" materialization should include.

## Checklist result summary

- Every path referenced in `manifest.json` exists: PASS
- No orphan files not referenced in `manifest.json`: FAIL (see "Missing references")
- `/app` rule consistency across requested files: PASS
- `OUTPUT_RULES.md` non-contradiction with placement/docs rules: PASS
- Ecommerce pack conflict with core rules: PASS
- File templates include required sections: PASS
- Prompt/rule-file references are valid: PASS
- `docs/README` folder names match scaffold: PASS
- No framework scaffolding outside `/app`: PASS
- No globs in `manifest.json`: PASS
