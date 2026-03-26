import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { IAppContext, IDataEnvelope } from '@toolbox/sdk';

type TaskStatus = 'todo' | 'in-progress' | 'done';

interface ITask {
  id: string;
  title: string;
  status: TaskStatus;
  createdAt: string;
}

interface IAppProps {
  context: IAppContext;
}

const STORAGE_KEY = 'tasks';
const STORAGE_VERSION = '1.0';

const COLUMNS: Array<{ key: TaskStatus; label: string }> = [
  { key: 'todo', label: '待辦' },
  { key: 'in-progress', label: '進行中' },
  { key: 'done', label: '已完成' }
];

function sanitizeTasks(value: unknown): ITask[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is ITask => {
      if (!item || typeof item !== 'object') {
        return false;
      }

      const task = item as Partial<ITask>;
      return (
        typeof task.id === 'string' &&
        typeof task.title === 'string' &&
        (task.status === 'todo' || task.status === 'in-progress' || task.status === 'done') &&
        typeof task.createdAt === 'string'
      );
    })
    .map((task) => ({ ...task }));
}

export function App({ context }: IAppProps) {
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [draftTitle, setDraftTitle] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const initialize = async () => {
      try {
        const envelope = await context.storage.get<ITask[]>(STORAGE_KEY);
        if (isCancelled) {
          return;
        }

        const normalized = sanitizeTasks((envelope as IDataEnvelope<ITask[]> | null)?.data ?? []);
        setTasks(normalized);
      } finally {
        if (!isCancelled) {
          setIsLoaded(true);
        }
      }
    };

    void initialize();

    return () => {
      isCancelled = true;
    };
  }, [context]);

  const persistAndBroadcast = useCallback(
    async (nextTasks: ITask[]) => {
      await context.storage.save(STORAGE_KEY, nextTasks, STORAGE_VERSION);
      await context.eventBus.emit('TASK_COUNT_CHANGED', { count: nextTasks.length });
    },
    [context]
  );

  const mutateTasks = useCallback(
    (updater: (prev: ITask[]) => ITask[]) => {
      setTasks((prev) => {
        const next = updater(prev);
        void persistAndBroadcast(next);
        return next;
      });
    },
    [persistAndBroadcast]
  );

  const addTask = useCallback(() => {
    const title = draftTitle.trim();
    if (!title) {
      return;
    }

    const now = new Date().toISOString();
    mutateTasks((prev) => [
      {
        id: crypto.randomUUID(),
        title,
        status: 'todo',
        createdAt: now
      },
      ...prev
    ]);
    setDraftTitle('');
  }, [draftTitle, mutateTasks]);

  const moveTask = useCallback(
    (taskId: string, status: TaskStatus) => {
      mutateTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, status } : task)));
    },
    [mutateTasks]
  );

  const removeTask = useCallback(
    (taskId: string) => {
      mutateTasks((prev) => prev.filter((task) => task.id !== taskId));
    },
    [mutateTasks]
  );

  const groupedTasks = useMemo(() => {
    return COLUMNS.reduce<Record<TaskStatus, ITask[]>>(
      (acc, column) => {
        acc[column.key] = tasks.filter((task) => task.status === column.key);
        return acc;
      },
      {
        todo: [],
        'in-progress': [],
        done: []
      }
    );
  }, [tasks]);

  return (
    <section className="task-board" aria-busy={!isLoaded}>
      <header className="task-board__header">
        <div>
          <p className="task-board__eyebrow">Task Board</p>
          <h1>任務管理</h1>
        </div>
        <p className="task-board__count">總任務: {tasks.length}</p>
      </header>

      <div className="task-board__composer">
        <label htmlFor="new-task" className="sr-only">
          新增任務
        </label>
        <input
          id="new-task"
          type="text"
          placeholder="輸入任務內容..."
          value={draftTitle}
          onChange={(event) => setDraftTitle(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              addTask();
            }
          }}
        />
        <button type="button" onClick={addTask}>
          新增
        </button>
      </div>

      <div className="task-board__grid">
        {COLUMNS.map((column) => (
          <article key={column.key} className="task-column">
            <header>
              <h2>{column.label}</h2>
              <span>{groupedTasks[column.key].length}</span>
            </header>

            <ul>
              {groupedTasks[column.key].map((task) => (
                <li key={task.id} className="task-card">
                  <p>{task.title}</p>
                  <div className="task-card__actions">
                    {column.key !== 'todo' && (
                      <button type="button" onClick={() => moveTask(task.id, 'todo')}>
                        待辦
                      </button>
                    )}
                    {column.key !== 'in-progress' && (
                      <button type="button" onClick={() => moveTask(task.id, 'in-progress')}>
                        進行中
                      </button>
                    )}
                    {column.key !== 'done' && (
                      <button type="button" onClick={() => moveTask(task.id, 'done')}>
                        完成
                      </button>
                    )}
                    <button type="button" className="danger" onClick={() => removeTask(task.id)}>
                      刪除
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
