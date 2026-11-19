import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useSiteText } from '@/lib/site-text';
import { login } from '@/routes';
import { email } from '@/routes/password';

export default function ForgotPassword({ status }: { status?: string }) {
    const { t } = useSiteText();

    return (
        <>
            <Head title={t('forgotTitle')} />
            {status && (
                <p className="auth-notice" role="status">
                    {t('resetLinkSent')}
                </p>
            )}
            <Form {...email.form()} className="auth-form">
                {({ processing, errors }) => (
                    <>
                        <div className="auth-field">
                            <Label htmlFor="email">{t('email')}</Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                autoComplete="email"
                                placeholder="name@example.com"
                                required
                                autoFocus
                            />
                            <InputError message={errors.email} />
                        </div>
                        <Button
                            type="submit"
                            className="auth-submit"
                            disabled={processing}
                            data-test="email-password-reset-link-button"
                        >
                            {processing && <Spinner />}
                            {t('resetLink')}
                        </Button>
                        <TextLink className="auth-form-link" href={login()}>
                            {t('backSignIn')}
                        </TextLink>
                    </>
                )}
            </Form>
        </>
    );
}

ForgotPassword.layout = {
    title: 'forgotTitle',
    description: 'forgotDescription',
};
