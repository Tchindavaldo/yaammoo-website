// Configuration partagee site + dashboard.
// Valeurs alignees sur l'app RN (yaammoo/src/api/config.ts) : meme backend,
// meme projet Firebase. Le web utilise le Web Client ID Google.

const PROD_API_URL = "https://yaammoo-backend.fly.dev";

// En dev on peut pointer une API locale via VITE_API_URL (.env.local).
const ENV_API_URL = import.meta.env?.VITE_API_URL;

export const Config = {
  apiUrl: ENV_API_URL || PROD_API_URL,
  socketUrl: ENV_API_URL || PROD_API_URL,

  firebaseConfig: {
    apiKey: "AIzaSyCGjhUfAHQncfeUcI0wXpghctQG_O9WCgo",
    authDomain: "yaammoo-d9de1.firebaseapp.com",
    projectId: "yaammoo-d9de1",
    storageBucket: "yaammoo-d9de1.firebasestorage.app",
    messagingSenderId: "136139892705",
    appId: "1:136139892705:web:a871d66dfc423e27a694a0",
    measurementId: "G-XZ9LTZJBQX",
  },

  googleWebClientId:
    "136139892705-3ahf4grc1prt7jtuk5toifjgi7mgt40c.apps.googleusercontent.com",
};
