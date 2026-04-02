import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { IAppContext } from '@toolbox/sdk';

interface ILegacyTask {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'done';
  createdAt: string;
}

interface ICard {
  id: string;
  title: string;
  description: string;
  reportId?: string;
  columnId: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface IReportLoggerOpenOrCreatePayload {
  sourcePluginId: string;
  targetPluginId: string;
  boardId: string;
  cardId: string;
  cardTitle: string;
  cardDescription: string;
  reportId?: string;
  mode: 'open' | 'create';
  requestedAt: string;
}

interface IColumn {
  id: string;
  name: string;
  order: number;
}

interface IBoard {
  id: string;
  name: string;
  columns: IColumn[];
  cards: ICard[];
  createdAt: string;
  updatedAt: string;
}

interface IBoardStore {
  schemaVersion: string;
  activeBoardId: string | null;
  boards: IBoard[];
}

interface IAppProps {
  context: IAppContext;
}

type TDropPlacement = 'before' | 'after';

const STORAGE_KEY = 'task-boards';
const LEGACY_STORAGE_KEY = 'tasks';
const STORAGE_VERSION = '2.1.0';
const SOURCE_PLUGIN_ID = 'plugin-task-board';
const REPORT_LOGGER_PLUGIN_ID = 'report-logger';
const REPORT_LOGGER_OPEN_OR_CREATE_EVENT = 'REPORT_LOGGER:OPEN_OR_CREATE';

const DEFAULT_COLUMNS: IColumn[] = [
  { id: 'todo', name: '待辦', order: 0 },
  { id: 'doing', name: '進行中', order: 1 },
  { id: 'done', name: '已完成', order: 2 }
];

function maybeParseJson(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }

  try {
    return JSON.parse(value) as unknown;
  } catch {
    return value;
  }
}

function extractEnvelopeData(value: unknown): unknown {
  const parsed = maybeParseJson(value);
  if (!parsed || typeof parsed !== 'object') {
    return parsed;
  }

  const record = parsed as Record<string, unknown>;
  if ('data' in record) {
    return maybeParseJson(record.data);
  }

  return parsed;
}

function resolveTaskArray(value: unknown): unknown[] | null {
  if (Array.isArray(value)) {
    return value;
  }

  const parsed = maybeParseJson(value);
  if (!parsed || typeof parsed !== 'object') {
    return null;
  }

  const record = parsed as Record<string, unknown>;
  const keys = ['data', 'value', 'payload', 'tasks'];

  for (const key of keys) {
    const resolved = resolveTaskArray(record[key]);
    if (resolved) {
      return resolved;
    }
  }

  return null;
}

function sanitizeLegacyTasks(value: unknown): ILegacyTask[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is ILegacyTask => {
      if (!item || typeof item !== 'object') {
        return false;
      }

      const task = item as Partial<ILegacyTask>;
      return (
        typeof task.id === 'string' &&
        typeof task.title === 'string' &&
        (task.status === 'todo' || task.status === 'in-progress' || task.status === 'done') &&
        typeof task.createdAt === 'string'
      );
    })
    .map((task) => ({ ...task }));
}

function createDefaultBoard(now: string): IBoard {
  const boardId = crypto.randomUUID();
  return {
    id: boardId,
    name: '我的任務板',
    columns: DEFAULT_COLUMNS.map((column) => ({ ...column })),
    cards: [],
    createdAt: now,
    updatedAt: now
  };
}

function createDefaultStore(): IBoardStore {
  const now = new Date().toISOString();
  const board = createDefaultBoard(now);

  return {
    schemaVersion: STORAGE_VERSION,
    activeBoardId: board.id,
    boards: [board]
  };
}

function sanitizeColumns(value: unknown): IColumn[] {
  if (!Array.isArray(value)) {
    return DEFAULT_COLUMNS.map((column) => ({ ...column }));
  }

  const sanitized = value
    .filter((item): item is IColumn => {
      if (!item || typeof item !== 'object') {
        return false;
      }

      const column = item as Partial<IColumn>;
      return (
        typeof column.id === 'string' &&
        typeof column.name === 'string' &&
        typeof column.order === 'number' &&
        Number.isFinite(column.order)
      );
    })
    .map((column) => ({
      id: column.id,
      name: column.name.trim() || '未命名欄位',
      order: column.order
    }))
    .sort((a, b) => a.order - b.order)
    .map((column, index) => ({ ...column, order: index }));

  return sanitized.length > 0 ? sanitized : DEFAULT_COLUMNS.map((column) => ({ ...column }));
}

