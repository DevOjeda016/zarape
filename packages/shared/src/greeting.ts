/** Saludo por horario (RF16: "Buenas tardes, John"). Lo usan el login de gestión y el del drive thru. */
export type Greeting = 'Buenos días' | 'Buenas tardes' | 'Buenas noches';

export function greeting(hour = new Date().getHours()): Greeting {
  if (hour < 12) return 'Buenos días';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
}
