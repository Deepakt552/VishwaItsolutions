<?php

namespace Database\Seeders;

use App\Models\Post;
use App\Services\RepairServices;
use Illuminate\Database\Seeder;

class LocalRepairGuidesSeeder extends Seeder
{
    public function run(): void
    {
        $guides = [
            'macbook-wont-turn-on-after-monsoon' => [
                'title' => 'MacBook won’t turn on after monsoon dampness in Nalasopara?',
                'excerpt' => 'Learn when to leave a damp MacBook unplugged and what to check when the laptop has stayed dry.',
                'service' => 'macbook-repair',
                'body' => <<<'MARKDOWN'
                    ## When the MacBook may have gotten damp

                    Unplug the charger and accessories. If the MacBook is still on, shut it down. Leave it off and avoid charging it to see if it starts. Moisture can collect inside even when the case looks dry. Skip the hair dryer and rice. Tell the workshop where the moisture may have entered and whether the MacBook was powered on at the time.

                    ## When the keyboard and ports stayed dry

                    Check the wall outlet with another device. Try a known-good charger and cable compatible with your MacBook. Disconnect hubs and external drives, then attempt a normal startup. Record whether you hear a startup sound or see anything on the display. Those clues help distinguish a charging problem from a display or startup fault.

                    If you need to bring the device to the Nalasopara East workshop during the rains, keep it in a dry sleeve inside a waterproof bag. Bring the charger and tell the technician if any important files are missing from your backup.
                    MARKDOWN,
            ],
            'desktop-turns-on-but-no-display' => [
                'title' => 'Desktop turns on but shows no picture in Vasai-Virar',
                'excerpt' => 'Check the monitor, input and cable before deciding whether the desktop needs a hardware diagnosis.',
                'service' => 'laptop-repair',
                'body' => <<<'MARKDOWN'
                    ## Start with the monitor and cable

                    Open the monitor’s own menu. If the menu appears, check that the selected input matches the port you are using, such as HDMI or DisplayPort. Reseat both ends of the cable. If you can, try a cable or monitor that works with another computer.

                    ## Check which port the desktop uses

                    If a desktop has a separate graphics card, connect the cable to the same card output that previously worked. Some motherboard display ports only work with processors that have integrated graphics. Disconnect extra screens and adapters before trying again.

                    Fans can spin even when the computer fails to start. Note any blinking lights or repeated beeps and whether the fault first appeared after a move, power outage or upgrade. If you arrange a repair from Vasai or Virar, share which monitor and cable you have already tested so the technician can start with the desktop.
                    MARKDOWN,
            ],
            'laptop-no-power-charger-or-motherboard' => [
                'title' => 'Laptop has no power. Could it be the charger or motherboard?',
                'excerpt' => 'Identify the signs that can help a Nalasopara East technician narrow down a laptop power fault.',
                'service' => 'motherboard-repair',
                'body' => <<<'MARKDOWN'
                    ## Rule out the outlet and adapter

                    Try a working outlet, check the charger cable for damage and disconnect docks and USB accessories. If the laptop stayed dry and looks undamaged, try a charger approved for that model. For USB-C laptops, the port must support charging and the charger and cable must supply the required power.

                    ## Record the charging light and symptoms

                    Note whether a charging light appears, the laptop starts briefly or the screen stays blank while the fan runs. A failing charger, damaged charging port, battery fault and motherboard fault can produce similar symptoms. If you smell burning, see swelling or notice the charger light goes out whenever you connect it, unplug the charger and stop testing.

                    Bring the charger with the laptop to the Hawai Pada workshop. Ask for a diagnosis and quote before approving parts or board work. If the laptop holds important files, mention that before authorizing any repair that could affect storage.
                    MARKDOWN,
            ],
            'nvme-ssd-data-recovery-vasai-virar' => [
                'title' => 'What affects NVMe SSD data recovery cost in Vasai-Virar?',
                'excerpt' => 'Understand what affects a recovery quote and how to avoid overwriting files on a failing NVMe drive.',
                'service' => 'data-recovery',
                'body' => <<<'MARKDOWN'
                    ## Protect the files first

                    Stop using the drive if files disappear, the drive drops out repeatedly or Windows asks you to initialize or format it. Avoid reinstalling the operating system, running repair utilities or saving recovered files back to the source drive. Deleted files on an SSD can become unrecoverable after TRIM and internal cleanup.

                    ## What changes the quote

                    Tell the technician if the drive is detected, what happened just before the fault, and which files matter most. Recovery effort depends on whether the issue is logical or hardware-related, whether the drive can be read reliably and whether the volume is encrypted. If BitLocker or device encryption was enabled, locate the recovery key and keep it private until the technician explains how it will be used.

                    When asking for a quote in Vasai-Virar, confirm what the evaluation covers and whether a separate destination drive is needed. Ask which priority files can be checked before approving recovery.
                    MARKDOWN,
            ],
            'laptop-overheating-slow-shutdown' => [
                'title' => 'Laptop overheating or shutting down in Nalasopara?',
                'excerpt' => 'Distinguish blocked airflow and high CPU use from signs that a laptop needs workshop inspection.',
                'service' => 'laptop-repair',
                'body' => <<<'MARKDOWN'
                    ## Check airflow and workload

                    Use the laptop on a flat, hard surface with space around the vents. Check Task Manager or Activity Monitor for a process keeping the CPU busy. If the fan calms when the task finishes, take note of the app and whether the same symptoms return during light use.

                    ## Stop if the laptop keeps shutting off

                    Repeated shutdowns, grinding fan noise or a fan that stays silent under load are reasons to stop testing and have the laptop inspected. Avoid running a stress test. If the case is swollen or there is a burning smell, switch the laptop off, unplug it and leave it off.

                    Before bringing it to the Nalasopara East workshop, note the model and how long it takes to slow down or shut off. Ask the technician to check the fan and dust buildup before quoting parts. Back up important files if the laptop can stay on safely long enough.
                    MARKDOWN,
            ],
        ];

        $services = RepairServices::all();

        foreach ($guides as $slug => $guide) {
            $serviceName = $services[$guide['service']]['name'];
            $serviceUrl = route('storefront.service', $guide['service'], absolute: false);

            Post::query()->firstOrCreate(['slug' => $slug], [
                'title' => $guide['title'],
                'excerpt' => $guide['excerpt'],
                'body' => $guide['body']."\n\n[Explore our {$serviceName} service]({$serviceUrl}).",
                'published_at' => now(),
            ]);
        }
    }
}
