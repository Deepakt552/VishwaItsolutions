import { Check } from 'lucide-react';
import { Chat } from '@/components/storefront/catalog';
import {
    RepairServiceLinks,
    ServiceAreas,
    ServiceIcon,
    SpecialistRepairs,
    VisitingPricingBanner,
} from '@/components/storefront/HomeSections';
import PageHeader from '@/components/storefront/PageHeader';
import Reveal from '@/components/storefront/Reveal';
import { servicesList } from '@/components/storefront/service-list';
import { useSiteText } from '@/lib/site-text';
import type { RepairServiceLink } from '@/types/storefront';

export default function ServicesPage({
    repairServices,
}: {
    repairServices: RepairServiceLink[];
}) {
    const { t } = useSiteText();
    const coreServices = servicesList.slice(0, 4);
    const officeService = servicesList[4];

    return (
        <>
            <PageHeader
                breadcrumbLabel={t('services')}
                eyebrow={t('trustedLocal')}
                title={t('serviceTitle')}
                description={t('serviceIntro')}
                footer={
                    <>
                        <RepairServiceLinks links={repairServices} />
                        <nav className="service-jump" aria-label={t('serviceJump')}>
                            {servicesList.map((service) => (
                                <a key={service.id} href={'#' + service.id}>
                                    {t(service.title)}
                                </a>
                            ))}
                        </nav>
                    </>
                }
            />
            <SpecialistRepairs />
            <section className="service-details service-details-grid-section">
                <div className="wrap">
                    <div className="services-grid-view">
                        {coreServices.map((service, index) => (
                            <Reveal
                                as="article"
                                className="service-grid-card"
                                id={service.id}
                                key={service.id}
                                delay={index * 65}
                            >
                                <div className="service-grid-media">
                                    <img
                                        src={
                                            '/service-photos/' +
                                            service.image +
                                            '.webp'
                                        }
                                        alt=""
                                        width="840"
                                        height="560"
                                        loading="lazy"
                                        decoding="async"
                                    />
                                    <div
                                        className="service-grid-media-scrim"
                                        aria-hidden="true"
                                    />
                                    <span
                                        className="service-grid-step"
                                        aria-hidden="true"
                                    >
                                        0{index + 1}
                                    </span>
                                </div>
                                <div className="service-grid-body">
                                    <div className="service-grid-head">
                                        <ServiceIcon name={service.icon} />
                                        <h2>{t(service.title)}</h2>
                                    </div>
                                    <p className="service-grid-summary">
                                        {t(service.summary)}
                                    </p>
                                    <ul className="service-grid-points">
                                        {service.points.map((point) => (
                                            <li key={point}>
                                                <span
                                                    className="point-check"
                                                    aria-hidden="true"
                                                >
                                                    <Check size={14} />
                                                </span>
                                                <span>{t(point)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="service-grid-footer">
                                        <Chat
                                            className="button primary service-grid-cta"
                                            message={
                                                'Hi Vishwa IT Solutions, I have a question about ' +
                                                t(service.title) +
                                                '.'
                                            }
                                        >
                                            {t('quote')}
                                        </Chat>
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>

                    {officeService && (
                        <Reveal
                            as="article"
                            className="service-grid-card is-featured"
                            id={officeService.id}
                            delay={120}
                            variant="scale"
                        >
                            <div className="service-grid-media">
                                <img
                                    src={
                                        '/service-photos/' +
                                        officeService.image +
                                        '.webp'
                                    }
                                    alt=""
                                    width="840"
                                    height="560"
                                    loading="lazy"
                                    decoding="async"
                                />
                                <div
                                    className="service-grid-media-scrim"
                                    aria-hidden="true"
                                />
                                <span
                                    className="service-grid-step"
                                    aria-hidden="true"
                                >
                                    05 · AMC
                                </span>
                            </div>
                            <div className="service-grid-body">
                                <div className="service-grid-head">
                                    <ServiceIcon name={officeService.icon} />
                                    <div>
                                        <span className="featured-tag">
                                            {t('maintenance')}
                                        </span>
                                        <h2>{t(officeService.title)}</h2>
                                    </div>
                                </div>
                                <p className="service-grid-summary">
                                    {t(officeService.summary)}
                                </p>
                                <ul className="service-grid-points">
                                    {officeService.points.map((point) => (
                                        <li key={point}>
                                            <span
                                                className="point-check"
                                                aria-hidden="true"
                                            >
                                                <Check size={14} />
                                            </span>
                                            <span>{t(point)}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="service-grid-footer">
                                    <Chat
                                        className="button hero-cta-primary"
                                        icon="black"
                                        message={
                                            'Hi Vishwa IT Solutions, I have a question about ' +
                                            t(officeService.title) +
                                            '.'
                                        }
                                    >
                                        {t('quote')}
                                    </Chat>
                                </div>
                            </div>
                        </Reveal>
                    )}
                </div>
            </section>
            <VisitingPricingBanner />
            <ServiceAreas />
        </>
    );
}
