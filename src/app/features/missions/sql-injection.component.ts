import { Component, inject, signal, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService, Mission } from '../../core/services/game.service';

interface Column {
  name: string;
}

interface Table {
  name: string;
  columns: Column[];
}

interface SelectedNode {
  tableName: string;
  columnName: string;
}

interface Connection {
  from: SelectedNode;
  to: SelectedNode;
}

@Component({
  selector: 'app-sql-injection',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="sql-chamber">
      <div class="header">
        <span class="title">SCHEMA_LINKER_v2.1</span>
        <span class="subtitle">EXTRACT MASTER_KEY FROM TARGET_DB</span>
      </div>

      <div class="schema-grid">
        @for (table of tables(); track table.name) {
          <div class="table-card">
            <div class="table-name">{{ table.name }}</div>
            <div class="column-list">
              @for (column of table.columns; track column.name) {
                <button 
                  class="column-btn" 
                  [class.selected]="isSelected(table.name, column.name)"
                  [class.connected]="isConnected(table.name, column.name)"
                  [class.target]="isTarget(table.name, column.name)"
                  (click)="selectColumn(table.name, column.name)"
                >
                  {{ column.name }}
                </button>
              }
            </div>
          </div>
        }
      </div>

      <div class="connections-list">
        <div class="conn-header">ACTIVE_LINKS:</div>
        @for (conn of connections(); track $index) {
          <div class="conn-item">
            {{ conn.from.tableName }}.{{ conn.from.columnName }} 
            <span class="arrow">↔</span> 
            {{ conn.to.tableName }}.{{ conn.to.columnName }}
          </div>
        }
      </div>

      <div class="status-bar" [class.solved]="isSolved()">
        @if (isSolved()) {
          <div class="success-msg">MASTER_KEY_DECRYPTED: {{ masterKey() }}</div>
          <button class="primary" (click)="onComplete.emit()">DOWNLOAD_DATA</button>
        } @else {
          <div class="progress">LINKS_REQUIRED: {{ targetPath().length - 1 }}</div>
        }
      </div>
    </div>
  `,
  styles: `
    .sql-chamber {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      width: 100%;
      height: 100%;
      color: var(--primary);
      font-family: 'JetBrains Mono', monospace;
    }

    .header {
      display: flex;
      flex-direction: column;
      border-bottom: 1px solid rgba(13, 242, 242, 0.2);
      padding-bottom: 0.5rem;
    }

    .title { font-weight: 900; font-size: 1rem; color: var(--secondary); }
    .subtitle { font-size: 0.6rem; opacity: 0.6; }

    .schema-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
      max-height: 300px;
      overflow-y: auto;
      padding-right: 10px;
    }

    .table-card {
      background: rgba(13, 242, 242, 0.05);
      border: 1px solid rgba(13, 242, 242, 0.2);
      display: flex;
      flex-direction: column;
    }

    .table-name {
      background: rgba(13, 242, 242, 0.1);
      padding: 4px 8px;
      font-size: 0.7rem;
      font-weight: 900;
      border-bottom: 1px solid rgba(13, 242, 242, 0.2);
    }

    .column-list {
      display: flex;
      flex-direction: column;
      padding: 4px;
    }

    .column-btn {
      background: transparent;
      border: none;
      color: var(--primary);
      text-align: left;
      font-size: 0.65rem;
      padding: 4px 8px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .column-btn:hover { background: rgba(13, 242, 242, 0.1); }
    .column-btn.selected { background: var(--primary); color: #000; }
    .column-btn.connected { color: var(--secondary); text-shadow: 0 0 5px var(--secondary); }
    .column-btn.target { border-left: 2px solid var(--tertiary); }

    .connections-list {
      background: var(--layer-0);
      padding: 10px;
      font-size: 0.6rem;
      min-height: 60px;
      border: 1px dashed rgba(13, 242, 242, 0.2);
    }

    .conn-header { opacity: 0.4; margin-bottom: 5px; font-weight: 900; }
    .conn-item { color: var(--secondary); margin-bottom: 2px; }
    .arrow { margin: 0 5px; opacity: 0.5; }

    .status-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
      background: var(--layer-2);
      border-top: 2px solid var(--primary);
    }

    .status-bar.solved {
      border-top-color: var(--secondary);
      background: rgba(47, 248, 1, 0.05);
    }

    .success-msg { color: var(--secondary); font-weight: 900; font-size: 0.8rem; }
    .progress { font-size: 0.7rem; opacity: 0.7; }

    .primary {
      background: var(--secondary);
      color: #000;
      border: none;
      padding: 8px 16px;
      font-weight: 900;
      font-size: 0.7rem;
      cursor: pointer;
    }
  `
})
export class SqlInjectionComponent implements OnInit {
  @Input() mission!: Mission;
  @Output() onComplete = new EventEmitter<void>();
  @Output() onFail = new EventEmitter<void>();

  gameService = inject(GameService);

  tables = signal<Table[]>([]);
  targetPath = signal<SelectedNode[]>([]);
  connections = signal<Connection[]>([]);
  selectedColumn = signal<SelectedNode | null>(null);
  masterKey = signal('');
  isSolved = signal(false);

  ngOnInit() {
    this.generatePuzzle();
  }

  generatePuzzle() {
    const tableNames = ['users', 'accounts', 'sessions', 'logs', 'metadata', 'secrets', 'vault', 'permissions', 'roles', 'configs'];
    const columnNames = ['id', 'uuid', 'user_id', 'owner_id', 'account_id', 'session_token', 'created_at', 'hash', 'salt', 'master_key', 'priv_level'];

    // Generate random tables
    const generatedTables: Table[] = [];
    const numTables = 4 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < numTables; i++) {
      const name = tableNames[i];
      const cols: Column[] = [{ name: 'id' }];
      const numCols = 2 + Math.floor(Math.random() * 3);
      for (let j = 0; j < numCols; j++) {
        const colName = columnNames[Math.floor(Math.random() * columnNames.length)];
        if (!cols.find(c => c.name === colName)) {
          cols.push({ name: colName });
        }
      }
      generatedTables.push({ name, columns: cols });
    }

    // Ensure we have 'users' and 'secrets' for the target path
    if (!generatedTables.find(t => t.name === 'users')) {
      generatedTables[0].name = 'users';
    }
    if (!generatedTables.find(t => t.name === 'secrets')) {
      generatedTables[generatedTables.length - 1].name = 'secrets';
    }

    // Ensure 'secrets' has 'master_key'
    const secretsTable = generatedTables.find(t => t.name === 'secrets')!;
    if (!secretsTable.columns.find(c => c.name === 'master_key')) {
        secretsTable.columns.push({ name: 'master_key' });
    }

    this.tables.set(generatedTables);

    // Create a target path: users.id -> ??? -> secrets.master_key
    // For simplicity, let's make it a 3-node path if possible
    const path: SelectedNode[] = [];
    path.push({ tableName: 'users', columnName: 'id' });
    
    const middleTable = generatedTables[Math.floor(generatedTables.length / 2)];
    if (middleTable.name !== 'users' && middleTable.name !== 'secrets') {
        const fk = middleTable.columns.find(c => c.name.includes('id') && c.name !== 'id') || middleTable.columns[0];
        path.push({ tableName: middleTable.name, columnName: fk.name });
    }

    path.push({ tableName: 'secrets', columnName: 'master_key' });
    this.targetPath.set(path);

    this.masterKey.set(Math.random().toString(36).substring(2, 10).toUpperCase());
  }

  selectColumn(tableName: string, columnName: string) {
    const current = this.selectedColumn();
    if (current) {
      if (current.tableName === tableName && current.columnName === columnName) {
        this.selectedColumn.set(null);
        return;
      }

      // Create connection
      const newConn: Connection = {
        from: current,
        to: { tableName, columnName }
      };
      
      this.connections.update(conns => [...conns, newConn]);
      this.selectedColumn.set(null);
      this.checkSolution();
    } else {
      this.selectedColumn.set({ tableName, columnName });
    }
  }

  isSelected(tableName: string, columnName: string) {
    const sel = this.selectedColumn();
    return sel?.tableName === tableName && sel?.columnName === columnName;
  }

  isConnected(tableName: string, columnName: string) {
    return this.connections().some(c => 
      (c.from.tableName === tableName && c.from.columnName === columnName) ||
      (c.to.tableName === tableName && c.to.columnName === columnName)
    );
  }

  isTarget(tableName: string, columnName: string) {
    return this.targetPath().some(p => p.tableName === tableName && p.columnName === columnName);
  }

  checkSolution() {
    const path = this.targetPath();
    const conns = this.connections();

    // Verify if all steps in the path are connected
    let solved = true;
    for (let i = 0; i < path.length - 1; i++) {
        const step1 = path[i];
        const step2 = path[i+1];
        
        const isLinked = conns.some(c => 
            (this.nodesMatch(c.from, step1) && this.nodesMatch(c.to, step2)) ||
            (this.nodesMatch(c.from, step2) && this.nodesMatch(c.to, step1))
        );

        if (!isLinked) {
            solved = false;
            break;
        }
    }

    if (solved) {
      this.isSolved.set(true);
      this.gameService.log('SQL_INJECTION: Schema path established. Extracting master key...');
    }
  }

  nodesMatch(n1: SelectedNode, n2: SelectedNode) {
    return n1.tableName === n2.tableName && n1.columnName === n2.columnName;
  }
}
