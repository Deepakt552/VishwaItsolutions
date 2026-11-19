import { Form, Head } from '@inertiajs/react';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useSiteText } from '@/lib/site-text';
import { logout } from '@/routes';
import { send } from '@/routes/verification';

export default function VerifyEmail({ status }: { status?: string }) {
    const { t } = useSiteText();

    return (
        <>
            <Head title={t('verifyTitle')} />
            {status === 'verification-link-sent' && (
                <p className="auth-notice" role="status">
                    {t('verificationSent')}
                </p>
            )}
            <Form {...send.form()} className="auth-form">
                {({ processing }) => (
                    <>
                        <Button
                            type="submit"
                            className="auth-submit"
                            disabled={processing}
                        >
                            {processing && <Spinner />}
                            {t('resend')}
                        </Button>
                        <TextLink href={logout()} className="auth-form-link">
                            {t('signOut')}
                        </TextLink>
                    </>
                )}
            </Form>
        </>
    );
}

VerifyEmail.layout = { title: 'verifyTitle', description: 'verifyDescription' };
