import { Injectable } from "@nestjs/common";
import { DistributedInterval } from "@raytonx/nest-scheduler";

interface SchedulerDemoStatus {
  intervalMs: number;
  lastRunAt: string | null;
  runCount: number;
  taskName: string;
}

const SCHEDULER_DEMO_INTERVAL_MS = 30_000;

@Injectable()
export class SchedulerDemoService {
  private lastRunAt: Date | null = null;
  private runCount = 0;

  @DistributedInterval(SCHEDULER_DEMO_INTERVAL_MS, {
    driver: "memory",
    lockKey: "example:scheduler:heartbeat",
    logging: "verbose",
    name: "example-heartbeat",
    skipIfLocked: true,
  })
  handleHeartbeat(): void {
    this.lastRunAt = new Date();
    this.runCount += 1;
  }

  getStatus(): SchedulerDemoStatus {
    return {
      intervalMs: SCHEDULER_DEMO_INTERVAL_MS,
      lastRunAt: this.lastRunAt?.toISOString() ?? null,
      runCount: this.runCount,
      taskName: "example-heartbeat",
    };
  }
}
