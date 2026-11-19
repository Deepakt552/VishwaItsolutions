<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WebsiteVisit extends Model
{
    public $timestamps = false;

    /** @var list<string> */
    protected $fillable = [
        'ip_address',
        'visits_count',
        'first_path',
        'last_path',
        'user_agent',
        'referrer',
        'first_visited_at',
        'last_visited_at',
    ];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'visits_count' => 'integer',
            'first_visited_at' => 'datetime',
            'last_visited_at' => 'datetime',
        ];
    }
}
