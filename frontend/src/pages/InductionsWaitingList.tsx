import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PixelButton from '../components/PixelButton';
import WindowCard from '../components/WindowCard';
import { api } from '../services/api';
import type { WaitingListEntry } from '../services/api';

type FieldName = 'name' | 'email' | 'phone' | 'batch' | 'faculty';
type FieldErrors = Partial<Record<FieldName, string>>;

const GIKI_EMAIL_REGEX = /^u\d{7}@giki\.edu\.pk$/;
const GIKI_EMAIL_EXAMPLE = 'u2026123@giki.edu.pk';
const GIKI_REG_NUMBER_DIGITS = 7;

const normalizePhoneDigits = (value: string) => value.replace(/\D/g, '');

const isValidPhoneNumber = (value: string) => {
  const digits = normalizePhoneDigits(value);
  return /^03\d{9}$/.test(digits) || /^923\d{9}$/.test(digits);
};

const getEmailError = (rawEmail: string) => {
  const email = rawEmail.trim().toLowerCase();
  if (!email) {
    return 'Please enter your GIKI email.';
  }

  if (!email.endsWith('@giki.edu.pk')) {
    return `Use your official GIKI email, for example ${GIKI_EMAIL_EXAMPLE}.`;
  }

  const localPart = email.slice(0, -'@giki.edu.pk'.length);
  if (!localPart.startsWith('u')) {
    return `GIKI email must start with u, for example ${GIKI_EMAIL_EXAMPLE}.`;
  }

  const registrationNumber = localPart.slice(1);
  if (!/^\d+$/.test(registrationNumber) || registrationNumber.length !== GIKI_REG_NUMBER_DIGITS) {
    return `Registration number must look like 2026123, for example ${GIKI_EMAIL_EXAMPLE}.`;
  }

  if (!GIKI_EMAIL_REGEX.test(email)) {
    return `Enter a valid GIKI email, for example ${GIKI_EMAIL_EXAMPLE}.`;
  }

  return null;
};

const emptyFieldErrors: FieldErrors = {};

const FieldMessage = ({
  error,
  hint,
}: {
  error?: string;
  hint?: string;
}) => {
  if (error) {
    return (
      <p role="alert" className="text-[10px] text-red-600 mb-1">
        {error}
      </p>
    );
  }

  if (!hint) return null;

  return <p className="text-[10px] text-gray-500 mb-1">{hint}</p>;
};

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-7 h-7" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="6" fill="none" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="2" />
    <circle cx="17.4" cy="6.6" r="1.2" fill="currentColor" />
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" className="w-7 h-7" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
    <path
      fill="currentColor"
      d="M7.2 10.2h2.1v7.1H7.2zm1.05-3.4a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zM11 10.2h2v1h.03c.28-.53.97-1.09 2-1.09 2.14 0 2.54 1.41 2.54 3.24v3.95h-2.1v-3.5c0-.84-.02-1.91-1.17-1.91-1.17 0-1.35.91-1.35 1.85v3.56H11z"
    />
  </svg>
);

const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" className="w-7 h-7" aria-hidden="true">
    <rect x="1.5" y="5.5" width="21" height="13" rx="3.5" fill="none" stroke="currentColor" strokeWidth="2" />
    <path fill="currentColor" d="M10.2 9.2v5.6l5.2-2.8z" />
  </svg>
);

const followLinks = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/microsoftclubgiki/?hl=en',
    icon: <InstagramIcon />,
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/microsoft-club-giki/',
    icon: <LinkedInIcon />,
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/@LOGIKALGIKI',
    icon: <YouTubeIcon />,
  },
];

