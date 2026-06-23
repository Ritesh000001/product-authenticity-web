// import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
// import { addDoc, collection, serverTimestamp } from "firebase/firestore";
// import { db } from "../firebase/config";
// import {
//   FaShieldAlt,
//   FaQrcode,
//   FaExclamationTriangle,
//   FaStar,
//   FaPhone,
//   FaEnvelope,
//   FaMapMarkerAlt,
//   FaTwitter,
//   FaLinkedin,
//   FaGithub,
//   FaCheckCircle,
//   FaChevronDown,
//   FaMoon,
//   FaSun,
//   FaArrowRight,
//   FaBuilding,
//   FaChartLine,
//   FaGlobe,
//   FaLock,
//   FaPaperPlane,
// } from "react-icons/fa";

// const features = [
//   {
//     icon: FaQrcode,
//     title: "Instant Verification",
//     desc: "Scan and confirm product authenticity in seconds with a simple verification flow.",
//   },
//   {
//     icon: FaLock,
//     title: "One-Time Scratch Codes",
//     desc: "Unique codes prevent reuse and strengthen trust at the point of purchase.",
//   },
//   {
//     icon: FaExclamationTriangle,
//     title: "Fraud Detection Alerts",
//     desc: "Repeated scans and suspicious activity are flagged early for faster action.",
//   },
//   {
//     icon: FaChartLine,
//     title: "Operational Visibility",
//     desc: "Track product checks, duplicate scans, and field activity from one place.",
//   },
//   {
//     icon: FaBuilding,
//     title: "Brand Protection",
//     desc: "Help distributors and customers identify genuine products with confidence.",
//   },
//   {
//     icon: FaGlobe,
//     title: "Scalable Deployment",
//     desc: "Built for growing brands that need verification across regions and channels.",
//   },
// ];

// const rawStats = [
//   { label: "Products Protected", value: 50000, suffix: "+" },
//   { label: "Verification Scans", value: 2500000, suffix: "+" },
//   { label: "Fraud Detection Rate", value: 98, suffix: "%" },
//   { label: "Business Clients", value: 1200, suffix: "+" },
// ];

// const testimonials = [
//   {
//     quote:
//       "AuthentiScan helped us reduce counterfeit complaints and made verification easier for distributors.",
//     company: "MSII",
//     role: "Operations Team",
//   },
//   {
//     quote:
//       "The onboarding was simple, and customers understood the scan flow without extra support.",
//     company: "ChaiSuttaBar",
//     role: "Brand Protection",
//   },
//   {
//     quote:
//       "Duplicate scan visibility gave our team earlier warning signs than our old manual process.",
//     company: "Toyotii",
//     role: "Supply Chain",
//   },
//   {
//     quote: "It feels like a real enterprise platform, not just another QR checker.",
//     company: "N Pharma",
//     role: "Compliance Lead",
//   },
// ];

// const faqs = [
//   {
//     question: "How does product verification work?",
//     answer:
//       "Customers scan the QR code on the product and enter the scratch code to verify authenticity instantly.",
//   },
//   {
//     question: "Can a scratch code be reused?",
//     answer:
//       "No. Each scratch code is intended for one-time validation, which helps reduce counterfeit reuse.",
//   },
//   {
//     question: "Who should use this platform?",
//     answer:
//       "It is designed for manufacturers, brands, distributors, and businesses that need authentication and fraud visibility.",
//   },
//   {
//     question: "Can the system detect suspicious scans?",
//     answer:
//       "Yes. Repeated or unusual scan activity can be highlighted so your team can review potential fraud patterns quickly.",
//   },
//   {
//     question: "Is the platform suitable for mobile users?",
//     answer:
//       "Yes. The verification flow and landing experience are optimized for mobile screens and easy tapping.",
//   },
// ];

// const trustBadges = [
//   "SOC-ready workflows",
//   "QR + Scratch Validation",
//   "Duplicate Scan Monitoring",
// ];

// const logos = [
//   "NexaPharm",
//   "TrueMark",
//   "SecureChain",
//   "VeriGoods",
//   "OriginTrust",
//   "PureTrack",
// ];

// const INITIAL_FORM_DATA = {
//   name: "",
//   email: "",
//   number: "",
//   company: "",
//   gst: "",
//   companyType: "",
//   message: "",
// };

// function CountUp({ end, suffix = "", duration = 1500, start = 0 }) {
//   const [count, setCount] = useState(start);
//   const [isVisible, setIsVisible] = useState(false);
//   const elementRef = useRef(null);
//   const frameRef = useRef(null);

//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       ([entry]) => {
//         if (entry.isIntersecting) setIsVisible(true);
//       },
//       { threshold: 0.1 }
//     );

//     const currentElement = elementRef.current;
//     if (currentElement) observer.observe(currentElement);

//     return () => {
//       observer.disconnect();
//       if (frameRef.current) cancelAnimationFrame(frameRef.current);
//     };
//   }, []);

//   useEffect(() => {
//     if (!isVisible) return;

//     let startTimestamp = null;

//     const step = (timestamp) => {
//       if (!startTimestamp) startTimestamp = timestamp;
//       const progress = Math.min((timestamp - startTimestamp) / duration, 1);
//       const value = Math.floor(progress * (end - start) + start);
//       setCount(value);

//       if (progress < 1) {
//         frameRef.current = window.requestAnimationFrame(step);
//       }
//     };

//     frameRef.current = window.requestAnimationFrame(step);

//     return () => {
//       if (frameRef.current) cancelAnimationFrame(frameRef.current);
//     };
//   }, [isVisible, end, duration, start]);

//   return (
//     <span ref={elementRef}>
//       {count.toLocaleString()}
//       {suffix}
//     </span>
//   );
// }

// function Landing() {
//   const navigate = useNavigate();

//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);
//   const [scrollY, setScrollY] = useState(0);
//   const [openFaq, setOpenFaq] = useState(0);
//   const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") === "dark");
//   const [formData, setFormData] = useState(INITIAL_FORM_DATA);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   useEffect(() => {
//     localStorage.setItem("theme", darkMode ? "dark" : "light");
//   }, [darkMode]);

//   useEffect(() => {
//     if (darkMode) document.documentElement.classList.add("dark");
//     else document.documentElement.classList.remove("dark");
//   }, [darkMode]);

//   useEffect(() => {
//     const handleScroll = () => setScrollY(window.scrollY);
//     window.addEventListener("scroll", handleScroll, { passive: true });
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   const handleInputChange = useCallback((e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   }, []);

//   const handleFormSubmit = async (e) => {
//     e.preventDefault();
//     if (isSubmitting) return;

//     const payload = {
//       name: formData.name.trim(),
//       email: formData.email.trim(),
//       number: formData.number.trim(),
//       company: formData.company.trim(),
//       gst: formData.gst.trim(),
//       companyType: formData.companyType.trim(),
//       message: formData.message.trim(),
//       status: "new",
//       inquiryStatus: "New",
//       isRead: false,
//       createdAt: serverTimestamp(),
//     };

//     if (
//       !payload.name ||
//       !payload.email ||
//       !payload.number ||
//       !payload.company ||
//       !payload.companyType ||
//       !payload.message
//     ) {
//       alert("Please fill all required fields.");
//       return;
//     }

//     setIsSubmitting(true);

//     try {
//       const docRef = await addDoc(collection(db, "contactInquiries"), payload);

//       if (docRef?.id) {
//         alert("Inquiry Sent Successfully! Our team will contact you.");
//         setFormData(INITIAL_FORM_DATA);
//       } else {
//         throw new Error("Document was not created.");
//       }
//     } catch (error) {
//       console.error("Error saving inquiry:", error);

