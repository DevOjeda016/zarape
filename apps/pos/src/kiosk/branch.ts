const KEY = 'zarape.pos.branchId';

/**
 * Sucursal de esta tableta. Se elige una vez y se queda guardada en el dispositivo;
 * `?branch=3` en la URL la cambia.
 */
export function storedBranchId(): number | null {
  try {
    const fromUrl = new URLSearchParams(location.search).get('branch');
    if (fromUrl) localStorage.setItem(KEY, fromUrl);
    const id = Number(localStorage.getItem(KEY));
    return Number.isInteger(id) && id > 0 ? id : null;
  } catch {
    return null;
  }
}

export function saveBranchId(id: number): void {
  try {
    localStorage.setItem(KEY, String(id));
  } catch {
    // Sin almacenamiento (modo privado): la sucursal se pide otra vez al recargar
  }
}
