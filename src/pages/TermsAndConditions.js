import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaShieldAlt,
  FaLock,
  FaBuilding,
  FaExclamationTriangle,
  FaCheckCircle,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaSun,
  FaMoon,
  FaQrcode,
  FaArrowLeft,
} from "react-icons/fa";

function TermsAndConditions() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const theme = darkMode
    ? {
        page: "bg-slate-950 text-white",
        hero: "bg-slate-950",
        card: "bg-white/5 border border-white/10 text-white",
        muted: "text-slate-300",
        soft: "text-slate-400",
        heading: "text-white",
        navScrolled:
          "bg-slate-950/95 backdrop-blur-xl border-b border-white/10 shadow-sm",
        navTop: "bg-slate-950/80 backdrop-blur-xl border-b border-white/5",
        buttonAlt:
          "bg-white/5 border border-white/10 text-white hover:bg-white/10",
        iconWrap: "bg-white/10",
        warnBox: "bg-orange-500/10 border border-orange-500/20",
        warnText: "text-orange-400",
        badItem: "bg-orange-500/5 border-l-4 border-orange-400",
      }
    : {
        page: "bg-white text-slate-900",
        hero: "bg-white",
        card: "bg-white border border-slate-200 text-slate-900",
        muted: "text-slate-600",
        soft: "text-slate-500",
        heading: "text-slate-950",
        navScrolled:
          "bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm",
        navTop: "bg-white/85 backdrop-blur-xl border-b border-slate-100",
        buttonAlt:
          "bg-slate-100 border border-slate-200 text-slate-800 hover:bg-slate-200",
        iconWrap: "bg-slate-100",
        warnBox: "bg-orange-50 border border-orange-200",
        warnText: "text-orange-600",
        badItem: "bg-orange-50 border-l-4 border-orange-400",
      };

  const handleBackToLanding = () => {
    navigate("/");
  };

  return (
    <div
      className={`min-h-screen antialiased overflow-x-hidden transition-colors duration-300 ${theme.page}`}
    >
      <header
        className={`fixed top-0 z-50 w-full px-5 lg:px-10 py-4 transition-all duration-300 ${
          scrollY > 24 ? theme.navScrolled : theme.navTop
        }`}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={handleBackToLanding}
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity text-left"
          >
            <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center shadow-sm">
              <FaShieldAlt className="text-white text-lg" />
            </div>

            <div>
              <div
                className={`text-xl font-extrabold tracking-tight ${theme.heading}`}
              >
                AuthentiScan
              </div>
              <div className={`text-xs font-medium ${theme.soft}`}>
                Product Authentication Platform
              </div>
            </div>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleBackToLanding}
              className={`hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl font-semibold transition-all ${theme.buttonAlt}`}
            >
              <FaArrowLeft className="text-sm" />
              Back
            </button>

            <button
              onClick={() => setDarkMode((prev) => !prev)}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${theme.buttonAlt}`}
              aria-label="Toggle theme"
              type="button"
            >
              {darkMode ? (
                <FaSun className="h-5 w-5" />
              ) : (
                <FaMoon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="pt-24 lg:pt-28">
        <section className={`py-16 lg:py-20 px-5 lg:px-10 ${theme.hero}`}>
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 text-blue-500 border border-blue-500/20 text-sm font-semibold mb-6">
              <FaLock />
              Legal Terms
            </div>

            <h1
              className={`text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6 ${theme.heading}`}
            >
              Terms and Conditions
            </h1>

            <p
              className={`text-lg md:text-xl leading-relaxed max-w-3xl mx-auto ${theme.muted}`}
            >
              Please read these terms carefully before using the AuthentiScan
              platform, verification tools, and related services.
            </p>

            <p className={`mt-4 text-sm ${theme.soft}`}>
              Effective date: April 6, 2026
            </p>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-5 lg:px-10 pb-20">
          <div className="space-y-10">
            <section className={`${theme.card} rounded-3xl p-8 lg:p-12 shadow-lg`}>
              <h2
                className={`text-2xl lg:text-3xl font-black mb-6 flex items-center gap-3 ${theme.heading}`}
              >
                <FaShieldAlt className="text-blue-500 text-2xl" />
                1. Introduction
              </h2>

              <div className="space-y-6">
                <p className={`${theme.muted} leading-8 text-base md:text-lg`}>
                  Welcome to AuthentiScan ("Platform", "we", "us", or "our").
                  These Terms and Conditions ("Terms") govern your access to and
                  use of the AuthentiScan platform, including our website,
                  verification modules, dashboards, and related services
                  ("Services").
                </p>

                <p className={`${theme.muted} leading-8 text-base md:text-lg`}>
                  By registering as a Company Account, Admin Account, or
                  otherwise using our Services, you agree to be bound by these
                  Terms, our{" "}
                  <a
                    href="/privacy-policy"
                    className="text-blue-500 hover:underline font-semibold"
                  >
                    Privacy Policy
                  </a>
                  , and all applicable laws and regulations.
                </p>
              </div>
            </section>

            <section className={`${theme.card} rounded-3xl p-8 lg:p-12 shadow-lg`}>
              <h2
                className={`text-2xl lg:text-3xl font-black mb-6 flex items-center gap-3 ${theme.heading}`}
              >
                <FaBuilding className="text-emerald-500 text-2xl" />
                2. Eligibility and Account Registration
              </h2>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className={`text-xl font-bold mb-4 ${theme.heading}`}>
                    Company Accounts
                  </h3>

                  <ul className="space-y-3">
                    <li className={`${theme.muted} flex items-start gap-3`}>
                      <FaCheckCircle className="text-emerald-400 mt-1 flex-shrink-0" />
                      <span>Must represent a registered business or legal entity.</span>
                    </li>
                    <li className={`${theme.muted} flex items-start gap-3`}>
                      <FaCheckCircle className="text-emerald-400 mt-1 flex-shrink-0" />
                      <span>Requires Admin approval before full access is granted.</span>
                    </li>
                    <li className={`${theme.muted} flex items-start gap-3`}>
                      <FaCheckCircle className="text-emerald-400 mt-1 flex-shrink-0" />
                      <span>Responsible for all submitted product and batch data.</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className={`text-xl font-bold mb-4 ${theme.heading}`}>
                    Admin Accounts
                  </h3>

                  <ul className="space-y-3">
                    <li className={`${theme.muted} flex items-start gap-3`}>
                      <FaCheckCircle className="text-emerald-400 mt-1 flex-shrink-0" />
                      <span>Reserved for authorized internal personnel.</span>
                    </li>
                    <li className={`${theme.muted} flex items-start gap-3`}>
                      <FaCheckCircle className="text-emerald-400 mt-1 flex-shrink-0" />
                      <span>Can approve or reject company registration requests.</span>
                    </li>
                    <li className={`${theme.muted} flex items-start gap-3`}>
                      <FaCheckCircle className="text-emerald-400 mt-1 flex-shrink-0" />
                      <span>Can monitor verification activity and fraud indicators.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section className={`${theme.card} rounded-3xl p-8 lg:p-12 shadow-lg`}>
              <h2
                className={`text-2xl lg:text-3xl font-black mb-6 flex items-center gap-3 ${theme.heading}`}
              >
                <FaQrcode className="text-blue-500 text-2xl" />
                3. Product and Batch Verification
              </h2>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-xl font-bold mb-4 text-blue-500">
                    QR and Scratch Code Flow
                  </h3>
                  <p className={`${theme.muted} leading-8`}>
                    You agree that products and batches may use unique QR codes
                    paired with one-time scratch codes. Duplicate, suspicious,
                    or reused codes may trigger review, alerts, or restrictions.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-4 text-emerald-500">
                    Verification Data
                  </h3>
                  <p className={`${theme.muted} leading-8`}>
                    You retain ownership of your submitted business and product
                    data, while AuthentiScan may process scan events and
                    verification records to operate the platform and detect
                    misuse.
                  </p>
                </div>
              </div>

              <div className={`${theme.warnBox} rounded-2xl p-6`}>
                <h4
                  className={`font-bold text-lg mb-3 flex items-center gap-2 ${theme.warnText}`}
                >
                  <FaExclamationTriangle />
                  Data Accuracy Responsibility
                </h4>
                <p className={`${theme.muted} leading-7`}>
                  You are solely responsible for the correctness of all
                  uploaded or entered product, batch, and related business
                  information. False, misleading, or unauthorized data may lead
                  to suspension or termination.
                </p>
              </div>
            </section>

            <section className={`${theme.card} rounded-3xl p-8 lg:p-12 shadow-lg`}>
              <h2
                className={`text-2xl lg:text-3xl font-black mb-6 flex items-center gap-3 ${theme.heading}`}
              >
                <FaExclamationTriangle className="text-orange-500 text-2xl" />
                4. Prohibited Activities
              </h2>

              <ul className="grid md:grid-cols-2 gap-4">
                <li className={`${theme.badItem} ${theme.muted} flex items-start gap-3 p-4 rounded-xl`}>
                  <span className="font-bold text-orange-500 min-w-[20px]">×</span>
                  Using the platform for counterfeit, unauthorized, or deceptive verification.
                </li>

                <li className={`${theme.badItem} ${theme.muted} flex items-start gap-3 p-4 rounded-xl`}>
                  <span className="font-bold text-orange-500 min-w-[20px]">×</span>
                  Sharing login access with unauthorized persons.
                </li>

                <li className={`${theme.badItem} ${theme.muted} flex items-start gap-3 p-4 rounded-xl`}>
                  <span className="font-bold text-orange-500 min-w-[20px]">×</span>
                  Attempting to bypass approval, access, or monitoring workflows.
                </li>

                <li className={`${theme.badItem} ${theme.muted} flex items-start gap-3 p-4 rounded-xl`}>
                  <span className="font-bold text-orange-500 min-w-[20px]">×</span>
                  Scraping, automating, or abusing the platform without authorization.
                </li>
              </ul>
            </section>

            <section className={`${theme.card} rounded-3xl p-8 lg:p-12 shadow-lg`}>
              <h2
                className={`text-2xl lg:text-3xl font-black mb-6 flex items-center gap-3 ${theme.heading}`}
              >
                <FaLock className="text-purple-500 text-2xl" />
                5. Intellectual Property and Data
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className={`text-xl font-bold mb-3 ${theme.heading}`}>
                    Platform Ownership
                  </h3>
                  <p className={`${theme.muted} leading-8`}>
                    AuthentiScan retains all rights, title, and interest in the
                    platform, interface, system design, workflows, and fraud
                    detection mechanisms.
                  </p>
                </div>

                <div>
                  <h3 className={`text-xl font-bold mb-3 ${theme.heading}`}>
                    Your Data
                  </h3>
                  <p className={`${theme.muted} leading-8`}>
                    You retain ownership of your lawful product, batch, and
                    organization data, subject to the rights necessary for us to
                    operate and improve the Services.
                  </p>
                </div>

                <div>
                  <h3 className={`text-xl font-bold mb-3 ${theme.heading}`}>
                    Usage Rights
                  </h3>
                  <p className={`${theme.muted} leading-8`}>
                    You grant us a limited, non-exclusive right to host,
                    process, display, and transmit relevant data solely as
                    needed to provide the Services.
                  </p>
                </div>
              </div>
            </section>

            <section className={`${theme.card} rounded-3xl p-8 lg:p-12 shadow-lg`}>
              <h2
                className={`text-2xl lg:text-3xl font-black mb-6 flex items-center gap-3 ${theme.heading}`}
              >
                <FaExclamationTriangle className="text-red-500 text-2xl" />
                6. Termination and Suspension
              </h2>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold mb-4 text-red-500">
                    Account Suspension
                  </h3>
                  <ul className="space-y-3">
                    <li className={theme.muted}>Violation of these Terms.</li>
                    <li className={theme.muted}>Submission of inaccurate or misleading data.</li>
                    <li className={theme.muted}>Evidence of suspicious or fraudulent activity.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-4 text-emerald-500">
                    Reactivation
                  </h3>
                  <p className={`${theme.muted} leading-8`}>
                    Suspended accounts may be reviewed for reactivation after
                    the relevant issue is corrected and any required compliance
                    checks are completed.
                  </p>
                </div>
              </div>
            </section>

            <section className={`${theme.card} rounded-3xl p-8 lg:p-12 shadow-lg`}>
              <h2
                className={`text-2xl lg:text-3xl font-black mb-8 flex items-center gap-3 justify-center ${theme.heading}`}
              >
                <FaEnvelope className="text-emerald-500 text-2xl" />
                Questions About These Terms?
              </h2>

              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div className="space-y-3">
                  <div
                    className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center ${theme.iconWrap}`}
                  >
                    <FaEnvelope className="text-blue-500 text-xl" />
                  </div>
                  <h3 className={`font-bold text-xl ${theme.heading}`}>Email</h3>
                  <a
                    href="mailto:legal@authentiscan.com"
                    className="text-lg font-semibold text-blue-500 hover:underline"
                  >
                    legal@authentiscan.com
                  </a>
                </div>

                <div className="space-y-3">
                  <div
                    className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center ${theme.iconWrap}`}
                  >
                    <FaPhone className="text-emerald-500 text-xl" />
                  </div>
                  <h3 className={`font-bold text-xl ${theme.heading}`}>Phone</h3>
                  <p className="text-lg font-semibold">+91 98765 43210</p>
                </div>

                <div className="space-y-3">
                  <div
                    className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center ${theme.iconWrap}`}
                  >
                    <FaMapMarkerAlt className="text-purple-500 text-xl" />
                  </div>
                  <h3 className={`font-bold text-xl ${theme.heading}`}>Address</h3>
                  <p className="text-lg font-semibold">India Operations Center</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default TermsAndConditions;