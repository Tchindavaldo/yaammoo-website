import DocLayout from "../components/DocLayout.jsx";

const MAIL = "support@yaammoo.rauval.com";

export default function Accessibility() {
  return (
    <DocLayout
      title="Accessibilité"
      footerLinks={[
        { to: "/privacy", label: "Confidentialité" },
        { to: "/support", label: "Support" },
      ]}
    >
      <p>
        Yaammoo s'engage à rendre son application accessible au plus grand nombre,
        y compris aux personnes utilisant des technologies d'assistance sur iPhone.
      </p>

      <h2>Fonctionnalités prises en charge</h2>
      <div className="tiles">
        <div className="tile left">
          <div className="icon">👁</div>
          <strong>VoiceOver</strong>
          <p>
            Tous les éléments interactifs de l'application (boutons, champs de
            saisie, listes de produits) sont étiquetés pour être lus correctement
            par VoiceOver. La navigation par gestes est prise en charge sur
            l'ensemble des écrans principaux.
          </p>
        </div>
        <div className="tile left">
          <div className="icon">Aa</div>
          <strong>Taille de texte dynamique</strong>
          <p>
            L'application respecte la taille de texte définie dans les réglages
            iOS (Réglages → Accessibilité → Taille du texte). Les textes peuvent
            être agrandis jusqu'à 200&nbsp;% sans perte de contenu ni chevauchement
            majeur.
          </p>
        </div>
      </div>

      <h2>Bonnes pratiques appliquées</h2>
      <ul>
        <li>Contrastes de couleurs conformes aux recommandations WCAG 2.1 (niveau AA).</li>
        <li>Zones tactiles dimensionnées à 44×44 pt minimum sur les éléments interactifs.</li>
        <li>Aucun contenu important transmis uniquement par la couleur.</li>
        <li>Messages d'erreur explicites et accessibles aux lecteurs d'écran.</li>
      </ul>

      <h2>Signaler un problème d'accessibilité</h2>
      <p>
        Si vous rencontrez une difficulté d'accessibilité dans l'application, nous
        souhaitons le savoir pour l'améliorer. Contactez-nous à :{" "}
        <a href={`mailto:${MAIL}`}>{MAIL}</a>
      </p>
      <p>
        Précisez dans votre message : l'écran concerné, la technologie d'assistance
        utilisée, et une description du problème rencontré. Nous nous engageons à
        répondre sous 5 jours ouvrés.
      </p>
    </DocLayout>
  );
}
