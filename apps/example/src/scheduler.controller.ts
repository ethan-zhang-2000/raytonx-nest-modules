import { Controller, Get } from "@nestjs/common";

import { SchedulerDemoService } from "./scheduler-demo.service";

interface SchedulerStatusResponse {
  intervalMs: number;
  lastRunAt: string | null;
  runCount: number;
  taskName: string;
}

@Controller("scheduler")
export class SchedulerController {
  constructor(private readonly schedulerDemoService: SchedulerDemoService) {}

  @Get("status")
  getStatus(): SchedulerStatusResponse {
    return this.schedulerDemoService.getStatus();
  }
}
