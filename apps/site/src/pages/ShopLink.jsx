// Lien boutique partage par QR code : https://yaammoo.rauval.com/shop/<id>.
// App installee : iOS / Android ouvrent l'app directement (Universal Links /
// App Links, fichiers public/.well-known/) et cette page n'est jamais vue.
// App absente : redirection vers le store du telephone, boutons sinon.
import { useEffect } from "react";
import { PAGES } from "../seo/pages.js";
import useSeo from "../seo/useSeo.js";
import { APP_STORE_URL, PLAY_STORE_URL } from "../content/contact.js";

function storeFor(ua) {
  if (/android/i.test(ua)) return PLAY_STORE_URL;
  if (/iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && "ontouchend" in document)) {
    return APP_STORE_URL;
  }
  return null;
}

export default function ShopLink() {
  useSeo(PAGES.shop);

  useEffect(() => {
    const url = storeFor(navigator.userAgent || "");
    if (url) window.location.replace(url);
  }, []);

  return (
    <div className="notfound">
      <h1>Ouvrir dans Yaammoo</h1>
      <p>Installez l'application Yaammoo pour voir cette boutique, puis scannez à nouveau le QR code.</p>
      <a className="store-btn" href={APP_STORE_URL} style={{ background: "var(--orange)" }}>
        App Store
      </a>
      <a className="store-btn" href={PLAY_STORE_URL} style={{ background: "var(--orange)", marginTop: 12 }}>
        Google Play
      </a>
    </div>
  );
}
