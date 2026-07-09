My account page will be rendered conditionally.. codes under this file will be rendered if there are user is not login or for guest user.. 
for now use the code in this file to render the guest preview or the auth forms.. use *-theme-primary for using the primary page as it is already set up in this app..

we would want to ensure the page created will not be on client side.. we want to consider minimal usage of client side components, and just "use client" on components that really needs it..
this is to ensure all our pages are seo friendly.. ensure that the page and its components are beautifully rendered based on the apps design pattern for light and dark mode and it is important to be responsive..


====================
COMPONENTS

// ============================================================
// FILE: _components/auth/LoginForm.tsx
// Standalone, reusable — drop into /my-account, a modal, a drawer, etc.
// ============================================================
'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface LoginFormProps {
  onSubmit?: (data: LoginFormData) => void | Promise<void>;
  showTitle?: boolean;
  className?: string;
}

export default function LoginForm({
  onSubmit,
  showTitle = true,
  className = '',
}: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit?.({ email, password, rememberMe });
    } catch {
      setError('Login failed. Please check your credentials and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={className}>
      {showTitle && (
        <h2 className="font-barlow-condensed text-2xl md:text-3xl font-bold text-[#1a1a1a] dark:text-white mb-6">
          Login
        </h2>
      )}

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-[#cc0000] dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Email */}
        <div>
          <label
            htmlFor="login-email"
            className="block text-sm font-medium text-[#cc0000] dark:text-red-400 mb-1.5"
          >
            Email address <span className="text-[#cc0000] dark:text-red-400">*</span>
          </label>
          <input
            id="login-email"
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-gray-200 bg-blue-50/60 px-3.5 py-2.5 text-sm text-[#1a1a1a]
                       placeholder:text-gray-400 focus:border-[#cc0000] focus:outline-none focus:ring-1 focus:ring-[#cc0000]
                       dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
            placeholder="you@example.com"
          />
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="login-password"
            className="block text-sm font-medium text-[#cc0000] dark:text-red-400 mb-1.5"
          >
            Password <span className="text-[#cc0000] dark:text-red-400">*</span>
          </label>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-gray-200 bg-blue-50/60 px-3.5 py-2.5 pr-11 text-sm text-[#1a1a1a]
                         placeholder:text-gray-400 focus:border-[#cc0000] focus:outline-none focus:ring-1 focus:ring-[#cc0000]
                         dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-[#1a1a1a] dark:hover:text-gray-200"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Actions row */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-[#cc0000] px-6 py-2.5 text-sm font-semibold text-white
                         transition-colors hover:bg-[#a30000] disabled:cursor-not-allowed disabled:opacity-60
                         focus:outline-none focus:ring-2 focus:ring-[#cc0000] focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            >
              {isSubmitting ? 'Logging in…' : 'Log in'}
            </button>

            <label
              htmlFor="remember-me"
              className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 cursor-pointer select-none"
            >
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-[#cc0000] focus:ring-[#cc0000] dark:border-gray-600 dark:bg-gray-800"
              />
              Remember me
            </label>
          </div>
        </div>

        <div>
          <Link
            href="/lost-password"
            className="text-sm font-medium text-[#cc0000] hover:underline dark:text-red-400"
          >
            Lost your password?
          </Link>
        </div>
      </form>
    </div>
  );
}


// ============================================================
// FILE: _components/auth/RegisterForm.tsx
// Standalone, reusable — drop into /my-account, a modal, a drawer, etc.
// ============================================================
'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Info } from 'lucide-react';

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  contactNumber: string;
  companyName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
}

interface RegisterFormProps {
  onSubmit?: (data: RegisterFormData) => void | Promise<void>;
  showTitle?: boolean;
  showBenefits?: boolean;
  showLogo?: boolean;
  className?: string;
}

const BENEFITS = [
  'Access to Live Inventory',
  'Exclusive Discounts and Promotions',
  'Inventory Email Updates',
  'Dedicated Account Representative',
];

export default function RegisterForm({
  onSubmit,
  showTitle = true,
  showBenefits = true,
  showLogo = true,
  className = '',
}: RegisterFormProps) {
  const [form, setForm] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    contactNumber: '',
    companyName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptedTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [notRobot, setNotRobot] = useState(false); // wire to real reCAPTCHA below
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof RegisterFormData>(key: K, value: RegisterFormData[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const { firstName, lastName, contactNumber, email, password, confirmPassword, acceptedTerms } = form;

    if (!firstName || !lastName || !contactNumber || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!notRobot) {
      setError('Please verify that you are not a robot.');
      return;
    }
    if (!acceptedTerms) {
      setError('You must accept the terms & conditions to continue.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit?.(form);
    } catch {
      setError('Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    'w-full rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-[#1a1a1a] ' +
    'placeholder:text-gray-400 focus:border-[#cc0000] focus:outline-none focus:ring-1 focus:ring-[#cc0000] ' +
    'dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500';

  const labelClass = 'block text-sm font-medium text-[#cc0000] dark:text-red-400 mb-1.5';

  return (
    <div className={className}>
      {showTitle && (
        <h2 className="font-barlow-condensed text-2xl md:text-3xl font-bold text-[#1a1a1a] dark:text-white mb-6">
          Register
        </h2>
      )}

      {/* Logo — swap the two spans for next/image with the real logo asset when integrated */}
      {showLogo && (
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center border-[3px] border-[#1a1a1a] dark:border-white">
            <span className="font-barlow-condensed text-xl font-extrabold leading-[0.85] text-[#cc0000]">
              ON
              <br />
              SITE
            </span>
          </span>
          <span className="font-barlow-condensed text-2xl md:text-3xl font-extrabold leading-none">
            <span className="text-[#cc0000]">STORAGE</span>
            <br />
            <span className="text-gray-400 dark:text-gray-500">SOLUTIONS</span>
          </span>
        </div>
      )}

      {showBenefits && (
        <div className="mb-6">
          <p className="text-sm font-semibold text-[#1a1a1a] dark:text-white mb-2">
            Benefits Of Registration
          </p>
          <ul className="space-y-1 pl-4 text-sm text-[#cc0000] dark:text-red-400 list-disc marker:text-[#cc0000] dark:marker:text-red-400">
            {BENEFITS.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-[#cc0000] dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* First / Last name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="reg-first-name" className={labelClass}>
              First Name <span className="text-[#cc0000] dark:text-red-400">*</span>
            </label>
            <input
              id="reg-first-name"
              type="text"
              required
              autoComplete="given-name"
              value={form.firstName}
              onChange={(e) => update('firstName', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="reg-last-name" className={labelClass}>
              Last Name <span className="text-[#cc0000] dark:text-red-400">*</span>
            </label>
            <input
              id="reg-last-name"
              type="text"
              required
              autoComplete="family-name"
              value={form.lastName}
              onChange={(e) => update('lastName', e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {/* Contact number */}
        <div>
          <label htmlFor="reg-contact" className="flex items-center gap-1.5 text-sm font-medium text-[#cc0000] dark:text-red-400 mb-1.5">
            Contact Number <span className="text-[#cc0000] dark:text-red-400">*</span>
            <span className="group relative inline-flex">
              <Info size={13} className="text-gray-400 cursor-help" />
              <span
                role="tooltip"
                className="pointer-events-none absolute left-1/2 top-full z-10 mt-1.5 w-48 -translate-x-1/2 rounded-md
                           bg-[#1a1a1a] px-2.5 py-1.5 text-xs text-white opacity-0 shadow-lg transition-opacity
                           group-hover:opacity-100 dark:bg-gray-700"
              >
                Include country code, e.g. +1 555 123 4567
              </span>
            </span>
            <span className="group relative inline-flex">
              <Info size={13} className="text-gray-400 cursor-help" />
              <span
                role="tooltip"
                className="pointer-events-none absolute left-1/2 top-full z-10 mt-1.5 w-48 -translate-x-1/2 rounded-md
                           bg-[#1a1a1a] px-2.5 py-1.5 text-xs text-white opacity-0 shadow-lg transition-opacity
                           group-hover:opacity-100 dark:bg-gray-700"
              >
                Used for delivery and order updates only
              </span>
            </span>
          </label>
          <input
            id="reg-contact"
            type="tel"
            required
            autoComplete="tel"
            value={form.contactNumber}
            onChange={(e) => update('contactNumber', e.target.value)}
            className={inputClass}
            placeholder="+1 (555) 123-4567"
          />
        </div>

        {/* Company name */}
        <div>
          <label htmlFor="reg-company" className={labelClass}>
            Company Name
          </label>
          <input
            id="reg-company"
            type="text"
            autoComplete="organization"
            value={form.companyName}
            onChange={(e) => update('companyName', e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="reg-email" className={labelClass}>
            Email address <span className="text-[#cc0000] dark:text-red-400">*</span>
          </label>
          <input
            id="reg-email"
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="reg-password" className={labelClass}>
            Password <span className="text-[#cc0000] dark:text-red-400">*</span>
          </label>
          <div className="relative">
            <input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              className={`${inputClass} pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-[#1a1a1a] dark:hover:text-gray-200"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Confirm password */}
        <div>
          <label htmlFor="reg-confirm-password" className={labelClass}>
            Confirm password <span className="text-[#cc0000] dark:text-red-400">*</span>
          </label>
          <div className="relative">
            <input
              id="reg-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={(e) => update('confirmPassword', e.target.value)}
              className={`${inputClass} pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-[#1a1a1a] dark:hover:text-gray-200"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* reCAPTCHA placeholder — replace with real widget (e.g. react-google-recaptcha) on integration */}
        <div
          className="flex w-full max-w-[304px] items-center justify-between gap-3 rounded-md border border-gray-300
                     bg-gray-50 px-3.5 py-3 dark:border-gray-700 dark:bg-gray-800"
        >
          <label className="flex items-center gap-2.5 text-sm text-[#1a1a1a] dark:text-gray-200 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={notRobot}
              onChange={(e) => setNotRobot(e.target.checked)}
              className="h-5 w-5 rounded border-gray-300 text-[#cc0000] focus:ring-[#cc0000] dark:border-gray-600 dark:bg-gray-700"
            />
            I&apos;m not a robot
          </label>
          <span className="text-[10px] leading-tight text-gray-400">reCAPTCHA</span>
        </div>

        {/* Terms */}
        <label className="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={form.acceptedTerms}
            onChange={(e) => update('acceptedTerms', e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#cc0000] focus:ring-[#cc0000] dark:border-gray-600 dark:bg-gray-800"
          />
          <span>
            I&apos;ve read and accept the{' '}
            <Link href="/terms-and-conditions" className="text-[#cc0000] hover:underline dark:text-red-400">
              terms &amp; conditions
            </Link>{' '}
            <span className="text-[#cc0000] dark:text-red-400">*</span>
          </span>
        </label>

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-[#cc0000] px-6 py-2.5 text-sm font-semibold text-white
                       transition-colors hover:bg-[#a30000] disabled:cursor-not-allowed disabled:opacity-60
                       focus:outline-none focus:ring-2 focus:ring-[#cc0000] focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            {isSubmitting ? 'Creating account…' : 'Register'}
          </button>
        </div>
      </form>
    </div>
  );
}


// ============================================================
// FILE: app/my-account/page.tsx
// Renders LoginForm and RegisterForm side-by-side, responsive.
// ============================================================
import type { Metadata } from 'next';
import LoginForm, { LoginFormData } from '@/components/auth/LoginForm';
import RegisterForm, { RegisterFormData } from '@/components/auth/RegisterForm';

export const metadata: Metadata = {
  title: 'My Account | On-Site Storage Solutions',
  description: 'Log in to your account or register for exclusive discounts, live inventory access, and more.',
};

export default function MyAccountPage() {
  // Server actions or client handlers can be wired here; kept as
  // no-ops so the forms remain fully reusable/standalone elsewhere.
  const handleLogin = async (data: LoginFormData) => {
    'use server';
    // e.g. await signIn(data)
    console.log(data);
  };

  const handleRegister = async (data: RegisterFormData) => {
    'use server';
    // e.g. await createAccount(data)
    console.log(data);
  };

  return (
    <main className="min-h-screen bg-white dark:bg-[#1a1a1a] px-4 py-10 sm:px-6 md:py-16 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="font-barlow-condensed text-3xl md:text-4xl font-bold text-[#1a1a1a] dark:text-white mb-8 md:mb-12">
          My Account
        </h1>

        <div
          className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16
                     divide-y divide-gray-200 dark:divide-gray-800
                     lg:divide-y-0 lg:divide-x"
        >
          {/* Login */}
          <section className="pb-10 lg:pb-0">
            <LoginForm onSubmit={handleLogin} />
          </section>

          {/* Register */}
          <section className="pt-10 lg:pt-0 lg:pl-16">
            <RegisterForm onSubmit={handleRegister} />
          </section>
        </div>
      </div>
    </main>
  );
}

