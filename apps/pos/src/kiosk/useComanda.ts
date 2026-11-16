import { calculateOrder, type ComandaProduct, comandaReducer } from '@zarape/shared';
import { useMemo, useReducer } from 'react';

/** RF09: la comanda del comensal. Los totales se recalculan solos con cada cambio. */
export function useComanda() {
  const [lines, dispatch] = useReducer(comandaReducer, []);
  const ticket = useMemo(() => calculateOrder(lines), [lines]);
  const pieces = useMemo(() => lines.reduce((sum, line) => sum + line.quantity, 0), [lines]);

  return {
    ...ticket,
    pieces,
    add: (product: ComandaProduct) => dispatch({ type: 'add', product }),
    increase: (line: ComandaProduct) => dispatch({ type: 'increase', line }),
    decrease: (line: ComandaProduct) => dispatch({ type: 'decrease', line }),
    remove: (line: ComandaProduct) => dispatch({ type: 'remove', line }),
    clear: () => dispatch({ type: 'clear' }),
  };
}

export type Comanda = ReturnType<typeof useComanda>;
