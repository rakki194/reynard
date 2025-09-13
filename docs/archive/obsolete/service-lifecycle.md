# Service Lifecycle and Core Setup

YipYap runs backend services under a unified lifecycle. Each service derives from a common base that
provides startup sequencing, dependency wiring, periodic health checks, and uniform metadata.

## Base Service Model

All services inherit from `app/services/base.py` `BaseService`. The base defines the lifecycle:

- start: verifies dependency readiness and required packages, calls `initialize`, transitions to RUNNING, starts a periodic health loop.
- stop: cancels health checks, calls `shutdown`, transitions to STOPPED.
- health: `_health_check` returns `HEALTHY`/`DEGRADED`/`UNHEALTHY`. The base records `last_check`, `startup_time`, and `error` if any.

Services declare: `name`, `dependencies`, optional `required_packages`, `startup_priority` (lower starts earlier), and
`auto_start`. `get_info()` returns status, health, dependencies, startup time, and last error.

- Files:
  - `app/services/base.py`

## Core Service Initialization

`initialize_core_services(config_file="config.json")` (in `app/services/core/service_setup.py`) creates a
`ServiceManager`, registers services, and starts them in dependency order. It conditionally registers RAG and NLWeb
stacks based on config flags.

Registered services include (non‑exhaustive):

- Core: `config_manager`, `threading_manager`, `data_source`, `file_watcher`, `model_registry`, `caption_generator`, `detection_models`, `image_processing`
- Integrations: `ollama`, `tool_registry`, `git`, `memory`, `tts`, `crawl_service`, `summarize_service`, optional `comfy`
- Background: `index_service`, `training_script_watcher_service`, `caption_request_queue`
- RAG (when `rag_enabled`): `vector_db`, `embedding_service`, `clip_embedding_service`, `embedding_index_service`, `rag_service`
- NLWeb (when `nlweb_enabled`): `nlweb_router_service`

Helpers: `get_service_manager()`, `get_core_service_status()`, `shutdown_core_services()`.

- Files:
  - `app/services/core/service_setup.py`

## Config Manager Service

`ConfigManagerService` wraps `AppConfig` and provides config IO with env overrides. It loads `config.json` or
`config.default.json`, applies environment overrides (NLWeb, Comfy, RAG, etc.), and
exposes `get_config()`, `update_config(**kwargs)`, `save_config()`.

- Files:
  - `app/services/core/config_manager_service.py`
  - `app/services/core/app_config.py`

## Health and Diagnostics

Each service runs `_health_check()` on
an interval (`health_check_interval`). Aggregate info is exposed via the manager’s `get_all_service_info()` (wired to
`get_core_service_status()`), while each service returns a structured dict via `get_info()`.

### Watchdog and Backoff Tunables

Several services expose configuration-backed health and
reconnection tunables, with environment overrides consumed by the config manager:

- Comfy: `COMFY_HEALTH_INTERVAL_S`, `COMFY_RECONNECT_MAX_ATTEMPTS`, `COMFY_RECONNECT_BASE_DELAY_S`, `COMFY_RECONNECT_MAX_DELAY_S`
- NLWeb: `NLWEB_HEALTH_INTERVAL_S`, `NLWEB_RECONNECT_MAX_ATTEMPTS`, `NLWEB_RECONNECT_BASE_DELAY_MS`, `NLWEB_RECONNECT_MAX_DELAY_MS`
- VectorDB (Postgres): `PG_HEALTH_INTERVAL_S`, `PG_POOL_PRE_PING`, `PG_RECONNECT_ON_ERROR`

## Feature Flags and Optional Services

Feature flags in `AppConfig` (with env overrides) control optional subsystems:

- `rag_enabled`, `pg_dsn`, RAG models, and CLIP options
- `nlweb_enabled` and related router/performance toggles
- `comfy_enabled`, `comfy_api_url`, `comfy_timeout`, `comfy_image_dir`
- `tts_enabled`, defaults and runtime toggles
- `crawl_enabled`, `firecrawl_base_url`, `crawl_cache_dir`

## Lifecycle States and Health Model