const InductionsWaitingList = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    batch: 'Batch 36' as 'Batch 35' | 'Batch 36',
    faculty: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>(emptyFieldErrors);
  const [submittedEntry, setSubmittedEntry] = useState<WaitingListEntry | null>(null);

  const handleChange = (field: FieldName, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (submitError) setSubmitError(null);
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateForm = () => {
    const nextErrors: FieldErrors = {};

    if (!formData.name.trim()) {
      nextErrors.name = 'Please enter your full name.';
    }

    const emailError = getEmailError(formData.email);
    if (emailError) {
      nextErrors.email = emailError;
    }

    const phone = formData.phone.trim();
    if (!phone) {
      nextErrors.phone = 'Please enter your phone / WhatsApp number.';
    } else if (!isValidPhoneNumber(phone)) {
      nextErrors.phone =
        'Enter a valid 11-digit Pakistani number using digits only, for example 03189665400.';
    }

    if (!formData.batch) {
      nextErrors.batch = 'Please select your Batch (Batch 35 or Batch 36).';
    }

    if (!formData.faculty.trim()) {
      nextErrors.faculty = 'Please enter your faculty or department.';
    }

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return null;
    }

    return {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: normalizePhoneDigits(phone),
      batch: formData.batch,
      faculty: formData.faculty.trim(),
    };
  };

  const applyServerFieldError = (message: string) => {
    const lower = message.toLowerCase();
    if (
      lower.includes('email') ||
      lower.includes('registration') ||
      lower.includes('giki')
    ) {
      setFieldErrors({ email: message });
      return true;
    }
    if (lower.includes('phone') || lower.includes('whatsapp') || lower.includes('11-digit')) {
      setFieldErrors({ phone: message });
      return true;
    }
    if (lower.includes('name')) {
      setFieldErrors({ name: message });
      return true;
    }
    if (lower.includes('batch')) {
      setFieldErrors({ batch: message });
      return true;
    }
    if (lower.includes('faculty')) {
      setFieldErrors({ faculty: message });
      return true;
    }
    return false;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const payload = validateForm();
    if (!payload) return;

    setLoading(true);
    try {
      const res = await api.post<{ message: string; entry: WaitingListEntry }>(
        '/api/waiting-list',
        payload
      );

      setSubmittedEntry(res.data.entry);
    } catch (err: any) {
      const status = err?.response?.status;
      const serverMsg =
        typeof err?.response?.data?.message === 'string'
          ? err.response.data.message
          : null;

      if (status === 400 || status === 409) {
        const message =
          serverMsg && serverMsg.toLowerCase() !== 'server error'
            ? serverMsg
            : 'Please check the highlighted fields and try again.';
        if (!applyServerFieldError(message)) {
          setFieldErrors((prev) => ({ ...prev, email: message }));
        }
      } else if (!err.response) {
        setSubmitError(
          'Unable to reach the server. Please check your connection and try again.'
        );
      } else {
        setSubmitError(
          'Could not submit your application. Please check your email and phone number, then try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-2">
      <motion.div
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {submittedEntry ? (
          <WindowCard title="Inductions Waiting List - Submission Received">
            <div className="text-center py-6 px-2 space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 border-2 border-black text-sm font-heading shadow-retro">
                OK
              </div>
              <h2 className="text-xl font-heading font-bold text-gray-900">
                You're on the Waiting List!
              </h2>
              <p className="text-xs md:text-sm text-gray-700 max-w-lg mx-auto leading-relaxed">
                Thank you, <span className="font-semibold">{submittedEntry.name}</span>! Your response has been securely recorded. You will be among the first to receive notifications regarding induction schedules, orientations, and interview slots.
              </p>

              {/* Summary Card */}
              <div className="bg-lightBg border-2 border-black p-4 text-left rounded shadow-retro text-xs space-y-2 max-w-md mx-auto">
                <div className="border-b border-gray-300 pb-2 mb-2 font-heading font-semibold text-gray-800 flex items-center justify-between">
                  <span>Application Summary</span>
                  <span className="bg-primaryDark text-white px-2 py-0.5 text-[10px] rounded">
                    {submittedEntry.batch}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-gray-500 font-medium">Name:</span>
                  <span className="col-span-2 font-semibold">{submittedEntry.name}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-gray-500 font-medium">GIKI Email:</span>
                  <span className="col-span-2 font-semibold break-all">{submittedEntry.email}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-gray-500 font-medium">Phone:</span>
                  <span className="col-span-2 font-semibold">{submittedEntry.phone}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-gray-500 font-medium">Faculty:</span>
                  <span className="col-span-2 font-semibold">{submittedEntry.faculty}</span>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <p className="font-heading text-xs text-gray-900">Follow us</p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {followLinks.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Follow us on ${item.label}`}
                      className="inline-flex items-center justify-center w-12 h-12 border-2 border-black bg-white shadow-retro hover:bg-gray-50"
                    >
                      {item.icon}
                    </a>
                  ))}
                </div>
                <div className="flex justify-center pt-2">
                  <Link to="/" className="pixel-button bg-gray-800">
                    Return to Home
                  </Link>
                </div>
              </div>
            </div>
          </WindowCard>
        ) : (
          <WindowCard title="Inductions Waiting List - Freshers Registration">
            <div className="p-1 md:p-2">
              <div className="mb-6 border-b-2 border-black pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="font-heading text-base md:text-lg font-bold">
                    Microsoft Club GIKI Inductions
                  </h1>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Welcome freshers! Fill out this form to register your interest for the upcoming recruitment drive. We recruit across technical development, design, media, marketing, operations, and logistics teams.
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-xs font-heading font-semibold mb-1">
                    Full Name <span className="text-red-600">*</span>
                  </label>
                  <FieldMessage error={fieldErrors.name} />
                  <input
                    id="name"
                    type="text"
                    required
                    maxLength={120}
                    autoComplete="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="e.g., Muhammad Ali"
                    className={`w-full border-2 rounded px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary shadow-sm ${
                      fieldErrors.name ? 'border-red-500' : 'border-black'
                    }`}
                    aria-invalid={!!fieldErrors.name}
                  />
                </div>

                {/* GIKI Email */}
                <div>
                  <label htmlFor="email" className="block text-xs font-heading font-semibold mb-1">
                    GIKI Email <span className="text-red-600">*</span>
                  </label>
                  <FieldMessage
                    error={fieldErrors.email}
                    hint={`Use u + your registration number, for example ${GIKI_EMAIL_EXAMPLE}.`}
                  />
                  <input
                    id="email"
                    type="email"
                    required
                    maxLength={254}
                    autoComplete="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder={`e.g., ${GIKI_EMAIL_EXAMPLE}`}
                    className={`w-full border-2 rounded px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary shadow-sm ${
                      fieldErrors.email ? 'border-red-500' : 'border-black'
                    }`}
                    aria-invalid={!!fieldErrors.email}
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label htmlFor="phone" className="block text-xs font-heading font-semibold mb-1">
                    Phone / WhatsApp Number <span className="text-red-600">*</span>
                  </label>
                  <FieldMessage
                    error={fieldErrors.phone}
                    hint="Use 11 digits starting with 03, for example 03189665400."
                  />
                  <input
                    id="phone"
                    type="tel"
                    required
                    maxLength={32}
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="e.g., 03189665400"
                    inputMode="numeric"
                    className={`w-full border-2 rounded px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary shadow-sm ${
                      fieldErrors.phone ? 'border-red-500' : 'border-black'
                    }`}
                    aria-invalid={!!fieldErrors.phone}
                  />
                </div>

                {/* Batch (Radio button: Batch 35 or Batch 36) */}
                <fieldset className="border-2 border-black p-3 rounded bg-gray-50">
                  <legend className="text-xs font-heading font-semibold px-2">
                    Batch <span className="text-red-600">*</span>
                  </legend>
                  <FieldMessage error={fieldErrors.batch} />
                  <div className="grid grid-cols-2 gap-3 mt-1">
                    <label
                      className={`flex items-center gap-3 p-3 border-2 border-black rounded cursor-pointer transition-all shadow-sm ${
                        formData.batch === 'Batch 35'
                          ? 'bg-primaryDark text-white shadow-retro'
                          : 'bg-white text-gray-800 hover:bg-gray-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name="batch"
                        value="Batch 35"
                        checked={formData.batch === 'Batch 35'}
                        onChange={() => handleChange('batch', 'Batch 35')}
                        className="w-4 h-4 text-primary focus:ring-primary border-black"
                      />
                      <div>
                        <span className="font-heading text-xs font-bold block">Batch 35</span>
                        <span className={`text-[10px] block ${formData.batch === 'Batch 35' ? 'text-gray-200' : 'text-gray-500'}`}>
                          Sophomores
                        </span>
                      </div>
                    </label>

                    <label
                      className={`flex items-center gap-3 p-3 border-2 border-black rounded cursor-pointer transition-all shadow-sm ${
                        formData.batch === 'Batch 36'
                          ? 'bg-primaryDark text-white shadow-retro'
                          : 'bg-white text-gray-800 hover:bg-gray-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name="batch"
                        value="Batch 36"
                        checked={formData.batch === 'Batch 36'}
                        onChange={() => handleChange('batch', 'Batch 36')}
                        className="w-4 h-4 text-primary focus:ring-primary border-black"
                      />
                      <div>
                        <span className="font-heading text-xs font-bold block">Batch 36</span>
                        <span className={`text-[10px] block ${formData.batch === 'Batch 36' ? 'text-gray-200' : 'text-gray-500'}`}>
                          Freshers (Incoming)
                        </span>
                      </div>
                    </label>
                  </div>
                </fieldset>

                {/* Faculty (Text Field) */}
                <div>
                  <label htmlFor="faculty" className="block text-xs font-heading font-semibold mb-1">
                    Faculty <span className="text-red-600">*</span>
                  </label>
                  <FieldMessage
                    error={fieldErrors.faculty}
                    hint="Enter your faculty or academic department at GIKI."
                  />
                  <input
                    id="faculty"
                    type="text"
                    required
                    maxLength={120}
                    value={formData.faculty}
                    onChange={(e) => handleChange('faculty', e.target.value)}
                    placeholder="e.g., FCSE, FME, FEE, FES, FMCE, MGS"
                    className={`w-full border-2 rounded px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary shadow-sm ${
                      fieldErrors.faculty ? 'border-red-500' : 'border-black'
                    }`}
                    aria-invalid={!!fieldErrors.faculty}
                  />
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  {submitError && (
                    <p role="alert" className="text-[10px] text-red-600 mb-2">
                      {submitError}
                    </p>
                  )}
                  <PixelButton
                    type="submit"
                    disabled={loading}
                    label={loading ? 'Submitting Application...' : 'Join Waiting List'}
                    className="w-full justify-center text-xs py-2.5 bg-purpleAccent text-white"
                  />
                </div>
              </form>
            </div>
          </WindowCard>
        )}
      </motion.div>
    </div>
  );
};

export default InductionsWaitingList;
