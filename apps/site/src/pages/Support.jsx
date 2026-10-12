import DocLayout from "../components/DocLayout.jsx";
import Icon from "../components/Icon.jsx";
import { SUPPORT_EMAIL, SUPPORT_HOURS, WHATSAPP } from "../content/contact.js";
import { faqs } from "../content/faqs.js";
import { PAGES } from "../seo/pages.js";
import useSeo from "../seo/useSeo.js";

export default function Support() {
  useSeo(PAGES.support);

  return (
    <DocLayout
      title="Centre d'aide"
      footerLinks={[{ to: "/privacy", label: "Confidentialité" }]}
    >
      <h2>Nous contacter</h2>
      <p>
        Notre équipe est disponible pour vous aider {SUPPORT_HOURS.label}.
      </p>
      <div className="tiles">
        <div className="tile">
          <div className="icon">
            <Icon name="mail" size={28} />
          </div>
          <p>E-mail</p>
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
        </div>
        <div className="tile">
          <div className="icon">
            <Icon name="chat" size={28} />
          </div>
          <p>WhatsApp</p>
          <a href={WHATSAPP.url}>{WHATSAPP.label}</a>
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
