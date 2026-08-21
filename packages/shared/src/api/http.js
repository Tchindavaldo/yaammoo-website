// Client axios partage — portage de yaammoo/src/api/setupHttp.ts.
//
// Deux choses, exactement comme l'app RN :
//  1. headers globaux x-app-version / x-platform sur CHAQUE requete (le backend
//     s'en sert pour choisir le format de reponse, ex. deliveryHours) ;
//  2. Authorization: Bearer <idToken> Firebase, relu a chaque appel (getIdToken
//     sert son cache et rafraichit tout seul a l'expiration).
import axios from "axios";
import { Config } from "../config.js";
import { auth } from "../firebase.js";
import { APP_VERSION, APP_PLATFORM } from "../version.js";

export const http = axios.create({
  baseURL: Config.apiUrl,
  headers: {
    "x-app-version": APP_VERSION,
    "x-platform": APP_PLATFORM,
  },
});

http.interceptors.request.use(async (config) => {
  // Filet de securite : re-injecte les headers de version si un appel a fourni
  // ses propres headers (meme logique que la couche 2 de setupHttp.ts).
  config.headers["x-app-version"] ??= APP_VERSION;
  config.headers["x-platform"] ??= APP_PLATFORM;

  const user = auth.currentUser;
  if (user) {
    config.headers.Authorization = `Bearer ${await user.getIdToken()}`;
  }
  return config;
});

// Normalise les erreurs backend en Error avec un message lisible.
http.interceptors.response.use(
  (res) => res,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Erreur reseau";
    return Promise.reject(new Error(message));
  },
);
