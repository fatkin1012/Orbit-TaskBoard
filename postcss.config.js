import prefixSelector from 'postcss-prefix-selector';

export default {
  plugins: [
    prefixSelector({
      prefix: '#plugin-task-board',
      transform(prefix, selector, prefixedSelector) {
        if (selector.startsWith('html') || selector.startsWith('body')) {
          return prefix;
        }

        return prefixedSelector;
      }
    })
  ]
};
