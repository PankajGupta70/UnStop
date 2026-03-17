import {
  AfterViewInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  inject,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

import type { Chart, ChartConfiguration } from 'chart.js';

import { User } from '../../models/user.model';

@Component({
  selector: 'app-user-role-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-role-chart.component.html',
  styleUrl: './user-role-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserRoleChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input({ required: true }) users: User[] = [];

  @ViewChild('chartCanvas') private chartCanvas?: ElementRef<HTMLCanvasElement>;

  protected isLoading = true;

  private readonly cdr = inject(ChangeDetectorRef);
  private readonly platformId = inject(PLATFORM_ID);
  private chart?: Chart;
  private ChartConstructor?: new (
    item: HTMLCanvasElement,
    config: ChartConfiguration<'pie', number[], string>
  ) => Chart;
  private viewInitialized = false;

  async ngAfterViewInit(): Promise<void> {
    this.viewInitialized = true;
    await this.loadChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['users'] && this.chart) {
      this.syncChart();
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  protected get roleCounts(): { label: string; value: number; tone: string }[] {
    const [admin, editor, viewer] = this.getRoleCounts();

    return [
      { label: 'Admin', value: admin, tone: 'admin' },
      { label: 'Editor', value: editor, tone: 'editor' },
      { label: 'Viewer', value: viewer, tone: 'viewer' }
    ];
  }

  private async loadChart(): Promise<void> {
    if (!isPlatformBrowser(this.platformId) || this.ChartConstructor || !this.chartCanvas) {
      this.isLoading = false;
      this.cdr.markForCheck();
      return;
    }

    const chartModule = await import('chart.js/auto');
    this.ChartConstructor = chartModule.default;
    this.createChart();
    this.isLoading = false;
    this.cdr.markForCheck();
  }

  private createChart(): void {
    if (!this.ChartConstructor || !this.chartCanvas) {
      return;
    }

    this.chart?.destroy();

    const configuration: ChartConfiguration<'pie', number[], string> = {
      type: 'pie',
      data: {
        labels: ['Admin', 'Editor', 'Viewer'],
        datasets: [
          {
            data: this.getRoleCounts(),
            backgroundColor: ['#1c4980', '#4b7db7', '#383838'],
            borderColor: '#f5f7fb',
            borderWidth: 4,
            hoverOffset: 12
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 18,
              color: '#383838',
              font: {
                family: 'Segoe UI',
                size: 13,
                weight: 600
              }
            }
          }
        }
      }
    };

    this.chart = new this.ChartConstructor(this.chartCanvas.nativeElement, configuration);
  }

  private syncChart(): void {
    if (!this.chart && this.viewInitialized) {
      void this.loadChart();
      return;
    }

    if (!this.chart) {
      return;
    }

    this.chart.data.datasets[0].data = this.getRoleCounts();
    this.chart.update();
    this.cdr.markForCheck();
  }

  private getRoleCounts(): number[] {
    const counts = { Admin: 0, Editor: 0, Viewer: 0 };

    for (const user of this.users) {
      counts[user.role] += 1;
    }

    return [counts.Admin, counts.Editor, counts.Viewer];
  }
}
