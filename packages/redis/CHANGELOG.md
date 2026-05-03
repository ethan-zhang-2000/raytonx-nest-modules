# @raytonx/nest-redis

## 0.2.1

### Patch Changes

- e3ce95d: Fix RedisLockService dependency injection metadata so Nest can resolve RedisService at runtime.

## 0.2.0

### Minor Changes

- Add `RedisLockConflictError` for lock contention handling and export `REDIS_LOCK_SERVICE` to support optional Redis lock integration in other modules.
