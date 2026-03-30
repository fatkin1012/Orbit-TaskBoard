import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { IAppContext, IPlugin } from '@toolbox/sdk';
import { App } from './App';
import styles from './styles.css?raw';

const ROOT_ID = 'plugin-task-board';
const STYLE_ID = `${ROOT_ID}-styles`;
let styleRefCount = 0;
const roots = new WeakMap<HTMLElement, Root>();

function mountPlugin(container: HTMLElement, context: IAppContext): void {
  // Ensure plugin styles are present in the host document.
  if (!document.getElementById(STYLE_ID)) {
    const styleEl = document.createElement('style');
    styleEl.id = STYLE_ID;
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);
  }
  styleRefCount++;

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

  // Remove injected styles when no instances remain.
  styleRefCount = Math.max(0, styleRefCount - 1);
  if (styleRefCount === 0) {
    const el = document.getElementById(STYLE_ID);
    if (el) el.remove();
  }
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
