import DocLayout from "../components/DocLayout.jsx";
import { SUPPORT_EMAIL as MAIL } from "../content/contact.js";
import { PAGES } from "../seo/pages.js";
import useSeo from "../seo/useSeo.js";

export default function DeleteAccount() {
  useSeo(PAGES.deleteAccount);

  return (
    <DocLayout
      title="Suppression de compte"
      footerLinks={[
        { to: "/privacy", label: "Confidentialité" },
        { to: "/support", label: "Support" },
      ]}
    >
      <p className="updated">Dernière mise à jour : août 2026</p>

      <p>
        Cette page explique comment demander la suppression de votre compte
        <strong> Yaammoo</strong> et des données qui y sont associées.
      </p>

      <h2>1. Demander la suppression</h2>
      <p>
        Envoyez un e-mail à <a href={`mailto:${MAIL}`}>{MAIL}</a> avec pour objet
        <strong> « Suppression de compte »</strong>, en précisant l'adresse e-mail
        ou le numéro de téléphone associé à votre compte.
      </p>
      <p>
        Vous pouvez également faire la demande depuis l'application, dans
        <strong> Profil → Assistance</strong>.
      </p>
      <p>
        Votre demande est confirmée sous 48 heures, et la suppression est
        effectuée sous 30 jours au maximum.
      </p>

      <h2>2. Données supprimées</h2>
      <ul>
        <li>Nom, adresse e-mail, numéro de téléphone et identifiant utilisateur.</li>
        <li>Adresses de livraison enregistrées.</li>
        <li>Panier, commandes en cours et historique de commandes.</li>
        <li>Photos, vidéos et notes vocales que vous avez envoyées.</li>
        <li>Messages échangés avec l'assistance.</li>
        <li>Jetons de notification push de vos appareils.</li>
        <li>Bonus et avantages associés au compte.</li>
      </ul>

      <h2>3. Données conservées</h2>
      <ul>
        <li>
          <strong>Justificatifs de transaction</strong> (montant, date, référence
          de paiement) — conservés jusqu'à 10 ans pour répondre à nos obligations
          comptables et fiscales. Ils sont dissociés de votre identité dès la
          suppression du compte.
        </li>
        <li>
          <strong>Journaux techniques anonymisés</strong> (diagnostics, rapports
          de plantage) — conservés jusqu'à 90 jours, sans lien avec votre identité.
        </li>
      </ul>
      <p>Passé ces délais, ces données sont supprimées automatiquement.</p>

      <h2>4. Contact</h2>
      <p>
        Pour toute question relative à la suppression de vos données :<br />
        <strong>Yaammoo</strong><br />
        <a href={`mailto:${MAIL}`}>{MAIL}</a>
      </p>
    </DocLayout>
  );
}
