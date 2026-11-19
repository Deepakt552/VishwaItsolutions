import { Form } from '@inertiajs/react';
import { Check, Mail } from 'lucide-react';
import {
    DeleteButton,
    PageHeading,
    Panel,
    Status,
} from '@/components/admin/workspace';
import { destroy, index, update } from '@/routes/admin/inbox';
import { dateLabel } from '@/types/storefront';

type Message = {
    id: number;
    subject: string;
    name: string;
    email: string;
    phone: string | null;
    message: string;
    read_at: string | null;
    created_at: string;
};

export default function MessageDetails({ message }: { message: Message }) {
    const reply =
        'mailto:' +
        message.email +
        '?subject=' +
        encodeURIComponent('Re: ' + message.subject);
    return (
        <>
            <PageHeading
                title={message.subject}
                text={message.name + ' · ' + dateLabel(message.created_at)}
                back={{ url: index.url(), label: 'Inbox' }}
                actions={
                    <a href={reply} className="admin-btn admin-primary">
                        <Mail size={17} />
                        Reply by email
                    </a>
                }
            />
            <div className="admin-editor">
                <Panel title="Message">
                    <p className="admin-message">{message.message}</p>
                </Panel>
                <Panel title="Sender">
                    <div className="admin-fields">
                        <Status value={message.read_at ? 'read' : 'unread'} />
                        <a className="admin-inline" href={reply}>
                            {message.email}
                        </a>
                        {message.phone && (
                            <a
                                className="admin-inline"
                                href={
                                    'tel:' +
                                    message.phone.replace(/[^\d+]/g, '')
                                }
                            >
                                {message.phone}
                            </a>
                        )}
                        {!message.read_at && (
                            <Form {...update.form(message.id)}>
                                {({ processing }) => (
                                    <button
                                        className="admin-btn admin-secondary"
                                        disabled={processing}
                                    >
                                        <Check size={17} />
                                        Mark as read
                                    </button>
                                )}
                            </Form>
                        )}
                        <DeleteButton
                            url={destroy.url(message.id)}
                            label="Delete message"
                            message="Delete this enquiry from the inbox?"
                        />
                    </div>
                </Panel>
            </div>
        </>
    );
}
