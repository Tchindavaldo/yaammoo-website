// Metadonnees SEO de chaque route publique du site.
// Source unique, lue par :
//   - useSeo (src/seo/useSeo.js) a chaque navigation cote client ;
//   - scripts/prerender.mjs, qui ecrit le HTML statique de chaque route au build
//     et verifie que public/sitemap.xml liste exactement les routes indexables.
// Ajouter une page : voir architecture/seo.md.

export const SITE_URL = "https://yaammoo.rauval.com";
export const SITE_NAME = "Yaammoo";

export const OG_IMAGE = {
  url: `${SITE_URL}/og-image.jpg`,
  width: 1200,
  height: 630,
  alt: "Yaammoo — Livraison locale, livrée à votre porte. Disponible sur l'App Store.",
};

export const absoluteUrl = (path) => `${SITE_URL}${path}`;

// title : 60 caracteres environ ; description : 160 caracteres maximum.
// schemaType : type schema.org du noeud de page dans le JSON-LD (WebPage par defaut).
export const PAGES = {
  home: {
    path: "/",
    title: "Yaammoo — Livraison de repas et produits au Cameroun",
    description:
      "Commandez vos repas et produits auprès des restaurants et boutiques de votre quartier. Livraison rapide, suivi en temps réel, paiement à la livraison.",
  },
  support: {
    path: "/support",
    title: "Centre d'aide et contact — Yaammoo",
    description:
      "Une question sur une commande Yaammoo ? Contactez le support par e-mail ou WhatsApp, du lundi au samedi de 8h à 20h, et consultez la foire aux questions.",
    schemaType: "FAQPage",
  },
  privacy: {
    path: "/privacy",
    title: "Politique de confidentialité — Yaammoo",
    description:
      "Quelles données l'application Yaammoo collecte, pourquoi, avec qui elles sont partagées, combien de temps elles sont conservées et comment exercer vos droits.",
  },
  deleteAccount: {
    path: "/delete-account",
    // Page de service (lien demande par Google Play) : accessible, mais hors des resultats de recherche.
    noindex: true,
    title: "Suppression de compte — Yaammoo",
    description:
      "Comment demander la suppression de votre compte Yaammoo : démarche par e-mail ou dans l'application, délais de traitement, données supprimées et conservées.",
  },
  // Page 404 : jamais indexee, pas de canonical (son URL est quelconque).
  notFound: {
    path: null,
    title: "Page introuvable — Yaammoo",
    description: "Cette page n'existe pas. Retournez à l'accueil de Yaammoo.",
    noindex: true,
  },
};

// Routes prerendues au build : "/" -> dist/index.html, "/support" -> dist/support.html.
// Chaque route indexable doit aussi figurer dans public/sitemap.xml (controle au build).
export const PRERENDER_PAGES = [PAGES.home, PAGES.support, PAGES.privacy, PAGES.deleteAccount];
