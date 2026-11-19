import { Link } from '@inertiajs/react';
import { Mail } from 'lucide-react';
import {
    AdminPagination,
    Empty,
    PageHeading,
    Status,
} from '@/components/admin/workspace';
import { show } from '@/routes/admin/inbox';
import type { PageResult } from '@/types/storefront';
import { dateLabel } from '@/types/storefront';

type Message = {
    id: number;
    subject: string;
    name: string;
    email: string;
    read_at: string | null;
    created_at: string;
};

export default function Inbox({ messages }: { messages: PageResult<Message> }) {
    return (
        <>
            <PageHeading
                title="Inbox"
                text="Read and respond to messages sent from the contact page."
            />
            <section className="admin-panel admin-table-panel">
                {messages.data.length > 0 ? (
                    <div className="admin-table-scroll">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Enquiry</th>
                                    <th>Status</th>
                                    <th>Received</th>
                                    <th>
                                        <span className="sr-only">Action</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {messages.data.map((message) => (
                                    <tr key={message.id}>
                                        <td>
                                            <Link
                                                className="admin-record"
                                                href={show(message.id)}
                                            >
                                                {message.subject}
                                                <small>
                                                    {message.name} ·{' '}
                                                    {message.email}
                                                </small>
                                            </Link>
                                        </td>
                                        <td>
                                            <Status
                                                value={
                                                    message.read_at
                                                        ? 'read'
                                                        : 'unread'
                                                }
                                            />
                                        </td>
                                        <td>{dateLabel(message.created_at)}</td>
                                        <td>
                                            <Link
                                                className="admin-inline"
                                                href={show(message.id)}
                                                aria-label={
                                                    'Open ' + message.subject
                                                }
                                            >
                                                Open
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <Empty
                        icon={Mail}
                        title="No enquiries yet"
                        text="Messages from the website will appear here."
                    />
                )}
                <AdminPagination links={messages.links} />
            </section>
        </>
    );
}
