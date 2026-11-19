import { usePage } from '@inertiajs/react';
import { ChevronDown, Globe2 } from 'lucide-react';
import { useId } from 'react';
import { useSiteText } from '@/lib/site-text';

export default function LanguageSwitcher() {
    const { url } = usePage();
    const { language, t } = useSiteText();
    const id = useId();

    function change(value: string) {
        const next = new URL(url, window.location.origin);
        next.searchParams.set('lang', value);
        next.hash = window.location.hash;
        window.location.assign(next.pathname + next.search + next.hash);
    }

    return (
        <div className="language-switcher">
            <label htmlFor={id}>
                <Globe2 size={17} aria-hidden="true" />
                {t('language')}
            </label>
            <div className="language-control">
                <select
                    id={id}
                    value={language}
                    onChange={(event) => change(event.target.value)}
                >
                    <option value="en" lang="en">
                        English
                    </option>
                    <option value="mr" lang="mr">
                        मराठी
                    </option>
                    <option value="gu" lang="gu">
                        ગુજરાતી
                    </option>
                </select>
                <ChevronDown size={16} aria-hidden="true" />
            </div>
        </div>
    );
}
