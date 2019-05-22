// eslint-disable-next-line no-unused-vars
import React, { useRef } from 'react';
import nestingId from './nestingId';

export default function useNestedContextProvider(Context, id) {
  const NestedContextProvider = ({ children, ...props }) => {
    /* inject the nesting id into the context using a Symbol so there's no
     * chance of collision
     */
    const nestingProps = {
      ...props,
      value: {
        ...props.value,
        [nestingId]: id,
      },
    };

    return <Context.Provider {...nestingProps}>{children}</Context.Provider>;
  };

  const provider = useRef(NestedContextProvider);
  return provider.current;
}
