import { Form, usePage } from '@inertiajs/react';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import type { ReactNode } from 'react';
import { business, directions } from '@/components/storefront/business';
import { Chat } from '@/components/storefront/catalog';
import PageHeader from '@/components/storefront/PageHeader';
import Reveal from '@/components/storefront/Reveal';
import { useSiteText } from '@/lib/site-text';
import { send } from '@/routes/storefront/contact';

function Field({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: ReactNode;
}) {
    return (
        <label>
            {label}
            {children}
            {error && (
                <span className="site-error" role="alert">
                    {error}
                </span>
            )}
        </label>
    );
}

export default function ContactPage() {
    const { notice } = usePage<{ notice?: string }>().props;
    const { t } = useSiteText();

    return (
        <>
            <PageHeader
                breadcrumbLabel={t('contact')}
                eyebrow={t('location')}
                title={t('contactTitle')}
                description={t('contactIntro')}
                aside={
                    <div className="contact-intro-actions">
                        <a
                            href={'tel:' + business.phone}
                            className="contact-call"
                        >
                            <span className="contact-call-icon">
                                <Phone size={22} aria-hidden="true" />
                            </span>
                            <span>
                                <small>{t('call')}</small>
                                <strong dir="ltr">{business.phoneText}</strong>
                            </span>
                        </a>
                        <Chat className="button hero-cta-primary" icon="black">
                            {t('whatsapp')}
                        </Chat>
                    </div>
                }
            />
            <section className="section contact-page">
                <div className="wrap contact-form-grid">
                    <Reveal className="contact-options" delay={40}>
                        <div
                            className="contact-option"
                            aria-label={t('contact')}
                        >
                            <span className="service-icon">
                                <MapPin size={23} aria-hidden="true" />
                            </span>
                            <div>
                                <h2>{t('visit')}</h2>
                                <address>{t('address')}</address>
                                <a
                                    className="text-link"
                                    href={directions}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    {t('directions')}
                                </a>
                            </div>
                        </div>
                        {business.email && (
                            <div className="contact-option">
                                <span className="service-icon">
                                    <Mail size={22} aria-hidden="true" />
                                </span>
                                <div>
                                    <h2>{t('emailUs')}</h2>
                                    <a
                                        className="text-link"
                                        href={'mailto:' + business.email}
                                    >
                                        {business.email}
                                    </a>
                                </div>
                            </div>
                        )}
                    </Reveal>
                    <Reveal delay={110}>
                        <Form
                            {...send.form()}
                            resetOnSuccess
                            className="site-fields contact-form"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="contact-form-heading">
                                        <h2>{t('formTitle')}</h2>
                                    </div>
                                    {notice && (
                                        <p
                                            className="site-notice"
                                            role="status"
                                        >
                                            {t('messageSent')}
                                        </p>
                                    )}
                                    <div className="field-row">
                                        <Field
                                            label={t('name')}
                                            error={errors.name}
                                        >
                                            <input
                                                name="name"
                                                autoComplete="name"
                                                maxLength={120}
                                                required
                                            />
                                        </Field>
                                        <Field
                                            label={t('email')}
                                            error={errors.email}
                                        >
                                            <input
                                                name="email"
                                                type="email"
                                                autoComplete="email"
                                                maxLength={255}
                                                required
                                            />
                                        </Field>
                                    </div>
                                    <div className="field-row">
                                        <Field
                                            label={t('phoneOptional')}
                                            error={errors.phone}
                                        >
                                            <input
                                                name="phone"
                                                type="tel"
                                                autoComplete="tel"
                                                maxLength={30}
                                            />
                                        </Field>
                                        <Field
                                            label={t('subject')}
                                            error={errors.subject}
                                        >
                                            <input
                                                name="subject"
                                                maxLength={160}
                                                required
                                            />
                                        </Field>
                                    </div>
                                    <Field
                                        label={t('message')}
                                        error={errors.message}
                                    >
                                        <textarea
                                            name="message"
                                            rows={5}
                                            minLength={10}
                                            maxLength={5000}
                                            required
                                        />
                                    </Field>
                                    <button
                                        className="button primary"
                                        type="submit"
                                        disabled={processing}
                                    >
                                        <Send size={17} aria-hidden="true" />
                                        {t(processing ? 'sending' : 'send')}
                                    </button>
                                </>
                            )}
                        </Form>
                    </Reveal>
                </div>
            </section>
        </>
    );
}
