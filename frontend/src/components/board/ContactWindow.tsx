import { useState, type FormEvent } from 'react';
import { isAxiosError } from 'axios';
import { api } from '../../services/api';
import { socialLinks } from '../desktop/desktopApps';
import { DesktopArt } from '../desktop/DesktopArt';
import WindowControls from '../desktop/WindowControls';

const MAX = { name: 120, email: 254, subject: 150, message: 3000 };
const MIN_MESSAGE = 10;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type SendState = { kind: 'idle' } | { kind: 'sending' } | { kind: 'sent' } | { kind: 'error'; message: string };
type FieldName = 'name' | 'email' | 'message';
type FieldErrors = Partial<Record<FieldName, string>>;

const errorMessage = (err: unknown) => {
  if (isAxiosError<{ message?: string }>(err) && err.response?.data?.message) return err.response.data.message;
  return 'Couldn’t reach the server. Check your connection and try again.';
};

/** Same rules the backend enforces, phrased for people instead of the browser's default popups. */
const validate = (values: Record<FieldName, string>): FieldErrors => {
  const errors: FieldErrors = {};
  if (!values.name.trim()) errors.name = 'Add your name so we know who’s writing.';
  if (!values.email.trim()) errors.email = 'Add your email so we can reply.';
  else if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = 'That email doesn’t look right — try name@example.com.';
  const message = values.message.trim();
  if (!message) errors.message = 'Write a message before sending.';
  else if (message.length < MIN_MESSAGE) errors.message = `A little more, please — at least ${MIN_MESSAGE} characters.`;
  return errors;
};

type FieldErrorProps = { id: string; text?: string };

const FieldError = ({ id, text }: FieldErrorProps) =>
  text ? (
    <small id={id} className="field-error">
      <i className="icon-warning" aria-hidden="true" />
      {text}
    </small>
  ) : null;

const ContactWindow = () => {
  const [state, setState] = useState<SendState>({ kind: 'idle' });
  const [messageLength, setMessageLength] = useState(0);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const clearError = (field: FieldName) =>
    setFieldErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get('name') ?? ''),
      email: String(data.get('email') ?? ''),
      subject: String(data.get('subject') ?? ''),
      message: String(data.get('message') ?? ''),
      website: String(data.get('website') ?? ''),
    };

    const errors = validate(payload);
    setFieldErrors(errors);
    const firstInvalid = (['name', 'email', 'message'] as const).find((field) => errors[field]);
    if (firstInvalid) {
      form.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }

    setState({ kind: 'sending' });
    try {
      await api.post('/api/contact', payload);
      form.reset();
      setMessageLength(0);
      setState({ kind: 'sent' });
    } catch (err) {
      setState({ kind: 'error', message: errorMessage(err) });
    }
  };

  const isSending = state.kind === 'sending';
  const describedBy = (field: FieldName, extra?: string) =>
    [fieldErrors[field] ? `mail-${field}-error` : '', extra ?? ''].filter(Boolean).join(' ') || undefined;

  return (
    <section className="win mail-win" aria-labelledby="mail-title">
      <div className="win-bar win-bar--coral">
        <p className="win-title">new message — mail.app</p>
        <WindowControls />
      </div>

      <div className="mail-grid">
        <div className="mail-compose">
          <h2 id="mail-title" className="mail-heading">Write to the club</h2>

          {state.kind === 'sent' ? (
            <div className="mail-sent" role="status">
              <div className="blocks" aria-hidden="true">
                {Array.from({ length: 14 }, (_, i) => (
                  <span key={i} />
                ))}
              </div>
              <p className="mail-sent-title">Message sent.</p>
              <p className="m-0 text-ink-soft">Thanks for writing in — someone from the team will reply to your email.</p>
              <button type="button" className="btn btn--white btn--sm self-start" onClick={() => setState({ kind: 'idle' })}>
                <i className="icon-pencil" aria-hidden="true" />
                Write another
              </button>
            </div>
          ) : (
            /* noValidate: the browser's own "Please fill in this field" popups can't be themed, so we show our own errors */
            <form className="mail-form" onSubmit={handleSubmit} noValidate>
              <div className="mail-to">
                <span>To:</span>
                <span className="tag tag--yellow">Microsoft Club GIKI</span>
              </div>

              <div className="mail-row">
                <label className="field">
                  <span>Your name</span>
                  <input
                    className="input"
                    name="name"
                    required
                    maxLength={MAX.name}
                    autoComplete="name"
                    disabled={isSending}
                    aria-invalid={fieldErrors.name ? true : undefined}
                    aria-describedby={describedBy('name')}
                    onChange={() => clearError('name')}
                  />
                  <FieldError id="mail-name-error" text={fieldErrors.name} />
                </label>
                <label className="field">
                  <span>Your email</span>
                  <input
                    className="input"
                    name="email"
                    type="email"
                    required
                    maxLength={MAX.email}
                    autoComplete="email"
                    disabled={isSending}
                    aria-invalid={fieldErrors.email ? true : undefined}
                    aria-describedby={describedBy('email')}
                    onChange={() => clearError('email')}
                  />
                  <FieldError id="mail-email-error" text={fieldErrors.email} />
                </label>
              </div>

              <label className="field">
                <span>Subject</span>
                <input className="input" name="subject" maxLength={MAX.subject} placeholder="Collab, sponsorship, question…" disabled={isSending} />
              </label>

              <label className="field">
                <span>Message</span>
                <textarea
                  className="input"
                  name="message"
                  required
                  minLength={MIN_MESSAGE}
                  maxLength={MAX.message}
                  rows={6}
                  aria-invalid={fieldErrors.message ? true : undefined}
                  aria-describedby={describedBy('message', 'mail-count')}
                  onChange={(e) => {
                    setMessageLength(e.target.value.length);
                    clearError('message');
                  }}
                  disabled={isSending}
                />
                <span className="field-foot">
                  <FieldError id="mail-message-error" text={fieldErrors.message} />
                  <small id="mail-count" className="mail-count">
                    {messageLength}/{MAX.message}
                  </small>
                </span>
              </label>

              <label className="mail-trap" aria-hidden="true">
                Leave this empty
                <input name="website" tabIndex={-1} autoComplete="off" />
              </label>

              {state.kind === 'error' && (
                <p className="mail-error" role="alert">
                  <i className="icon-close" aria-hidden="true" />
                  {state.message}
                </p>
              )}

              <div className="mail-actions">
                <button type="submit" className="btn btn--blue" disabled={isSending}>
                  <i className="icon-paper-plane" aria-hidden="true" />
                  {isSending ? 'Sending…' : 'Send'}
                </button>
                <span className="text-sm text-ink-soft">We reply to the email you give us.</span>
              </div>
            </form>
          )}
        </div>

        <aside className="mail-side" aria-label="Other ways to reach us">
          <div className="mail-art" aria-hidden="true">
            <DesktopArt name="envelope" className="" />
          </div>
          <p className="m-0 font-bold">Rather DM?</p>
          <ul className="mail-links">
            {socialLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} target="_blank" rel="noopener noreferrer">
                  <i className={link.icon} aria-hidden="true" />
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
};

export default ContactWindow;
