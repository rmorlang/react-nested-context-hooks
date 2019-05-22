import { useContext, useEffect, useState } from 'react';

import nestingId from './nestingId';
import graphFor from './graphFor';

export default function useParentContext(Context, id, startAttached) {
  const parent = useContext(Context);
  const parentId = parent ? parent[nestingId] : null;
  const hasParent = !!parent;

  const graph = graphFor(id);

  const [isAttachedToParent, setIsAttachedToParent] = useState(
    startAttached && hasParent,
  );
  const [attachToParent, setAttachToParent] = useState(startAttached);

  const [triggerUpdate, forceUpdate] = useState(0);
  // eslint-disable-next-line no-param-reassign
  id.current.forceUpdate = (fn) => {
    forceUpdate(fn);
  };

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (attachToParent && parentId) {
      setIsAttachedToParent(true);
      graph.api.addParent(parentId);
      parentId.current.forceUpdate(x => x + 1);
      return () => {
        setIsAttachedToParent(false);
        graph.api.removeParent(parentId);
        parentId.current.forceUpdate(x => x + 1);
      };
    }
  }, [attachToParent, parentId]);

  return {
    hasParent,
    attachToParent,
    isAttachedToParent,
    setAttachToParent,
    triggerUpdate,
  };
}
