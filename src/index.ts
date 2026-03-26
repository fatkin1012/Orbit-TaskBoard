import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { IAppContext, IPlugin } from '@toolbox/sdk';
import { App } from './App';
import './styles.css';

const ROOT_ID = 'plugin-task-board';
const roots = new WeakMap<HTMLElement, Root>();

function mountPlugin(container: HTMLElement, context: IAppContext): void {
  const host = document.createElement('div');
  host.id = ROOT_ID;
  container.appendChild(host);

  const root = createRoot(host);
  roots.set(container, root);
  root.render(createElement(App, { context }));
}

function unmountPlugin(container: HTMLElement): void {
  const root = roots.get(container);
  if (root) {
    root.unmount();
    roots.delete(container);
  }

  container.innerHTML = '';
}

const plugin: IPlugin = {
  id: ROOT_ID,
  mount(container, context) {
    mountPlugin(container, context);
  },
  unmount(container) {
    unmountPlugin(container);
  }
};

export default plugin;
