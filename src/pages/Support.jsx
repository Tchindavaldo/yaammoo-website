import DocLayout from "../components/DocLayout.jsx";

const MAIL = "support@yaammoo.rauval.com";

const faqs = [
  {
    q: "Comment passer une commande ?",
    a: "Ouvrez l'app, parcourez les restaurants ou boutiques près de vous, ajoutez vos articles au panier, puis appuyez sur « Commander ». Un livreur prend en charge votre commande et vous la livre directement.",
  },
  {
    q: "Comment fonctionne le paiement ?",
    a: "Le paiement s'effectue à la livraison, en espèces. Aucune carte bancaire n'est nécessaire.",
  },
  {
    q: "Comment suivre ma commande ?",
    a: "Après validation, vous recevez une notification en temps réel à chaque changement de statut (commande acceptée, en préparation, en route, livrée). Consultez l'onglet « Commandes » dans l'app.",
  },
  {
    q: "Ma commande est en retard — que faire ?",
    a: "Contactez-nous par WhatsApp ou e-mail en indiquant votre numéro de commande. Nous faisons le lien avec le livreur et revenons vers vous sous 10 minutes.",
  },
  {
    q: "Je n'ai pas reçu ma commande ou il manque des articles.",
    a: "Signalez-le dans les 30 minutes suivant la livraison via l'app (onglet Commandes → Signaler un problème) ou contactez notre support. Nous traitons chaque signalement individuellement.",
  },
  {
    q: "Comment modifier ou annuler une commande ?",
    a: "Une commande peut être annulée tant qu'elle n'a pas été acceptée par le restaurant. Rendez-vous dans « Commandes » → sélectionnez la commande → « Annuler ». Passé ce stade, contactez le support directement.",
  },
  {
    q: "Comment supprimer mon compte ?",
    a: "Envoyez un e-mail depuis l'adresse associée à votre compte avec la mention « Suppression de compte ». Nous traitons les demandes sous 48h.",
  },
  {
    q: "Je veux référencer mon restaurant ou ma boutique.",
    a: "Écrivez-nous avec le nom de votre établissement, votre localisation et vos coordonnées. Notre équipe vous recontacte sous 24h.",
  },
];

export default function Support() {
  return (
    <DocLayout
      title="Centre d'aide"
      footerLinks={[{ to: "/privacy", label: "Confidentialité" }]}
    >
      <h2>Nous contacter</h2>
      <p>
        Notre équipe est disponible pour vous aider du lundi au samedi, de 8h à
        20h (heure de Yaoundé).
      </p>
      <div className="tiles">
        <div className="tile">
          <div className="icon">✉️</div>
          <p>E-mail</p>
          <a href={`mailto:${MAIL}`}>{MAIL}</a>
        </div>
        <div className="tile">
          <div className="icon">💬</div>
          <p>WhatsApp</p>
          <a href="https://wa.me/237600000000">+237 6 00 00 00 00</a>
        </div>
      </div>

      <h2>Foire aux questions</h2>
      {faqs.map((f) => (
        <div className="faq-item" key={f.q}>
          <strong>{f.q}</strong>
          {f.a}
        </div>
      ))}
    </DocLayout>
  );
}
