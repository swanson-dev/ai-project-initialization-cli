import fs from 'node:fs/promises';
import path from 'node:path';
import {
  BootstrapLockPayload,
  Manifest,
  ResolvedSelections,
  SelectedAssetsHashEntry,
  SelectedAssetsPayload,
  SelectedAssetsTooling,
} from './types.js';
import { recordCreatedFile, WriteContext } from './write-context.js';

export type ProvenanceBuildInput = {
  manifest: Manifest;
  resolvedSelections: ResolvedSelections;
  scaffoldId: string;
  techStackRecipeId: string;
  productPackId?: string;
  description: string;
  preferredTechnology: string;
  selectedSkillIds: string[];
  copiedPaths: string[];
  instantiatedDocs: string[];
  metadataFiles: string[];
  cliName: string;
  cliVersion: string;
  createdAt: string;
  source: {
    owner: string | null;
    repo: string | null;
    ref: string;
    rawBase: string;
    isOverride: boolean;
  };
  tooling: {
    manifestContractVersionUsedByCli: SelectedAssetsTooling['manifest_contract_version_used_by_cli'];
    cliName: string;
    cliVersion: string;
  };
  hashes?: SelectedAssetsHashEntry[];
  projectRoot?: string;
};

function getProjectName(projectRoot: string): string {
  return path.basename(projectRoot);
}

function getProductTypePacks(productPackId?: string): string[] {
  return productPackId ? [productPackId] : [];
}

function getInstantiationRuleOutputs(manifest: Manifest): Array<{ template_id: string; target: string }> {
  return (manifest.instantiation_rules ?? []).map((rule) => ({
    template_id: rule.template_id,
    target: rule.target.replace(/\\/g, '/'),
  }));
}

function sortLex(values: string[]): string[] {
  return [...values].sort((left, right) => left.localeCompare(right));
}

function getMaterializationSnapshot(manifest: Manifest): SelectedAssetsPayload['materialization'] {
  const materialization = manifest.materialization;
  return {
    copy_raw_asset_groups: materialization?.copy_raw_asset_groups ? [...materialization.copy_raw_asset_groups] : [],
    asset_group_roots: materialization?.asset_group_roots ? { ...materialization.asset_group_roots } : {},
    exclude_globs: materialization?.exclude_globs ? [...materialization.exclude_globs] : [],
    project_metadata_dir: materialization?.project_metadata_dir ?? '.project',
  };
}

export function buildSelectedAssetsPayload(input: ProvenanceBuildInput): SelectedAssetsPayload {
  const projectRoot = input.projectRoot ?? process.cwd();
  const instantiationRules = getInstantiationRuleOutputs(input.manifest);
  const hashes = input.hashes
    ? [...input.hashes].sort((left, right) => left.path.localeCompare(right.path)).map((entry) => ({
        path: entry.path,
        sha256: entry.sha256,
      }))
    : undefined;

  return {
    registry_version: input.manifest.version,
    published_at: input.manifest.published_at ?? null,
    contract_version: '1',
    created_at: input.createdAt,
    project: {
      project_id: null,
      name: getProjectName(projectRoot),
      description: input.description,
      preferred_technology: input.preferredTechnology,
      product_type: input.productPackId ?? '',
      selected_skills: [...input.selectedSkillIds],
      initialized_at: input.createdAt,
      cli_version: input.cliVersion,
      code_location: '/app',
    },
    source: {
      registry: {
        owner: input.source.owner,
        repo: input.source.repo,
        ref: input.source.ref,
        raw_base: input.source.rawBase,
        is_override: input.source.isOverride,
      },
    },
    tooling: {
      manifest_contract_version_used_by_cli: input.tooling.manifestContractVersionUsedByCli,
      cli: {
        name: input.tooling.cliName,
        version: input.tooling.cliVersion,
      },
    },
    selected: {
      scaffold: input.scaffoldId,
      tech_stack_recipe: input.techStackRecipeId,
      agent_packs: [...input.resolvedSelections.agentPackIds],
      skills: [...input.resolvedSelections.skillIds],
      product_type_packs: getProductTypePacks(input.productPackId),
      registry_docs: [...input.resolvedSelections.registryDocIds],
      file_templates: [...input.resolvedSelections.fileTemplateIds],
      instantiation_rules: instantiationRules,
    },
    materialization: getMaterializationSnapshot(input.manifest),
    outputs: {
      copied_paths: sortLex(input.copiedPaths),
      instantiated_docs: [...input.instantiatedDocs],
      metadata_files: sortLex(input.metadataFiles),
      hashes,
    },
  };
}

