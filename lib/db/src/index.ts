import fs from "fs";
import path from "path";
import * as schema from "./schema";

// Helper to find the project root workspace directory where db.json will be saved
function getDbPath(): string {
  let current = process.cwd();
  for (let i = 0; i < 5; i++) {
    if (fs.existsSync(path.join(current, "pnpm-workspace.yaml")) || fs.existsSync(path.join(current, ".git"))) {
      return path.join(current, "db.json");
    }
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return path.join(process.cwd(), "db.json");
}

function readDb(): Record<string, any[]> {
  const dbPath = getDbPath();
  if (!fs.existsSync(dbPath)) {
    const initial = { users: [], analyses: [], recommendations: [], work_orders: [] };
    fs.writeFileSync(dbPath, JSON.stringify(initial, null, 2), "utf8");
    return initial;
  }
  try {
    const data = JSON.parse(fs.readFileSync(dbPath, "utf8"));
    if (!data.users) data.users = [];
    if (!data.analyses) data.analyses = [];
    if (!data.recommendations) data.recommendations = [];
    if (!data.work_orders) data.work_orders = [];
    return data;
  } catch (err) {
    console.error("Error reading JSON database, resetting to empty:", err);
    return { users: [], analyses: [], recommendations: [], work_orders: [] };
  }
}

function writeDb(data: Record<string, any[]>) {
  const dbPath = getDbPath();
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf8");
}

function getColumnKey(column: any): string {
  if (!column) return "";
  const table = column.table;
  if (!table) return column.name;
  for (const [key, val] of Object.entries(table)) {
    if (val === column) return key;
  }
  return column.name;
}

function getTableName(table: any): string {
  if (table === schema.usersTable) return "users";
  if (table === schema.analysesTable) return "analyses";
  if (table === schema.recommendationsTable) return "recommendations";
  if (table === schema.workOrdersTable) return "work_orders";
  if (table && typeof table === 'object' && 'tableName' in table) {
    return (table as any).tableName;
  }
  throw new Error("Unknown table: " + table);
}

function parseCondition(condition: any): (item: any) => boolean {
  if (!condition) return () => true;
  
  if (condition.queryChunks && Array.isArray(condition.queryChunks)) {
    const chunks = condition.queryChunks;
    if (chunks.length >= 3) {
      const column = chunks[1];
      const operatorChunk = chunks[2];
      const param = chunks[3];
      
      if (column && typeof column === 'object' && operatorChunk && typeof operatorChunk === 'object') {
        const columnKey = getColumnKey(column);
        const op = Array.isArray(operatorChunk.value) ? operatorChunk.value[0] : operatorChunk.value;
        const val = param && typeof param === 'object' ? param.value : param;
        
        if (typeof op === 'string' && op.trim() === '=') {
          return (item: any) => item[columnKey] === val;
        }
      }
    }
  }
  
  return () => true;
}

function parseOrderBy(orderByExpr: any): { key: string; descending: boolean } | null {
  if (!orderByExpr || !orderByExpr.queryChunks || !Array.isArray(orderByExpr.queryChunks)) {
    return null;
  }
  const chunks = orderByExpr.queryChunks;
  if (chunks.length >= 2) {
    const column = chunks[1];
    const columnKey = getColumnKey(column);
    let descending = false;
    if (chunks.length >= 3 && chunks[2] && chunks[2].value) {
      const val = Array.isArray(chunks[2].value) ? chunks[2].value[0] : chunks[2].value;
      if (typeof val === 'string' && val.includes('desc')) {
        descending = true;
      }
    }
    return { key: columnKey, descending };
  }
  return null;
}

class QueryBuilder<T> implements PromiseLike<T[]> {
  private tableName: string;
  private conditions: Array<(item: any) => boolean> = [];
  private orderExpr: any = null;

  constructor(table: any) {
    this.tableName = getTableName(table);
  }

  where(condition: any) {
    this.conditions.push(parseCondition(condition));
    return this;
  }

  orderBy(orderExpr: any) {
    this.orderExpr = orderExpr;
    return this;
  }

  then<TResult1 = T[], TResult2 = never>(
    onfulfilled?: ((value: T[]) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }

  async execute(): Promise<T[]> {
    const data = readDb();
    let list = [...(data[this.tableName] || [])];

    // Convert string ISO dates back to Native Date objects for JS runtime
    for (const item of list) {
      if (item.createdAt && typeof item.createdAt === "string") {
        item.createdAt = new Date(item.createdAt);
      }
    }

    // Filter conditions
    for (const cond of this.conditions) {
      list = list.filter(cond);
    }

    // Order sorting
    if (this.orderExpr) {
      const orderInfo = parseOrderBy(this.orderExpr);
      if (orderInfo) {
        const { key, descending } = orderInfo;
        list.sort((a, b) => {
          const valA = a[key];
          const valB = b[key];
          if (valA instanceof Date && valB instanceof Date) {
            return descending ? valB.getTime() - valA.getTime() : valA.getTime() - valB.getTime();
          }
          if (typeof valA === "number" && typeof valB === "number") {
            return descending ? valB - valA : valA - valB;
          }
          const strA = String(valA || "");
          const strB = String(valB || "");
          return descending ? strB.localeCompare(strA) : strA.localeCompare(strB);
        });
      }
    }

    return list as T[];
  }
}

class InsertBuilder<T> implements PromiseLike<T[]> {
  private tableName: string;
  private payload: any;

  constructor(table: any) {
    this.tableName = getTableName(table);
  }

  values(payload: any) {
    this.payload = payload;
    return this;
  }

  returning() {
    return this;
  }

  then<TResult1 = T[], TResult2 = never>(
    onfulfilled?: ((value: T[]) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }

  async execute(): Promise<T[]> {
    const dbData = readDb();
    const list = dbData[this.tableName] || [];

    const maxId = list.reduce((max: number, item: any) => Math.max(max, item.id || 0), 0);
    const nextId = maxId + 1;

    const newRecord = {
      id: nextId,
      ...this.payload,
      createdAt: new Date().toISOString(),
    };

    list.push(newRecord);
    dbData[this.tableName] = list;
    writeDb(dbData);

    const memoryRecord = {
      ...newRecord,
      createdAt: new Date(newRecord.createdAt),
    };

    return [memoryRecord] as T[];
  }
}

class UpdateBuilder<T> implements PromiseLike<T[]> {
  private tableName: string;
  private valuesToSet: any;
  private conditions: Array<(item: any) => boolean> = [];

  constructor(table: any) {
    this.tableName = getTableName(table);
  }

  set(valuesToSet: any) {
    this.valuesToSet = valuesToSet;
    return this;
  }

  where(condition: any) {
    this.conditions.push(parseCondition(condition));
    return this;
  }

  returning() {
    return this;
  }

  then<TResult1 = T[], TResult2 = never>(
    onfulfilled?: ((value: T[]) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }

  async execute(): Promise<T[]> {
    const dbData = readDb();
    const list = dbData[this.tableName] || [];
    const updatedRecords: any[] = [];

    for (let i = 0; i < list.length; i++) {
      let match = true;
      for (const cond of this.conditions) {
        if (!cond(list[i])) {
          match = false;
          break;
        }
      }
      if (match) {
        list[i] = {
          ...list[i],
          ...this.valuesToSet,
        };
        updatedRecords.push(list[i]);
      }
    }

    dbData[this.tableName] = list;
    writeDb(dbData);

    const mapped = updatedRecords.map(item => ({
      ...item,
      createdAt: typeof item.createdAt === "string" ? new Date(item.createdAt) : item.createdAt,
    }));

    return mapped as T[];
  }
}

class DeleteBuilder<T> implements PromiseLike<T[]> {
  private tableName: string;
  private conditions: Array<(item: any) => boolean> = [];

  constructor(table: any) {
    this.tableName = getTableName(table);
  }

  where(condition: any) {
    this.conditions.push(parseCondition(condition));
    return this;
  }

  returning() {
    return this;
  }

  then<TResult1 = T[], TResult2 = never>(
    onfulfilled?: ((value: T[]) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }

  async execute(): Promise<T[]> {
    const dbData = readDb();
    const list = dbData[this.tableName] || [];
    const deletedRecords: any[] = [];
    const remainingRecords: any[] = [];

    for (let i = 0; i < list.length; i++) {
      let match = true;
      for (const cond of this.conditions) {
        if (!cond(list[i])) {
          match = false;
          break;
        }
      }
      if (match) {
        deletedRecords.push(list[i]);
      } else {
        remainingRecords.push(list[i]);
      }
    }

    dbData[this.tableName] = remainingRecords;
    writeDb(dbData);

    const mapped = deletedRecords.map(item => ({
      ...item,
      createdAt: typeof item.createdAt === "string" ? new Date(item.createdAt) : item.createdAt,
    }));

    return mapped as T[];
  }
}

export const db = {
  select: () => ({
    from: (table: any) => new QueryBuilder<any>(table),
  }),
  insert: (table: any) => new InsertBuilder<any>(table),
  update: (table: any) => new UpdateBuilder<any>(table),
  delete: (table: any) => new DeleteBuilder<any>(table),
};

export const pool = {
  query: () => Promise.resolve({ rows: [] }),
};

export * from "./schema";
