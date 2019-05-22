import { useRef, useEffect, useState } from 'react';

import graphFor from './graphFor';
import useNestedContextProvider from './useNestedContextProvider';
import useParentContext from './useParentContext';

const cellsMap = new WeakMap();
function cellsFor(key) {
  let cells = cellsMap.get(key);
  if (!cells) {
    cells = [];
    cellsMap.set(key, cells);
  }

  return cells;
}

export default function createdNestedContext(Context, startAttached = true) {
  const id = useRef({});
  const NestedContextProvider = useNestedContextProvider(Context, id);
  const { useGraphSignal, ...graph } = graphFor(id);

  const {
    hasParent,
    attachToParent,
    isAttachedToParent,
    setAttachToParent,
    triggerUpdate,
  } = useParentContext(Context, id, startAttached);

  const useUnicastSignalToRoot = useGraphSignal(g => [
    g.api.rootNode(),
  ]);
  const useBroadcastSignal = useGraphSignal(g => g.api.family());

  let cellIndex = -1;
  const cells = cellsFor(id);

  function useNestedState(val) {
    cellIndex += 1;
    const [localState, setLocalState] = useState(val);
    cells[cellIndex] = localState;
    const root = attachToParent ? graph.api.rootNode() : null;
    let rootState;
    if (root) {
      rootState = cellsFor(root)[cellIndex];
    }
    return [localState, rootState, setLocalState];
  }

  function useInheritedState(val) {
    const [localState, rootState, setLocalState] = useNestedState(val);
    if (rootState !== undefined) {
      return [rootState, setLocalState];
    }
    return [localState, setLocalState];
  }

  function useCopiedState(val) {
    const [localState, rootState, setLocalState] = useNestedState(val);
    if (rootState !== undefined && rootState !== localState) {
      setLocalState(rootState);
    }
    return [localState, setLocalState];
  }

  function useCollectedState(val) {
    const [localState, setLocalState] = useState(val);
    const [collectedState, setMyCollectedState] = useInheritedState([val]);
    const setRootCollectedState = useUnicastSignalToRoot((v) => {
      setMyCollectedState(v);
    });
    cellIndex += 1;
    cells[cellIndex] = localState;
    useEffect(() => {
      cells[cellIndex] = localState;
      const root = attachToParent ? graph.api.rootNode() : id;
      const walk = (node) => {
        const result = [cellsFor(node)[cellIndex]];
        const g = graphFor(node);
        if (g.children.size > 0) {
          result.push(
            Array.from(g.children).reduce(
              (memo, n) => memo.concat(walk(n)),
              [],
            ),
          );
        }
        return result;
      };

      const state = walk(root);
      setRootCollectedState(state);
    }, [localState, isAttachedToParent, triggerUpdate]);
    return [localState, collectedState, setLocalState];
  }

  return {
    /**  */
    NestedContextProvider,

    /**
     * Whether this context is currently attached to its parent
     * @member {boolean} isAttachedToParent
     */
    isAttachedToParent,

    /**
     * Whether this context is nested inside an attachable parent
     * @member {boolean} hasParent
     */
    hasParent,

    /**
     * Control whether this context should attach to any parent context, if
     * found.
     * @function setAttachToParent
     * @param {boolean} attachToParent
     */
    setAttachToParent,

    /**
     * Drop-in replacement for useState(). When the current context is attached
     * to a context tree, the returned state value will be the value of the
     * root node's state. If no root state is available, the local state will
     * be returned instead. Note that the local state exists independently of
     * the root state and can be updated even when it is masked by a root
     * state.
     * @function useInheritedState
     * @param {*} initialValue The initial value to set the local state to
     * @returns [Array] Array containing the effective state (local or
     * inherited) and a setState function to modify the local state
     */
    useInheritedState,

    /**
     * Drop-in replacement for useState(). When the current context is attached
     * to a context tree, the local state's value will be copied from the
     * inherited state.
     * @function useCopiedState
     * @param {*} initialValue The initial value to set the local state to
     * @returns [Array] Array containing the local state and a setState
     * function to modify the local state
     */
    useCopiedState,

    /**
     * @function useCollectedState
     * @param {*} initialValue The initial value to set the local state to
     * @returns [Array]
     */
    useCollectedState,

    /**
     * Wrap the supplied function in a broadcast handler. When this context is
     * part of a nested context tree, calling the returned function will cause
     * the inner function to be called for each context in the tree. The inner
     * function called is always the matching function in its own context. (Not
     * the suppled function being called multiple times with different this
     * values.)
     * @function useBroadcastSignal
     * @param {function} fn The function to be wrapped.
     * @returns {function} The broadcast signal
     */
    useBroadcastSignal,

    /**
     * Wrap the supplied function in a broadcast handler. When this context is
     * part of a nested context tree, calling the returned function will cause
     * the inner function to be called for only ther root context in the tree.
     * @function useRootnodeSignal
     * @param {function} fn The function to be wrapped.
     * @returns {function} The root node signal
     */
    useUnicastSignalToRoot,
  };
}
