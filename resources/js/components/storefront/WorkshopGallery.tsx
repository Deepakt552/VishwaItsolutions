import { useSiteText } from '@/lib/site-text';
import type { GalleryPhoto } from '@/types/storefront';

export default function WorkshopGallery({
    photos,
}: {
    photos: GalleryPhoto[];
}) {
    const { t } = useSiteText();

    if (photos.length === 0) {
        return null;
    }

    return (
        <section
            className="section workshop-gallery"
            aria-labelledby="workshop-gallery-title"
        >
            <div className="wrap">
                <div className="section-head">
                    <div>
                        <h2 id="workshop-gallery-title">
                            {t('workshopGallery')}
                        </h2>
                        <p>{t('workshopGalleryIntro')}</p>
                    </div>
                </div>
                <div className="workshop-gallery-masonry">
                    {photos.map((photo) => (
                        <figure
                            key={photo.id}
                            className="workshop-gallery-photo"
                        >
                            <img
                                src={photo.url}
                                alt={photo.alt_text}
                                width={photo.width}
                                height={photo.height}
                                loading="lazy"
                                decoding="async"
                            />
                            {photo.caption && (
                                <figcaption>{photo.caption}</figcaption>
                            )}
                        </figure>
                    ))}
                </div>
            </div>
        </section>
    );
}
