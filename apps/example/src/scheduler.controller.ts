import { Controller, Get } from "@nestjs/common";

import { SchedulerDemoService } from "./scheduler-demo.service";

interface SchedulerStatusResponse {
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

@Controller("scheduler")
export class SchedulerController {
  constructor(private readonly schedulerDemoService: SchedulerDemoService) {}

  @Get("status")
  getStatus(): SchedulerStatusResponse {
    return this.schedulerDemoService.getStatus();
  }
}
