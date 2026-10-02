// Metadonnees de version envoyees au backend — pendant web de
// yaammoo/src/api/version.ts.
//
// Cote RN la version vient d'app.json via expo-constants. Ici il n'y a pas
// d'app store : on declare la version du client web.

// IMPORTANT : doit rester >= 1.0.1. En dessous, le backend rétrograde
// `deliveryHours` au format legacy (simples strings "HH:mm", sans zone ni
// prix) et le dashboard ne peut plus afficher les créneaux réels.
export const APP_VERSION = "1.0.1";
export const APP_PLATFORM = "web";
