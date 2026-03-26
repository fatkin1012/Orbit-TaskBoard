import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import type { IAppContext, IDataEnvelope } from '@toolbox/sdk';
import './styles.css';

class InMemoryStorage {
  private store = new Map<string, IDataEnvelope<unknown>>();

  async get<TData>(key: string): Promise<IDataEnvelope<TData> | null> {
    return (this.store.get(key) as IDataEnvelope<TData> | undefined) ?? null;
  }

  async save<TData>(key: string, data: TData, version: string): Promise<void> {
    this.store.set(key, { data, version });
  }
}

const devContext: IAppContext = {
  storage: new InMemoryStorage(),
  eventBus: {
    emit(event, payload) {
      console.info('[eventBus.emit]', event, payload);
    }
  }
};

const container = document.querySelector<HTMLDivElement>('#root');
if (!container) {
  throw new Error('Missing #root container');
}

createRoot(container).render(
  <div id="plugin-task-board">
    <App context={devContext} />
  </div>
);
