// Donnees structurees schema.org (JSON-LD) du site, un seul graphe par page :
// noeuds communs (site, organisation, application, editeur) + noeud de la page.
// Uniquement des faits affiches sur le site : aucune note, aucun avis, aucun
// prix (le site ne dit pas que l'app est gratuite). Seule l'app iOS existe
// (lien App Store), d'ou operatingSystem "iOS".

import { SITE_URL, SITE_NAME, OG_IMAGE, absoluteUrl } from "./pages.js";
import { APP_STORE_URL, SUPPORT_EMAIL, SUPPORT_HOURS, WHATSAPP } from "../content/contact.js";
import { faqs } from "../content/faqs.js";

const ID = {
  website: `${SITE_URL}/#website`,
  organization: `${SITE_URL}/#organization`,
  app: `${SITE_URL}/#app`,
  rauval: "https://rauval.com/#organization",
};

const CAMEROON = { "@type": "Country", name: "Cameroun" };

const SITE_NODES = [
  {
    "@type": "WebSite",
    "@id": ID.website,
    url: `${SITE_URL}/`,
    name: SITE_NAME,
    inLanguage: "fr",
    publisher: { "@id": ID.rauval },
    about: { "@id": ID.app },
  },
  {
    "@type": "Organization",
    "@id": ID.organization,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png`, width: 1254, height: 1254 },
    email: SUPPORT_EMAIL,
    areaServed: CAMEROON,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: SUPPORT_EMAIL,
      telephone: WHATSAPP.number,
      areaServed: "CM",
      availableLanguage: "French",
      hoursAvailable: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: SUPPORT_HOURS.days,
        opens: SUPPORT_HOURS.opens,
        closes: SUPPORT_HOURS.closes,
      },
    },
  },
  {
    "@type": "Organization",
    "@id": ID.rauval,
    name: "Rauval",
    url: "https://rauval.com",
  },
  {
    "@type": "MobileApplication",
    "@id": ID.app,
    name: SITE_NAME,
    description:
      "Application de commande et de livraison locale au Cameroun : repas et produits des restaurants et boutiques de votre quartier, suivi en temps réel, paiement en espèces à la livraison.",
    url: `${SITE_URL}/`,
    image: OG_IMAGE.url,
    operatingSystem: "iOS",
    applicationCategory: "ShoppingApplication",
    applicationSubCategory: "Livraison de repas et de produits",
    inLanguage: "fr",
    downloadUrl: APP_STORE_URL,
    installUrl: APP_STORE_URL,
    areaServed: CAMEROON,
    featureList: [
      "Commande auprès des restaurants et boutiques de proximité",
      "Livraison rapide par des livreurs locaux",
      "Suivi de commande en temps réel",
      "Paiement en espèces à la livraison",
    ],
    provider: { "@id": ID.organization },
    publisher: { "@id": ID.rauval },
    creator: { "@id": ID.rauval },
  },
];

// Graphe complet d'une page, ou null pour une page non indexable (404).
export function pageJsonLd(page) {
  if (page.noindex) return null;
  const url = absoluteUrl(page.path);
  const node = {
    "@type": page.schemaType || "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: page.title,
    description: page.description,
    inLanguage: "fr",
    isPartOf: { "@id": ID.website },
  };
  if (page.path === "/") {
    node.about = { "@id": ID.app };
    node.primaryImageOfPage = { "@type": "ImageObject", url: OG_IMAGE.url, width: OG_IMAGE.width, height: OG_IMAGE.height };
  }
  if (node["@type"] === "FAQPage") {
    node.mainEntity = faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    }));
  }
  return { "@context": "https://schema.org", "@graph": [...SITE_NODES, node] };
}
