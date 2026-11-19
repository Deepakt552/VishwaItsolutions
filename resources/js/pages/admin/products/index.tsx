import { Link } from '@inertiajs/react';
import { Package, Plus, Search } from 'lucide-react';
import {
    AdminPagination,
    Empty,
    FilterBar,
    PageHeading,
    Status,
} from '@/components/admin/workspace';
import { money } from '@/components/storefront/business';
import { create, edit, index } from '@/routes/admin/products';
import type { Product, ResourcePage } from '@/types/storefront';
import { storageLabel } from '@/types/storefront';

export default function Products({
    products,
    categories,
    filters,
}: {
    products: ResourcePage<Product>;
    categories: string[];
    filters: { q?: string; status?: string; category?: string };
}) {
    const filtered = Object.values(filters).some(Boolean);
    return (
        <>
            <PageHeading
                title="Products"
                text="Manage pre-owned listings, device specifications and availability."
                actions={
                    <Link className="admin-btn admin-primary" href={create()}>
                        <Plus size={18} />
                        Add product
                    </Link>
                }
            />
            <section className="admin-panel admin-table-panel">
                <FilterBar url={index.url()} active={filtered}>
                    <label className="admin-search">
                        <Search size={17} />
                        <input
                            name="q"
                            aria-label="Search products"
                            placeholder="Search products"
                            maxLength={120}
                            defaultValue={filters.q}
                        />
                    </label>
                    <select
                        name="category"
                        aria-label="Category"
                        defaultValue={filters.category || ''}
                    >
                        <option value="">All categories</option>
                        {categories.map((category) => (
                            <option key={category}>{category}</option>
                        ))}
                    </select>
                    <select
                        name="status"
                        aria-label="Status"
                        defaultValue={filters.status || ''}
                    >
                        <option value="">All statuses</option>
                        <option value="available">Available</option>
                        <option value="draft">Draft</option>
                        <option value="sold">Sold</option>
                    </select>
                </FilterBar>
                {products.data.length > 0 ? (
                    <div className="admin-table-scroll">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Configuration</th>
                                    <th>Status</th>
                                    <th>Price</th>
                                    <th>
                                        <span className="sr-only">Action</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.data.map((item) => (
                                    <tr key={item.id}>
                                        <td>
                                            <Link
                                                href={edit(item.id)}
                                                className="admin-record admin-product-row"
                                            >
                                                {item.photos[0] ? (
                                                    <img
                                                        src={item.photos[0].url}
                                                        alt=""
                                                        loading="lazy"
                                                        width="48"
                                                        height="42"
                                                    />
                                                ) : (
                                                    <span className="admin-thumb">
                                                        <Package size={18} />
                                                    </span>
                                                )}
                                                <span>
                                                    {item.name}
                                                    <small>
                                                        {item.category} ·{' '}
                                                        {item.condition}
                                                        {item.featured &&
                                                            ' · Featured'}
                                                    </small>
                                                </span>
                                            </Link>
                                        </td>
                                        <td>
                                            {[
                                                item.processor,
                                                item.ram_gb &&
                                                    item.ram_gb + ' GB RAM',
                                                item.storage_gb &&
                                                    storageLabel(
                                                        item.storage_gb,
                                                    ),
                                            ]
                                                .filter(Boolean)
                                                .join(' · ') || '—'}
                                        </td>
                                        <td>
                                            <Status value={item.status} />
                                        </td>
                                        <td>
                                            {item.price == null
                                                ? 'On enquiry'
                                                : money.format(
                                                      Number(item.price),
                                                  )}
                                        </td>
                                        <td>
                                            <Link
                                                className="admin-inline"
                                                href={edit(item.id)}
                                                aria-label={'Edit ' + item.name}
                                            >
                                                Edit
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <Empty
                        icon={Package}
                        title={
                            filtered
                                ? 'No matching products'
                                : 'No products yet'
                        }
                        text={
                            filtered
                                ? 'Clear the filters or try another search.'
                                : 'Add a product to start managing inventory.'
                        }
                    />
                )}
                <AdminPagination links={products.meta.links} />
            </section>
        </>
    );
}
