import makeMirrorable from './mirrorable';

const graphInterfaces = new WeakMap();
let neighbourCache = new WeakMap();

export default function graphFor(key) {
  let graph = graphInterfaces.get(key);
  if (!graph) {
    // eslint-disable-next-line no-use-before-define
    graph = makeGraph(key);
    graphInterfaces.set(key, graph);
  }
  const useGraphSignal = makeMirrorable(key, graph);
  return { ...graph, useGraphSignal };
}

function makeGraph(obj) {
  const node = {
    parent: null,
    children: new Set(),
    api: { parent: {}, children: {} },
  };
  neighbourCache.has({}); // eslint TODO

  node.api.addParent = (el) => {
    node.parent = el;
    graphFor(node.parent).children.add(obj);
    neighbourCache = new WeakMap();
  };

  node.api.removeParent = () => {
    graphFor(node.parent).children.delete(obj);
    node.parent = null;
    neighbourCache = new WeakMap();
  };

  node.api.rootNode = () => {
    const walk = (n) => {
      const { parent } = graphFor(n);
      return parent ? walk(parent) : n;
    };
    return walk(obj);
  };

  node.api.family = () => {
    const seen = new Set();

    const walk = (visited) => {
      seen.add(visited);
      const graph = graphFor(visited);
      const neighbours = [graph.parent, ...graph.children].filter(
        neighbour => neighbour && !seen.has(neighbour),
      );
      neighbours.forEach(walk);
    };

    walk(obj);
    return Array.from(seen);
  };

  return node;
}
