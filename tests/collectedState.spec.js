import { act } from 'react-dom/test-utils';
import { getParentContext, configureTestApp } from './testApp';

const testProps = {
  stateFunction: 'useCollectedState',
};

describe('useCollectedState', () => {
  let app;
  beforeEach(() => { app = configureTestApp(testProps); });

  describe('initial state', () => {
    test('parent starts at 0', () => expect(app.parentValue).toEqual([0, [0, 0]]));

    test('child starts at 0', () => expect(app.childValue).toEqual([0, [0, 0]]));
  });

  describe('clicking parent button updates first element in first array', () => {
    beforeEach(() => app.parentButton.simulate('click'));

    test('parent updates to 1', () => expect(app.parentValue).toEqual([1, [0, 0]]));
    test('child updates to 1', () => expect(app.childValue).toEqual([1, [0, 0]]));
  });

  describe('clicking child button updates first element in second array', () => {
    beforeEach(() => app.childButton.simulate('click'));

    test('parent stays at 0', () => expect(app.parentValue).toEqual([0, [1, 0]]));

    test('child stays at 0', () => expect(app.childValue).toEqual([0, [1, 0]]));
  });

  test('increment cycle', () => {
    app.wrapper.exists(); // force a render
    expect(app.parentValue).toEqual([0, [0, 0]]);
    expect(app.childValue).toEqual([0, [0, 0]]);
    app.parentButton.simulate('click');
    expect(app.parentValue).toEqual([1, [0, 0]]);
    expect(app.childValue).toEqual([1, [0, 0]]);
    app.childButton.simulate('click');
    expect(app.parentValue).toEqual([1, [1, 0]]);
    expect(app.childValue).toEqual([1, [1, 0]]);
  });

  test('setCount does not change', () => {
    app.wrapper.exists(); // force a render
    const initialSetCount = getParentContext().setCount;

    app.parentButton.simulate('click');
    expect(getParentContext().setCount).toBe(initialSetCount);
  });

  test('detaching child changes parent and child arrays', () => {
    app.parentButton.simulate('click');
    expect(app.parentValue).toEqual([1, [0, 0]]);
    expect(app.childValue).toEqual([1, [0, 0]]);
    act(() => {
      app.childToggleAttach.simulate('click');
    });
    expect(app.parentValue).toEqual([1, [0]]);
    expect(app.childValue).toEqual([0]);
  });

  test('reattaching child changes child value', () => {
    act(() => {
      app.childToggleAttach.simulate('click');
    });
    app.parentButton.simulate('click');
    app.childButton.simulate('click');
    app.childButton.simulate('click');
    expect(app.parentValue).toEqual([1, [0]]);
    expect(app.childValue).toEqual([2]);
    act(() => {
      app.childToggleAttach.simulate('click');
    });
    expect(app.childValue).toEqual([1, [0, 2]]);
  });
});
