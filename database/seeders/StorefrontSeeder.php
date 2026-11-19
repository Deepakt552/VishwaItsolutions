<?php

namespace Database\Seeders;

use App\Models\Post;
use App\Models\Product;
use Illuminate\Database\Seeder;

class StorefrontSeeder extends Seeder
{
    public function run(): void
    {
        if (! app()->environment(['local', 'testing'])) {
            return;
        }

        Product::query()->firstOrCreate(['slug' => 'sample-thinkpad-t14'], [
            'name' => 'Sample Lenovo ThinkPad T14',
            'category' => 'Laptops',
            'condition' => 'Good',
            'processor' => 'Intel Core i5',
            'ram_gb' => 16,
            'storage_gb' => 512,
            'storage_type' => 'SSD',
            'description' => 'Example listing for checking the inventory editor.',
        ]);

        Post::query()->firstOrCreate(['slug' => 'sample-used-laptop-guide'], [
            'title' => 'Sample used laptop buying guide',
            'excerpt' => 'A draft example for the article editor.',
            'body' => "## Inspect the device\n\nCheck the screen, keyboard and charging port in person. Confirm the memory and storage in system settings before paying.",
        ]);
    }
}
