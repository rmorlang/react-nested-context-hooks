import React, { useContext, useState, useCallback } from 'react';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';
import createNestedContext from '../lib';

export const Context = React.createContext();

let parentContext = null;
function stashParent(context) {
  parentContext = context;
}
export function getParentContext() {
  return parentContext;
}

let childContext = null;
function stashChild(context) {
  childContext = context;
}
export function getChildContext() {
  return childContext;
}

function TestContextProvider({
  children,
  stateFunction,
  signalFunction = 'useCallback',
}) {
  const nestedContextApi = createNestedContext(Context);
  const {
    NestedContextProvider,
    setAttachToParent,
    isAttachedToParent,
    useInheritedState,
    useCopiedState,
    useCollectedState,
    useBroadcastSignal,
    useUnicastSignalToRoot,
  } = nestedContextApi;

  let count; let
    setCount;
  const useConfiguredStateFunction = {
    useInheritedState,
    useCopiedState,
    useCollectedState,
    useState,
  }[stateFunction];
  if (stateFunction === 'useCollectedState') {
    [, count, setCount] = useCollectedState(0);
  } else {
    [count, setCount] = useConfiguredStateFunction(0);
  }

  const useConfiguredSignalFunction = {
    useCallback,
    useBroadcastSignal,
    useUnicastSignalToRoot,
  }[signalFunction];

  const increment = useConfiguredSignalFunction(
    useCallback(() => setCount(v => v + 1), [setCount]),
  );

  const context = {
    count,
    setCount,
    increment,
    setAttachToParent,
    isAttachedToParent,
  };

  return (
    <NestedContextProvider value={context}>{children}</NestedContextProvider>
  );
}

function TestCounter({ name, stashContext = () => undefined }) {
  const context = useContext(Context);
  stashContext(context);
  const { count, increment, setAttachToParent } = context;
  const toggleAttach = () => {
    setAttachToParent(old => !old);
  };

  return (
    <div id={name}>
      <span>{JSON.stringify(count)}</span>
      <button className="add" onClick={increment}>
        Add
      </button>
      <button className="toggleAttach" onClick={toggleAttach}>
        Toggle Attach
      </button>
    </div>
  );
}

export function TestApp(props) {
  return (
    <TestContextProvider {...props}>
      <TestCounter name="parent" stashContext={stashParent} />
      <TestContextProvider {...props}>
        <TestCounter name="child" stashContext={stashChild} />
      </TestContextProvider>
      <TestContextProvider {...props}>
        <TestCounter name="sibling" />
      </TestContextProvider>
    </TestContextProvider>
  );
}

export const getValue = el => JSON.parse(el.find('span').text());
const createClickCallback = el => () => {
  act(() => {
    el.simulate('click');
  });
};

export function configureTestApp(props = {}) {
  const wrapper = mount(<TestApp {...props} />);

  return {
    wrapper,
    get parentCounter() { return wrapper.find('#parent'); },
    get parentButton() { return this.parentCounter.find('button.add'); },
    get parentButtonClick() { return createClickCallback(this.parentButton); },
    get parentToggleAttach() { return this.parentCounter.find('button.toggleAttach'); },
    get parentValue() { return getValue(this.parentCounter); },

    get childCounter() { return wrapper.find('#child'); },
    get childButton() { return this.childCounter.find('button.add'); },
    get childButtonClick() { return createClickCallback(this.childButton); },
    get childToggleAttach() { return this.childCounter.find('button.toggleAttach'); },
    get childValue() { return getValue(this.childCounter); },

    get siblingCounter() { return wrapper.find('#sibling'); },
    get siblingButton() { return this.siblingCounter.find('button.add'); },
    get siblingToggleAttach() { return this.siblingCounter.find('button.toggleAttach'); },
    get siblingValue() { return getValue(this.siblingCounter); },
  };
}
