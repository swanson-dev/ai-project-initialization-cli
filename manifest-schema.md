# manifest.json schema notes (Phase 2)

This document describes the current shape of `manifest.json` used in Phase 2.

## Top-level fields

- `version` (string): semantic version for registry snapshot.
- `published_at` (string): ISO-8601 timestamp for publication.
- `scaffolds` (array): scaffold records.
- `agent_packs` (array): agent pack directory records.
- `agent_pack_files` (array): explicit core policy/prompt files.
- `product_type_packs` (array): product-type-specific pack files.
- `skills` (array): skill records.
- `tech_stack_recipes` (array): tech recipe records.
- `file_templates` (array): template records.
- `registry_docs` (array): required registry-level documentation explicitly intended for initialized project output.

## Record shape

Each record uses:

- `id` (string): stable identifier.
- `path` (string): explicit relative path to directory or file.

## Constraints

- No wildcard paths.
- Every referenced path MUST exist.
- Paths MUST be explicitly enumerated for policy-critical assets.
- MVP scaffold scope remains one scaffold (`standard-planning-plus-code`).

## Registry-level documentation clarification

Repository-level documentation files such as `README.md`, `CONTRIBUTING.md`, `USAGE.md`, and `manifest-schema.md` are repository governance artifacts. These files are NOT required to be referenced in `manifest.json` and are NOT copied into initialized projects unless explicitly added to manifest output mappings.