//       if (error?.code === "permission-denied") {
//         alert(
//           "Submission failed because Firestore rules are blocking public writes. Please update Firebase rules for contactInquiries."
//         );
//       } else {
//         alert("Failed to send inquiry. Please try again.");
//       }
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const navClass = useMemo(() => {
//     if (darkMode) {
//       return scrollY > 24
//         ? "bg-slate-950/95 backdrop-blur-xl border-b border-white/10 shadow-sm"
//         : "bg-slate-950/80 backdrop-blur-xl border-b border-white/5";
//     }

//     return scrollY > 24
//       ? "bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm"
//       : "bg-white/85 backdrop-blur-xl border-b border-slate-100";
//   }, [scrollY, darkMode]);

//   const theme = darkMode
//     ? {
//         page: "bg-slate-950 text-white",
//         sectionAlt: "bg-slate-900",
//         sectionSoft: "bg-slate-950",
//         card: "bg-white/5 border-white/10 text-white",
//         cardSoft: "bg-white/4 border-white/10 text-white",
//         textMuted: "text-slate-300",
//         textSoft: "text-slate-400",
//         heading: "text-white",
//         badge: "bg-white/5 border border-white/10 text-slate-200",
//         lightCard: "bg-white text-slate-900 border border-slate-200",
//         footer: "bg-[#060b16]",
//         input: "bg-white/5 border-white/10 text-white focus:ring-blue-500",
//       }
//     : {
//         page: "bg-white text-slate-900",
//         sectionAlt: "bg-slate-50",
//         sectionSoft: "bg-white",
//         card: "bg-white border-slate-200 text-slate-900",
//         cardSoft: "bg-slate-50 border-slate-200 text-slate-900",
//         textMuted: "text-slate-600",
//         textSoft: "text-slate-500",
//         heading: "text-slate-950",
//         badge: "bg-slate-100 border border-slate-200 text-slate-700",
//         lightCard: "bg-white text-slate-900 border border-slate-200",
//         footer: "bg-slate-950",
//         input: "bg-white border-slate-300 text-slate-900 focus:ring-blue-600",
//       };

//   const closeAllMenus = useCallback(() => {
//     setLoginDropdownOpen(false);
//     setMobileMenuOpen(false);
//   }, []);

//   const handleCompanyLogin = useCallback(() => {
//     closeAllMenus();
//     navigate("/logincompany");
//   }, [closeAllMenus, navigate]);

//   const handleAdminLogin = useCallback(() => {
//     closeAllMenus();
//     navigate("/loginadmin");
//   }, [closeAllMenus, navigate]);

//   const handleSignup = useCallback(() => {
//     closeAllMenus();
//     navigate("/signup");
//   }, [closeAllMenus, navigate]);

//   const handleTermsAndConditions = useCallback(() => {
//     closeAllMenus();
//     navigate("/terms-and-conditions");
//   }, [closeAllMenus, navigate]);

//   const navLinks = [
//     { href: "#about", label: "About" },
//     { href: "#features", label: "Features" },
//     { href: "#proof", label: "Proof" },
//     { href: "#faq", label: "FAQ" },
//     { href: "#contact", label: "Contact" },
//   ];

//   return (
//     <div className={`min-h-screen antialiased overflow-x-hidden transition-colors duration-300 ${theme.page}`}>
//       <nav className={`fixed top-0 z-50 w-full px-5 lg:px-10 py-4 transition-all duration-300 ${navClass}`}>
//         <div className="max-w-7xl mx-auto flex items-center justify-between">
//           <a href="#" className="flex items-center gap-3">
//             <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center shadow-sm">
//               <FaShieldAlt className="text-white text-lg" />
//             </div>
//             <div>
//               <div className={`text-xl lg:text-2xl font-extrabold tracking-tight ${theme.heading}`}>
//                 AuthentiScan
//               </div>
//               <div className={`text-xs font-medium -mt-0.5 ${theme.textSoft}`}>
//                 Product Authentication Platform
//               </div>
//             </div>
//           </a>

//           <div className="hidden lg:flex items-center gap-7">
//             {navLinks.map((item) => (
//               <a
//                 key={item.label}
//                 href={item.href}
//                 className={`text-[15px] font-semibold transition-colors ${
//                   darkMode ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-950"
//                 }`}
//               >
//                 {item.label}
//               </a>
//             ))}

//             <button
//               onClick={() => setDarkMode((prev) => !prev)}
//               className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
//                 darkMode
//                   ? "bg-white/5 border border-white/10 text-white hover:bg-white/10"
//                   : "bg-slate-100 border border-slate-200 text-slate-800 hover:bg-slate-200"
//               }`}
//               aria-label="Toggle theme"
//             >
//               {darkMode ? <FaSun /> : <FaMoon />}
//             </button>

//             <div className="relative">
//               <button
//                 onClick={() => setLoginDropdownOpen((prev) => !prev)}
//                 className={`px-5 py-2.5 rounded-2xl font-semibold transition-all flex items-center gap-2 ${
//                   darkMode
//                     ? "border border-white/10 text-white hover:bg-white/5"
//                     : "border border-slate-300 text-slate-800 hover:bg-slate-50"
//                 }`}
//               >
//                 Login
//                 <FaChevronDown
//                   className={`text-xs transition-transform duration-200 ${loginDropdownOpen ? "rotate-180" : ""}`}
//                 />
//               </button>

//               {loginDropdownOpen && (
//                 <div
//                   className={`absolute right-0 mt-3 w-60 rounded-2xl overflow-hidden shadow-xl ${
//                     darkMode ? "border border-white/10 bg-slate-900" : "border border-slate-200 bg-white"
//                   }`}
//                 >
//                   <button
//                     onClick={handleCompanyLogin}
//                     className={`w-full text-left px-5 py-3.5 text-sm font-semibold transition-colors ${
//                       darkMode ? "text-slate-200 hover:bg-white/5" : "text-slate-700 hover:bg-slate-50"
//                     }`}
//                   >
//                     Company Login
//                   </button>
//                   <button
//                     onClick={handleAdminLogin}
//                     className={`w-full text-left px-5 py-3.5 text-sm font-semibold border-t transition-colors ${
//                       darkMode
//                         ? "text-slate-200 hover:bg-white/5 border-white/10"
//                         : "text-slate-700 hover:bg-slate-50 border-slate-100"
//                     }`}
//                   >
//                     Admin Login
//                   </button>
//                 </div>
//               )}
//             </div>

//             <button
//               onClick={handleSignup}
//               className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-600/20 transition-all"
//             >
//               SignUp Here
//             </button>
//           </div>

//           <div className="lg:hidden flex items-center gap-2">
//             <button
//               onClick={() => setDarkMode((prev) => !prev)}
//               className={`w-10 h-10 rounded-xl flex items-center justify-center ${
//                 darkMode
//                   ? "bg-white/5 border border-white/10 text-white"
//                   : "bg-slate-100 border border-slate-200 text-slate-800"
//               }`}
//               aria-label="Toggle theme"
//             >
//               {darkMode ? <FaSun /> : <FaMoon />}
//             </button>

//             <button
//               onClick={() => setMobileMenuOpen((prev) => !prev)}
//               className={`p-2 rounded-xl transition-all ${
//                 darkMode ? "hover:bg-white/5 text-white" : "hover:bg-slate-100 text-slate-900"
//               }`}
//               aria-label="Toggle menu"
//             >
//               <svg
//                 className={`w-7 h-7 transition-transform duration-300 ${mobileMenuOpen ? "rotate-90" : ""}`}
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
//               </svg>
//             </button>
//           </div>
//         </div>

//         {mobileMenuOpen && (
//           <div className={`lg:hidden mt-4 max-w-7xl mx-auto pt-4 ${darkMode ? "border-t border-white/10" : "border-t border-slate-200"}`}>
//             <div className="flex flex-col gap-2">
//               {navLinks.map((item) => (
//                 <a
//                   key={item.label}
//                   href={item.href}
//                   onClick={() => setMobileMenuOpen(false)}
//                   className={`px-4 py-3 rounded-xl font-semibold transition-all ${
//                     darkMode ? "text-slate-200 hover:bg-white/5" : "text-slate-700 hover:bg-slate-50"
//                   }`}
//                 >
//                   {item.label}
//                 </a>
//               ))}
//               <button
//                 onClick={handleCompanyLogin}
//                 className="w-full px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all text-left"
//               >
//                 Company Login
//               </button>
//               <button
//                 onClick={handleAdminLogin}
//                 className={`w-full px-4 py-3 rounded-xl font-bold transition-all text-left ${
//                   darkMode
//                     ? "bg-white/5 hover:bg-white/10 border border-white/10 text-white"
//                     : "bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-900"
//                 }`}
//               >
//                 Admin Login
//               </button>
//               <button
//                 onClick={handleSignup}
//                 className="w-full px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all text-left"
//               >
//                 Start Free Trial
//               </button>
//             </div>
//           </div>
//         )}
//       </nav>

//       <section className={`relative pt-32 lg:pt-36 pb-20 lg:pb-24 px-5 lg:px-10 overflow-hidden ${darkMode ? "bg-slate-950" : "bg-white"}`}>
//         <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.10),transparent_28%)]" />
//         <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
//           <div>
//             <div className={`inline-flex flex-wrap items-center gap-2 rounded-full px-4 py-2 text-sm mb-6 ${theme.badge}`}>
//               <span className="w-2 h-2 rounded-full bg-emerald-400" />
//               Trusted authentication for manufacturers and regulated brands
//             </div>

//             <h1 className={`text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight leading-[1.05] max-w-2xl ${theme.heading}`}>
//               Protect every product with smart verification and fraud visibility
//             </h1>

//             <p className={`mt-5 text-[15px] md:text-base leading-7 max-w-md ${theme.textMuted}`}>
//               Verify products using QR and scratch-code validation.
//             </p>
//             <p className={`mt-1 text-[15px] md:text-base leading-7 max-w-md ${theme.textMuted}`}>
//               Detect duplicate scans early and give customers a faster, clearer trust experience.
//             </p>

//             <div className="mt-8 flex flex-col sm:flex-row gap-3">
//               <button
//                 onClick={handleCompanyLogin}
//                 className="px-6 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base transition-all flex items-center justify-center gap-2"
//               >
//                 Company Login
//                 <FaArrowRight className="text-sm" />
//               </button>
//               <button
//                 onClick={handleAdminLogin}
//                 className={`px-6 py-4 rounded-2xl font-bold text-base transition-all ${
//                   darkMode
//                     ? "bg-white/5 hover:bg-white/10 border border-white/10 text-white"
//                     : "bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-900"
//                 }`}
//               >
//                 Admin Login
//               </button>
//               <button
//                 onClick={handleSignup}
//                 className="px-6 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-600/20 transition-all"
//               >
//                 Start Free Trial
//               </button>
//             </div>

//             <div className="mt-6 flex flex-wrap gap-3">
//               {trustBadges.map((badge) => (
//                 <div key={badge} className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-sm ${theme.badge}`}>
//                   <FaCheckCircle className="text-emerald-400" />
//                   {badge}
//                 </div>
//               ))}
//             </div>
//           </div>

//           <div className="relative">
//             <div className={`rounded-[28px] p-5 md:p-6 shadow-2xl ${darkMode ? "border border-white/10 bg-white/5 backdrop-blur-xl" : "border border-slate-200 bg-slate-50"}`}>
//               <div className={`rounded-[24px] p-6 md:p-8 ${darkMode ? "bg-slate-900 border border-white/10" : "bg-white border border-slate-200"}`}>
//                 <div className="flex items-start justify-between gap-4 mb-8">
//                   <div>
//                     <p className={`text-xs uppercase tracking-[0.18em] font-semibold ${theme.textSoft}`}>Live Verification Preview</p>
//                     <h3 className={`mt-2 text-2xl font-bold ${theme.heading}`}>Authentication Result</h3>
//                   </div>
//                   <div className={`px-3 py-2 rounded-xl font-bold text-sm border ${
//                     darkMode
//                       ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
//                       : "bg-emerald-50 text-emerald-700 border-emerald-200"
//                   }`}>
//                     Genuine
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-[110px,1fr] gap-5 items-center">
//                   <div className="w-[110px] h-[110px] rounded-2xl bg-white p-3 shadow-lg">
//                     <div className="w-full h-full rounded-xl border-2 border-dashed border-slate-900 flex items-center justify-center">
//                       <FaQrcode className="text-[52px] text-slate-900" />
//                     </div>
//                   </div>

//                   <div className="space-y-4">
//                     <div className={`rounded-2xl p-4 ${darkMode ? "bg-slate-800/70 border border-white/5" : "bg-slate-50 border border-slate-200"}`}>
//                       <p className={`text-xs uppercase tracking-[0.18em] mb-2 ${theme.textSoft}`}>Product ID</p>
//                       <p className={`text-lg font-mono ${theme.heading}`}>ABC123XYZ</p>
//                     </div>
//                     <div className={`rounded-2xl p-4 ${darkMode ? "bg-slate-800/70 border border-white/5" : "bg-slate-50 border border-slate-200"}`}>
//                       <p className={`text-xs uppercase tracking-[0.18em] mb-2 ${theme.textSoft}`}>Scratch Code Status</p>
//                       <p className={`text-lg font-semibold ${theme.heading}`}>Validated successfully</p>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="mt-8 grid sm:grid-cols-3 gap-4">
//                   <div className={`rounded-2xl p-4 ${darkMode ? "border border-white/5 bg-slate-800/50" : "border border-slate-200 bg-slate-50"}`}>
//                     <p className={`text-sm ${theme.textSoft}`}>First-time scan</p>
//                     <p className={`mt-1 text-xl font-bold ${theme.heading}`}>Yes</p>
//                   </div>
//                   <div className={`rounded-2xl p-4 ${darkMode ? "border border-white/5 bg-slate-800/50" : "border border-slate-200 bg-slate-50"}`}>
//                     <p className={`text-sm ${theme.textSoft}`}>Risk level</p>
//                     <p className="mt-1 text-xl font-bold text-emerald-500">Low</p>
//                   </div>
//                   <div className={`rounded-2xl p-4 ${darkMode ? "border border-white/5 bg-slate-800/50" : "border border-slate-200 bg-slate-50"}`}>
//                     <p className={`text-sm ${theme.textSoft}`}>Verification time</p>
//                     <p className={`mt-1 text-xl font-bold ${theme.heading}`}>2.1 sec</p>
//                   </div>
//                 </div>

//                 <div className="mt-5 grid grid-cols-3 gap-3">
//                   <div className={`rounded-2xl p-4 shadow-sm ${theme.lightCard}`}>
//                     <p className="text-sm text-slate-500">Duplicate scans</p>
//                     <p className="mt-2 text-xl font-black text-slate-950">-42%</p>
//                   </div>
//                   <div className={`rounded-2xl p-4 shadow-sm ${theme.lightCard}`}>
//                     <p className="text-sm text-slate-500">Faster checks</p>
//                     <p className="mt-2 text-xl font-black text-slate-950">3x</p>
//                   </div>
//                   <div className={`rounded-2xl p-4 shadow-sm ${theme.lightCard}`}>
//                     <p className="text-sm text-slate-500">Trust uplift</p>
//                     <p className="mt-2 text-xl font-black text-slate-950">High</p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       <section className={`py-8 px-5 lg:px-10 border-y ${darkMode ? "bg-slate-900 border-white/10" : "bg-slate-50 border-slate-200"}`}>
//         <div className="max-w-7xl mx-auto">
//           <p className={`text-sm font-semibold uppercase tracking-[0.16em] mb-5 text-center ${theme.textSoft}`}>
//             Trusted by product-focused teams
//           </p>
//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
//             {logos.map((logo) => (
//               <div
//                 key={logo}
//                 className={`rounded-2xl py-4 px-3 text-center font-bold tracking-wide ${
//                   darkMode ? "bg-white/5 border border-white/10 text-slate-200" : "bg-white border border-slate-200 text-slate-700"
//                 }`}
//               >
//                 {logo}
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       <section id="proof" className={`py-18 lg:py-24 px-5 lg:px-10 ${darkMode ? "bg-slate-950" : "bg-white"}`}>
//         <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-5">
//           {rawStats.map((stat) => (
//             <div
//               key={stat.label}
//               className={`rounded-3xl shadow-sm p-6 lg:p-8 ${
//                 darkMode ? "bg-white/5 border border-white/10" : "bg-slate-50 border border-slate-200"
//               }`}
//             >
//               <p className={`text-3xl lg:text-4xl font-black ${theme.heading}`}>
//                 <CountUp end={stat.value} suffix={stat.suffix} />
//               </p>
//               <p className={`mt-2 text-sm lg:text-base font-medium ${theme.textMuted}`}>{stat.label}</p>
//             </div>
//           ))}
//         </div>
//       </section>

//       <section id="about" className={`py-20 lg:py-24 px-5 lg:px-10 ${theme.sectionAlt}`}>
//         <div className="max-w-3xl mx-auto text-center">
//           <div className={`inline-flex px-4 py-2 rounded-full text-sm font-bold mb-5 ${
//             darkMode ? "bg-blue-500/10 text-blue-300 border border-blue-500/20" : "bg-blue-50 text-blue-700 border border-blue-100"
//           }`}>
//             About AuthentiScan
//           </div>
//           <h2 className={`text-3xl md:text-4xl lg:text-5xl font-black tracking-tight ${theme.heading}`}>
//             Authentication infrastructure built for trust
//           </h2>
//           <p className={`mt-5 text-base md:text-lg leading-7 ${theme.textMuted}`}>
//             AuthentiScan combines dual verification, fraud visibility, and practical workflows so teams can protect products without making the customer experience harder.
//           </p>
//         </div>
//       </section>

//       <section id="features" className={`py-20 lg:py-24 px-5 lg:px-10 ${darkMode ? "bg-slate-900" : "bg-slate-50"}`}>
//         <div className="max-w-7xl mx-auto">
//           <div className="max-w-3xl mb-12">
//             <div className={`inline-flex px-4 py-2 rounded-full text-sm font-bold mb-5 ${
//               darkMode ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20" : "bg-emerald-50 text-emerald-700 border border-emerald-100"
//             }`}>
//               Core Features
//             </div>
//             <h2 className={`text-3xl md:text-4xl lg:text-5xl font-black tracking-tight ${theme.heading}`}>
//               Built for verification, monitoring, and scale
//             </h2>
//             <p className={`mt-4 text-base md:text-lg leading-7 max-w-2xl ${theme.textMuted}`}>
//               Clear features, simple workflows, and stronger anti-counterfeit protection.
//             </p>
//           </div>

//           <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
//             {features.map((feature) => {
//               const Icon = feature.icon;
//               return (
//                 <div
//                   key={feature.title}
//                   className={`rounded-[28px] shadow-sm p-7 lg:p-8 transition-all ${
//                     darkMode ? "bg-white/5 border border-white/10 hover:bg-white/[0.07]" : "bg-white border border-slate-200 hover:shadow-lg"
//                   }`}
//                 >
//                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${
//                     darkMode ? "bg-white/5 border border-white/10" : "bg-slate-950"
//                   }`}>
//                     <Icon className={`${darkMode ? "text-blue-300" : "text-blue-400"} text-xl`} />
//                   </div>
//                   <h3 className={`text-xl md:text-2xl font-black mb-3 ${theme.heading}`}>{feature.title}</h3>
//                   <p className={`text-base leading-7 ${theme.textMuted}`}>{feature.desc}</p>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </section>

//       <section className={`py-20 lg:py-24 px-5 lg:px-10 ${theme.sectionSoft}`}>
//         <div className="max-w-7xl mx-auto">
//           <div className="max-w-3xl mb-12">
//             <div className={`inline-flex px-4 py-2 rounded-full text-sm font-bold mb-5 ${theme.badge}`}>
//               Customer Perspective
//             </div>
//             <h2 className={`text-3xl md:text-4xl lg:text-5xl font-black tracking-tight ${theme.heading}`}>
//               Teams trust it because the workflow is clear
//             </h2>
//           </div>

//           <div className="grid lg:grid-cols-2 gap-6">
//             {testimonials.map((item) => (
//               <div
//                 key={item.company}
//                 className={`rounded-[28px] p-7 lg:p-8 ${
//                   darkMode ? "border border-white/10 bg-white/5" : "border border-slate-200 bg-slate-50"
//                 }`}
//               >
//                 <div className="flex items-center gap-1 mb-5">
//                   {[...Array(5)].map((_, i) => (
//                     <FaStar key={i} className="text-amber-400 text-lg" />
//                   ))}
//                 </div>
//                 <p className={`text-lg md:text-xl leading-8 italic ${theme.textMuted}`}>{item.quote}</p>
//                 <div className="mt-6">
//                   <p className={`text-lg font-black ${theme.heading}`}>{item.company}</p>
//                   <p className={`text-sm font-medium ${theme.textSoft}`}>{item.role}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       <section id="faq" className={`py-20 lg:py-24 px-5 lg:px-10 ${darkMode ? "bg-slate-900" : "bg-slate-50"}`}>
//         <div className="max-w-4xl mx-auto">
//           <div className="text-center mb-10">
//             <div className={`inline-flex px-4 py-2 rounded-full text-sm font-bold mb-5 ${theme.badge}`}>FAQ</div>
//             <h2 className={`text-3xl md:text-4xl lg:text-5xl font-black tracking-tight ${theme.heading}`}>
//               Frequently asked questions
//             </h2>
//           </div>

//           <div className="space-y-4">
//             {faqs.map((faq, index) => {
//               const isOpen = openFaq === index;
//               return (
//                 <div
//                   key={faq.question}
//                   className={`rounded-3xl overflow-hidden ${
//                     darkMode ? "border border-white/10 bg-white/5" : "border border-slate-200 bg-white"
//                   }`}
//                 >
//                   <button
//                     onClick={() => setOpenFaq(isOpen ? -1 : index)}
//                     className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
//                   >
//                     <span className={`text-lg font-bold ${theme.heading}`}>{faq.question}</span>
//                     <FaChevronDown className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""} ${theme.textSoft}`} />
//                   </button>

//                   {isOpen && (
//                     <div className="px-6 pb-6">
//                       <p className={`text-base leading-7 ${theme.textMuted}`}>{faq.answer}</p>
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </section>

//       <section id="contact" className={`py-20 lg:py-24 px-5 lg:px-10 ${darkMode ? "bg-slate-950" : "bg-white"}`}>
//         <div className="max-w-6xl mx-auto">
//           <div className="text-center mb-16">
//             <div className={`inline-flex px-4 py-2 rounded-full text-sm font-bold mb-5 ${theme.badge}`}>Contact</div>
//             <h2 className={`text-3xl md:text-4xl lg:text-5xl font-black tracking-tight ${theme.heading}`}>
//               Ready to protect your products at scale?
//             </h2>
//             <p className={`mt-5 text-base md:text-lg leading-7 max-w-2xl mx-auto ${theme.textMuted}`}>
//               Start a trial, talk to the team, or sign in to manage authentication workflows.
//             </p>
//           </div>

//           <div className="grid lg:grid-cols-2 gap-10">
//             <div className="space-y-5">
//               <div className={`rounded-[28px] p-6 flex items-center gap-5 ${
//                 darkMode ? "bg-white/5 border border-white/10" : "bg-slate-50 border border-slate-200"
//               }`}>
//                 <div className="w-14 h-14 rounded-2xl bg-blue-600/10 flex items-center justify-center">
//                   <FaEnvelope className="text-blue-500 text-xl" />
//                 </div>
//                 <div>
//                   <h3 className={`text-xl font-black ${theme.heading}`}>Email Us</h3>
//                   <p className={theme.textMuted}>support@authentiscan.com</p>
//                 </div>
//               </div>

//               <div className={`rounded-[28px] p-6 flex items-center gap-5 ${
//                 darkMode ? "bg-white/5 border border-white/10" : "bg-slate-50 border border-slate-200"
//               }`}>
//                 <div className="w-14 h-14 rounded-2xl bg-emerald-600/10 flex items-center justify-center">
//                   <FaPhone className="text-emerald-500 text-xl" />
//                 </div>
//                 <div>
//                   <h3 className={`text-xl font-black ${theme.heading}`}>Call Us</h3>
//                   <p className={theme.textMuted}>+91 9876543210</p>
//                 </div>
//               </div>

//               <div className={`rounded-[28px] p-6 flex items-center gap-5 ${
//                 darkMode ? "bg-white/5 border border-white/10" : "bg-slate-50 border border-slate-200"
//               }`}>
//                 <div className="w-14 h-14 rounded-2xl bg-purple-600/10 flex items-center justify-center">
//                   <FaMapMarkerAlt className="text-purple-500 text-xl" />
//                 </div>
//                 <div>
//                   <h3 className={`text-xl font-black ${theme.heading}`}>Location</h3>
//                   <p className={theme.textMuted}>India Operations</p>
//                 </div>
//               </div>
//             </div>

//             <div className={`rounded-[32px] p-8 shadow-xl ${
//               darkMode ? "bg-white/5 border border-white/10" : "bg-slate-50 border border-slate-200"
//             }`}>
//               <form onSubmit={handleFormSubmit} className="space-y-5">
//                 <div className="grid md:grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <label className="text-sm font-bold ml-1 opacity-70">Name</label>
//                     <input
//                       required
//                       name="name"
//                       className={`w-full px-5 py-3 rounded-xl outline-none border transition-all ${theme.input}`}
//                       placeholder="Your name"
//                       value={formData.name}
//                       onChange={handleInputChange}
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <label className="text-sm font-bold ml-1 opacity-70">Email</label>
//                     <input
//                       required
//                       type="email"
//                       name="email"
//                       className={`w-full px-5 py-3 rounded-xl outline-none border transition-all ${theme.input}`}
//                       placeholder="work@email.com"
//                       value={formData.email}
//                       onChange={handleInputChange}
//                     />
//                   </div>
//                 </div>

//                 <div className="grid md:grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <label className="text-sm font-bold ml-1 opacity-70">Number</label>
//                     <input
//                       required
//                       type="tel"
//                       name="number"
//                       className={`w-full px-5 py-3 rounded-xl outline-none border transition-all ${theme.input}`}
//                       placeholder="+91 9876543210"
//                       value={formData.number}
//                       onChange={handleInputChange}
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <label className="text-sm font-bold ml-1 opacity-70">Company Type</label>
//                     <select
//                       required
//                       name="companyType"
//                       className={`w-full px-5 py-3 rounded-xl outline-none border transition-all ${theme.input}`}
//                       value={formData.companyType}
//                       onChange={handleInputChange}
//                     >
//                       <option value="">Select company type</option>
//                       <option value="manufacturer">Manufacturer</option>
//                       <option value="distributor">Distributor</option>
//                       <option value="retailer">Retailer</option>
//                       <option value="wholesaler">Wholesaler</option>
//                       <option value="exporter">Exporter</option>
//                       <option value="other">Other</option>
//                     </select>
//                   </div>
//                 </div>

//                 <div className="grid md:grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <label className="text-sm font-bold ml-1 opacity-70">Company</label>
//                     <input
//                       required
//                       name="company"
//                       className={`w-full px-5 py-3 rounded-xl outline-none border transition-all ${theme.input}`}
//                       placeholder="Company name"
//                       value={formData.company}
//                       onChange={handleInputChange}
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <label className="text-sm font-bold ml-1 opacity-70">GST</label>
//                     <input
//                       name="gst"
//                       className={`w-full px-5 py-3 rounded-xl outline-none border transition-all ${theme.input}`}
//                       placeholder="Enter GST number"
//                       value={formData.gst}
//                       onChange={handleInputChange}
//                     />
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <label className="text-sm font-bold ml-1 opacity-70">Message</label>
//                   <textarea
//                     required
//                     rows={4}
//                     name="message"
//                     className={`w-full px-5 py-3 rounded-xl outline-none border transition-all resize-none ${theme.input}`}
//                     placeholder="Tell us about your requirements..."
//                     value={formData.message}
//                     onChange={handleInputChange}
//                   />
//                 </div>

//                 <button
//                   type="submit"
//                   disabled={isSubmitting}
//                   className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed"
//                 >
//                   {isSubmitting ? "Sending..." : "Send Inquiry"}
//                   <FaPaperPlane className="text-xs" />
//                 </button>
//               </form>
//             </div>
//           </div>
//         </div>
//       </section>

//       <footer className={`px-5 lg:px-10 pt-14 pb-10 ${theme.footer}`}>
//         <div className="max-w-7xl mx-auto grid lg:grid-cols-4 gap-10">
//           <div className="lg:col-span-2">
//             <div className="flex items-center gap-3">
//               <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center shadow-sm">
//                 <FaShieldAlt className="text-white text-lg" />
//               </div>
//               <div>
//                 <div className="text-xl font-extrabold tracking-tight text-white">AuthentiScan</div>
//                 <div className="text-xs text-slate-400">Product Authentication Platform</div>
//               </div>
//             </div>
//             <p className="mt-5 max-w-xl text-slate-400 leading-7">
//               Built to help brands verify genuine products, reduce counterfeit risk, and create a cleaner trust experience.
//             </p>
//           </div>

//           <div>
//             <h3 className="text-white font-bold text-lg mb-4">Quick Links</h3>
//             <div className="space-y-3">
//               {navLinks.map((item) => (
//                 <a key={item.label} href={item.href} className="block text-slate-400 hover:text-white transition-colors">
//                   {item.label}
//                 </a>
//               ))}
//               <button
//                 onClick={handleTermsAndConditions}
//                 className="block text-slate-400 hover:text-white transition-colors text-left"
//               >
//                 Terms & Conditions
//               </button>
//             </div>
//           </div>

//           <div>
//             <h3 className="text-white font-bold text-lg mb-4">Follow</h3>
//             <div className="flex gap-3">
//               <a href="#" className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-all">
//                 <FaTwitter />
//               </a>
//               <a href="#" className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-all">
//                 <FaLinkedin />
//               </a>
//               <a href="#" className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-all">
//                 <FaGithub />
//               </a>
//             </div>
//           </div>
//         </div>

//         <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
//           <p className="text-slate-500 text-sm">© 2026 AuthentiScan. All rights reserved.</p>
//           <p className="text-slate-500 text-sm">Secure authentication for modern product ecosystems.</p>
//         </div>
//       </footer>
//     </div>
//   );
// }

// export default Landing;





import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import {
  FaShieldAlt,
  FaQrcode,
  FaExclamationTriangle,
  FaStar,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaTwitter,
  FaLinkedin,
  FaGithub,
  FaCheckCircle,
  FaChevronDown,
  FaMoon,
  FaSun,
  FaArrowRight,
  FaBuilding,
  FaChartLine,
  FaGlobe,
  FaLock,
  FaPaperPlane,
} from "react-icons/fa";

const features = [
  {
    icon: FaQrcode,
    title: "Instant Verification",
    desc: "Scan and confirm product authenticity in seconds with a simple verification flow.",
  },
  {
    icon: FaLock,
    title: "One-Time Scratch Codes",
    desc: "Unique codes prevent reuse and strengthen trust at the point of purchase.",
  },
  {
    icon: FaExclamationTriangle,
    title: "Fraud Detection Alerts",
    desc: "Repeated scans and suspicious activity are flagged early for faster action.",
  },
  {
    icon: FaChartLine,
    title: "Operational Visibility",
    desc: "Track product checks, duplicate scans, and field activity from one place.",
  },
  {
    icon: FaBuilding,
    title: "Brand Protection",
    desc: "Help distributors and customers identify genuine products with confidence.",
  },
  {
    icon: FaGlobe,
    title: "Scalable Deployment",
    desc: "Built for growing brands that need verification across regions and channels.",
  },
];

const rawStats = [
  { label: "Products Protected", value: 50000, suffix: "+" },
  { label: "Verification Scans", value: 2500000, suffix: "+" },
  { label: "Fraud Detection Rate", value: 98, suffix: "%" },
  { label: "Business Clients", value: 1200, suffix: "+" },
];

const testimonials = [
  {
    quote: "AuthentiScan helped us reduce counterfeit complaints and made verification easier for distributors.",
    company: "MSII",
    role: "Operations Team",
  },
  {
    quote: "The onboarding was simple, and customers understood the scan flow without extra support.",
    company: "ChaiSuttaBar",
    role: "Brand Protection",
  },
  {
    quote: "Duplicate scan visibility gave our team earlier warning signs than our old manual process.",
    company: "Toyotii",
    role: "Supply Chain",
  },
  {
    quote: "It feels like a real enterprise platform, not just another QR checker.",
    company: "N Pharma",
    role: "Compliance Lead",
  },
];

const faqs = [
  {
    question: "How does product verification work?",
    answer: "Customers scan the QR code on the product and enter the scratch code to verify authenticity instantly.",
  },
  {
    question: "Can a scratch code be reused?",
    answer: "No. Each scratch code is intended for one-time validation, which helps reduce counterfeit reuse.",
  },
  {
    question: "Who should use this platform?",
    answer: "It is designed for manufacturers, brands, distributors, and businesses that need authentication and fraud visibility.",
  },
  {
    question: "Can the system detect suspicious scans?",
    answer: "Yes. Repeated or unusual scan activity can be highlighted so your team can review potential fraud patterns quickly.",
  },
  {
    question: "Is the platform suitable for mobile users?",
    answer: "Yes. The verification flow and landing experience are optimized for mobile screens and easy tapping.",
  },
];

const trustBadges = [
  "SOC-ready workflows",
  "QR + Scratch Validation",
  "Duplicate Scan Monitoring",
];

const logos = [
  "NexaPharm",
  "TrueMark",
  "SecureChain",
  "VeriGoods",
  "OriginTrust",
  "PureTrack",
];

const INITIAL_FORM_DATA = {
  name: "",
  email: "",
  number: "",
  company: "",
  gst: "",
  companyType: "",
  message: "",
};

function CountUp({ end, suffix = "", duration = 1500, start = 0 }) {
  const [count, setCount] = useState(start);
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );

    const currentElement = elementRef.current;
    if (currentElement) observer.observe(currentElement);

    return () => {
      observer.disconnect();
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTimestamp = null;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const value = Math.floor(progress * (end - start) + start);
      setCount(value);

      if (progress < 1) {
        frameRef.current = window.requestAnimationFrame(step);
      }
    };

    frameRef.current = window.requestAnimationFrame(step);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [isVisible, end, duration, start]);

  return (
    <span ref={elementRef}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

function Landing() {
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      number: formData.number.trim(),
      company: formData.company.trim(),
      gst: formData.gst.trim(),
      companyType: formData.companyType.trim(),
      message: formData.message.trim(),
    };

    if (
      !payload.name ||
      !payload.email ||
      !payload.number ||
      !payload.company ||
      !payload.companyType ||
      !payload.message
    ) {
      alert("Please fill all required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Logic fix: Ensure fields match the 'inquiryList' logic in Admin.js
      const docRef = await addDoc(collection(db, "contactInquiries"), {
        ...payload,
        isRead: false,
        inquiryStatus: "New",
        createdAt: serverTimestamp(),
      });

      if (docRef?.id) {
        alert("Inquiry Sent Successfully! Our team will contact you.");
        setFormData(INITIAL_FORM_DATA);
      } else {
        throw new Error("Document was not created.");
      }
    } catch (error) {
      console.error("Error saving inquiry:", error);

      if (error?.code === "permission-denied") {
        alert("Submission failed because Firestore rules are blocking public writes. Please update Firebase rules for contactInquiries.");
      } else {
        alert("Failed to send inquiry. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const navClass = useMemo(() => {
    if (darkMode) {
      return scrollY > 24
        ? "bg-slate-950/95 backdrop-blur-xl border-b border-white/10 shadow-sm"
        : "bg-slate-950/80 backdrop-blur-xl border-b border-white/5";
    }

    return scrollY > 24
      ? "bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm"
      : "bg-white/85 backdrop-blur-xl border-b border-slate-100";
  }, [scrollY, darkMode]);

  const theme = darkMode
    ? {
        page: "bg-slate-950 text-white",
        sectionAlt: "bg-slate-900",
        sectionSoft: "bg-slate-950",
        card: "bg-white/5 border-white/10 text-white",
        cardSoft: "bg-white/4 border-white/10 text-white",
        textMuted: "text-slate-300",
        textSoft: "text-slate-400",
        heading: "text-white",
        badge: "bg-white/5 border border-white/10 text-slate-200",
        lightCard: "bg-white text-slate-900 border border-slate-200",
        footer: "bg-[#060b16]",
        input: "bg-white/5 border-white/10 text-white focus:ring-blue-500",
      }
    : {
        page: "bg-white text-slate-900",
        sectionAlt: "bg-slate-50",
        sectionSoft: "bg-white",
        card: "bg-white border-slate-200 text-slate-900",
        cardSoft: "bg-slate-50 border-slate-200 text-slate-900",
        textMuted: "text-slate-600",
        textSoft: "text-slate-500",
        heading: "text-slate-950",
        badge: "bg-slate-100 border border-slate-200 text-slate-700",
        lightCard: "bg-white text-slate-900 border border-slate-200",
        footer: "bg-slate-950",
        input: "bg-white border-slate-300 text-slate-900 focus:ring-blue-600",
      };

  const closeAllMenus = useCallback(() => {
    setLoginDropdownOpen(false);
    setMobileMenuOpen(false);
  }, []);

  const handleCompanyLogin = useCallback(() => {
    closeAllMenus();
    navigate("/login/company");
  }, [closeAllMenus, navigate]);

  const handleAdminLogin = useCallback(() => {
    closeAllMenus();
    navigate("/login/admin");
  }, [closeAllMenus, navigate]);

  const handleSignup = useCallback(() => {
    closeAllMenus();
    navigate("/signup");
  }, [closeAllMenus, navigate]);

  const handleTermsAndConditions = useCallback(() => {
    closeAllMenus();
    navigate("/terms-and-conditions");
  }, [closeAllMenus, navigate]);

  const navLinks = [
    { href: "#about", label: "About" },
    { href: "#features", label: "Features" },
    { href: "#proof", label: "Proof" },
    { href: "#faq", label: "FAQ" },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <div className={`min-h-screen antialiased overflow-x-hidden transition-colors duration-300 ${theme.page}`}>
      <nav className={`fixed top-0 z-50 w-full px-5 lg:px-10 py-4 transition-all duration-300 ${navClass}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="#" className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center shadow-sm">
              <FaShieldAlt className="text-white text-lg" />
            </div>
            <div>
              <div className={`text-xl lg:text-2xl font-extrabold tracking-tight ${theme.heading}`}>
                AuthentiScan
              </div>
              <div className={`text-xs font-medium -mt-0.5 ${theme.textSoft}`}>
                Product Authentication Platform
              </div>
            </div>
          </a>

          <div className="hidden lg:flex items-center gap-7">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`text-[15px] font-semibold transition-colors ${
                  darkMode ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-950"
                }`}
              >
                {item.label}
              </a>
            ))}

            <button
              onClick={() => setDarkMode((prev) => !prev)}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                darkMode
                  ? "bg-white/5 border border-white/10 text-white hover:bg-white/10"
                  : "bg-slate-100 border border-slate-200 text-slate-800 hover:bg-slate-200"
              }`}
              aria-label="Toggle theme"
            >
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>

            <div className="relative">
              <button
                onClick={() => setLoginDropdownOpen((prev) => !prev)}
                className={`px-5 py-2.5 rounded-2xl font-semibold transition-all flex items-center gap-2 ${
                  darkMode
                    ? "border border-white/10 text-white hover:bg-white/5"
                    : "border border-slate-300 text-slate-800 hover:bg-slate-50"
                }`}
              >
                Login
                <FaChevronDown
                  className={`text-xs transition-transform duration-200 ${loginDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {loginDropdownOpen && (
                <div
                  className={`absolute right-0 mt-3 w-60 rounded-2xl overflow-hidden shadow-xl ${
                    darkMode ? "border border-white/10 bg-slate-900" : "border border-slate-200 bg-white"
                  }`}
                >
                  <button
                    onClick={handleCompanyLogin}
                    className={`w-full text-left px-5 py-3.5 text-sm font-semibold transition-colors ${
                      darkMode ? "text-slate-200 hover:bg-white/5" : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    Company Login
                  </button>
                  <button
                    onClick={handleAdminLogin}
                    className={`w-full text-left px-5 py-3.5 text-sm font-semibold border-t transition-colors ${
                      darkMode
                        ? "text-slate-200 hover:bg-white/5 border-white/10"
                        : "text-slate-700 hover:bg-slate-50 border-slate-100"
                    }`}
                  >
                    Admin Login
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleSignup}
              className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-600/20 transition-all"
            >
              SignUp Here
            </button>
          </div>

          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => setDarkMode((prev) => !prev)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                darkMode ? "bg-white/5 border border-white/10 text-white" : "bg-slate-100 border border-slate-200 text-slate-800"
              }`}
              aria-label="Toggle theme"
            >
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>

            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className={`p-2 rounded-xl transition-all ${
                darkMode ? "hover:bg-white/5 text-white" : "hover:bg-slate-100 text-slate-900"
              }`}
              aria-label="Toggle menu"
            >
              <svg
                className={`w-7 h-7 transition-transform duration-300 ${mobileMenuOpen ? "rotate-90" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className={`lg:hidden mt-4 max-w-7xl mx-auto pt-4 ${darkMode ? "border-t border-white/10" : "border-t border-slate-200"}`}>
            <div className="flex flex-col gap-2">
              {navLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                    darkMode ? "text-slate-200 hover:bg-white/5" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {item.label}
                </a>
              ))}

              <button
                onClick={handleCompanyLogin}
                className="w-full px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all text-left"
              >
                Company Login
              </button>

              <button
                onClick={handleAdminLogin}
                className={`w-full px-4 py-3 rounded-xl font-bold transition-all text-left ${
                  darkMode
                    ? "bg-white/5 hover:bg-white/10 border border-white/10 text-white"
                    : "bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-900"
                }`}
              >
                Admin Login
              </button>

              <button
                onClick={handleSignup}
                className="w-full px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all text-left"
              >
                SignUp Here
              </button>
            </div>
          </div>
        )}
      </nav>

      <section className={`relative pt-32 lg:pt-36 pb-20 lg:pb-24 px-5 lg:px-10 overflow-hidden ${darkMode ? "bg-slate-950" : "bg-white"}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.10),transparent_28%)]"></div>

        <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <div className={`inline-flex flex-wrap items-center gap-2 rounded-full px-4 py-2 text-sm mb-6 ${theme.badge}`}>
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Trusted authentication for manufacturers and regulated brands
            </div>

            <h1 className={`text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight leading-[1.05] max-w-2xl ${theme.heading}`}>
              Protect every product with smart verification and fraud visibility
            </h1>

            <p className={`mt-5 text-[15px] md:text-base leading-7 max-w-md ${theme.textMuted}`}>
              Verify products using QR and scratch-code validation.
            </p>

            <p className={`mt-1 text-[15px] md:text-base leading-7 max-w-md ${theme.textMuted}`}>
              Detect duplicate scans early and give customers a faster, clearer trust experience.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleCompanyLogin}
                className="px-6 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base transition-all flex items-center justify-center gap-2"
              >
                Company Login <FaArrowRight className="text-sm" />
              </button>

              <button
                onClick={handleAdminLogin}
                className={`px-6 py-4 rounded-2xl font-bold text-base transition-all ${
                  darkMode
                    ? "bg-white/5 hover:bg-white/10 border border-white/10 text-white"
                    : "bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-900"
                }`}
              >
                Admin Login
              </button>

              <button
                onClick={handleSignup}
                className="px-6 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-600/20 transition-all"
              >
                SignUp Here
              </button>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {trustBadges.map((badge) => (
                <div
                  key={badge}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-sm ${theme.badge}`}
                >
                  <FaCheckCircle className="text-emerald-400" />
                  {badge}
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className={`rounded-[28px] p-5 md:p-6 shadow-2xl ${darkMode ? "border border-white/10 bg-white/5 backdrop-blur-xl" : "border border-slate-200 bg-slate-50"}`}>
              <div className={`rounded-[24px] p-6 md:p-8 ${darkMode ? "bg-slate-900 border border-white/10" : "bg-white border border-slate-200"}`}>
                <div className="flex items-start justify-between gap-4 mb-8">
                  <div>
                    <p className={`text-xs uppercase tracking-[0.18em] font-semibold ${theme.textSoft}`}>
                      Live Verification Preview
                    </p>
                    <h3 className={`mt-2 text-2xl font-bold ${theme.heading}`}>
                      Authentication Result
                    </h3>
                  </div>
                  <div className={`px-3 py-2 rounded-xl font-bold text-sm border ${
                    darkMode
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  }`}>
                    Genuine
                  </div>
                </div>

                <div className="grid grid-cols-[110px,1fr] gap-5 items-center">
                  <div className="w-[110px] h-[110px] rounded-2xl bg-white p-3 shadow-lg">
                    <div className="w-full h-full rounded-xl border-2 border-slate-900 border-dashed flex items-center justify-center">
                      <FaQrcode className="text-[52px] text-slate-900" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className={`rounded-2xl p-4 ${darkMode ? "bg-slate-800/70 border border-white/5" : "bg-slate-50 border border-slate-200"}`}>
                      <p className={`text-xs uppercase tracking-[0.18em] mb-2 ${theme.textSoft}`}>
                        Product ID
                      </p>
                      <p className={`text-lg font-mono ${theme.heading}`}>ABC123XYZ</p>
                    </div>

                    <div className={`rounded-2xl p-4 ${darkMode ? "bg-slate-800/70 border border-white/5" : "bg-slate-50 border border-slate-200"}`}>
                      <p className={`text-xs uppercase tracking-[0.18em] mb-2 ${theme.textSoft}`}>
                        Scratch Code Status
                      </p>
                      <p className={`text-lg font-semibold ${theme.heading}`}>
                        Validated successfully
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid sm:grid-cols-3 gap-4">
                  <div className={`rounded-2xl p-4 ${darkMode ? "border border-white/5 bg-slate-800/50" : "border border-slate-200 bg-slate-50"}`}>
                    <p className={`text-sm ${theme.textSoft}`}>First-time scan</p>
                    <p className={`mt-1 text-xl font-bold ${theme.heading}`}>Yes</p>
                  </div>
                  <div className={`rounded-2xl p-4 ${darkMode ? "border border-white/5 bg-slate-800/50" : "border border-slate-200 bg-slate-50"}`}>
                    <p className={`text-sm ${theme.textSoft}`}>Risk level</p>
                    <p className="mt-1 text-xl font-bold text-emerald-500">Low</p>
                  </div>
                  <div className={`rounded-2xl p-4 ${darkMode ? "border border-white/5 bg-slate-800/50" : "border border-slate-200 bg-slate-50"}`}>
                    <p className={`text-sm ${theme.textSoft}`}>Verification time</p>
                    <p className={`mt-1 text-xl font-bold ${theme.heading}`}>2.1 sec</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className={`rounded-2xl p-4 shadow-sm ${theme.lightCard}`}>
                <p className="text-sm text-slate-500">Duplicate scans</p>
                <p className="mt-2 text-xl font-black text-slate-950">-42%</p>
              </div>
              <div className={`rounded-2xl p-4 shadow-sm ${theme.lightCard}`}>
                <p className="text-sm text-slate-500">Faster checks</p>
                <p className="mt-2 text-xl font-black text-slate-950">3x</p>
              </div>
              <div className={`rounded-2xl p-4 shadow-sm ${theme.lightCard}`}>
                <p className="text-sm text-slate-500">Trust uplift</p>
                <p className="mt-2 text-xl font-black text-slate-950">High</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={`py-8 px-5 lg:px-10 border-y ${darkMode ? "bg-slate-900 border-white/10" : "bg-slate-50 border-slate-200"}`}>
        <div className="max-w-7xl mx-auto">
          <p className={`text-sm font-semibold uppercase tracking-[0.16em] mb-5 text-center ${theme.textSoft}`}>
            Trusted by product-focused teams
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {logos.map((logo) => (
              <div
                key={logo}
                className={`rounded-2xl py-4 px-3 text-center font-bold tracking-wide ${
                  darkMode ? "bg-white/5 border border-white/10 text-slate-200" : "bg-white border border-slate-200 text-slate-700"
                }`}
              >
                {logo}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="proof" className={`py-18 lg:py-24 px-5 lg:px-10 ${darkMode ? "bg-slate-950" : "bg-white"}`}>
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-5">
          {rawStats.map((stat) => (
            <div
              key={stat.label}
              className={`rounded-3xl shadow-sm p-6 lg:p-8 ${darkMode ? "bg-white/5 border border-white/10" : "bg-slate-50 border border-slate-200"}`}
            >
              <p className={`text-3xl lg:text-4xl font-black ${theme.heading}`}>
                <CountUp end={stat.value} suffix={stat.suffix} />
              </p>
              <p className={`mt-2 text-sm lg:text-base font-medium ${theme.textMuted}`}>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="about" className={`py-20 lg:py-24 px-5 lg:px-10 ${theme.sectionAlt}`}>
        <div className="max-w-3xl mx-auto text-center">
          <div className={`inline-flex px-4 py-2 rounded-full text-sm font-bold mb-5 ${darkMode ? "bg-blue-500/10 text-blue-300 border border-blue-500/20" : "bg-blue-50 text-blue-700 border border-blue-100"}`}>
            About AuthentiScan
          </div>
          <h2 className={`text-3xl md:text-4xl lg:text-5xl font-black tracking-tight ${theme.heading}`}>
            Authentication infrastructure built for trust
          </h2>
          <p className={`mt-5 text-base md:text-lg leading-7 ${theme.textMuted}`}>
            AuthentiScan combines dual verification, fraud visibility, and practical workflows
            so teams can protect products without making the customer experience harder.
          </p>
        </div>
      </section>

      <section id="features" className={`py-20 lg:py-24 px-5 lg:px-10 ${darkMode ? "bg-slate-900" : "bg-slate-50"}`}>
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-12">
            <div className={`inline-flex px-4 py-2 rounded-full text-sm font-bold mb-5 ${darkMode ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20" : "bg-emerald-50 text-emerald-700 border border-emerald-100"}`}>
              Core Features
            </div>
            <h2 className={`text-3xl md:text-4xl lg:text-5xl font-black tracking-tight ${theme.heading}`}>
              Built for verification, monitoring, and scale
            </h2>
            <p className={`mt-4 text-base md:text-lg leading-7 max-w-2xl ${theme.textMuted}`}>
              Clear features, simple workflows, and stronger anti-counterfeit protection.
            </p>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className={`rounded-[28px] shadow-sm p-7 lg:p-8 transition-all ${darkMode ? "bg-white/5 border border-white/10 hover:bg-white/[0.07]" : "bg-white border border-slate-200 hover:shadow-lg"}`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${darkMode ? "bg-white/5 border border-white/10" : "bg-slate-950"}`}>
                    <Icon className={`${darkMode ? "text-blue-300" : "text-blue-400"} text-xl`} />
                  </div>
                  <h3 className={`text-xl md:text-2xl font-black mb-3 ${theme.heading}`}>{feature.title}</h3>
                  <p className={`text-base leading-7 ${theme.textMuted}`}>{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className={`py-20 lg:py-24 px-5 lg:px-10 ${theme.sectionSoft}`}>
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-12">
            <div className={`inline-flex px-4 py-2 rounded-full text-sm font-bold mb-5 ${theme.badge}`}>
              Customer Perspective
            </div>
            <h2 className={`text-3xl md:text-4xl lg:text-5xl font-black tracking-tight ${theme.heading}`}>
              Teams trust it because the workflow is clear
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {testimonials.map((item) => (
              <div
                key={item.company}
                className={`rounded-[28px] p-7 lg:p-8 ${darkMode ? "border border-white/10 bg-white/5" : "border border-slate-200 bg-slate-50"}`}
              >
                <div className="flex items-center gap-1 mb-5">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="text-amber-400 text-lg" />
                  ))}
                </div>
                <p className={`text-lg md:text-xl leading-8 italic ${theme.textMuted}`}>
                  "{item.quote}"
                </p>
                <div className="mt-6">
                  <p className={`text-lg font-black ${theme.heading}`}>{item.company}</p>
                  <p className={`text-sm font-medium ${theme.textSoft}`}>{item.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className={`py-20 lg:py-24 px-5 lg:px-10 ${darkMode ? "bg-slate-900" : "bg-slate-50"}`}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <div className={`inline-flex px-4 py-2 rounded-full text-sm font-bold mb-5 ${theme.badge}`}>
              FAQ
            </div>
            <h2 className={`text-3xl md:text-4xl lg:text-5xl font-black tracking-tight ${theme.heading}`}>
              Frequently asked questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={faq.question}
                  className={`rounded-3xl overflow-hidden ${darkMode ? "border border-white/10 bg-white/5" : "border border-slate-200 bg-white"}`}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? -1 : index)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    <span className={`text-lg font-bold ${theme.heading}`}>{faq.question}</span>
                    <FaChevronDown
                      className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""} ${theme.textSoft}`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6">
                      <p className={`text-base leading-7 ${theme.textMuted}`}>{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="contact" className={`py-20 lg:py-24 px-5 lg:px-10 ${darkMode ? "bg-slate-950" : "bg-white"}`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className={`inline-flex px-4 py-2 rounded-full text-sm font-bold mb-5 ${theme.badge}`}>
              Contact
            </div>
            <h2 className={`text-3xl md:text-4xl lg:text-5xl font-black tracking-tight ${theme.heading}`}>
              Ready to protect your products at scale?
            </h2>
            <p className={`mt-5 text-base md:text-lg leading-7 max-w-2xl mx-auto ${theme.textMuted}`}>
              Start a trial, talk to the team, or sign in to manage authentication workflows.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-10">
            <div className="space-y-5">
              <div className={`rounded-[28px] p-6 flex items-center gap-5 ${darkMode ? "bg-white/5 border border-white/10" : "bg-slate-50 border border-slate-200"}`}>
                <div className="w-14 h-14 rounded-2xl bg-blue-600/10 flex items-center justify-center">
                  <FaEnvelope className="text-blue-500 text-xl" />
                </div>
                <div>
                  <h3 className={`text-xl font-black ${theme.heading}`}>Email Us</h3>
                  <p className={`${theme.textMuted}`}>support@authentiscan.com</p>
                </div>
              </div>

              <div className={`rounded-[28px] p-6 flex items-center gap-5 ${darkMode ? "bg-white/5 border border-white/10" : "bg-slate-50 border border-slate-200"}`}>
                <div className="w-14 h-14 rounded-2xl bg-emerald-600/10 flex items-center justify-center">
                  <FaPhone className="text-emerald-500 text-xl" />
                </div>
                <div>
                  <h3 className={`text-xl font-black ${theme.heading}`}>Call Us</h3>
                  <p className={`${theme.textMuted}`}>+91 9876543210</p>
                </div>
              </div>

              <div className={`rounded-[28px] p-6 flex items-center gap-5 ${darkMode ? "bg-white/5 border border-white/10" : "bg-slate-50 border border-slate-200"}`}>
                <div className="w-14 h-14 rounded-2xl bg-purple-600/10 flex items-center justify-center">
                  <FaMapMarkerAlt className="text-purple-500 text-xl" />
                </div>
                <div>
                  <h3 className={`text-xl font-black ${theme.heading}`}>Location</h3>
                  <p className={`${theme.textMuted}`}>India Operations</p>
                </div>
              </div>
            </div>

            <div className={`rounded-[32px] p-8 ${darkMode ? "bg-white/5 border border-white/10" : "bg-slate-50 border border-slate-200 shadow-xl"}`}>
              <form onSubmit={handleFormSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold ml-1 opacity-70">Name</label>
                    <input
                      required
                      name="name"
                      className={`w-full px-5 py-3 rounded-xl outline-none border transition-all ${theme.input}`}
                      placeholder="Your name"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold ml-1 opacity-70">Email</label>
                    <input
                      required
                      type="email"
                      name="email"
                      className={`w-full px-5 py-3 rounded-xl outline-none border transition-all ${theme.input}`}
                      placeholder="work@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold ml-1 opacity-70">Number</label>
                    <input
                      required
                      type="tel"
                      name="number"
                      className={`w-full px-5 py-3 rounded-xl outline-none border transition-all ${theme.input}`}
                      placeholder="+91 9876543210"
                      value={formData.number}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold ml-1 opacity-70">Company Type</label>
                    <select
                      required
                      name="companyType"
                      className={`w-full px-5 py-3 rounded-xl outline-none border transition-all ${theme.input}`}
                      value={formData.companyType}
                      onChange={handleInputChange}
                    >
                      <option value="">Select company type</option>
                      <option value="manufacturer">Manufacturer</option>
                      <option value="distributor">Distributor</option>
                      <option value="retailer">Retailer</option>
                      <option value="wholesaler">Wholesaler</option>
                      <option value="exporter">Exporter</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold ml-1 opacity-70">Company</label>
                    <input
                      required
                      name="company"
                      className={`w-full px-5 py-3 rounded-xl outline-none border transition-all ${theme.input}`}
                      placeholder="Company name"
                      value={formData.company}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold ml-1 opacity-70">GST</label>
                    <input
                      name="gst"
                      className={`w-full px-5 py-3 rounded-xl outline-none border transition-all ${theme.input}`}
                      placeholder="Enter GST number"
                      value={formData.gst}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold ml-1 opacity-70">Message</label>
                  <textarea
                    required
                    rows="4"
                    name="message"
                    className={`w-full px-5 py-3 rounded-xl outline-none border transition-all resize-none ${theme.input}`}
                    placeholder="Tell us about your requirements..."
                    value={formData.message}
                    onChange={handleInputChange}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Sending..." : <>Send Inquiry <FaPaperPlane className="text-xs" /></>}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <footer className={`px-5 lg:px-10 pt-14 pb-10 ${theme.footer}`}>
        <div className="max-w-7xl mx-auto grid lg:grid-cols-4 gap-10">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center shadow-sm">
                <FaShieldAlt className="text-white text-lg" />
              </div>
              <div>
                <div className="text-xl font-extrabold tracking-tight text-white">AuthentiScan</div>
                <div className="text-xs text-slate-400">Product Authentication Platform</div>
              </div>
            </div>

            <p className="mt-5 max-w-xl text-slate-400 leading-7">
              Built to help brands verify genuine products, reduce counterfeit risk, and create a cleaner trust experience.
            </p>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-4">Quick Links</h3>
            <div className="space-y-3">
              {navLinks.map((item) => (
                <a key={item.label} href={item.href} className="block text-slate-400 hover:text-white transition-colors">
                  {item.label}
                </a>
              ))}

              <button
                onClick={handleTermsAndConditions}
                className="block text-slate-400 hover:text-white transition-colors text-left"
              >
                Terms & Conditions
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-4">Follow</h3>
            <div className="flex gap-3">
              <a href="#" className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-all">
                <FaTwitter />
              </a>
              <a href="#" className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-all">
                <FaLinkedin />
              </a>
              <a href="#" className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-all">
                <FaGithub />
              </a>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            © 2026 AuthentiScan. All rights reserved.
          </p>
          <p className="text-slate-500 text-sm">
            Secure authentication for modern product ecosystems.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;