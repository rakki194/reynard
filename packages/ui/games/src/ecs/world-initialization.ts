// World initialization logic

import { ArchetypeId, Archetypes } from "./archetype";
import { ChangeDetectionImpl } from "./change-detection";
import { ComponentRegistry, ComponentStorage } from "./component";
import { EntityManager } from "./entity";
import { ResourceRegistry, ResourceStorage } from "./resource";
import { QueryWorldMixin } from "./query-world";
import { ComponentOperationsMixin } from "./component-operations";
import { ResourceOperationsMixin } from "./resource-operations";
import { ArchetypeOperationsMixin } from "./archetype-operations";
import { SystemOperationsMixin } from "./system-operations";
import { EntityOperationsMixin } from "./entity-operations";

/**
 * World initialization helper.
 * This provides the initialization logic for WorldImpl to keep the constructor clean.
 */
export class WorldInitialization {
  entityManager: EntityManager;
  componentRegistry: ComponentRegistry;
  componentStorage: ComponentStorage;
  resourceRegistry: ResourceRegistry;
  resourceStorage: ResourceStorage;
  changeDetection: ChangeDetectionImpl;
  archetypes: Archetypes;
  entityToArchetype: Map<number, ArchetypeId>;
  queryMixin: QueryWorldMixin;
  componentOps: ComponentOperationsMixin;
  resourceOps: ResourceOperationsMixin;
  archetypeOps: ArchetypeOperationsMixin;
  systemOps: SystemOperationsMixin;
  entityOps: EntityOperationsMixin;

  constructor() {
    this.entityManager = new EntityManager();
    this.componentRegistry = new ComponentRegistry();
    this.componentStorage = new ComponentStorage();
    this.resourceRegistry = new ResourceRegistry();
    this.resourceStorage = new ResourceStorage();
    this.changeDetection = new ChangeDetectionImpl();
    this.archetypes = new Archetypes();
    this.entityToArchetype = new Map();

    // Initialize mixins
    this.queryMixin = new QueryWorldMixin(this.entityManager, this.componentStorage, this.changeDetection);
    this.componentOps = new ComponentOperationsMixin(
      this.componentRegistry,
      this.componentStorage,
      this.changeDetection,
      this.archetypes,
      this.entityToArchetype,
      this.entityManager
    );
    this.resourceOps = new ResourceOperationsMixin(this.resourceRegistry, this.resourceStorage);
    this.archetypeOps = new ArchetypeOperationsMixin(
      this.archetypes,
      this.entityToArchetype,
      this.componentRegistry,
      this.componentStorage,
      this.entityManager
    );
    this.systemOps = new SystemOperationsMixin();
    this.entityOps = new EntityOperationsMixin(
      this.entityManager,
      this.componentRegistry,
      this.componentStorage,
      this.changeDetection,
      this.archetypeOps
    );
  }
}
