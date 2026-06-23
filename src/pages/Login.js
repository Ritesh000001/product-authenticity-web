import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { auth, db } from "../firebase/config";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from "firebase/auth";
import {
  setDoc,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";
import ReCAPTCHA from "react-google-recaptcha";

function Login() {
  const navigate = useNavigate();
  const { role } = useParams();
  const location = useLocation();

  const isSignup = location.pathname === "/signup";
  const isAdmin = role === "admin";
  const recaptchaRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);
  const [showUpdatePasswordModal, setShowUpdatePasswordModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [captchaToken, setCaptchaToken] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(true);

  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    gst: "",
    license: "",
    type: "",
    address: ""
  });

  const [passwordUpdateForm, setPasswordUpdateForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: ""
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setIsDarkMode(savedTheme === "dark");
  }, []);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setForm((prev) => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  const pageTitle = isAdmin
    ? "Admin Panel"
    : isSignup
    ? "Join Us"
    : "Welcome Back";

  const pageSubtitle = isAdmin
    ? "System Administration & Control"
    : isSignup
    ? "Protect your brand with AuthentiScan"
    : "Sign in to manage your products";

  const heroContent = isSignup
    ? "Create your company account to manage product verification, protect your brand identity, and streamline approval workflows with confidence."
    : "Sign in to monitor your registered products, access verification tools, and manage your company dashboard from one secure place.";

  const EMAIL_REGEX =
    /^[a-zA-Z0-9._%+-]+@gmail\.com$|^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.in$/i;
  const GST_REGEX = /^[0-9A-Z]{15}$/;
  const LICENSE_REGEX = /^[A-Za-z0-9]{14}$/;

  const getToastContent = (message, type = "error") => {
    const lower = String(message).toLowerCase();

    if (type === "success") {
      return { title: "Success", message };
    }
    if (lower.includes("captcha")) {
      return {
        title: "Verification required",
        message: "Please complete the captcha before creating your account."
      };
    }
    if (lower.includes("invalid admin credentials")) {
      return {
        title: "Access Denied",
        message: "Admin credentials are incorrect. Please try again."
      };
    }
    if (lower.includes("admin account not found")) {
      return {
        title: "Admin Not Found",
        message: "This account is not registered as an admin."
      };
    }
    if (lower.includes("inactive admin")) {
      return {
        title: "Admin Inactive",
        message: "This admin account is inactive. Contact super admin."
      };
    }
    if (lower.includes("invalid email or password")) {
      return {
        title: "Login Failed",
        message: "Please check your email and password, then try again."
      };
    }
    if (lower.includes("company not registered")) {
      return {
        title: "Company Not Found",
        message: "We could not find your company account. Please sign up first."
      };
    }
    if (lower.includes("blocked")) {
      return {
        title: "Account Restricted",
        message: "Your company account has been blocked. Please contact support."
      };
    }
    if (lower.includes("approval")) {
      return {
        title: "Pending Approval",
        message: "Your account is created but awaiting admin approval."
      };
    }
    if (lower.includes("passwords do not match")) {
      return {
        title: "Password Mismatch",
        message: "Confirm password should match your new password."
      };
    }
    if (lower.includes("reset")) {
      return {
        title: "Reset Email Sent",
        message: "Check your inbox for password reset instructions."
      };
    }
    return { title: "Error", message };
  };

  const getCleanErrorMessage = (errorCodeOrMessage) => {
    const errorMap = {
      "auth/invalid-credential": "Invalid email or password.",
      "auth/user-not-found": "No account found with this email.",
      "auth/wrong-password": "Incorrect password.",
      "auth/too-many-requests": "Too many attempts. Please try again later.",
      "auth/network-request-failed": "Network error. Check your connection.",
      "auth/invalid-email": "Please enter a valid email address.",
      "auth/weak-password": "Password should be at least 6 characters.",
      "auth/email-already-in-use": "Email already registered. Please log in.",
      "auth/operation-not-allowed": "Login unavailable. Contact support.",
      "auth/missing-password": "Please enter your password.",
      "auth/user-disabled": "Account disabled.",
      "auth/requires-recent-login": "Please login again and retry.",
      "auth/invalid-login-credentials": "Invalid email or password."
    };

    if (typeof errorCodeOrMessage === "string") {
      if (errorMap[errorCodeOrMessage]) return errorMap[errorCodeOrMessage];

      const codeMatch = errorCodeOrMessage.match(/\(auth\/([^)]+)\)/);
      if (codeMatch) {
        const code = `auth/${codeMatch[1]}`;
        return errorMap[code] || "Something went wrong. Please try again.";
      }
    }

    return "Login failed. Please check your details.";
  };

  const calculatePasswordStrength = (password) => {
    let score = 0;
    if (password.length > 7) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const getStrengthColor = () => {
    if (passwordStrength >= 4) return "bg-emerald-500";
    if (passwordStrength >= 3) return "bg-blue-400";
    if (passwordStrength >= 2) return "bg-amber-500";
    return "bg-rose-500";
  };

  const validateForm = () => {
    const newErrors = {};

    const trimmedName = form.name.trim();
    const trimmedEmail = form.email.trim().toLowerCase();
    const cleanedPhone = form.phone.replace(/\D/g, "");
    const trimmedGst = form.gst.trim().toUpperCase();
    const trimmedLicense = form.license.trim().toUpperCase();
    const trimmedType = form.type.trim();
    const trimmedAddress = form.address.trim();

    if (!trimmedName) {
      newErrors.name = "Company name is required.";
    }

    if (!trimmedEmail) {
      newErrors.email = "Email is required.";
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      newErrors.email = "Only @gmail.com or .in domain email is allowed.";
    }

    if (!cleanedPhone) {
      newErrors.phone = "Phone number is required.";
    } else if (!/^\d{10}$/.test(cleanedPhone)) {
      newErrors.phone = "Phone number must be exactly 10 digits.";
    }

    if (!trimmedGst) {
      newErrors.gst = "GST number is required.";
    } else if (!GST_REGEX.test(trimmedGst)) {
      newErrors.gst = "GST number must be exactly 15 characters.";
    }

    if (!trimmedLicense) {
      newErrors.license = "License number is required.";
    } else if (!LICENSE_REGEX.test(trimmedLicense)) {
      newErrors.license = "License number must be exactly 14 characters.";
    }

    if (!trimmedType) {
      newErrors.type = "Industry is required.";
    }

    if (!trimmedAddress) {
      newErrors.address = "Business address is required.";
    }

    if (!form.password) {
      newErrors.password = "Password is required.";
    } else if (form.password.length < 6) {
      newErrors.password = "Password should be at least 6 characters.";
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required.";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);

    return {
      isValid: Object.keys(newErrors).length === 0,
      newErrors,
      sanitizedData: {
        name: trimmedName,
        email: trimmedEmail,
        password: form.password,
        confirmPassword: form.confirmPassword,
        phone: cleanedPhone,
        gst: trimmedGst,
        license: trimmedLicense,
        type: trimmedType,
        address: trimmedAddress
      }
    };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedValue = value;

    if (name === "phone") {
      updatedValue = value.replace(/\D/g, "").slice(0, 10);
    }

    if (name === "gst") {
      updatedValue = value.toUpperCase().replace(/[^0-9A-Z]/g, "").slice(0, 15);
    }

    if (name === "license") {
      updatedValue = value.toUpperCase().replace(/[^0-9A-Z]/g, "").slice(0, 14);
    }

    if (name === "email") {
      updatedValue = value.trimStart();
    }

    setForm((prev) => ({ ...prev, [name]: updatedValue }));

    if (name === "password") {
      setPasswordStrength(calculatePasswordStrength(updatedValue));
    }

    setErrors((prev) => ({ ...prev, [name]: "" }));

    if (name === "email" && rememberMe) {
      localStorage.setItem("rememberedEmail", updatedValue);
    }
  };

  const togglePassword = () => setShowPassword((prev) => !prev);
  const toggleConfirmPassword = () => setShowConfirmPassword((prev) => !prev);

  const handleRememberMe = (e) => {
    const checked = e.target.checked;
    setRememberMe(checked);

    if (checked && form.email) {
      localStorage.setItem("rememberedEmail", form.email);
    } else {
      localStorage.removeItem("rememberedEmail");
    }
  };

  const showToast = (message, type = "error") => {
    const existingToast = document.getElementById("auth-toast");
    if (existingToast) existingToast.remove();

    const content = getToastContent(message, type);

    const toast = document.createElement("div");
    toast.id = "auth-toast";
    toast.setAttribute("role", "alert");
    toast.setAttribute("aria-live", "assertive");

    toast.className = `fixed top-5 right-5 z-50 w-[calc(100%-2.5rem)] max-w-md overflow-hidden rounded-[1.6rem] border shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl transition-all duration-300 translate-x-[120%] ${
      type === "success"
        ? "border-emerald-400/30 bg-gradient-to-br from-emerald-500/95 to-emerald-700/95 text-white"
        : "border-rose-300/20 bg-gradient-to-br from-rose-500/95 via-pink-600/95 to-rose-700/95 text-white"
    }`;

    toast.innerHTML = `
      <div class="relative p-5">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_35%)] pointer-events-none"></div>
        <div class="relative flex items-start gap-4">
          <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/12 ring-1 ring-white/10 shadow-inner">
            <span class="text-xl font-bold">${type === "success" ? "✓" : "!"}</span>
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-[15px] font-semibold tracking-wide">${content.title}</p>
            <p class="mt-1 text-sm leading-6 text-white/85">${content.message}</p>
          </div>
          <button id="toast-close-btn" class="shrink-0 rounded-full p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white">
            <span class="text-lg leading-none">&times;</span>
          </button>
        </div>
        <div class="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div id="toast-progress" class="h-full w-full origin-left rounded-full bg-white/70"></div>
        </div>
      </div>
    `;

    document.body.appendChild(toast);

    const progress = toast.querySelector("#toast-progress");
    if (progress) {
      progress.animate(
        [{ transform: "scaleX(1)" }, { transform: "scaleX(0)" }],
        { duration: 4200, easing: "linear", fill: "forwards" }
      );
    }

    requestAnimationFrame(() => {
      toast.classList.remove("translate-x-[120%]");
      toast.classList.add("translate-x-0");
    });

    const removeToast = () => {
      toast.classList.remove("translate-x-0");
      toast.classList.add("translate-x-[120%]");
      setTimeout(() => toast.remove(), 280);
    };

    toast
      .querySelector("#toast-close-btn")
      ?.addEventListener("click", removeToast);

    setTimeout(removeToast, 4200);
  };

  const handleForgotPassword = async () => {
    const emailToReset = (resetEmail || form.email).trim();

    if (!emailToReset) {
      showToast("Please enter your email first.");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, emailToReset);
      showToast("Password reset email sent successfully!", "success");
      setShowResetModal(false);
      setResetEmail("");
    } catch (error) {
      showToast(getCleanErrorMessage(error.code || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    const { isValid, newErrors, sanitizedData } = validateForm();

    if (!isValid) {
      showToast(Object.values(newErrors)[0] || "Please fill all fields correctly.");
      return;
    }

    if (!captchaToken) {
      showToast("Please complete captcha verification.");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        sanitizedData.email,
        sanitizedData.password
      );

      const user = userCredential.user;

      await setDoc(doc(db, "companies", user.uid), {
        name: sanitizedData.name,
        email: sanitizedData.email,
        phone: sanitizedData.phone,
        gst: sanitizedData.gst,
        license: sanitizedData.license,
        type: sanitizedData.type,
        address: sanitizedData.address,
        isApproved: false,
        isBlocked: false,
        createdAt: serverTimestamp(),
        captchaVerified: true
      });

      showToast("Signup successful! Wait for admin approval.", "success");
      setCaptchaToken("");
      recaptchaRef.current?.reset();
      navigate("/login/company");
    } catch (error) {
      console.error(error);

      if (auth.currentUser) {
        try {
          await auth.currentUser.delete();
        } catch (e) {
          console.log("Rollback failed:", e);
        }
      }

      showToast(getCleanErrorMessage(error.code || error.message));
      setCaptchaToken("");
      recaptchaRef.current?.reset();
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (isAdmin) {
      if (!form.email.trim() || !form.password) {
        showToast("Please enter admin email and password.");
        return;
      }

      setLoading(true);
      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          form.email.trim(),
          form.password
        );

        const adminRef = doc(db, "admins", userCredential.user.uid);
        const adminSnap = await getDoc(adminRef);

        if (!adminSnap.exists()) {
          await signOut(auth);
          showToast("Admin account not found.");
          return;
        }

        const adminData = adminSnap.data();

        if (adminData?.isActive === false) {
          await signOut(auth);
          showToast("Inactive admin account.");
          return;
        }

        localStorage.setItem("isAdmin", "true");
        showToast("Admin login successful!", "success");
        navigate("/admin");
      } catch (error) {
        console.error(error);
        showToast(getCleanErrorMessage(error.code || error.message));
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!form.email.trim() || !form.password) {
      showToast("Please enter email and password.");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        form.email.trim(),
        form.password
      );

      const docRef = doc(db, "companies", userCredential.user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        showToast("Company not registered.");
        await signOut(auth);
        return;
      }

      const company = docSnap.data();

      if (company.isBlocked) {
        showToast("Your company has been blocked by admin.");
        await signOut(auth);
        return;
      }

      if (!company.isApproved) {
        showToast("Wait for admin approval.");
        await signOut(auth);
        return;
      }

      localStorage.setItem("isCompany", "true");
      showToast("Login successful!", "success");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      showToast(getCleanErrorMessage(error.code || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    const user = auth.currentUser;

    if (!user) {
      showToast("Please login again.");
      return;
    }

    if (
      !passwordUpdateForm.currentPassword ||
      !passwordUpdateForm.newPassword ||
      !passwordUpdateForm.confirmNewPassword
    ) {
      showToast("Please fill all password fields.");
      return;
    }

    if (passwordUpdateForm.newPassword.length < 6) {
      showToast("New password should be at least 6 characters.");
      return;
    }

    if (
      passwordUpdateForm.newPassword !== passwordUpdateForm.confirmNewPassword
    ) {
      showToast("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        passwordUpdateForm.currentPassword
      );

      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, passwordUpdateForm.newPassword);

      if (!isAdmin) {
        const companyRef = doc(db, "companies", user.uid);
        const companySnap = await getDoc(companyRef);

        if (companySnap.exists()) {
          await updateDoc(companyRef, {
            passwordUpdatedAt: serverTimestamp()
          });
        }
      }

      showToast("Password updated successfully!", "success");
      setShowUpdatePasswordModal(false);
      setPasswordUpdateForm({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: ""
      });
    } catch (error) {
      console.error(error);
      showToast(getCleanErrorMessage(error.code || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-10 ${
        isDarkMode ? "bg-[#060a18]" : "bg-slate-50"
      }`}
    >
      <div className="absolute inset-0">
        {isDarkMode ? (
          <>
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]"></div>
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom_right,rgba(59,130,246,0.04),transparent,rgba(99,102,241,0.06))]"></div>
          </>
        ) : (
          <>
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-300/20 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-indigo-300/20 rounded-full blur-[120px]"></div>
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom_right,rgba(59,130,246,0.08),transparent,rgba(99,102,241,0.08))]"></div>
          </>
        )}
      </div>

      <button
        onClick={() => navigate("/")}
        className={`absolute top-6 left-6 backdrop-blur-md px-5 py-2.5 rounded-2xl shadow-xl hover:scale-[1.02] transition-all duration-200 font-semibold z-20 ${
          isDarkMode
            ? "bg-white/5 border border-white/10 text-white hover:bg-white/10"
            : "bg-white/80 border border-slate-200 text-slate-800 hover:bg-white"
        }`}
      >
        ← Back to Home
      </button>

      {isAdmin ? (
        <div className="relative z-10 w-full max-w-md">
          <div
            className={`backdrop-blur-3xl rounded-[2.5rem] shadow-2xl p-10 ${
              isDarkMode
                ? "bg-white/[0.03] border border-white/10"
                : "bg-white/80 border border-slate-200"
            }`}
          >
            <div className="text-center mb-8">
              <div
                className={`w-20 h-20 mx-auto rounded-2xl border-2 flex items-center justify-center mb-4 shadow-xl ${
                  isDarkMode
                    ? "bg-blue-500/20 border-blue-400/50"
                    : "bg-blue-100 border-blue-300"
                }`}
              >
                <span className="text-3xl">🔐</span>
              </div>
              <h2
                className={`text-4xl font-black mb-3 tracking-tight ${
                  isDarkMode ? "text-white" : "text-slate-900"
                }`}
              >
                {pageTitle}
              </h2>
              <div className="h-1.5 w-20 bg-blue-500 mx-auto rounded-full mb-4"></div>
              <p
                className={`font-medium text-lg ${
                  isDarkMode ? "text-gray-300" : "text-slate-600"
                }`}
              >
                {pageSubtitle}
              </p>
            </div>

            <div className="space-y-6">
              <input
                ref={emailRef}
                className={`w-full px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 ${
                  isDarkMode
                    ? "bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:bg-white/10"
                    : "bg-white border border-slate-200 text-slate-900 placeholder-slate-400"
                }`}
                name="email"
                type="email"
                placeholder="👤 Admin Email"
                value={form.email}
                onChange={handleChange}
              />

              <div className="relative">
                <input
                  ref={passwordRef}
                  className={`w-full px-5 pr-12 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 ${
                    isDarkMode
                      ? "bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:bg-white/10"
                      : "bg-white border border-slate-200 text-slate-900 placeholder-slate-400"
                  }`}
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="🔑 Admin Password"
                  value={form.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={togglePassword}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${
                    isDarkMode
                      ? "text-gray-500 hover:text-white"
                      : "text-slate-400 hover:text-slate-700"
                  }`}
                >
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>

              <div className="flex items-center justify-between px-1">
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={handleRememberMe}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                  />
                  <span
                    className={`text-sm transition-colors ${
                      isDarkMode
                        ? "text-gray-400 group-hover:text-gray-200"
                        : "text-slate-500 group-hover:text-slate-700"
                    }`}
                  >
                    Remember me
                  </span>
                </label>

                <button
                  onClick={() => {
                    setResetEmail(form.email);
                    setShowResetModal(true);
                  }}
                  className="text-sm text-blue-400 hover:text-blue-300 cursor-pointer font-medium transition-colors hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-blue-900/20 transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? (
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  "ADMIN LOGIN"
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`relative z-10 w-full max-w-6xl grid lg:grid-cols-[1.1fr_0.95fr] rounded-[2.5rem] overflow-hidden backdrop-blur-3xl shadow-2xl ${
            isDarkMode
              ? "border border-white/10 bg-white/[0.03]"
              : "border border-slate-200 bg-white/75"
          }`}
        >
          <div
            className={`hidden lg:flex flex-col justify-between p-10 xl:p-12 border-r ${
              isDarkMode
                ? "border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.01]"
                : "border-slate-200 bg-gradient-to-b from-slate-50 to-white"
            }`}
          >
            <div>
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-8 ${
                  isDarkMode
                    ? "border border-blue-400/20 bg-blue-500/10 text-blue-200"
                    : "border border-blue-200 bg-blue-50 text-blue-700"
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-blue-400"></span>
                Trusted product authentication platform
              </div>

              <h1
                className={`text-5xl xl:text-6xl font-black leading-[1.05] tracking-tight ${
                  isDarkMode ? "text-white" : "text-slate-900"
                }`}
              >
                {isSignup
                  ? "Build trust in every product."
                  : "Secure access for your business."}
              </h1>

              <p
                className={`mt-6 max-w-xl text-[17px] leading-8 ${
                  isDarkMode ? "text-slate-300" : "text-slate-600"
                }`}
              >
                {heroContent}
              </p>
            </div>
          </div>

          <div className="p-8 lg:p-10 xl:p-12">
            <div className="text-center mb-10">
              <h2
                className={`text-4xl font-black mb-3 tracking-tight ${
                  isDarkMode ? "text-white" : "text-slate-900"
                }`}
              >
                {pageTitle}
              </h2>
              <div className="h-1.5 w-12 bg-blue-500 mx-auto rounded-full mb-4"></div>
              <p
                className={`font-medium ${
                  isDarkMode ? "text-gray-400" : "text-slate-600"
                }`}
              >
                {pageSubtitle}
              </p>
            </div>

            <div className="space-y-5">
              {isSignup && (
                <>
                  <div>
                    <input
                      className={`w-full px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 ${
                        isDarkMode
                          ? "bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:bg-white/10"
                          : "bg-white border border-slate-200 text-slate-900 placeholder-slate-400"
                      }`}
                      name="name"
                      placeholder="🏢 Company Name *"
                      value={form.name}
                      onChange={handleChange}
                    />
                    {errors.name && (
                      <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <input
                        className={`w-full px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${
                          isDarkMode
                            ? "bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:bg-white/10"
                            : "bg-white border border-slate-200 text-slate-900 placeholder-slate-400"
                        }`}
                        name="phone"
                        placeholder="📱 Phone"
                        value={form.phone}
                        onChange={handleChange}
                        maxLength={10}
                        inputMode="numeric"
                      />
                      {errors.phone && (
                        <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
                      )}
                    </div>

                    <div>
                      <input
                        className={`w-full px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${
                          isDarkMode
                            ? "bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:bg-white/10"
                            : "bg-white border border-slate-200 text-slate-900 placeholder-slate-400"
                        }`}
                        name="gst"
                        placeholder="🆔 GST No."
                        value={form.gst}
                        onChange={handleChange}
                        maxLength={15}
                      />
                      {errors.gst && (
                        <p className="text-red-400 text-sm mt-1">{errors.gst}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <input
                        className={`w-full px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${
                          isDarkMode
                            ? "bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:bg-white/10"
                            : "bg-white border border-slate-200 text-slate-900 placeholder-slate-400"
                        }`}
                        name="license"
                        placeholder="📋 License"
                        value={form.license}
                        onChange={handleChange}
                        maxLength={14}
                      />
                      {errors.license && (
                        <p className="text-red-400 text-sm mt-1">{errors.license}</p>
                      )}
                    </div>

                    <div>
                      <input
                        className={`w-full px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${
                          isDarkMode
                            ? "bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:bg-white/10"
                            : "bg-white border border-slate-200 text-slate-900 placeholder-slate-400"
                        }`}
                        name="type"
                        placeholder="🏭 Industry"
                        value={form.type}
                        onChange={handleChange}
                      />
                      {errors.type && (
                        <p className="text-red-400 text-sm mt-1">{errors.type}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <input
                      className={`w-full px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${
                        isDarkMode
                          ? "bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:bg-white/10"
                          : "bg-white border border-slate-200 text-slate-900 placeholder-slate-400"
                      }`}
                      name="address"
                      placeholder="📍 Business Address"
                      value={form.address}
                      onChange={handleChange}
                    />
                    {errors.address && (
                      <p className="text-red-400 text-sm mt-1">{errors.address}</p>
                    )}
                  </div>
                </>
              )}

              <div>
                <input
                  ref={emailRef}
                  className={`w-full px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${
                    isDarkMode
                      ? "bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:bg-white/10"
                      : "bg-white border border-slate-200 text-slate-900 placeholder-slate-400"
                  }`}
                  name="email"
                  type="email"
                  placeholder="✉️ Email Address *"
                  value={form.email}
                  onChange={handleChange}
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div className="relative">
                <input
                  ref={passwordRef}
                  className={`w-full px-5 pr-12 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${
                    isDarkMode
                      ? "bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:bg-white/10"
                      : "bg-white border border-slate-200 text-slate-900 placeholder-slate-400"
                  }`}
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="🔑 Password *"
                  value={form.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={togglePassword}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${
                    isDarkMode
                      ? "text-gray-500 hover:text-white"
                      : "text-slate-400 hover:text-slate-700"
                  }`}
                >
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>

              {errors.password && (
                <p className="text-red-400 text-sm mt-1">{errors.password}</p>
              )}

              {form.password && !isAdmin && (
                <div className="px-1">
                  <div
                    className={`h-1.5 w-full rounded-full overflow-hidden ${
                      isDarkMode ? "bg-white/5" : "bg-slate-200"
                    }`}
                  >
                    <div
                      className={`h-full transition-all duration-500 ${getStrengthColor()}`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {isSignup && (
                <>
                  <div className="relative">
                    <input
                      className={`w-full px-5 pr-12 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${
                        isDarkMode
                          ? "bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:bg-white/10"
                          : "bg-white border border-slate-200 text-slate-900 placeholder-slate-400"
                      }`}
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="🔐 Confirm Password *"
                      value={form.confirmPassword}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      onClick={toggleConfirmPassword}
                      className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${
                        isDarkMode
                          ? "text-gray-500 hover:text-white"
                          : "text-slate-400 hover:text-slate-700"
                      }`}
                    >
                      {showConfirmPassword ? "🙈" : "👁"}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}

                  <div
                    className={`rounded-2xl p-4 ${
                      isDarkMode
                        ? "border border-white/10 bg-white/[0.04]"
                        : "border border-slate-200 bg-slate-50"
                    }`}
                  >
                    <p
                      className={`text-sm font-semibold mb-3 ${
                        isDarkMode ? "text-white" : "text-slate-900"
                      }`}
                    >
                      Security verification
                    </p>
                    <div className="overflow-hidden rounded-xl">
                      <ReCAPTCHA
                        ref={recaptchaRef}
                        sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                        theme={isDarkMode ? "dark" : "light"}
                        onChange={(token) => setCaptchaToken(token || "")}
                        onExpired={() => setCaptchaToken("")}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-center justify-between px-1">
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={handleRememberMe}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                  />
                  <span
                    className={`text-sm transition-colors ${
                      isDarkMode
                        ? "text-gray-400 group-hover:text-gray-200"
                        : "text-slate-500 group-hover:text-slate-700"
                    }`}
                  >
                    Remember me
                  </span>
                </label>

                {!isSignup && (
                  <button
                    onClick={() => {
                      setResetEmail(form.email);
                      setShowResetModal(true);
                    }}
                    className="text-sm text-blue-400 hover:text-blue-300 cursor-pointer font-medium transition-colors hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>

              <button
                onClick={isSignup ? handleSignup : handleLogin}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-blue-900/20 transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? (
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : isSignup ? (
                  "Create Account"
                ) : (
                  "Sign In"
                )}
              </button>

              <p
                onClick={() => navigate(isSignup ? "/login/company" : "/signup")}
                className={`text-center text-sm font-medium cursor-pointer ${
                  isDarkMode ? "text-gray-400" : "text-slate-500"
                }`}
              >
                {isSignup
                  ? "Already have an account?"
                  : "Don't have an account? "} 
                <span className="text-blue-500 hover:underline cursor-pointer ml-1">
                  {isSignup ? "Login here" : "Sign up here"}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div
            className={`w-full max-w-md p-8 rounded-3xl shadow-2xl border backdrop-blur-xl ${
              isDarkMode
                ? "bg-white/10 border-white/20"
                : "bg-white border-slate-200"
            }`}
          >
            <div className="text-center mb-8">
              <div
                className={`w-16 h-16 mx-auto rounded-2xl border-2 flex items-center justify-center mb-4 ${
                  isDarkMode
                    ? "bg-yellow-500/20 border-yellow-400/50"
                    : "bg-yellow-100 border-yellow-300"
                }`}
              >
                <span className="text-2xl">🔑</span>
              </div>
              <h3
                className={`text-2xl font-bold mb-2 ${
                  isDarkMode ? "text-white" : "text-slate-900"
                }`}
              >
                Reset Password
              </h3>
              <p
                className={`text-sm ${
                  isDarkMode ? "text-gray-300" : "text-slate-600"
                }`}
              >
                Enter your email and we'll send reset instructions
              </p>
            </div>

            <div className="space-y-4">
              <input
                className={`w-full px-4 py-3 rounded-2xl border-2 focus:outline-none focus:ring-2 transition-all ${
                  isDarkMode
                    ? "text-white bg-white/5 border-white/20 focus:ring-blue-500/50 focus:border-blue-500/60 hover:border-white/40 placeholder-gray-400"
                    : "text-slate-900 bg-white border-slate-200 focus:ring-blue-500/30 focus:border-blue-400 placeholder-slate-400"
                }`}
                type="email"
                placeholder="Enter your email address"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowResetModal(false);
                    setResetEmail("");
                  }}
                  className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-200 border ${
                    isDarkMode
                      ? "bg-gray-600/50 hover:bg-gray-500/70 text-white border-gray-500/50"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleForgotPassword}
                  disabled={loading || !resetEmail}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white py-3 rounded-xl font-semibold shadow-lg shadow-emerald-900/30 transition-all duration-200 disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAdmin && showUpdatePasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div
            className={`w-full max-w-md p-8 rounded-3xl shadow-2xl border backdrop-blur-xl ${
              isDarkMode
                ? "bg-white/10 border-white/20"
                : "bg-white border-slate-200"
            }`}
          >
            <div className="text-center mb-8">
              <div
                className={`w-16 h-16 mx-auto rounded-2xl border-2 flex items-center justify-center mb-4 ${
                  isDarkMode
                    ? "bg-blue-500/20 border-blue-400/50"
                    : "bg-blue-100 border-blue-300"
                }`}
              >
                <span className="text-2xl">🔒</span>
              </div>
              <h3
                className={`text-2xl font-bold mb-2 ${
                  isDarkMode ? "text-white" : "text-slate-900"
                }`}
              >
                Update Password
              </h3>
              <p
                className={`text-sm ${
                  isDarkMode ? "text-gray-300" : "text-slate-600"
                }`}
              >
                Enter your current and new password
              </p>
            </div>

            <div className="space-y-4">
              <input
                className={`w-full px-4 py-3 rounded-2xl border-2 focus:outline-none focus:ring-2 transition-all ${
                  isDarkMode
                    ? "text-white bg-white/5 border-white/20 focus:ring-blue-500/50 focus:border-blue-500/60 hover:border-white/40 placeholder-gray-400"
                    : "text-slate-900 bg-white border-slate-200 focus:ring-blue-500/30 focus:border-blue-400 placeholder-slate-400"
                }`}
                type="password"
                placeholder="Current password"
                value={passwordUpdateForm.currentPassword}
                onChange={(e) =>
                  setPasswordUpdateForm((prev) => ({
                    ...prev,
                    currentPassword: e.target.value
                  }))
                }
              />

              <input
                className={`w-full px-4 py-3 rounded-2xl border-2 focus:outline-none focus:ring-2 transition-all ${
                  isDarkMode
                    ? "text-white bg-white/5 border-white/20 focus:ring-blue-500/50 focus:border-blue-500/60 hover:border-white/40 placeholder-gray-400"
                    : "text-slate-900 bg-white border-slate-200 focus:ring-blue-500/30 focus:border-blue-400 placeholder-slate-400"
                }`}
                type="password"
                placeholder="New password"
                value={passwordUpdateForm.newPassword}
                onChange={(e) =>
                  setPasswordUpdateForm((prev) => ({
                    ...prev,
                    newPassword: e.target.value
                  }))
                }
              />

              <input
                className={`w-full px-4 py-3 rounded-2xl border-2 focus:outline-none focus:ring-2 transition-all ${
                  isDarkMode
                    ? "text-white bg-white/5 border-white/20 focus:ring-blue-500/50 focus:border-blue-500/60 hover:border-white/40 placeholder-gray-400"
                    : "text-slate-900 bg-white border-slate-200 focus:ring-blue-500/30 focus:border-blue-400 placeholder-slate-400"
                }`}
                type="password"
                placeholder="Confirm new password"
                value={passwordUpdateForm.confirmNewPassword}
                onChange={(e) =>
                  setPasswordUpdateForm((prev) => ({
                    ...prev,
                    confirmNewPassword: e.target.value
                  }))
                }
              />

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowUpdatePasswordModal(false);
                    setPasswordUpdateForm({
                      currentPassword: "",
                      newPassword: "",
                      confirmNewPassword: ""
                    });
                  }}
                  className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-200 border ${
                    isDarkMode
                      ? "bg-gray-600/50 hover:bg-gray-500/70 text-white border-gray-500/50"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdatePassword}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-3 rounded-xl font-semibold shadow-lg shadow-blue-900/30 transition-all duration-200 disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    "Update Password"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;