function sanitizeCards(value: unknown, columns: IColumn[]): ICard[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const columnIds = new Set(columns.map((column) => column.id));
  const fallbackColumnId = columns[0]?.id ?? 'todo';

  const cards = value
    .filter((item): item is ICard => {
      if (!item || typeof item !== 'object') {
        return false;
      }

      const card = item as Partial<ICard>;
      return (
        typeof card.id === 'string' &&
        typeof card.title === 'string' &&
        typeof card.description === 'string' &&
        typeof card.columnId === 'string' &&
        typeof card.order === 'number' &&
        Number.isFinite(card.order) &&
        typeof card.createdAt === 'string' &&
        typeof card.updatedAt === 'string'
      );
    })
    .map((card) => ({
      ...card,
      title: card.title.trim() || '未命名卡片',
      reportId: typeof card.reportId === 'string' && card.reportId.trim() ? card.reportId.trim() : undefined,
      columnId: columnIds.has(card.columnId) ? card.columnId : fallbackColumnId
    }));

  const seenIds = new Set<string>();
  const deduplicated = cards.map((card) => {
    if (!seenIds.has(card.id)) {
      seenIds.add(card.id);
      return card;
    }

    const nextId = crypto.randomUUID();
    seenIds.add(nextId);
    return {
      ...card,
      id: nextId
    };
  });

  const byColumn = new Map<string, ICard[]>();
  for (const card of deduplicated) {
    const grouped = byColumn.get(card.columnId) ?? [];
    grouped.push(card);
    byColumn.set(card.columnId, grouped);
  }

  const normalized: ICard[] = [];
  for (const [columnId, grouped] of byColumn.entries()) {
    grouped
      .sort((a, b) => a.order - b.order)
      .forEach((card, index) => {
        normalized.push({ ...card, columnId, order: index });
      });
  }

  return normalized;
}

function sanitizeBoards(value: unknown): IBoard[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is IBoard => {
      if (!item || typeof item !== 'object') {
        return false;
      }

      const board = item as Partial<IBoard>;
      return (
        typeof board.id === 'string' &&
        typeof board.name === 'string' &&
        typeof board.createdAt === 'string' &&
        typeof board.updatedAt === 'string'
      );
    })
    .map((board) => {
      const columns = sanitizeColumns((board as Partial<IBoard>).columns);
      const cards = sanitizeCards((board as Partial<IBoard>).cards, columns);

      return {
        id: board.id,
        name: board.name.trim() || '未命名看板',
        columns,
        cards,
        createdAt: board.createdAt,
        updatedAt: board.updatedAt
      };
    });
}

function migrateLegacyTasksToStore(payload: unknown): IBoardStore {
  const tasks = sanitizeLegacyTasks(resolveTaskArray(payload) ?? []);
  const now = new Date().toISOString();
  const board = createDefaultBoard(now);

  const statusToColumnId: Record<ILegacyTask['status'], string> = {
    todo: 'todo',
    'in-progress': 'doing',
    done: 'done'
  };

  board.cards = tasks.map((task, index) => ({
    id: task.id,
    title: task.title,
    description: '',
    columnId: statusToColumnId[task.status],
    order: index,
    createdAt: task.createdAt,
    updatedAt: task.createdAt
  }));
  board.updatedAt = now;

  return {
    schemaVersion: STORAGE_VERSION,
    activeBoardId: board.id,
    boards: [board]
  };
}

function normalizeStorePayload(payload: unknown): IBoardStore | null {
  const extracted = extractEnvelopeData(payload);
  const parsed = maybeParseJson(extracted);

  if (!parsed || typeof parsed !== 'object') {
    return null;
  }

  const record = parsed as Record<string, unknown>;
  const boards = sanitizeBoards(record.boards);
  if (boards.length === 0) {
    return null;
  }

  const activeBoardId =
    typeof record.activeBoardId === 'string' && boards.some((board) => board.id === record.activeBoardId)
      ? record.activeBoardId
      : boards[0].id;

  return {
    schemaVersion: STORAGE_VERSION,
    activeBoardId,
    boards
  };
}

function getCardsByColumn(cards: ICard[], columnId: string): ICard[] {
  return cards.filter((card) => card.columnId === columnId).sort((a, b) => a.order - b.order);
}

function moveCardWithOrder(
  cards: ICard[],
  cardId: string,
  targetColumnId: string,
  beforeCardId: string | null
): ICard[] {
  const movingCard = cards.find((card) => card.id === cardId);
  if (!movingCard) {
    return cards;
  }

  const remaining = cards.filter((card) => card.id !== cardId);
  const targetCards = getCardsByColumn(remaining, targetColumnId);
  const insertIndex =
    beforeCardId === null ? targetCards.length : Math.max(0, targetCards.findIndex((card) => card.id === beforeCardId));

  const insertedCard: ICard = {
    ...movingCard,
    columnId: targetColumnId,
    updatedAt: new Date().toISOString()
  };

  targetCards.splice(insertIndex, 0, insertedCard);

  const normalizedTarget = targetCards.map((card, index) => ({ ...card, order: index }));
  const sourceColumnId = movingCard.columnId;

  if (sourceColumnId === targetColumnId) {
    const untouched = remaining.filter((card) => card.columnId !== targetColumnId);
    return [...untouched, ...normalizedTarget];
  }

  const normalizedSource = getCardsByColumn(remaining, sourceColumnId).map((card, index) => ({ ...card, order: index }));

  const untouched = remaining.filter((card) => card.columnId !== sourceColumnId && card.columnId !== targetColumnId);
  return [...untouched, ...normalizedSource, ...normalizedTarget];
}

