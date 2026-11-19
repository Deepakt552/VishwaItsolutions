<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use stdClass;

class ProductIntegration
{
    public function settings(): ?stdClass
    {
        return DB::table('product_integration')->where('id', 1)->first();
    }

    public function enabled(): bool
    {
        return (bool) ($this->settings()->enabled ?? false);
    }

    public function setEnabled(bool $enabled): void
    {
        DB::table('product_integration')->where('id', 1)->update(['enabled' => $enabled]);
    }

    public function rotate(): string
    {
        $token = 'vis_'.Str::random(60);

        DB::table('product_integration')->where('id', 1)->update([
            'token_hash' => hash('sha256', $token),
            'rotated_at' => now(),
        ]);

        return $token;
    }
}
