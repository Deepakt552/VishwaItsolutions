import { Link } from '@inertiajs/react';
import { business } from '@/components/storefront/business';
import { RepairServiceLinks } from '@/components/storefront/HomeSections';
import PageHeader from '@/components/storefront/PageHeader';
import { contact, services } from '@/routes/storefront';
import type { RepairServiceLink } from '@/types/storefront';

type RepairService = {
    title: string;
    description: string;
    sections: Record<string, string>;
};

export default function ServicePage({
    service,
    relatedServices,
}: {
    service: RepairService;
    relatedServices: RepairServiceLink[];
}) {
    return (
        <article lang="en">
            <PageHeader
                narrow
                eyebrow="All services"
                eyebrowHref={services.url()}
                title={service.title}
                description={service.description}
                footer={
                    <div className="service-jump">
                        <a href={'tel:' + business.phone}>
                            Call {business.phoneText}
                        </a>
                        <Link href={contact()}>Contact the workshop</Link>
                    </div>
                }
            />
            <div className="wrap article-wrap article-body">
                <div className="article-content">
                    {Object.entries(service.sections).map(([heading, copy]) => (
                        <section key={heading}>
                            <h2>{heading}</h2>
                            <p>{copy}</p>
                        </section>
                    ))}
                </div>
                <RepairServiceLinks links={relatedServices} />
            </div>
        </article>
    );
}
