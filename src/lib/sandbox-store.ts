
// Sandbox Mock Store
const globalStore = globalThis as any;

if (!globalStore.pharmacyCache) globalStore.pharmacyCache = new Map();
if (!globalStore.clinicalCache) globalStore.clinicalCache = new Map(); // patient_id -> records[]

export const pharmacyCache = globalStore.pharmacyCache;
export const clinicalCache = globalStore.clinicalCache;
