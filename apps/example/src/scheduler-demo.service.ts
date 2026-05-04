import { Injectable } from "@nestjs/common";
import { DistributedInterval } from "@raytonx/nest-scheduler";

interface SchedulerDemoStatus {
  instanceId: string;
  redisLockKeys: string[];
  tasks: Array<{
    description: string;
    intervalMs: number;
    lastError: string | null;
    lastRunAt: string | null;
    runCount: number;
    taskName: string;
  }>;
}

const HEARTBEAT_INTERVAL_MS = 10_000;
const HEARTBEAT_RUNTIME_MS = 4_000;
const FAILURE_INTERVAL_MS = 20_000;
const FAILURE_RUNTIME_MS = 6_000;
const TTL_EXPIRY_INTERVAL_MS = 20_000;
const TTL_EXPIRY_RUNTIME_MS = 8_000;

@Injectable()
export class SchedulerDemoService {
  private readonly instanceId = `${process.pid}`;
  private readonly tasks = {
    heartbeat: this.createTaskState(
      "redis-heartbeat",
      HEARTBEAT_INTERVAL_MS,
      "Holds the Redis lock for 4 seconds on each tick so two app processes visibly compete. One process should run, while the other logs task_skipped for the same tick.",
    ),
    failure: this.createTaskState(
      "redis-failure",
      FAILURE_INTERVAL_MS,
      "Holds the Redis lock for 6 seconds, then throws intentionally so two processes can visibly contend before the failure is logged.",
    ),
    ttlExpiry: this.createTaskState(
      "redis-ttl-expiry",
      TTL_EXPIRY_INTERVAL_MS,
      "Runs for 8 seconds with a 2-second TTL and autoExtend disabled so two processes can contend first, then the winner demonstrates lock expiry.",
    ),
  };

  @DistributedInterval(HEARTBEAT_INTERVAL_MS, {
    driver: "redis",
    lockKey: "redis:heartbeat",
    logging: "verbose",
    name: "redis-heartbeat",
    skipIfLocked: true,
  })
  async handleHeartbeat(): Promise<void> {
    await this.sleep(HEARTBEAT_RUNTIME_MS);
    this.markSuccess(this.tasks.heartbeat);
  }

  @DistributedInterval(FAILURE_INTERVAL_MS, {
    driver: "redis",
    lockKey: "redis:failure",
    logging: "verbose",
    name: "redis-failure",
    skipIfLocked: true,
  })
  async handleFailure(): Promise<void> {
    await this.sleep(FAILURE_RUNTIME_MS);
    const error = new Error(`Intentional scheduler demo failure from process ${this.instanceId}.`);

    this.markFailure(this.tasks.failure, error);
    throw error;
  }

  @DistributedInterval(TTL_EXPIRY_INTERVAL_MS, {
    autoExtend: false,
    driver: "redis",
    lockKey: "redis:ttl-expiry",
    logging: "verbose",
    name: "redis-ttl-expiry",
    skipIfLocked: true,
    ttl: 2_000,
  })
  async handleTtlExpiry(): Promise<void> {
    await this.sleep(TTL_EXPIRY_RUNTIME_MS);
    this.markSuccess(this.tasks.ttlExpiry);
  }

  getStatus(): SchedulerDemoStatus {
    return {
      instanceId: this.instanceId,
      redisLockKeys: [
        "example:scheduler:redis:heartbeat",
        "example:scheduler:redis:failure",
        "example:scheduler:redis:ttl-expiry",
      ],
      tasks: [this.tasks.heartbeat, this.tasks.failure, this.tasks.ttlExpiry].map((task) => ({
        description: task.description,
        intervalMs: task.intervalMs,
        lastError: task.lastError,
        lastRunAt: task.lastRunAt?.toISOString() ?? null,
        runCount: task.runCount,
        taskName: task.taskName,
      })),
    };
  }

  private createTaskState(taskName: string, intervalMs: number, description: string) {
    return {
      description,
      intervalMs,
      lastError: null as string | null,
      lastRunAt: null as Date | null,
      runCount: 0,
      taskName,
    };
  }

  private markSuccess(task: ReturnType<SchedulerDemoService["createTaskState"]>): void {
    task.lastError = null;
    task.lastRunAt = new Date();
    task.runCount += 1;
  }

  private markFailure(
    task: ReturnType<SchedulerDemoService["createTaskState"]>,
    error: Error,
  ): void {
    task.lastError = error.message;
    task.lastRunAt = new Date();
    task.runCount += 1;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}
