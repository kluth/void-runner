import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../core/services/game.service';
import { OnboardAiService } from '../../core/services/onboard-ai.service';

interface AlertItem {
  id: string;
  type: 'trace' | 'security' | 'system' | 'network';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
}

@Component({
  selector: 'app-high-density-hud',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="hud-container">
      <!-- Trace Status Panel -->
      <div class="hud-panel trace-panel">
        <div class="panel-header">
          <span class="header-icon">◎</span>
          <span class="header-text">TRACE_STATUS</span>
          <span class="header-value" [class]="'severity-' + getTraceSeverity()">
            {{ gameService.detectionLevel() }}%
          </span>
        </div>
        <div class="panel-content">
          <div class="trace-bar">
            <div class="trace-fill" [style.width.%]="gameService.detectionLevel()"
                 [class.critical]="gameService.detectionLevel() > 70"></div>
          </div>
          <div class="trace-details">
            <div class="detail-row">
              <span class="label">VECTOR:</span>
              <span class="value">{{ getTraceVector() }}</span>
            </div>
            <div class="detail-row">
              <span class="label">TIME_TO_TRACE:</span>
              <span class="value">{{ getTimeToTrace() }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Security Alerts Panel -->
      <div class="hud-panel alerts-panel">
        <div class="panel-header">
          <span class="header-icon">⚠</span>
          <span class="header-text">SECURITY_ALERTS</span>
          <span class="header-count">{{ alerts().length }}</span>
        </div>
        <div class="panel-content alerts-list">
          @for (alert of alerts(); track alert.id) {
            <div class="alert-item" [class]="'severity-' + alert.severity">
              <div class="alert-header">
                <span class="alert-type">{{ alert.type | uppercase }}</span>
                <span class="alert-time">{{ formatTime(alert.timestamp) }}</span>
              </div>
              <div class="alert-message">{{ alert.message }}</div>
            </div>
          } @empty {
            <div class="no-alerts">NO_ACTIVE_THREATS</div>
          }
        </div>
      </div>

      <!-- System Status Panel -->
      <div class="hud-panel system-panel">
        <div class="panel-header">
          <span class="header-icon">▣</span>
          <span class="header-text">SYSTEM_STATUS</span>
        </div>
        <div class="panel-content">
          <div class="status-grid">
            <div class="status-item">
              <span class="status-label">INTEGRITY</span>
              <span class="status-value" [class.warning]="gameService.systemIntegrity() < 50">
                {{ gameService.systemIntegrity() }}%
              </span>
            </div>
            <div class="status-item">
              <span class="status-label">CREDITS</span>
              <span class="status-value">{{ gameService.credits() }}</span>
            </div>
            <div class="status-item">
              <span class="status-label">REPUTATION</span>
              <span class="status-value">{{ gameService.reputation() }}</span>
            </div>
            <div class="status-item">
              <span class="status-label">ONBOARD</span>
              <span class="status-value" [class]="'phase-' + onboard.phase().toLowerCase()">
                {{ onboard.phase() }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Network Status Panel -->
      <div class="hud-panel network-panel">
        <div class="panel-header">
          <span class="header-icon">⇄</span>
          <span class="header-text">NETWORK_STATUS</span>
        </div>
        <div class="panel-content">
          <div class="network-stats">
            <div class="stat-row">
              <span class="stat-label">UPLINK:</span>
              <span class="stat-value online">ACTIVE</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">LATENCY:</span>
              <span class="stat-value">{{ getLatency() }}ms</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">BANDWIDTH:</span>
              <span class="stat-value">{{ getBandwidth() }} Mbps</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">SECURITY:</span>
              <span class="stat-value" [class]="getSecurityClass()">{{ getSecurityLevel() }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    .hud-container {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      grid-template-rows: repeat(2, auto);
      gap: 8px;
      padding: 8px;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(0, 255, 159, 0.1);
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.7rem;
    }

    .hud-panel {
      background: var(--layer-1);
      border: 1px solid rgba(뚜255, 159, 0.15);
      clip-path: var(--clip-notch);
      position: relative;
      overflow: hidden;
    }

    .hud-panel::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 3px;
      height: 100%;
      background: var(--neon-green);
      opacity: 0.5;
    }

    .panel-header {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 8px;
      background: rgba(0, 255, 159, 0.05);
      border-bottom: 1px solid rgba(0, 255, 159, 0.1);
    }

    .header-icon {
      color: var(--neon-green);
      font-size: 0.8rem;
    }

    .header-text {
      flex: 1;
      font-weight: bold;
      letter-spacing: 1px;
      color: var(--neon-green);
    }

    .header-value {
      font-weight: bold;
    }

    .header-count {
      background: var(--neon-magenta);
      color: #000;
      padding: 1px 6px;
      font-size: 0.6rem;
      font-weight: bold;
    }

    .panel-content {
      padding: 8px;
    }

    /* Trace Panel */
    .trace-bar {
      height: 4px;
      background: rgba(0, 255, 159, 0.1);
      margin-bottom: 8px;
    }

    .trace-fill {
      height: 100%;
      background: var(--neon-green);
      transition: width 0.3s ease;
    }

    .trace-fill.critical {
      background: var(--neon-magenta);
      animation: pulse 1s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .trace-details {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
    }

    .label {
      opacity: 0.6;
    }

    .value {
      font-weight: bold;
    }

    /* Alerts Panel */
    .alerts-list {
      max-height: 100px;
      overflow-y: auto;
    }

    .alert-item {
      padding: 4px 6px;
      margin-bottom: 4px;
      border-left: 2px solid;
    }

    .alert-item.severity-low {
      border-color: var(--neon-green);
      background: rgba(0, 255, 159, 0.05);
    }

    .alert-item.severity-medium {
      border-color: var(--neon-yellow);
      background: rgba(252, 238, 9, 0.05);
    }

    .alert-item.severity-high {
      border-color: var(--neon-orange);
      background: rgba(255, 107, 0, 0.05);
    }

    .alert-item.severity-critical {
      border-color: var(--neon-magenta);
      background: rgba(255, 0, 85, 0.05);
      animation: critical-pulse 2s infinite;
    }

    @keyframes critical-pulse {
      0%, 100% { background: rgba(255, 0, 85, 0.05); }
      50% { background: rgba(255, 0, 85, 0.1); }
    }

    .alert-header {
      display: flex;
      justify-content: space-between;
      font-size: 0.6rem;
      margin-bottom: 2px;
    }

    .alert-type {
      font-weight: bold;
      opacity: 0.8;
    }

    .alert-time {
      opacity: 0.5;
    }

    .alert-message {
      font-size: 0.65rem;
      line-height: 1.3;
    }

    .no-alerts {
      text-align: center;
      opacity: 0.5;
      padding: 10px;
    }

    /* System Panel */
    .status-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
    }

    .status-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .status-label {
      font-size: 0.6rem;
      opacity: 0.6;
    }

    .status-value {
      font-weight: bold;
      font-size: 0.8rem;
    }

    .status-value.warning {
      color: var(--neon-magenta);
    }

    .status-value.phase-hostile {
      color: var(--neon-magenta);
      animation: blink 0.5s infinite;
    }

    @keyframes blink {
      50% { opacity: 0.5; }
    }

    /* Network Panel */
    .network-stats {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .stat-row {
      display: flex;
      justify-content: space-between;
    }

    .stat-label {
      opacity: 0.6;
    }

    .stat-value {
      font-weight: bold;
    }

    .stat-value.online {
      color: var(--neon-green);
    }

    .stat-value.warning {
      color: var(--neon-yellow);
    }

    .stat-value.critical {
      color: var(--neon-magenta);
    }

    /* Responsive */
    @media (max-width: 600px) {
      .hud-container {
        grid-template-columns: 1fr;
      }
    }
  `
})
export class HighDensityHudComponent implements OnInit, OnDestroy {
  gameService = inject(GameService);
  onboard = inject(OnboardAiService);

  alerts = signal<AlertItem[]>([]);

  private alertInterval: any;
  private latency = 14;
  private bandwidth = 100;

  ngOnInit() {
    this.startAlertSimulation();
  }

  ngOnDestroy() {
    if (this.alertInterval) clearInterval(this.alertInterval);
  }

  getTraceSeverity(): string {
    const level = this.gameService.detectionLevel();
    if (level > 70) return 'critical';
    if (level > 40) return 'high';
    if (level > 20) return 'medium';
    return 'low';
  }

  getTraceVector(): string {
    const level = this.gameService.detectionLevel();
    if (level > 70) return 'MULTI_VECTOR_ASSAULT';
    if (level > 40) return 'ACTIVE_TRACE_PROTOCOL';
    if (level > 20) return 'PASSIVE_MONITORING';
    return 'STEALTH_MODE';
  }

  getTimeToTrace(): string {
    const level = this.gameService.detectionLevel();
    if (level > 70) return 'IMMINENT';
    if (level > 40) return `${Math.floor((100 - level) * 0.3)}s`;
    if (level > 20) return `${Math.floor((100 - level) * 0.5)}s`;
    return 'N/A';
  }

  formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  getLatency(): number {
    // Simulate network latency
    this.latency = Math.max(5, Math.min(100, this.latency + (Math.random() - 0.5) * 10));
    return Math.floor(this.latency);
  }

  getBandwidth(): number {
    // Simulate bandwidth
    this.bandwidth = Math.max(10, Math.min(1000, this.bandwidth + (Math.random() - 0.5) * 50));
    return Math.floor(this.bandwidth);
  }

  getSecurityLevel(): string {
    const level = this.gameService.detectionLevel();
    if (level > 70) return 'COMPROMISED';
    if (level > 40) return 'AT_RISK';
    if (level > 20) return 'MONITORING';
    return 'SECURE';
  }

  getSecurityClass(): string {
    const level = this.gameService.detectionLevel();
    if (level > 70) return 'critical';
    if (level > 40) return 'warning';
    return 'online';
  }

  private startAlertSimulation() {
    // Generate random alerts
    this.alertInterval = setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance every 5 seconds
        this.generateAlert();
      }
    }, 5000);
  }

  private generateAlert() {
    const alertTypes: AlertItem['type'][] = ['trace', 'security', 'system', 'network'];
    const severities: AlertItem['severity'][] = ['low', 'medium', 'high', 'critical'];
    
    const messages: Record<AlertItem['type'], string[]> = {
      trace: [
        'Passive trace detected on port 443',
        'ISP monitoring increased by 15%',
        'Corporate firewall probing detected',
        'Law enforcement trace protocol initiated',
      ],
      security: [
        'Unauthorized access attempt blocked',
        'SSL certificate mismatch detected',
        'Firewall rule violation logged',
        'Intrusion detection system triggered',
      ],
      system: [
        'Memory allocation warning',
        'CPU usage spike detected',
        'Disk I/O bottleneck identified',
        'Process watchdog timeout',
      ],
      network: [
        'Packet loss detected on VPN tunnel',
        'Bandwidth throttling applied',
        'DNS resolution failure',
        'Connection timeout on proxy node',
      ],
    };

    const type = alertTypes[Math.floor(Math.random() * alertTypes.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const messageList = messages[type];
    const message = messageList[Math.floor(Math.random() * messageList.length)];

    const newAlert: AlertItem = {
      id: Date.now().toString(),
      type,
      message,
      severity,
      timestamp: Date.now(),
    };

    this.alerts.update(alerts => [newAlert, ...alerts].slice(0, 10)); // Keep last 10 alerts

    // Log critical alerts
    if (severity === 'critical') {
      this.gameService.log(`<span style="color: var(--neon-magenta)">[ALERT] ${message}</span>`);
    }
  }
}
