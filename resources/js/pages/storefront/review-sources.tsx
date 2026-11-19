import PageHeader from '@/components/storefront/PageHeader';
import { useSiteText } from '@/lib/site-text';

export default function ReviewSources() {
    const { t } = useSiteText();

    return (
        <>
            <PageHeader
                narrow
                breadcrumbLabel={t('reviewSources')}
                title={t('reviewSources')}
                description={t('reviewSourcesIntro')}
            />
            <div className="wrap article-wrap article-body article-content">
                <h2>{t('reviewTerms')}</h2>
                <p>{t('reviewTermsCopy')}</p>
                <ul>
                    <li>
                        <a
                            href="https://www.google.com/help/terms_maps/"
                            target="_blank"
                            rel="noreferrer"
                        >
                            {t('googleTerms')}
                        </a>
                    </li>
                    <li>
                        <a
                            href="https://policies.google.com/privacy"
                            target="_blank"
                            rel="noreferrer"
                        >
                            {t('googlePrivacy')}
                        </a>
                    </li>
                    <li>
                        <a
                            href="https://support.google.com/contributionpolicy/answer/7422880"
                            target="_blank"
                            rel="noreferrer"
                        >
                            {t('reviewGooglePolicy')}
                        </a>
                    </li>
                </ul>
                <h2>{t('reviewPrivacy')}</h2>
                <p>{t('reviewPrivacyCopy')}</p>
            </div>
        </>
    );
}
