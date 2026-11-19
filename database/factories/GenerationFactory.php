<?php

namespace Database\Factories;

use App\Models\Generation;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Generation> */
class GenerationFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'kind' => 'post',
            'topic' => fake()->sentence(6),
            'status' => 'queued',
        ];
    }
}