export function buildBootstrapLockPayloadFromSelectedAssets(payload: SelectedAssetsPayload): BootstrapLockPayload {
  if (
    payload.tooling === undefined ||
    payload.tooling.manifest_contract_version_used_by_cli !== '1' ||
    typeof payload.tooling.cli.name !== 'string' ||
    payload.tooling.cli.name.length === 0 ||
    typeof payload.tooling.cli.version !== 'string' ||
    payload.tooling.cli.version.length === 0
  ) {
    throw new Error('selected-assets.json does not include enough tooling metadata to reconstruct .project/bootstrap.lock');
  }

  return {
    registry: {
      version: payload.registry_version,
      published_at: payload.published_at,
      contract_version: payload.contract_version,
    },
    selection: {
      scaffold: payload.selected.scaffold,
      tech_stack_recipe: payload.selected.tech_stack_recipe,
      agent_packs: [...payload.selected.agent_packs],
      skills: [...payload.selected.skills],
      product_type_packs: [...payload.selected.product_type_packs],
      registry_docs: [...payload.selected.registry_docs],
      file_templates: [...payload.selected.file_templates],
    },
    instantiated_docs: payload.selected.instantiation_rules.map((rule) => ({
      template_id: rule.template_id,
      target: rule.target,
    })),
    manifest_contract_version_used_by_cli: payload.tooling.manifest_contract_version_used_by_cli,
    cli: {
      name: payload.tooling.cli.name,
      version: payload.tooling.cli.version,
    },
  };
}

export function buildBootstrapLockPayload(input: ProvenanceBuildInput): BootstrapLockPayload {
  return {
    registry: {
      version: input.manifest.version,
      published_at: input.manifest.published_at ?? null,
      contract_version: '1',
    },
    selection: {
      scaffold: input.scaffoldId,
      tech_stack_recipe: input.techStackRecipeId,
      agent_packs: [...input.resolvedSelections.agentPackIds],
      skills: [...input.resolvedSelections.skillIds],
      product_type_packs: getProductTypePacks(input.productPackId),
      registry_docs: [...input.resolvedSelections.registryDocIds],
      file_templates: [...input.resolvedSelections.fileTemplateIds],
    },
    instantiated_docs: getInstantiationRuleOutputs(input.manifest),
    manifest_contract_version_used_by_cli: '1',
    cli: {
      name: input.cliName,
      version: input.cliVersion,
    },
  };
}

export async function writeSelectedAssets(
  payload: SelectedAssetsPayload,
  context: WriteContext,
  projectRoot = process.cwd(),
): Promise<string> {
  const relativePath = '.project/selected-assets.json';
  await fs.writeFile(path.join(projectRoot, relativePath), JSON.stringify(payload, null, 2) + '\n', 'utf8');
  recordCreatedFile(context, relativePath);
  return relativePath;
}

export async function writeBootstrapLock(
  payload: BootstrapLockPayload,
  context: WriteContext,
  projectRoot = process.cwd(),
): Promise<string> {
  const relativePath = '.project/bootstrap.lock';
  await fs.writeFile(path.join(projectRoot, relativePath), JSON.stringify(payload, null, 2) + '\n', 'utf8');
  recordCreatedFile(context, relativePath);
  return relativePath;
}
