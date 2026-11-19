import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useSiteText } from '@/lib/site-text';
import { update } from '@/routes/password';

export default function ResetPassword({
    token,
    email,
    passwordRules,
}: {
    token: string;
    email: string;
    passwordRules: string;
}) {
    const { t } = useSiteText();

    return (
        <>
            <Head title={t('resetTitle')} />
            <Form
                {...update.form()}
                transform={(data) => ({ ...data, token, email })}
                resetOnSuccess={['password', 'password_confirmation']}
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
                                value={email}
                                readOnly
                            />
                            <InputError message={errors.email} />
                        </div>
                        <div className="auth-field">
                            <Label htmlFor="password">{t('password')}</Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                autoComplete="new-password"
                                passwordrules={passwordRules}
                                required
                                autoFocus
                            />
                            <InputError message={errors.password} />
                        </div>
                        <div className="auth-field">
                            <Label htmlFor="password_confirmation">
                                {t('confirmPassword')}
                            </Label>
                            <PasswordInput
                                id="password_confirmation"
                                name="password_confirmation"
                                autoComplete="new-password"
                                passwordrules={passwordRules}
                                required
                            />
                            <InputError
                                message={errors.password_confirmation}
                            />
                        </div>
                        <Button
                            type="submit"
                            className="auth-submit"
                            disabled={processing}
                            data-test="reset-password-button"
                        >
                            {processing && <Spinner />}
                            {t('resetTitle')}
                        </Button>
                    </>
                )}
            </Form>
        </>
    );
}

ResetPassword.layout = { title: 'resetTitle', description: 'resetDescription' };