Services progress through clearly defined lifecycle statuses: pending, starting, running, stopping, stopped, failed,
and disabled. Health is tracked separately as healthy, degraded, unhealthy, or
unknown. A service is considered usable when its status is running and its health is healthy or degraded, and
the system captures startup time, last health check timestamp, and
the last error message for later inspection. Health checks are executed on
a configurable interval inside each service, and
detailed results include status, health, a human-readable message, optional error, and
timestamps suitable for surfacing in diagnostics or external monitoring.

- Files:
  - `app/services/health.py`

## Service Registration and Metadata

Services are registered declaratively using decorators. The `@service` decorator attaches metadata including name,
dependencies, required packages, startup priority, health check interval, and `auto_start`, and
it registers the class with the service registry. Additional helpers such as `@requires_packages`, `@depends_on`,
`@startup_priority`, and `@health_check` can be used to incrementally tune behavior. At runtime,
`BaseService` validates required packages using the project’s lazy loader before initialization to
avoid importing heavy dependencies prematurely and to fail fast with a clear message when prerequisites are missing.

- Files:
  - `app/services/decorators.py`
  - `app/services/base.py`

## Startup Orchestration and Parallelism

The service manager computes an optimal startup plan that respects dependencies and
declared priorities, organizing services into parallel groups to minimize overall startup time. Within each group,
services start concurrently with progress tracked per service, and
dependency readiness is propagated to their dependents to unlock subsequent groups. If
some services fail to start, the system continues with
reduced functionality rather than blocking the whole application,
which allows noncritical subsystems to be unavailable without halting core features.

- Files:
  - `app/services/manager.py`

## Health Checks, Watchdog, and Monitoring

Each running service performs its own periodic health checks. In addition,
the manager runs a background monitor that invokes health checks across all services at a regular cadence and
logs any unhealthy states. This dual approach provides both local self-assessment and
centralized visibility. Tunables for health interval and reconnection behavior are sourced from configuration and
environment variables so operators can adjust sensitivity without code changes.

- Files:
  - `app/services/base.py`
  - `app/services/manager.py`

## Graceful Shutdown

Shutdown proceeds in reverse dependency order to ensure dependents are torn down before their providers. For
each service, the health loop is cancelled and awaited briefly, and
`shutdown()` is called to release resources. The manager also stops its monitoring task before
stopping services. Errors during stop are logged but
do not prevent the remainder of the system from shutting down cleanly.

- Files:
  - `app/services/base.py`
  - `app/services/manager.py`

## Configuration Overrides and Feature Flags

Configuration is backed by `AppConfig` and
loaded through `ConfigManagerService`. Settings can be provided via `config.json` or `config.default.json` and
are further overridden by environment variables for key features like NLWeb, Comfy, and
RAG, as well as watchdog, reconnection, and rollout tunables. After core services are up, NLWeb may be registered and
started dynamically if enabled in configuration.

- Files:
  - `app/services/core/config_manager_service.py`
  - `app/services/core/app_config.py`
  - `app/services/core/service_setup.py`

## Accessing Services Programmatically

To avoid circular imports, convenience accessors resolve service instances through
the global manager. These helpers return typed instances for common subsystems like configuration, threading,
data source, model registry, image processing, and
integration services. They should be preferred over manual lookups to keep call sites concise and
decoupled from the manager.

- Files:
  - `app/services/access.py`

## Operational Guidance and Best Practices

When deploying in containerized environments,
map service health to platform probes. Readiness should reflect that
a service is running with at least degraded health so traffic is only routed when dependencies are satisfied, while
liveness should fail on persistent unhealthy states to trigger restarts. For external connections,
favor exponential backoff with jitter to avoid thundering herds during outages, and
consider a circuit breaker for flaky dependencies to protect upstreams. During shutdown,
ensure background tasks are cancelled and awaited briefly so no in-flight operations are left hanging.

Recommended references: For container probes, see the Kubernetes documentation on liveness, readiness, and
startup probes ([Kubernetes
Probes](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#container-probes)). For resilient retries, see
the AWS Architecture Blog on exponential backoff with full jitter ([AWS Backoff With
Jitter](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/)). For graceful task cancellation,
consult the Python `asyncio` documentation on cancelling tasks ([AsyncIO Task
Cancellation](https://docs.python.org/3/library/asyncio-task.html#task-cancellation)). For dependency protection,
consider an asyncio-compatible circuit breaker such as `aiobreaker` ([aiobreaker on
PyPI](https://pypi.org/project/aiobreaker/)).
