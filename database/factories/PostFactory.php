<?php

namespace Database\Factories;

use App\Models\Post;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Post> */
class PostFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        $title = fake()->unique()->sentence(5);

        return [
            'title' => $title,
            'slug' => Post::makeSlug($title),
            'excerpt' => fake()->sentence(),
            'body' => fake()->paragraph(),
        ];
    }

    public function published(): static
    {
        return $this->state(fn (): array => ['published_at' => now()]);
    }
}
