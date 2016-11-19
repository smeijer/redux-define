const NAMESPACE_SEPARATOR = '/';

const defineAction = (type, subactions = [], namespace) => {
  if (subactions && subactions.__name || typeof subactions === 'string') {
    namespace = subactions;
  }

  if (!Array.isArray(subactions)) {
    subactions = [];
  }

  const name = (namespace) ? [namespace, type].join(NAMESPACE_SEPARATOR) : type;

  const action = subactions.reduce((r, i) => Object.assign({}, r, {
    [i]: `${name}_${i}`,
  }), {});

  action.__name = name;
  action.defineAction = (type, subactions) => defineAction(type, subactions, name);

  action.toString = () => name.toString();
  return action;
};

export default defineAction;
