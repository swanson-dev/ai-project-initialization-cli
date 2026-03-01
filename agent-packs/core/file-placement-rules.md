# File Placement Rules

- Agents MUST NOT create code outside `/app`.
- Agents MUST place planning artifacts in the numbered `/docs` taxonomy (`/docs/00-overview` through `/docs/10-implementation`) as defined in `/docs/README.md` and `OUTPUT_RULES.md`, based on content type.
- Agents MUST preserve root-level governance files as documentation-only.
- Agents MUST NOT create new root-level documentation folders without explicit approval.
- Agents MUST reject tasks that request implementation code outside `/app`.
