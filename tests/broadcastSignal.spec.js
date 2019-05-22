import { act } from 'react-dom/test-utils';
import { getParentContext, configureTestApp } from './testApp';

const testProps = {
  stateFunction: 'useState',
  signalFunction: 'useBroadcastSignal',
};

describe('useBroadcastSignal', () => {
  let app;
  beforeEach(() => { app = configureTestApp(testProps); });

  describe('initial state', () => {
    test('parent starts at 0', () => {
      expect(app.parentValue).toBe(0);
    });

    test('child starts at 0', () => {
      expect(app.childValue).toBe(0);
    });
  });

  describe('clicking parent button updates both counters', () => {
    beforeEach(() => app.parentButtonClick());

    test('parent updates to 1', () => {
      expect(app.parentValue).toBe(1);
    });
    test('sibling updates to 1', () => {
      expect(app.siblingValue).toBe(1);
    });
    test('child updates to 1', () => {
      expect(app.childValue).toBe(1);
    });
  });

  describe('clicking child button updates both counters', () => {
    beforeEach(() => app.childButtonClick());

    test('parent updates to 1', () => {
      expect(app.parentValue).toBe(1);
    });
    test('sibling updates to 1', () => {
      expect(app.siblingValue).toBe(1);
    });
    test('child updates to 1', () => {
      expect(app.childValue).toBe(1);
    });
  });
  test('callback does not change', () => {
    app.wrapper.exists(); // force a render
    const initialIncrement = getParentContext().increment;

    app.parentButtonClick();
    expect(getParentContext().increment).toBe(initialIncrement);
  });

  describe('when detached', () => {
    beforeEach(() => {
      act(() => {
        app.childToggleAttach.simulate('click');
      });
    });

    describe('clicking parent button does not update child counter', () => {
      beforeEach(() => app.parentButtonClick());

      test('parent updates to 1', () => {
        expect(app.parentValue).toBe(1);
      });
      test('sibling updates to 1', () => {
        expect(app.siblingValue).toBe(1);
      });
      test('child stays at 0', () => {
        expect(app.childValue).toBe(0);
      });
    });

    describe('clicking child button updates only child counter', () => {
      beforeEach(() => app.childButtonClick());

      test('parent stays at 0', () => {
        expect(app.parentValue).toBe(0);
      });
      test('sibling stays at 0', () => {
        expect(app.siblingValue).toBe(0);
      });
      test('child updates to 1', () => {
        expect(app.childValue).toBe(1);
      });
    });
  });
});
