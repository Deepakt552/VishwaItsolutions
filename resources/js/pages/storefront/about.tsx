import { Link } from '@inertiajs/react';
import { MapPin, Phone } from 'lucide-react';
import { business, directions } from '@/components/storefront/business';
import { Chat } from '@/components/storefront/catalog';
import {
    SpecialistRepairs,
    VisitingPricingBanner,
} from '@/components/storefront/HomeSections';
import PageHeader from '@/components/storefront/PageHeader';
import Reveal from '@/components/storefront/Reveal';
import { useSiteText } from '@/lib/site-text';
import { contact, services } from '@/routes/storefront';

export default function AboutPage() {
    const { t } = useSiteText();

    return (
        <>
            <PageHeader
                breadcrumbLabel={t('about')}
                eyebrow={t('location')}
                title={t('aboutTitle')}
                description={t('aboutIntro')}
            />
            <SpecialistRepairs />
            <section className="section">
                <div className="wrap article-wrap article-content">
                    <Reveal>
                        <h2>{t('hardwareLab')}</h2>
                        <p>
                            Vishwa IT Solutions is a dedicated computer repair
                            workshop and IT support provider in Nalasopara East,
                            serving home users, students, and local offices
                            across Vasai-Virar and Palghar.
                        </p>
                        <p>
                            Our technicians handle everything from software
                            troubleshooting and Windows/macOS setup to advanced
                            chip-level motherboard repairing, MacBook logic
                            boards, and All-in-One (AIO) desktop systems. We
                            also supply tested pre-owned laptops, desktops, and
                            workstations, and manage ongoing office IT
                            maintenance plans (AMC).
                        </p>
                        <div
                            className="actions"
                            style={{ marginTop: '1.5rem' }}
                        >
                            <Chat>{t('whatsapp')}</Chat>
                            <Link
                                href={services()}
                                className="button secondary"
                            >
                                {t('allServices')}
                            </Link>
                            <Link href={contact()} className="button secondary">
                                <Phone size={16} aria-hidden="true" />
                                {t('contact')}
                            </Link>
                            <a
                                href={directions}
                                target="_blank"
                                rel="noreferrer"
                                className="text-link"
                            >
                                <MapPin size={15} aria-hidden="true" />
                                {t('directions')}
                            </a>
                        </div>
                        <p style={{ marginTop: '1.25rem' }}>
                            <strong>{t('visit')}:</strong> {business.address} ·{' '}
                            <a href={'tel:' + business.phone} dir="ltr">
                                {business.phoneText}
                            </a>
                        </p>
                    </Reveal>
                </div>
            </section>
            <VisitingPricingBanner />
        </>
    );
}

