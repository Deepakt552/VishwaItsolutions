import { business, directions, whatsapp } from '@/components/storefront/business';

type WebMcpTool = {
    name: string;
    description: string;
    inputSchema: Record<string, unknown>;
    execute: (input: Record<string, unknown>) => Promise<unknown> | unknown;
};

type ModelContext = {
    registerTool: (tool: WebMcpTool) => void;
};

declare global {
    interface Navigator {
        modelContext?: ModelContext;
    }
}

let registered = false;

export function registerWebMcpTools(visitingChargeInr: number): void {
    if (registered || typeof navigator === 'undefined') {
        return;
    }

    const modelContext = navigator.modelContext;

    if (!modelContext || typeof modelContext.registerTool !== 'function') {
        return;
    }

    registered = true;

    const tools: WebMcpTool[] = [
        {
            name: 'get_repair_pricing_and_services',
            description: `Get Vishwa IT Solutions computer repair services, ₹${visitingChargeInr} visiting charge policy, and specialized chip-level, MacBook, and All-in-One repair capabilities.`,
            inputSchema: {
                type: 'object',
                properties: {},
            },
            execute: () => ({
                business: business.name,
                visitingChargeInr,
                policy: `₹${visitingChargeInr} visiting charge includes diagnosis and repair of any software-related problem. If there is a hardware fault, only the cost of replacement parts applies.`,
                specialties: [
                    'Chip-Level Repairing',
                    'MacBook Repair',
                    'All-in-One Systems',
                ],
                services: [
                    'Laptop & PC repair',
                    'Networking',
                    'Data recovery',
                    'IT support & upgrades',
                    'Office IT support (AMC)',
                ],
                servicesUrl: window.location.origin + '/services',
            }),
        },
        {
            name: 'get_workshop_contact',
            description:
                'Get Vishwa IT Solutions workshop address, phone number, Google Maps directions, and WhatsApp enquiry link.',
            inputSchema: {
                type: 'object',
                properties: {
                    message: {
                        type: 'string',
                        description:
                            'Optional pre-filled WhatsApp enquiry message.',
                    },
                },
            },
            execute: (input) => {
                const msg =
                    typeof input?.message === 'string' &&
                    input.message.trim() !== ''
                        ? input.message.trim()
                        : undefined;
                return {
                    name: business.name,
                    phone: business.phoneText,
                    address: business.address,
                    directionsUrl: directions,
                    whatsappUrl: whatsapp(msg),
                    contactPageUrl: window.location.origin + '/contact',
                };
            },
        },
        {
            name: 'search_used_devices',
            description:
                'Build a direct URL to browse or search available pre-owned laptops, desktops, workstations, and accessories in the Vishwa IT Solutions shop.',
            inputSchema: {
                type: 'object',
                properties: {
                    query: {
                        type: 'string',
                        description:
                            'Search keyword (e.g. ThinkPad, Core i5, Dell).',
                    },
                    category: {
                        type: 'string',
                        enum: [
                            'Laptops',
                            'Desktops',
                            'Workstations',
                            'Accessories',
                        ],
                    },
                },
            },
            execute: (input) => {
                const params = new URLSearchParams();
                if (
                    typeof input?.query === 'string' &&
                    input.query.trim() !== ''
                ) {
                    params.set('q', input.query.trim());
                }
                if (
                    typeof input?.category === 'string' &&
                    input.category.trim() !== ''
                ) {
                    params.set('category', input.category.trim());
                }
                const qs = params.toString();
                return {
                    shopUrl:
                        window.location.origin + '/shop' + (qs ? '?' + qs : ''),
                };
            },
        },
    ];

    for (const tool of tools) {
        try {
            modelContext.registerTool(tool);
        } catch {
            // Ignore duplicate or unsupported tool registration errors.
        }
    }
}

