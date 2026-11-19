import { Link, useForm } from '@inertiajs/react';
import { ExternalLink, Save, Sparkles } from 'lucide-react';
import type { FormEvent, HTMLInputTypeAttribute } from 'react';
import {
    DeleteButton,
    Field,
    PageHeading,
    Panel,
} from '@/components/admin/workspace';
import { index as automation } from '@/routes/admin/automation';
import { destroy, index, store, update } from '@/routes/admin/products';
import { product as publicProduct } from '@/routes/storefront';
import type { Product } from '@/types/storefront';

type Props = {
    product: Product | null;
    categories: string[];
    conditions: string[];
    storageTypes: string[];
};

export default function ProductEditor(props: Props) {
    return <Editor key={props.product?.id ?? 'new'} {...props} />;
}

function Editor({ product, categories, conditions, storageTypes }: Props) {
    const form = useForm({
        name: product?.name ?? '',
        category: product?.category ?? categories[0],
        condition: product?.condition ?? 'Unspecified',
        status: product?.status ?? 'draft',
        price: product?.price ?? '',
        processor: product?.processor ?? '',
        ram_gb: String(product?.ram_gb ?? ''),
        storage_gb: String(product?.storage_gb ?? ''),
        storage_type: product?.storage_type ?? '',
        graphics: product?.graphics ?? '',
        operating_system: product?.operating_system ?? '',
        age_months: String(product?.age_months ?? ''),
        description: product?.description ?? '',
        features: product?.features ?? '',
        featured: product?.featured ?? false,
        uploads: [] as File[],
        remove_photos: [] as string[],
        _method: product ? 'PUT' : 'POST',
    });
    const { data, errors, processing, setData } = form;
    const action = product ? update.url(product.id) : store.url();

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const element = event.currentTarget;
        form.post(action, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                const fileInput =
                    element.querySelector<HTMLInputElement>('input[type=file]');
                if (fileInput) fileInput.value = '';
                setData((current) => ({
                    ...current,
                    uploads: [],
                    remove_photos: [],
                }));
            },
        });
    }

    function input(
        name:
            | 'name'
            | 'price'
            | 'processor'
            | 'ram_gb'
            | 'storage_gb'
            | 'graphics'
            | 'operating_system'
            | 'age_months',
        label: string,
        options: {
            type?: HTMLInputTypeAttribute;
            placeholder?: string;
            required?: boolean;
            min?: number;
            max?: number;
            step?: string;
            maxLength?: number;
        } = {},
    ) {
        return (
            <Field label={label} error={errors[name]}>
                <input
                    {...options}
                    value={data[name]}
                    onChange={(event) => setData(name, event.target.value)}
                />
            </Field>
        );
    }

    return (
        <>
            <PageHeading
                title={product ? 'Edit product' : 'Add product'}
                text="Add verified specs and photos so shoppers can see exactly what’s available."
                back={{ url: index.url(), label: 'Products' }}
                actions={
                    product?.status === 'available' ? (
                        <Link
                            href={publicProduct(product.slug)}
                            className="admin-btn admin-secondary"
                        >
                            <ExternalLink size={16} />
                            View listing
                        </Link>
                    ) : !product ? (
                        <Link
                            href={automation({ query: { kind: 'product' } })}
                            className="admin-btn admin-secondary"
                        >
                            <Sparkles size={17} />
                            Generate draft
                        </Link>
                    ) : undefined
                }
            />
            <form onSubmit={submit} className="admin-editor">
                <div className="admin-editor-main">
                    <Panel title="Product information">
                        <div className="admin-fields">
                            {input('name', 'Product name', {
                                required: true,
                                maxLength: 150,
                                placeholder: 'e.g. Lenovo ThinkPad T14',
                            })}
                            <div className="admin-fields two">
                                <Field label="Category" error={errors.category}>
                                    <select
                                        value={data.category}
                                        onChange={(event) =>
                                            setData(
                                                'category',
                                                event.target.value,
                                            )
                                        }
                                    >
                                        {categories.map((value) => (
                                            <option key={value}>{value}</option>
                                        ))}
                                    </select>
                                </Field>
                                <Field
                                    label="Condition"
                                    error={errors.condition}
                                >
                                    <select
                                        value={data.condition}
                                        onChange={(event) =>
                                            setData(
                                                'condition',
                                                event.target.value,
                                            )
                                        }
                                    >
                                        {conditions.map((value) => (
                                            <option key={value}>{value}</option>
                                        ))}
                                    </select>
                                </Field>
                            </div>
                            <Field
                                label="Description"
                                error={errors.description}
                            >
                                <textarea
                                    value={data.description}
                                    onChange={(event) =>
                                        setData(
                                            'description',
                                            event.target.value,
                                        )
                                    }
                                    rows={5}
                                    maxLength={12000}
                                    placeholder="Describe the device, what’s included and any visible wear."
                                />
                            </Field>
                            <Field
                                label="Features"
                                error={errors.features}
                                note="Write one feature per line."
                            >
                                <textarea
                                    value={data.features}
                                    onChange={(event) =>
                                        setData('features', event.target.value)
                                    }
                                    rows={4}
                                    maxLength={3500}
                                    placeholder="e.g. Backlit keyboard"
                                />
                            </Field>
                        </div>
                    </Panel>
                    <Panel
                        title="Device configuration"
                        text="Leave unknown specifications blank."
                    >
                        <div className="admin-fields two">
                            {input('processor', 'Processor', {
                                placeholder: 'e.g. Intel Core i5-1135G7',
                                maxLength: 150,
                            })}
                            {input('ram_gb', 'RAM (GB)', {
                                type: 'number',
                                min: 1,
                                max: 4096,
                                placeholder: '16',
                            })}
                            {input('storage_gb', 'Storage capacity (GB)', {
                                type: 'number',
                                min: 1,
                                max: 1000000,
                                placeholder: '512',
                            })}
                            <Field
                                label="Storage type"
                                error={errors.storage_type}
                            >
                                <select
                                    value={data.storage_type}
                                    onChange={(event) =>
                                        setData(
                                            'storage_type',
                                            event.target.value,
                                        )
                                    }
                                >
                                    <option value="">Unspecified</option>
                                    {storageTypes.map((value) => (
                                        <option key={value}>{value}</option>
                                    ))}
                                </select>
                            </Field>
                            {input('graphics', 'Graphics', { maxLength: 150 })}
                            {input('operating_system', 'Operating system', {
                                maxLength: 100,
                            })}
                            {input('age_months', 'Approximate age (months)', {
                                type: 'number',
                                min: 0,
                                max: 1200,
                                placeholder: '24',
                            })}
                        </div>
                    </Panel>
                    <Panel
                        title="Product photos"
                        text="The first photo is used on the storefront card. Add up to 8 JPG, PNG or WebP images, 4 MB each."
                    >
                        <div className="admin-fields">
                            {product && product.photos.length > 0 && (
                                <div className="admin-photo-grid">
                                    {product.photos.map((photo, position) => (
                                        <div key={photo.name}>
                                            <img
                                                src={photo.url}
                                                width="170"
                                                height="120"
                                                alt={
                                                    'Product photo ' +
                                                    (position + 1)
                                                }
                                            />
                                            <label className="admin-check">
                                                <input
                                                    type="checkbox"
                                                    checked={data.remove_photos.includes(
                                                        photo.name,
                                                    )}
                                                    onChange={(event) =>
                                                        setData(
                                                            'remove_photos',
                                                            event.target.checked
                                                                ? [
                                                                      ...data.remove_photos,
                                                                      photo.name,
                                                                  ]
                                                                : data.remove_photos.filter(
                                                                      (name) =>
                                                                          name !==
                                                                          photo.name,
                                                                  ),
                                                        )
                                                    }
                                                />
                                                Remove photo
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <Field
                                label="Upload photos"
                                error={
                                    errors.uploads ||
                                    Object.entries(errors).find(([key]) =>
                                        key.startsWith('uploads.'),
                                    )?.[1]
                                }
                            >
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    multiple
                                    onChange={(event) =>
                                        setData(
                                            'uploads',
                                            Array.from(
                                                event.target.files ?? [],
                                            ),
                                        )
                                    }
                                />
                            </Field>
                        </div>
                    </Panel>
                </div>
                <div className="admin-editor-side">
                    <Panel title="Listing settings">
                        <div className="admin-fields">
                            <Field label="Status" error={errors.status}>
                                <select
                                    value={data.status}
                                    onChange={(event) =>
                                        setData(
                                            'status',
                                            event.target
                                                .value as Product['status'],
                                        )
                                    }
                                >
                                    <option value="draft">Draft</option>
                                    <option value="available">Available</option>
                                    <option value="sold">Sold</option>
                                </select>
                            </Field>
                            {input('price', 'Price (₹)', {
                                type: 'number',
                                min: 0,
                                max: 9999999999.99,
                                step: '0.01',
                                placeholder: 'Ask for price',
                            })}
                            <label className="admin-check">
                                <input
                                    type="checkbox"
                                    checked={data.featured}
                                    onChange={(event) =>
                                        setData(
                                            'featured',
                                            event.target.checked,
                                        )
                                    }
                                />
                                Prioritise on the homepage
                            </label>
                            <button
                                className="admin-btn admin-primary"
                                type="submit"
                                disabled={processing}
                            >
                                <Save size={17} />
                                {processing
                                    ? 'Saving…'
                                    : product
                                      ? 'Save changes'
                                      : 'Create product'}
                            </button>
                            {product && (
                                <DeleteButton
                                    url={destroy.url(product.id)}
                                    label="Delete product"
                                    message={
                                        'Delete ' +
                                        product.name +
                                        '? This removes its listing and photos.'
                                    }
                                />
                            )}
                        </div>
                    </Panel>
                </div>
            </form>
        </>
    );
}
