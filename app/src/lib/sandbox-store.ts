
// Sandbox Mock Store
// En un entorno serverless (Vercel), globalThis ayuda a mantener el estado 
// en cachés calientes (warm lambdas) para permitir simulaciones de flujo rápidas.
const globalStore = globalThis as any;

if (!globalStore.pharmacyCache) {
  globalStore.pharmacyCache = new Map();
}

export const pharmacyCache = globalStore.pharmacyCache;
