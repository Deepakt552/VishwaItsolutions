import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useSiteText } from '@/lib/site-text';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { t } = useSiteText();

    return (
        <>
            <Head title={t('loginTitle')} />
            {status && (
                <p className="auth-notice" role="status">
                    {status}
                </p>
            )}
            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="auth-form"
            >
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
                        <div className="auth-field">
                            <div className="auth-field-row">
                                <Label htmlFor="password">
                                    {t('password')}
                                </Label>
                                {canResetPassword && (
                                    <TextLink href={request()}>
                                        {t('forgotLink')}
                                    </TextLink>
                                )}
                            </div>
                            <PasswordInput
                                id="password"
                                name="password"
                                autoComplete="current-password"
                                required
                            />
                            <InputError message={errors.password} />
                        </div>
                        <div className="auth-remember">
                            <Checkbox id="remember" name="remember" />
                            <Label htmlFor="remember">{t('remember')}</Label>
                        </div>
                        <Button
                            type="submit"
                            className="auth-submit"
                            data-test="login-button"
                            disabled={processing}
                        >
                            {processing && <Spinner />}
                            {t('signIn')}
                        </Button>
                    </>
                )}
            </Form>
        </>
    );
}

Login.layout = { title: 'loginTitle', description: 'loginDescription' };
