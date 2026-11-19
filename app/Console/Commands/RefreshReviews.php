<?php

namespace App\Console\Commands;

use App\Services\LiveReviews;
use Illuminate\Console\Command;

class RefreshReviews extends Command
{
    protected $signature = 'vishwa:refresh-reviews';

    protected $description = 'Refresh cached Google Maps and Justdial reviews from configured feeds';

    public function handle(LiveReviews $reviews): int
    {
        $result = $reviews->refresh();

        $googleStatus = $result['google']['status'] ?? 'unconfigured';
        $justdialStatus = $result['justdial']['status'] ?? 'unconfigured';

        $this->info("Reviews refreshed — Google: {$googleStatus}, Justdial: {$justdialStatus}.");

        return self::SUCCESS;
    }
}
