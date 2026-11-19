import type { SiteTextKey } from '@/lib/site-text';

type Service = {
    id: string;
    title: SiteTextKey;
    summary: SiteTextKey;
    icon: string;
    image: string;
    points: SiteTextKey[];
};

export const servicesList: Service[] = [
    {
        id: 'repair',
        title: 'repair',
        summary: 'repairSummary',
        icon: 'laptop',
        image: 'laptop-repair',
        points: [
            'repairChipLevel',
            'repairMacAio',
            'repairScreen',
            'repairPower',
            'repairSlow',
        ],
    },
    {
        id: 'networking',
        title: 'network',
        summary: 'networkSummary',
        icon: 'network',
        image: 'networking',
        points: ['networkWifi', 'networkCable', 'networkFix'],
    },
    {
        id: 'data-recovery',
        title: 'recovery',
        summary: 'recoverySummary',
        icon: 'recovery',
        image: 'data-recovery',
        points: ['recoveryCheck', 'recoveryOptions', 'recoveryBackup'],
    },
    {
        id: 'upgrades',
        title: 'upgrades',
        summary: 'upgradesSummary',
        icon: 'upgrades',
        image: 'it-upgrades',
        points: ['upgradesWindows', 'upgradesRam', 'upgradesSetup'],
    },
    {
        id: 'office-it',
        title: 'office',
        summary: 'officeSummary',
        icon: 'calendar',
        image: 'networking',
        points: ['officeCare', 'officeNetwork', 'officePlan'],
    },
];
