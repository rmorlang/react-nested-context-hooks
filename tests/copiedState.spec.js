import { act } from 'react-dom/test-utils';
import { getParentContext, configureTestApp } from './testApp';

const testProps = {
  stateFunction: 'useCopiedState',
};

describe('useCopiedState', () => {
  let app;
  beforeEach(() => { app = configureTestApp(testProps); });

  describe('initial state', () => {
    test('parent starts at 0', () => expect(app.parentValue).toBe(0));

    test('child starts at 0', () => expect(app.childValue).toBe(0));
  });

  describe('clicking parent button updates both counters', () => {
    beforeEach(() => app.parentButton.simulate('click'));

    test('parent updates to 1', () => expect(app.parentValue).toBe(1));
    test('child updates to 1', () => expect(app.childValue).toBe(1));
  });

  describe('clicking child button updates neither counter', () => {
    beforeEach(() => app.childButton.simulate('click'));

    test('parent stays at 0', () => expect(app.parentValue).toBe(0));

    test('child stays at 0', () => expect(app.childValue).toBe(0));
  });

  test('increment cycle', () => {
    app.wrapper.exists(); // force a render
    expect(app.parentValue).toBe(0);
    app.parentButton.simulate('click');
    expect(app.parentValue).toBe(1);
    app.parentButton.simulate('click');
    expect(app.parentValue).toBe(2);
  });

  test('setCount does not change', () => {
    app.wrapper.exists(); // force a render
    const initialSetCount = getParentContext().setCount;

    app.parentButton.simulate('click');
    expect(getParentContext().setCount).toBe(initialSetCount);
  });

  test('detaching child changes child value', () => {
    app.parentButton.simulate('click');
    expect(app.childValue).toBe(1);
    act(() => {
      app.childToggleAttach.simulate('click');
    });
    expect(app.childValue).toBe(1);
  });

  test('reattaching child changes child value', () => {
    act(() => {
      app.childToggleAttach.simulate('click');
    });
    app.parentButton.simulate('click');
    expect(app.childValue).toBe(0);
    act(() => {
      app.childToggleAttach.simulate('click');
    });
    expect(app.childValue).toBe(1);
  });
});
