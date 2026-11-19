<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Product> */
class ProductFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        $name = rtrim(fake()->unique()->sentence(3, false), '.');

        return [
            'name' => ucwords($name),
            'slug' => Product::makeSlug($name),
            'category' => 'Laptops',
            'condition' => 'Good',
            'processor' => 'Intel Core i5',
            'ram_gb' => 16,
            'storage_gb' => 512,
            'storage_type' => 'SSD',
            'age_months' => 24,
        ];
    }

    public function available(): static
    {
        return $this->state(['status' => 'available']);
    }
}
