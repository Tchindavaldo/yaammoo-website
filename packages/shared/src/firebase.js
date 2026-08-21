// Instance Firebase web unique, partagee par les apps du monorepo.
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { Config } from "./config.js";

const app = getApps().length ? getApp() : initializeApp(Config.firebaseConfig);

export const auth = getAuth(app);
export { app };
