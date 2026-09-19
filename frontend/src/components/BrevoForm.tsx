// frontend/src/components/BrevoForm.tsx
import { Link } from 'react-router-dom';
import { Check, Mail, Sparkles } from 'lucide-react';

const BREVO_FORM_URL =
  'https://ab1eeccf.sibforms.com/serve/MUIFAO5wTxGlVQRFTWzrgx7UtG23UOKXqODLVZJq0wmVCjT2sgHhn3E9rTteZazdx7UrgplDJAtPccYBq5eRsgB-jtkUrfU3pJja6_yNctKjLy-U1860542iKrPGisC3sbJYc6T8yKjdygnGBhof_8Gmj14uSmmu9LeZud5nT-7IAXbscaFESZ1P0TRRhjb68E-t3lxsoHvpb8e6aw==';

const PROMISES = [
  'Free to join',
  'Unsubscribe at any time',
  'No spam',
];

interface BrevoFormProps {
  /** Height of the embedded Brevo form in px. */
  iframeHeight?: number;
}

export default function BrevoForm({ iframeHeight = 680 }: BrevoFormProps) {
  return (
    <section
      aria-labelledby="newsletter"
      className="relative overflow-hidden border-y-2 border-[var(--charcoal)] bg-gradient-to-r from-[var(--pale)] via-[var(--sunset)]/60 to-[var(--pink)]/50 px-4 py-10 md:py-12"
    >
      {/* Decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full bg-[var(--rose)]/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 top-0 h-64 w-64 rounded-full bg-[var(--blue)]/15 blur-3xl"
      />

      <div className="relative z-10 mx-auto grid max-w-5xl items-start gap-8 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:gap-10">
        {/* Copy */}
        <div className="pt-2">

          <p className="mt-3 max-w-md leading-relaxed">
            Join the MouseDays community for practical planning tips, helpful
            recommendations, and updates when we add new tools and features.
          </p>

          <ul className="mt-5 space-y-2 text-sm">
            {PROMISES.map((text) => (
              <li key={text} className="flex items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white">
                  <Check
                    className="h-3.5 w-3.5 text-[var(--dblue)]"
                    strokeWidth={3}
                    aria-hidden="true"
                  />
                </span>
                <span>{text}</span>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex items-start gap-2 text-sm text-[var(--charcoal]">
            <p>
              Your privacy matters. Read our{' '}
              <Link
                to="/privacy-policy"
                className="font-semibold underline underline-offset-2 hover:text-[var(--rust)]"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="overflow-hidden rounded-xl border-2 border-[var(--charcoal)] bg-white shadow-[4px_4px_0_var(--charcoal)]">
          <iframe
            src={BREVO_FORM_URL}
            title="Newsletter signup form"
            loading="lazy"
            scrolling="auto"
            className="block w-full border-0"
            style={{ height: iframeHeight }}
          />
        </div>
      </div>
    </section>
  );
}