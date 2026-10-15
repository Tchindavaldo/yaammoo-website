// Instance Firebase web unique, partagee par les apps du monorepo.
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { Config } from "./config.js";
import { IS_DEMO } from "./demo/flag.js";

// En mode demo, Firebase n'est pas initialise : aucune connexion reelle.
const app = IS_DEMO ? null : getApps().length ? getApp() : initializeApp(Config.firebaseConfig);

export const auth = IS_DEMO ? null : getAuth(app);
export { app };
