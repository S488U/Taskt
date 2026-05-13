
  Task Model

  export type TaskKind = "one_time" | "recurring";

  export type RecurringMode = "today" | "tomorrow" | "custom" | "everyday";

  export type Weekday = "Su" | "M" | "T" | "W" | "Th" | "F" | "S";

  export type TaskStatus = "pending" | "done";

  export type Task = {
    id: string;                  // uuid v4
    title: string;
    description: string | null;

    kind: TaskKind;
    status: TaskStatus;

    dueDate: string | null;      // local date only: YYYY-MM-DD
    dueTime: string | null;      // local time only: HH:mm

    recurringMode: RecurringMode | null;
    recurringDays: Weekday[];    // [] for one-time tasks

    createdAt: string;           // ISO UTC string
    updatedAt: string;           // ISO UTC string
    completedAt: string | null;  // ISO UTC string

    timezone: string | null;     // ex: Asia/Kolkata, useful later for reminders/sync
  };

  Storage Rules

  Use these rules consistently:

  - id: uuidv4()
  - dueDate: store exactly what user picked, like 2026-05-01
  - dueTime: store exactly what user picked, like 09:30
  - createdAt, updatedAt, completedAt: store as new Date().toISOString()
  - timezone: store Intl.DateTimeFormat().resolvedOptions().timeZone when creating the task

  That split is the important part:

  - user schedule fields stay local
  - system/audit fields stay ISO

  SQLite Table

  For SQLite, keep it flat:

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    kind TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',

    due_date TEXT,
    due_time TEXT,

    recurring_mode TEXT,
    recurring_days TEXT NOT NULL DEFAULT '[]',

    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    completed_at TEXT,

    timezone TEXT
  );

  recurring_days can be a JSON string like ["M","W","F"] for now. That is simpler than building a second table immediately.

  Examples

  One-time task:

  {
    "id": "uuid-v4",
    "title": "Pay electricity bill",
    "description": null,
    "kind": "one_time",
    "status": "pending",
    "dueDate": "2026-05-01",
    "dueTime": "09:30",
    "recurringMode": null,
    "recurringDays": [],
    "createdAt": "2026-04-30T18:20:00.000Z",
    "updatedAt": "2026-04-30T18:20:00.000Z",
    "completedAt": null,
    "timezone": "Asia/Kolkata"
  }

  Recurring task:

  {
    "id": "uuid-v4",
    "title": "Workout",
    "description": "30 minutes",
    "kind": "recurring",
    "status": "pending",
    "dueDate": null,
    "dueTime": "07:00",
    "recurringMode": "custom",
    "recurringDays": ["M", "W", "F"],
    "createdAt": "2026-04-30T18:20:00.000Z",
    "updatedAt": "2026-04-30T18:20:00.000Z",
    "completedAt": null,
    "timezone": "Asia/Kolkata"
  }

  Validation Rules

  Keep these strict:

  - title required
  - if kind === "one_time", require dueDate
  - if kind === "recurring", require recurringMode
  - if recurringMode === "custom", require at least one recurringDays
  - dueTime optional unless reminders depend on it
  - updatedAt changes on every edit
  - completedAt set only when marking done

  What task.types.ts, repository.ts, mapper.ts Mean

  task.types.ts

  - defines Task, TaskKind, Weekday, etc.

  task.repository.ts

  - database functions only
  - examples:

  createTask(task)
  getAllTasks()
  getTasksForDate(date)
  toggleTaskStatus(id, status)
  deleteTask(id)

  task.mapper.ts

  - converts DB row to app object and back
  - example:
      - SQLite row has due_date
      - app object has dueDate
      - SQLite row has recurring_days string
      - app object has recurringDays array

  Recommendation

  Before adding notifications, make these decisions final:

  - dueDate is always YYYY-MM-DD
  - dueTime is always HH:mm
  - audit timestamps are always ISO
  - recurring days are always weekday codes

  That will remove most of the date/time mess.
