<?php

namespace App\Services;

class RepairServices
{
    public const VISITING_CHARGE_INR = 400;

    public static function visitingCharge(): string
    {
        return '₹'.self::VISITING_CHARGE_INR;
    }

    /**
     * @return array<string, array{name: string, title: string, description: string, image: string, sections: array<string, string>}>
     */
    public static function all(): array
    {
        return [
            'laptop-repair' => [
                'name' => 'Laptop & PC Repair',
                'title' => 'Laptop Screen & Charging Repair in Nalasopara',
                'description' => 'Get help with laptop screens, keyboards, charging faults, overheating and Windows problems at our Nalasopara East repair workshop.',
                'image' => '/service-photos/laptop-repair.webp',
                'sections' => [
                    'Laptop and desktop problems we check' => 'Bring in a laptop or desktop that won’t switch on, loses charge, shuts down under load or has a damaged screen or keyboard. If it still turns on but runs slowly, we can check whether Windows, cooling or a failing drive is responsible.',
                    'When a part needs replacing' => 'A laptop that won’t charge can have a faulty adaptor, battery, charging port or motherboard. Bring its charger if you have it. We’ll explain what the diagnosis points to and quote any replacement parts before you approve the repair.',
                    'Workshop and visiting charges' => 'Our workshop is in Hawai Pada, Nalasopara East. If you need a technician to visit, call to confirm availability. The '.self::visitingCharge().' visiting charge covers software-related repair. Hardware replacement parts are quoted separately.',
                ],
            ],
            'macbook-repair' => [
                'name' => 'MacBook Repair',
                'title' => 'MacBook Repair in Nalasopara East',
                'description' => 'Ask our Nalasopara East workshop about MacBook Air and MacBook Pro battery, display, keyboard, charging, logic board and macOS problems.',
                'image' => '/social-preview.jpg',
                'sections' => [
                    'MacBook Air and MacBook Pro diagnostics' => 'We check battery and charging faults, display problems, unresponsive keyboards and macOS startup issues. Share the model and year if you know them, along with what happens when you connect the charger or press the power button.',
                    'Charging, display and logic board faults' => 'A black screen or a MacBook that won’t turn on can have several causes. We check the symptoms before recommending a display, battery or logic board repair. The model and the fault determine which repair options are available.',
                    'Before bringing in your MacBook' => 'Back up important files if the MacBook still works. If liquid was spilled on it, power it off and disconnect the charger. Tell us about the spill or any previous repair when you call the Nalasopara East workshop.',
                ],
            ],
            'motherboard-repair' => [
                'name' => 'Chip-Level Motherboard Repair',
                'title' => 'Chip-Level Motherboard Repair in Nalasopara',
                'description' => 'Contact Vishwa IT Solutions in Nalasopara East for chip-level laptop and desktop motherboard diagnostics, including no-power and charging faults.',
                'image' => '/repair-bench.webp',
                'sections' => [
                    'No-power and intermittent faults' => 'A laptop that stays dead with a working charger, powers off unexpectedly or stops charging may need a board-level diagnosis. We also check desktop and all-in-one systems with power or startup problems.',
                    'What chip-level repair involves' => 'We check the circuits involved in power and charging to see whether a fault can be isolated to a component. If a component-level repair is possible, we explain that option before you decide. Some boards may need replacement depending on the damage and parts availability.',
                    'What to tell the technician' => 'Tell us the make and model, the first sign of the fault and whether the machine was exposed to liquid or worked on previously. If the problem comes and goes, mention when it happens, such as during charging or after the machine warms up.',
                ],
            ],
            'data-recovery' => [
                'name' => 'Data Recovery',
                'title' => 'HDD & SSD Data Recovery in Nalasopara East',
                'description' => 'Get a recovery assessment for an unreadable hard drive, SSD or USB drive at our Nalasopara East workshop. Ask about recovery and backup options.',
                'image' => '/service-photos/data-recovery.webp',
                'sections' => [
                    'Unrecognized or unreadable drives' => 'We assess hard disks, SATA and NVMe SSDs, and USB drives that stop appearing, report errors or contain files you can no longer open. Tell us what happened immediately before the failure, such as a drop, a power cut or an accidental format.',
                    'Avoid writing more data to the drive' => 'If the data matters, stop using the affected drive. Avoid formatting it or saving new files to it, as this can overwrite data that might otherwise be recoverable. If a hard disk starts clicking, shut it down and ask about the next step.',
                    'Assessment and recovery options' => 'List the folders or files you need most. We’ll assess the drive and explain what options are available before you decide how to proceed. Recovery depends on the fault and the state of the storage device. Ask us about setting up a separate backup once you have your files.',
                ],
            ],
        ];
    }

    /** @return list<array{name: string, url: string}> */
    public static function links(): array
    {
        $links = [];

        foreach (self::all() as $slug => $service) {
            $links[] = ['name' => $service['name'], 'url' => route('storefront.service', $slug)];
        }

        return $links;
    }
}
