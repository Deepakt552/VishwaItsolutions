import { Form } from '@inertiajs/react';
import { Images, Save, Upload } from 'lucide-react';
import {
    AdminPagination,
    DeleteButton,
    Empty,
    Field,
    PageHeading,
    Panel,
} from '@/components/admin/workspace';
import { destroy, store, update } from '@/routes/admin/gallery';
import type { GalleryPhoto, PageResult } from '@/types/storefront';

function PhotoDetails({
    photo,
    errors,
}: {
    photo?: GalleryPhoto;
    errors: { alt_text?: string; caption?: string };
}) {
    return (
        <>
            <Field
                label="Alt text"
                error={errors.alt_text}
                note="Describe the photo for someone who can’t see it."
            >
                <input
                    name="alt_text"
                    defaultValue={photo?.alt_text}
                    maxLength={160}
                    required
                />
            </Field>
            <Field label="Caption (optional)" error={errors.caption}>
                <input
                    name="caption"
                    defaultValue={photo?.caption ?? ''}
                    maxLength={220}
                />
            </Field>
        </>
    );
}

export default function Gallery({
    photos,
}: {
    photos: PageResult<GalleryPhoto>;
}) {
    return (
        <>
            <PageHeading
                title="Workshop gallery"
                text="The nine most recent uploads appear on the homepage."
            />
            <Panel title="Upload a photo">
                <Form
                    action={store.url()}
                    method="post"
                    encType="multipart/form-data"
                    errorBag="galleryUpload"
                    resetOnSuccess
                    className="admin-fields"
                >
                    {({ errors, processing }) => (
                        <>
                            <Field
                                label="Workshop or repair photo"
                                error={errors.image}
                                note="JPEG, PNG, or WebP. Up to 1.5 MB and 2,400 pixels per side."
                            >
                                <input
                                    type="file"
                                    name="image"
                                    accept="image/jpeg,image/png,image/webp"
                                    required
                                />
                            </Field>
                            <PhotoDetails errors={errors} />
                            <div className="admin-actions">
                                <button
                                    className="admin-btn admin-primary"
                                    type="submit"
                                    disabled={processing}
                                >
                                    <Upload size={17} /> Upload photo
                                </button>
                            </div>
                        </>
                    )}
                </Form>
            </Panel>
            {photos.data.length ? (
                <div className="admin-gallery-grid">
                    {photos.data.map((photo) => (
                        <article className="admin-panel" key={photo.id}>
                            <img
                                className="admin-gallery-preview"
                                src={photo.url}
                                alt={photo.alt_text}
                                width={photo.width}
                                height={photo.height}
                                loading="lazy"
                            />
                            <Form
                                action={update.url(photo.id)}
                                method="patch"
                                errorBag={`galleryPhoto${photo.id}`}
                                options={{ preserveScroll: true }}
                                className="admin-fields"
                            >
                                {({ errors, processing }) => (
                                    <>
                                        <PhotoDetails
                                            photo={photo}
                                            errors={errors}
                                        />
                                        <div className="admin-actions">
                                            <button
                                                className="admin-btn admin-secondary"
                                                type="submit"
                                                disabled={processing}
                                            >
                                                <Save size={16} /> Save details
                                            </button>
                                            <DeleteButton
                                                url={destroy.url(photo.id)}
                                                label="Remove"
                                                message="Remove this photo from the workshop gallery?"
                                            />
                                        </div>
                                    </>
                                )}
                            </Form>
                        </article>
                    ))}
                </div>
            ) : (
                <Empty
                    icon={Images}
                    title="No photos yet"
                    text="Upload a photo to show the gallery on the homepage."
                />
            )}
            <AdminPagination links={photos.links} />
        </>
    );
}