function getVerticalDropPlacement(event: React.DragEvent<HTMLElement>): TDropPlacement {
  const rect = event.currentTarget.getBoundingClientRect();
  const offsetY = event.clientY - rect.top;
  return offsetY < rect.height / 2 ? 'before' : 'after';
}

function getHorizontalDropPlacement(event: React.DragEvent<HTMLElement>): TDropPlacement {
  const rect = event.currentTarget.getBoundingClientRect();
  const offsetX = event.clientX - rect.left;
  return offsetX < rect.width / 2 ? 'before' : 'after';
}

export function App({ context }: IAppProps) {
  const [store, setStore] = useState<IBoardStore>(() => createDefaultStore());
  const [draftBoardName, setDraftBoardName] = useState('');
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [renameBoardName, setRenameBoardName] = useState('');
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [renameColumnName, setRenameColumnName] = useState('');
  const [draftColumnName, setDraftColumnName] = useState('');
  const [draftCardByColumn, setDraftCardByColumn] = useState<Record<string, string>>({});
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [cardForm, setCardForm] = useState<{ title: string; description: string }>({ title: '', description: '' });
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);
  const [draggingColumnId, setDraggingColumnId] = useState<string | null>(null);
  const [dragOverLanePlacement, setDragOverLanePlacement] = useState<{ id: string; position: TDropPlacement } | null>(null);
  const [draggingBoardId, setDraggingBoardId] = useState<string | null>(null);
  const [dragOverBoardPlacement, setDragOverBoardPlacement] = useState<{ id: string; position: TDropPlacement } | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const firstPersistSkippedRef = useRef(false);
  const skipNextBoardBlurSaveRef = useRef(false);
  const skipNextColumnBlurSaveRef = useRef(false);
  const lanesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const initialize = async () => {
      try {
        const [nextPayload, legacyPayload] = await Promise.all([
          context.storage.get<unknown>(STORAGE_KEY),
          context.storage.get<unknown>(LEGACY_STORAGE_KEY)
        ]);

        if (isCancelled) {
          return;
        }

        const normalized = normalizeStorePayload(nextPayload);
        if (normalized) {
          setStore(normalized);
          return;
        }

        if (legacyPayload) {
          setStore(migrateLegacyTasksToStore(legacyPayload));
          return;
        }

        setStore(createDefaultStore());
      } catch (error) {
        console.error('[task-board] restore failed', error);
      } finally {
        if (!isCancelled) {
          setHydrated(true);
          setIsLoaded(true);
        }
      }
    };

    void initialize();

    return () => {
      isCancelled = true;
    };
  }, [context]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (!firstPersistSkippedRef.current) {
      firstPersistSkippedRef.current = true;
      return;
    }

    void context.storage
      .save(STORAGE_KEY, store, STORAGE_VERSION)
      .then(() => {
        const count = store.boards.reduce((acc, board) => acc + board.cards.length, 0);
        return context.eventBus.emit('TASK_COUNT_CHANGED', { count });
      })
      .catch((error) => {
        console.error('[task-board] save failed', error);
      });
  }, [context, hydrated, store]);

  const mutateStore = useCallback((updater: (prev: IBoardStore) => IBoardStore) => {
    setStore((prev) => updater(prev));
  }, []);

  const activeBoard = useMemo(
    () => store.boards.find((board) => board.id === store.activeBoardId) ?? store.boards[0] ?? null,
    [store.activeBoardId, store.boards]
  );

  const totalCardsCount = useMemo(
    () => store.boards.reduce((acc, board) => acc + board.cards.length, 0),
    [store.boards]
  );

  const updateBoardById = useCallback(
    (boardId: string, updater: (board: IBoard) => IBoard) => {
      mutateStore((prev) => ({
        ...prev,
        boards: prev.boards.map((board) => {
          if (board.id !== boardId) {
            return board;
          }

          return {
            ...updater(board),
            updatedAt: new Date().toISOString()
          };
        })
      }));
    },
    [mutateStore]
  );

  const addBoard = useCallback(() => {
    const name = draftBoardName.trim();
    if (!name) {
      return;
    }

    const now = new Date().toISOString();
    const board = createDefaultBoard(now);
    board.name = name;

    mutateStore((prev) => ({
      ...prev,
      boards: [...prev.boards, board],
      activeBoardId: board.id
    }));
    setDraftBoardName('');
  }, [draftBoardName, mutateStore]);

  const startRenameBoard = useCallback(
    (boardId: string) => {
      const board = store.boards.find((item) => item.id === boardId);
      if (!board) {
        return;
      }

      setEditingBoardId(boardId);
      setRenameBoardName(board.name);
      mutateStore((prev) => ({
        ...prev,
        activeBoardId: boardId
      }));
    },
    [mutateStore, store.boards]
  );

  const saveRenameBoard = useCallback(
    (boardId: string) => {
      const board = store.boards.find((item) => item.id === boardId);
      if (!board) {
        setEditingBoardId(null);
        setRenameBoardName('');
        return;
      }

      const name = renameBoardName.trim();
      if (!name) {
        setEditingBoardId(null);
        setRenameBoardName('');
        return;
      }

      updateBoardById(boardId, (current) => ({ ...current, name }));
      setEditingBoardId(null);
      setRenameBoardName('');
    },
    [renameBoardName, store.boards, updateBoardById]
  );

  const handleRenameBoard = useCallback(
    (boardId: string) => {
      if (editingBoardId === boardId) {
        saveRenameBoard(boardId);
        return;
      }

      startRenameBoard(boardId);
    },
    [editingBoardId, saveRenameBoard, startRenameBoard]
  );

  const cancelRenameBoard = useCallback(() => {
    setEditingBoardId(null);
    setRenameBoardName('');
  }, []);

  const removeBoard = useCallback(
    (boardId: string) => {
      if (store.boards.length <= 1) {
        window.alert('至少需要保留一個看板。');
        return;
      }

      const board = store.boards.find((item) => item.id === boardId);
      if (!board) {
        return;
      }

      if (!window.confirm(`確定刪除看板「${board.name}」嗎？`)) {
        return;
      }

      mutateStore((prev) => {
        const boards = prev.boards.filter((item) => item.id !== boardId);
        return {
          ...prev,
          boards,
          activeBoardId: prev.activeBoardId === boardId ? boards[0]?.id ?? null : prev.activeBoardId
        };
      });
    },
    [mutateStore, store.boards]
  );

  const moveBoardWithOrder = useCallback(
    (targetBoardId: string | null, placement: TDropPlacement = 'before') => {
      if (!draggingBoardId) {
        return;
      }

      mutateStore((prev) => {
        const movingIndex = prev.boards.findIndex((board) => board.id === draggingBoardId);
        if (movingIndex < 0) {
          return prev;
        }

        const remaining = prev.boards.filter((board) => board.id !== draggingBoardId);
        const movingBoard = prev.boards[movingIndex];

        let insertIndex = remaining.length;
        if (targetBoardId !== null) {
          const targetIndex = remaining.findIndex((board) => board.id === targetBoardId);
          if (targetIndex < 0) {
            return prev;
          }

          insertIndex = placement === 'after' ? targetIndex + 1 : targetIndex;
        }

        if (insertIndex < 0 || insertIndex > remaining.length) {
          return prev;
        }

        const boards = [...remaining];
        boards.splice(insertIndex, 0, movingBoard);

        return {
          ...prev,
          boards
        };
      });

      setDraggingBoardId(null);
      setDragOverBoardPlacement(null);
    },
    [draggingBoardId, mutateStore]
  );

  const addColumn = useCallback(() => {
    if (!activeBoard) {
      return;
    }

    const name = draftColumnName.trim();
    if (!name) {
      return;
    }

    updateBoardById(activeBoard.id, (board) => ({
      ...board,
      columns: [...board.columns, { id: crypto.randomUUID(), name, order: board.columns.length }]
    }));
    setDraftColumnName('');
  }, [activeBoard, draftColumnName, updateBoardById]);

  const startRenameColumn = useCallback(
    (columnId: string) => {
      if (!activeBoard) {
        return;
      }

      const column = activeBoard.columns.find((item) => item.id === columnId);
      if (!column) {
        return;
      }

      setEditingColumnId(columnId);
      setRenameColumnName(column.name);
    },
    [activeBoard]
  );

  const saveRenameColumn = useCallback(
    (columnId: string) => {
      if (!activeBoard) {
        return;
      }

      const column = activeBoard.columns.find((item) => item.id === columnId);
      if (!column) {
        setEditingColumnId(null);
        setRenameColumnName('');
        return;
      }

      const name = renameColumnName.trim();
      if (!name) {
        setEditingColumnId(null);
        setRenameColumnName('');
        return;
      }

      updateBoardById(activeBoard.id, (board) => ({
        ...board,
        columns: board.columns.map((item) => (item.id === columnId ? { ...item, name } : item))
      }));
      setEditingColumnId(null);
      setRenameColumnName('');
    },
    [activeBoard, renameColumnName, updateBoardById]
  );

  const handleRenameColumn = useCallback(
    (columnId: string) => {
      if (editingColumnId === columnId) {
        saveRenameColumn(columnId);
        return;
      }

      startRenameColumn(columnId);
    },
    [editingColumnId, saveRenameColumn, startRenameColumn]
  );

  const cancelRenameColumn = useCallback(() => {
    setEditingColumnId(null);
    setRenameColumnName('');
  }, []);

  useEffect(() => {
    if (!activeBoard || !editingColumnId) {
      return;
    }

    const exists = activeBoard.columns.some((column) => column.id === editingColumnId);
    if (!exists) {
      cancelRenameColumn();
    }
  }, [activeBoard, cancelRenameColumn, editingColumnId]);

  const removeColumn = useCallback(
    (columnId: string) => {
      if (!activeBoard || activeBoard.columns.length <= 1) {
        window.alert('至少需要保留一個欄位。');
        return;
      }

      const column = activeBoard.columns.find((item) => item.id === columnId);
      if (!column) {
        return;
      }

      if (!window.confirm(`確定刪除欄位「${column.name}」嗎？卡片會移到第一欄。`)) {
        return;
      }

      updateBoardById(activeBoard.id, (board) => {
        const columns = board.columns
          .filter((item) => item.id !== columnId)
          .map((item, index) => ({ ...item, order: index }));
        const fallbackColumnId = columns[0]?.id;

        const cards = fallbackColumnId
          ? board.cards.map((card) => (card.columnId === columnId ? { ...card, columnId: fallbackColumnId } : card))
          : board.cards;

        return {
          ...board,
          columns,
          cards
        };
      });
    },
    [activeBoard, updateBoardById]
  );

  const moveColumnWithOrder = useCallback(
    (targetColumnId: string | null, placement: TDropPlacement = 'before') => {
      if (!activeBoard || !draggingColumnId) {
        return;
      }

      updateBoardById(activeBoard.id, (board) => {
        const movingIndex = board.columns.findIndex((column) => column.id === draggingColumnId);
        if (movingIndex < 0) {
          return board;
        }

        const remaining = board.columns.filter((column) => column.id !== draggingColumnId);
        const movingColumn = board.columns[movingIndex];

        let insertIndex = remaining.length;
        if (targetColumnId !== null) {
          const targetIndex = remaining.findIndex((column) => column.id === targetColumnId);
          if (targetIndex < 0) {
            return board;
          }

          insertIndex = placement === 'after' ? targetIndex + 1 : targetIndex;
        }

        if (insertIndex < 0 || insertIndex > remaining.length) {
          return board;
        }

        const columns = [...remaining];
        columns.splice(insertIndex, 0, movingColumn);

        return {
          ...board,
          columns: columns.map((column, index) => ({ ...column, order: index }))
        };
      });

      setDraggingColumnId(null);
      setDragOverLanePlacement(null);
    },
    [activeBoard, draggingColumnId, updateBoardById]
  );

  const addCard = useCallback(
    (columnId: string) => {
      if (!activeBoard) {
        return;
      }

      const title = (draftCardByColumn[columnId] ?? '').trim();
      if (!title) {
        return;
      }

      const now = new Date().toISOString();
      updateBoardById(activeBoard.id, (board) => {
        const cardsInColumn = getCardsByColumn(board.cards, columnId);
        const card: ICard = {
          id: crypto.randomUUID(),
          title,
          description: '',
          columnId,
          order: cardsInColumn.length,
          createdAt: now,
          updatedAt: now
        };

        return {
          ...board,
          cards: [...board.cards, card]
        };
      });

      setDraftCardByColumn((prev) => ({ ...prev, [columnId]: '' }));
    },
    [activeBoard, draftCardByColumn, updateBoardById]
  );

  const openCardEditor = useCallback(
    (cardId: string) => {
      if (!activeBoard) {
        return;
      }

      const card = activeBoard.cards.find((item) => item.id === cardId);
      if (!card) {
        return;
      }

      setSelectedCardId(cardId);
      setCardForm({ title: card.title, description: card.description });
    },
    [activeBoard]
  );

  const saveCardEditor = useCallback(() => {
    if (!activeBoard || !selectedCardId) {
      return;
    }

    const title = cardForm.title.trim();
    if (!title) {
      window.alert('標題不能為空');
      return;
    }

    updateBoardById(activeBoard.id, (board) => ({
      ...board,
      cards: board.cards.map((card) =>
        card.id === selectedCardId
          ? {
              ...card,
              title,
              description: cardForm.description.trim(),
              updatedAt: new Date().toISOString()
            }
          : card
      )
    }));

    setSelectedCardId(null);
  }, [activeBoard, cardForm.description, cardForm.title, selectedCardId, updateBoardById]);

  const removeCard = useCallback(
    (cardId: string) => {
      if (!activeBoard) {
        return;
      }

      updateBoardById(activeBoard.id, (board) => ({
        ...board,
        cards: board.cards.filter((card) => card.id !== cardId)
      }));

      if (selectedCardId === cardId) {
        setSelectedCardId(null);
      }
    },
    [activeBoard, selectedCardId, updateBoardById]
  );

  const handleDropCard = useCallback(
    (targetColumnId: string, beforeCardId: string | null) => {
      if (!activeBoard || !draggingCardId) {
        return;
      }

      updateBoardById(activeBoard.id, (board) => ({
        ...board,
        cards: moveCardWithOrder(board.cards, draggingCardId, targetColumnId, beforeCardId)
      }));

      setDraggingCardId(null);
      setDragOverColumnId(null);
    },
    [activeBoard, draggingCardId, updateBoardById]
  );

  const selectedCard = useMemo(() => {
    if (!activeBoard || !selectedCardId) {
      return null;
    }

    return activeBoard.cards.find((card) => card.id === selectedCardId) ?? null;
  }, [activeBoard, selectedCardId]);

  const openCardInReportLogger = useCallback(async () => {
    if (!activeBoard || !selectedCard) {
      return;
    }

    const payload: IReportLoggerOpenOrCreatePayload = {
      sourcePluginId: SOURCE_PLUGIN_ID,
      targetPluginId: REPORT_LOGGER_PLUGIN_ID,
      boardId: activeBoard.id,
      cardId: selectedCard.id,
      cardTitle: cardForm.title.trim() || selectedCard.title,
      cardDescription: cardForm.description.trim() || selectedCard.description,
      reportId: selectedCard.reportId,
      mode: selectedCard.reportId ? 'open' : 'create',
      requestedAt: new Date().toISOString()
    };

    try {
      await context.eventBus.emit(REPORT_LOGGER_OPEN_OR_CREATE_EVENT, payload);
    } catch (error) {
      console.error('[task-board] open report logger failed', error);
      window.alert('暫時無法開啟 Report Logger，請稍後再試。');
    }
  }, [activeBoard, cardForm.description, cardForm.title, context.eventBus, selectedCard]);

  const sortedColumns = useMemo(() => {
    if (!activeBoard) {
      return [];
    }

    return [...activeBoard.columns].sort((a, b) => a.order - b.order);
  }, [activeBoard]);

  return (
    <section className="kanban-shell" aria-busy={!isLoaded}>
      <aside className="board-sidebar">
        <div className="board-sidebar__head">
          <p className="board-sidebar__eyebrow">Orbit Board</p>
          <h1>我的看板</h1>
          <p className="board-sidebar__count">總卡片: {totalCardsCount}</p>
        </div>

        <div className="board-sidebar__composer">
          <label htmlFor="new-board" className="sr-only">
            新增看板
          </label>
          <input
            id="new-board"
            type="text"
            placeholder="新增看板名稱"
            value={draftBoardName}
            onChange={(event) => setDraftBoardName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                addBoard();
              }
            }}
          />
          <button type="button" onClick={addBoard}>
            建立看板
          </button>
        </div>

        <ul
          className="board-list"
          role="list"
          onDragOver={(event) => {
            if (event.target !== event.currentTarget) {
              return;
            }

            event.preventDefault();
            setDragOverBoardPlacement(null);
          }}
          onDrop={(event) => {
            if (event.target !== event.currentTarget) {
              return;
            }

            event.preventDefault();
            moveBoardWithOrder(null);
          }}
        >
          {store.boards.map((board) => (
            <li
              key={board.id}
              className={[
                'board-list__item',
                draggingBoardId === board.id ? 'board-list__item--dragging' : '',
                dragOverBoardPlacement?.id === board.id && dragOverBoardPlacement.position === 'before'
                  ? 'board-list__item--indicator-before'
                  : '',
                dragOverBoardPlacement?.id === board.id && dragOverBoardPlacement.position === 'after'
                  ? 'board-list__item--indicator-after'
                  : ''
              ]
                .filter(Boolean)
                .join(' ')}
              draggable
              onDragStart={(event) => {
                event.dataTransfer.effectAllowed = 'move';
                setDraggingBoardId(board.id);
              }}
              onDragEnd={() => {
                setDraggingBoardId(null);
                setDragOverBoardPlacement(null);
              }}
              onDragOver={(event) => {
                event.preventDefault();

                const position = getVerticalDropPlacement(event);
                setDragOverBoardPlacement({ id: board.id, position });
              }}
              onDragLeave={() => {
                setDragOverBoardPlacement((prev) => (prev?.id === board.id ? null : prev));
              }}
              onDrop={(event) => {
                event.preventDefault();

                const position = getVerticalDropPlacement(event);
                moveBoardWithOrder(board.id, position);
              }}
            >
              <button
                type="button"
                className={board.id === activeBoard?.id ? 'board-item board-item--active' : 'board-item'}
                onClick={() => mutateStore((prev) => ({ ...prev, activeBoardId: board.id }))}
              >
                <span>{board.name}</span>
                <small>{board.cards.length}</small>
              </button>
              <div className="board-item__actions">
                <button
                  type="button"
                  className="ghost"
                  data-board-rename-id={board.id}
                  onClick={() => handleRenameBoard(board.id)}
                >
                  {editingBoardId === board.id ? '保存' : '改名'}
                </button>
                <button type="button" className="danger" onClick={() => removeBoard(board.id)}>
                  刪除
                </button>
              </div>
            </li>
          ))}
        </ul>
      </aside>

      <div className="kanban-workspace">
        <header className="workspace-header">
          <div>
            <p className="workspace-header__eyebrow">Task Workspace</p>
            {activeBoard && editingBoardId === activeBoard.id ? (
              <input
                type="text"
                className="workspace-header__title-input"
                value={renameBoardName}
                onChange={(event) => setRenameBoardName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    saveRenameBoard(activeBoard.id);
                  }

                  if (event.key === 'Escape') {
                    skipNextBoardBlurSaveRef.current = true;
                    cancelRenameBoard();
                  }
                }}
                onBlur={(event) => {
                  const nextTarget = event.relatedTarget as HTMLElement | null;
                  if (nextTarget?.dataset.boardRenameId === activeBoard.id) {
                    return;
                  }

                  if (skipNextBoardBlurSaveRef.current) {
                    skipNextBoardBlurSaveRef.current = false;
                    return;
                  }

                  saveRenameBoard(activeBoard.id);
                }}
                autoFocus
                aria-label="編輯看板名稱"
              />
            ) : (
              <h2>{activeBoard?.name ?? '未選擇看板'}</h2>
            )}
          </div>
          <div className="workspace-header__column-composer">
            <label htmlFor="new-column" className="sr-only">
              新增欄位
            </label>
            <input
              id="new-column"
              type="text"
              placeholder="新增欄位名稱"
              value={draftColumnName}
              onChange={(event) => setDraftColumnName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  addColumn();
                }
              }}
            />
            <button type="button" onClick={addColumn}>
              新增欄位
            </button>
          </div>
        </header>

        <div
          className="lanes"
          ref={lanesRef}
          onDragOver={(event) => {
            if (!draggingColumnId) {
              return;
            }

            const scroller = lanesRef.current;
            if (scroller) {
              const rect = scroller.getBoundingClientRect();
              const edgeThreshold = 96;
              const step = 20;

              if (event.clientX < rect.left + edgeThreshold) {
                scroller.scrollLeft -= step;
              } else if (event.clientX > rect.right - edgeThreshold) {
                scroller.scrollLeft += step;
              }
            }

            if (event.target !== event.currentTarget) {
              return;
            }

            event.preventDefault();
            setDragOverLanePlacement(null);
          }}
          onDrop={(event) => {
            if (!draggingColumnId) {
              return;
            }

            if (event.target !== event.currentTarget) {
              return;
            }

            event.preventDefault();
            moveColumnWithOrder(null);
          }}
        >
          {sortedColumns.map((column) => {
            const cards = activeBoard ? getCardsByColumn(activeBoard.cards, column.id) : [];

            return (
              <article
                key={column.id}
                className={[
                  'lane',
                  dragOverColumnId === column.id ? 'lane--drop' : '',
                  dragOverLanePlacement?.id === column.id && dragOverLanePlacement.position === 'before'
                    ? 'lane--indicator-before'
                    : '',
                  dragOverLanePlacement?.id === column.id && dragOverLanePlacement.position === 'after'
                    ? 'lane--indicator-after'
                    : '',
                  draggingColumnId === column.id ? 'lane--dragging' : ''
                ]
                  .filter(Boolean)
                  .join(' ')}
                onDragOver={(event) => {
                  event.preventDefault();

                  if (draggingColumnId) {
                    const position = getHorizontalDropPlacement(event);
                    setDragOverLanePlacement({ id: column.id, position });
                    return;
                  }

                  setDragOverColumnId(column.id);
                }}
                onDragLeave={() => {
                  setDragOverColumnId((prev) => (prev === column.id ? null : prev));
                  setDragOverLanePlacement((prev) => (prev?.id === column.id ? null : prev));
                }}
                onDrop={(event) => {
                  event.preventDefault();

                  if (draggingColumnId) {
                    const position = getHorizontalDropPlacement(event);
                    moveColumnWithOrder(column.id, position);
                    return;
                  }

                  handleDropCard(column.id, null);
                }}
              >
                <header className="lane__header">
                  {editingColumnId === column.id ? (
                    <input
                      type="text"
                      className="lane__title-input"
                      value={renameColumnName}
                      onChange={(event) => setRenameColumnName(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          saveRenameColumn(column.id);
                        }

                        if (event.key === 'Escape') {
                          skipNextColumnBlurSaveRef.current = true;
                          cancelRenameColumn();
                        }
                      }}
                      onBlur={(event) => {
                        const nextTarget = event.relatedTarget as HTMLElement | null;
                        if (nextTarget?.dataset.columnRenameId === column.id) {
                          return;
                        }

                        if (skipNextColumnBlurSaveRef.current) {
                          skipNextColumnBlurSaveRef.current = false;
                          return;
                        }

                        saveRenameColumn(column.id);
                      }}
                      autoFocus
                      aria-label="編輯欄位名稱"
                    />
                  ) : (
                    <div
                      className="lane__title-grip"
                      draggable
                      title="拖動欄位排序"
                      onDragStart={(event) => {
                        event.dataTransfer.effectAllowed = 'move';
                        setDraggingColumnId(column.id);
                      }}
                      onDragEnd={() => {
                        setDraggingColumnId(null);
                        setDragOverLanePlacement(null);
                      }}
                    >
                      <h3>{column.name}</h3>
                    </div>
                  )}
                  <div className="lane__header-tools">
                    <span>{cards.length}</span>
                  </div>
                </header>

                <div className="lane__header-actions">
                  <button
                    type="button"
                    className="ghost"
                    data-column-rename-id={column.id}
                    onClick={() => handleRenameColumn(column.id)}
                  >
                    {editingColumnId === column.id ? '保存' : '改名'}
                  </button>
                  <button type="button" className="danger" onClick={() => removeColumn(column.id)}>
                    刪除
                  </button>
                </div>

                <div className="lane__composer">
                  <label htmlFor={`new-card-${column.id}`} className="sr-only">
                    新增卡片
                  </label>
                  <input
                    id={`new-card-${column.id}`}
                    type="text"
                    placeholder="新增卡片標題"
                    value={draftCardByColumn[column.id] ?? ''}
                    onChange={(event) =>
                      setDraftCardByColumn((prev) => ({
                        ...prev,
                        [column.id]: event.target.value
                      }))
                    }
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        addCard(column.id);
                      }
                    }}
                  />
                  <button type="button" onClick={() => addCard(column.id)}>
                    新增卡片
                  </button>
                </div>

                <ul className="card-list" role="list">
                  {cards.map((card) => (
                    <li
                      key={card.id}
                      className={draggingCardId === card.id ? 'card card--dragging' : 'card'}
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.effectAllowed = 'move';
                        setDraggingCardId(card.id);
                      }}
                      onDragEnd={() => {
                        setDraggingCardId(null);
                        setDragOverColumnId(null);
                      }}
                      onDragOver={(event) => {
                        event.preventDefault();
                        setDragOverColumnId(column.id);
                      }}
                      onDrop={(event) => {
                        event.preventDefault();
                        handleDropCard(column.id, card.id);
                      }}
                    >
                      <button type="button" className="card__body" onClick={() => openCardEditor(card.id)}>
                        <p>{card.title}</p>
                        <small>{card.description ? '已填寫詳情' : '尚無詳情'}</small>
                      </button>
                      <div className="card__actions">
                        <button type="button" className="ghost" onClick={() => openCardEditor(card.id)}>
                          編輯
                        </button>
                        <button type="button" className="danger" onClick={() => removeCard(card.id)}>
                          刪除
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </div>

      {selectedCard && (
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="card-modal-title">
          <div className="modal__panel">
            <header className="modal__header">
              <h4 id="card-modal-title">卡片詳情</h4>
              <button type="button" className="ghost" onClick={() => setSelectedCardId(null)}>
                關閉
              </button>
            </header>

            <label htmlFor="card-title">標題</label>
            <input
              id="card-title"
              type="text"
              value={cardForm.title}
              onChange={(event) => setCardForm((prev) => ({ ...prev, title: event.target.value }))}
            />

            <label htmlFor="card-desc">描述</label>
            <textarea
              id="card-desc"
              rows={5}
              placeholder="輸入和這張卡片相關的資訊"
              value={cardForm.description}
              onChange={(event) => setCardForm((prev) => ({ ...prev, description: event.target.value }))}
            />

            <p className="modal__hint">
              {selectedCard.reportId
                ? '已綁定 report 文件，將直接在 Report Logger 開啟。'
                : '尚未綁定 report 文件，將跳轉到 Report Logger 建立文件。'}
            </p>

            <div className="modal__actions">
              <button type="button" className="ghost" onClick={openCardInReportLogger}>
                前往 Report Logger
              </button>
              <button type="button" className="ghost" onClick={() => setSelectedCardId(null)}>
                取消
              </button>
              <button type="button" onClick={saveCardEditor}>
                儲存
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
