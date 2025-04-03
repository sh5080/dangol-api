import { Injectable, OnModuleInit } from "@nestjs/common";
import { Counter, Histogram, register } from "prom-client";
import { MetricConfig } from "../types/data.type";

@Injectable()
export class MetricsService implements OnModuleInit {
  private requestSuccessHistogram!: Histogram<string>;
  private requestFailHistogram!: Histogram<string>;
  private failureCounter!: Counter<string>;

  onModuleInit() {
    this.initializeMetrics();
  }

  private initializeMetrics() {
    const metricConfigs: Record<string, MetricConfig> = {
      success: {
        name: "nestjs_success_requests",
        help: "NestJs success requests - duration in seconds",
        type: "histogram",
      },
      fail: {
        name: "nestjs_fail_requests",
        help: "NestJs fail requests - duration in seconds",
        type: "histogram",
      },
      counter: {
        name: "nestjs_requests_failed_count",
        help: "NestJs requests that failed",
        type: "counter",
      },
    };

    // 공통 설정
    const commonConfig = {
      labelNames: ["handler", "controller", "method"],
      buckets: [
        0.0001, 0.001, 0.005, 0.01, 0.025, 0.05, 0.075, 0.09, 0.1, 0.25, 0.5, 1,
        2.5, 5, 10,
      ],
    };

    const initMetric = (
      config: MetricConfig,
      type: "histogram" | "counter"
    ) => {
      const name = config.name;
      if (!register.getSingleMetric(name)) {
        return type === "histogram"
          ? new Histogram({ ...config, ...commonConfig })
          : new Counter({
              ...config,
              labelNames: [...commonConfig.labelNames, "error"],
            });
      } else {
        return register.getSingleMetric(name) as any;
      }
    };

    // 각 메트릭 초기화
    this.requestSuccessHistogram = initMetric(
      metricConfigs.success,
      "histogram"
    );
    this.requestFailHistogram = initMetric(metricConfigs.fail, "histogram");
    this.failureCounter = initMetric(metricConfigs.counter, "counter");
  }

  // 성공 시간 측정
  startSuccessTimer(labels: Record<string, string>): () => void {
    return this.requestSuccessHistogram.startTimer(labels);
  }

  // 실패 시간 측정
  startFailTimer(labels: Record<string, string>): () => void {
    return this.requestFailHistogram.startTimer(labels);
  }

  // 실패 카운터 증가
  incrementFailureCounter(labels: Record<string, string>) {
    this.failureCounter.labels(labels).inc(1);
  }

  // 메트릭 데이터 반환
  async getMetrics(): Promise<string> {
    return await register.metrics();
  }
}
