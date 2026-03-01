# File Placement Rules

- Agents MUST NOT create code outside `/app`.
- Agents MUST place planning artifacts in the numbered `/docs` taxonomy defined in `scaffolds/standard-planning-plus-code/docs/README.md` (`00-overview` through `10-implementation`) according to content type.
- Agents MUST preserve root-level governance files as documentation-only.
- Agents MUST NOT create new root-level documentation folders without explicit approval.
- Agents MUST reject tasks that request implementation code outside `/app`.
