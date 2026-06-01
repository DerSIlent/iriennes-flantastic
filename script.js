const menuToggle = document.querySelector("[data-menu-toggle]");
const siteNav = document.querySelector("[data-site-nav]");
const navLinks = document.querySelectorAll("[data-site-nav] a");
const analyticsLinks = document.querySelectorAll("[data-analytics-event]");
const cookieBanner = document.querySelector("[data-cookie-banner]");
const acceptCookiesButton = document.querySelector("[data-cookie-accept]");
const declineCookiesButton = document.querySelector("[data-cookie-decline]");
const cookiePreferencesButton = document.querySelector("[data-cookie-preferences]");
const analyticsConfig = window.iriennesAnalytics || {};
const measurementId = (analyticsConfig.measurementId || "").trim();
const hasMeasurementId = /^G-[A-Z0-9]+$/i.test(measurementId);
const consentStorageKey = "iriennes_analytics_consent";

let analyticsLoaded = false;

function getStoredConsent() {
  try {
    return window.localStorage.getItem(consentStorageKey);
  } catch {
    return null;
  }
}

function setStoredConsent(value) {
  try {
    window.localStorage.setItem(consentStorageKey, value);
  } catch {
    // If storage is unavailable, keep the choice for this session only.
  }
}

function showCookieBanner() {
  if (cookieBanner) {
    cookieBanner.hidden = false;
  }
}

function hideCookieBanner() {
  if (cookieBanner) {
    cookieBanner.hidden = true;
  }
}

function loadAnalytics() {
  if (!hasMeasurementId || analyticsLoaded) {
    return;
  }

  analyticsLoaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };

  const analyticsScript = document.createElement("script");
  analyticsScript.async = true;
  analyticsScript.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(analyticsScript);

  window.gtag("js", new Date());
  window.gtag("config", measurementId, {
    send_page_view: true,
    transport_type: "beacon"
  });
}

function trackAnalyticsEvent(eventName, params = {}) {
  if (!analyticsLoaded || typeof window.gtag !== "function") {
    return;
  }

  window.gtag("event", eventName, params);
}

if (hasMeasurementId) {
  const storedConsent = getStoredConsent();

  if (storedConsent === "granted") {
    loadAnalytics();
  } else if (storedConsent !== "denied") {
    showCookieBanner();
  }
}

if (acceptCookiesButton) {
  acceptCookiesButton.addEventListener("click", () => {
    setStoredConsent("granted");
    loadAnalytics();
    trackAnalyticsEvent("cookie_consent_update", {
      analytics_storage: "granted"
    });
    hideCookieBanner();
  });
}

if (declineCookiesButton) {
  declineCookiesButton.addEventListener("click", () => {
    setStoredConsent("denied");
    hideCookieBanner();
  });
}

if (cookiePreferencesButton) {
  cookiePreferencesButton.addEventListener("click", () => {
    showCookieBanner();
    acceptCookiesButton?.focus();
  });
}

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    document.body.classList.toggle("menu-open", isOpen);
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open menu");
      document.body.classList.remove("menu-open");
    });
  });
}

analyticsLinks.forEach((link) => {
  link.addEventListener("click", () => {
    trackAnalyticsEvent(link.dataset.analyticsEvent, {
      contact_method: link.dataset.analyticsMethod || undefined,
      link_text: link.textContent.trim(),
      link_url: link.href,
      location: link.dataset.analyticsLocation || undefined
    });
  });
});
