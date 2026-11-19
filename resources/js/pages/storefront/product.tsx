import { Link } from '@inertiajs/react';
import { Check, Cpu, HardDrive, MemoryStick } from 'lucide-react';
import { useState } from 'react';
import {
    Chat,
    ProductCards,
    ProductImage,
} from '@/components/storefront/catalog';
import { money } from '@/components/storefront/business';
import { isSiteTextKey, useSiteText } from '@/lib/site-text';
import { shop } from '@/routes/storefront';
import type { Product } from '@/types/storefront';
import { ageLabel, storageLabel } from '@/types/storefront';

export default function ProductDetails({
    product: item,
    related,
}: {
    product: Product;
    related: Product[];
}) {
    const { language, t } = useSiteText();
    const category = isSiteTextKey(item.category)
        ? t(item.category)
        : item.category;
    const [active, selectPhoto] = useState(0);
    const photo = item.photos[active];
    const specs = [
        [t('processor'), item.processor],
        ['RAM', item.ram_gb ? item.ram_gb + ' GB' : null],
        [
            t('storage'),
            item.storage_gb
                ? [storageLabel(item.storage_gb), item.storage_type]
                      .filter(Boolean)
                      .join(' ')
                : item.storage_type,
        ],
        [t('graphics'), item.graphics],
        [t('operatingSystem'), item.operating_system],
        [
            t('age'),
            item.age_months == null
                ? null
                : ageLabel(item.age_months, language),
        ],
    ].filter(([, value]) => value);
    const features =
        item.features
            ?.split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean) ?? [];

    return (
        <>
            <div className="shop product-detail">
                <div className="wrap">
                    <nav
                        className="breadcrumb-line"
                        aria-label={t('breadcrumb')}
                    >
                        <Link href={shop()}>{t('shop')}</Link>
                        <span aria-hidden="true">/</span>
                        <Link
                            href={shop({ query: { category: item.category } })}
                        >
                            {category}
                        </Link>
                        <span aria-hidden="true">/</span>
                        <span aria-current="page">{item.name}</span>
                    </nav>
                    <div className="detail-grid">
                        <div className="product-gallery">
                            <div className="gallery-main">
                                {photo ? (
                                    <img
                                        src={photo.url}
                                        alt={
                                            item.name +
                                            ' · ' +
                                            t('viewPhoto', {
                                                index: active + 1,
                                            })
                                        }
                                        width="840"
                                        height="560"
                                        fetchPriority="high"
                                    />
                                ) : (
                                    <ProductImage item={item} lazy={false} />
                                )}
                            </div>
                            {item.photos.length > 1 && (
                                <div
                                    className="gallery-thumbs"
                                    aria-label={item.name}
                                >
                                    {item.photos.map((image, index) => (
                                        <button
                                            type="button"
                                            key={image.name}
                                            aria-label={t('viewPhoto', {
                                                index: index + 1,
                                            })}
                                            aria-pressed={active === index}
                                            onClick={() => selectPhoto(index)}
                                        >
                                            <img
                                                src={image.url}
                                                alt=""
                                                loading="lazy"
                                                width="84"
                                                height="64"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="detail-summary">
                            <p className="eyebrow">
                                {category} · {t('preowned')}
                            </p>
                            <h1>{item.name}</h1>
                            <div className="detail-tags">
                                <span>{t('available')}</span>
                                <span>
                                    {isSiteTextKey(item.condition)
                                        ? t(item.condition)
                                        : item.condition}
                                </span>
                            </div>
                            <p className="detail-price">
                                {item.price == null
                                    ? t('askPrice')
                                    : money.format(Number(item.price))}
                            </p>
                            <div className="detail-quick">
                                {item.processor && (
                                    <span>
                                        <Cpu size={18} />
                                        {item.processor}
                                    </span>
                                )}
                                {item.ram_gb && (
                                    <span>
                                        <MemoryStick size={18} />
                                        {item.ram_gb} GB RAM
                                    </span>
                                )}
                                {item.storage_gb && (
                                    <span>
                                        <HardDrive size={18} />
                                        {storageLabel(item.storage_gb)}{' '}
                                        {item.storage_type}
                                    </span>
                                )}
                            </div>
                            <Chat
                                message={
                                    'Hi Vishwa IT Solutions, I’m interested in ' +
                                    item.name +
                                    ' (listing #' +
                                    item.id +
                                    '). Is it still available?'
                                }
                            >
                                {t('enquire')}
                            </Chat>
                        </div>
                    </div>
                    {(item.description ||
                        specs.length > 0 ||
                        features.length > 0) && (
                        <div className="detail-info">
                            {(item.description || features.length > 0) && (
                                <section className="detail-panel">
                                    {item.description && (
                                        <>
                                            <h2>{t('aboutDevice')}</h2>
                                            <p className="pre-wrap">
                                                {item.description}
                                            </p>
                                        </>
                                    )}
                                    {features.length > 0 && (
                                        <>
                                            <h2>{t('features')}</h2>
                                            <ul className="device-features">
                                                {features.map(
                                                    (feature, index) => (
                                                        <li key={index}>
                                                            <Check size={17} />
                                                            {feature}
                                                        </li>
                                                    ),
                                                )}
                                            </ul>
                                        </>
                                    )}
                                </section>
                            )}
                            {specs.length > 0 && (
                                <section className="detail-panel">
                                    <h2>{t('specifications')}</h2>
                                    <dl>
                                        {specs.map(([label, value]) => (
                                            <div key={label}>
                                                <dt>{label}</dt>
                                                <dd>{value}</dd>
                                            </div>
                                        ))}
                                    </dl>
                                </section>
                            )}
                        </div>
                    )}
                </div>
            </div>
            {related.length > 0 && (
                <section className="section">
                    <div className="wrap">
                        <div className="section-head">
                            <h2>{t('relatedDevices')}</h2>
                            <Link className="button secondary" href={shop()}>
                                {t('allDevices')}
                            </Link>
                        </div>
                        <ProductCards items={related} />
                    </div>
                </section>
            )}
        </>
    );
}
