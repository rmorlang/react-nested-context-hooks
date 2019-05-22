/* Attaching and detaching child nodes internally uses the setter function
 * from a useState() hook, which causes a useEffect() to fire, which in turn
 * fires the setter from another useState() hook. Because useEffect() fires
 * asynchronously, this causes the test harness to observe an intermediate
 * state, not the final one.
 *
 * This mock works around the issue by replacing useEffect() with
 * useLayoutEffect() in the test harness.
 *
 * Without this workaround, tests that verify that signals affecting other
 * contexts (useBroadcastSignal(), useUnicastToRootSignal()) won't update
 * attached contexts.
 */
const React = jest.requireActual('react');
module.exports = { ...React, useEffect: React.useLayoutEffect };
