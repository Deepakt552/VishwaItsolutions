<?php

namespace App\Models;

use Database\Factories\GenerationFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['user_id', 'kind', 'topic', 'notes', 'reference_path', 'reference_mime', 'status', 'error', 'product_id', 'post_id'])]
#[Hidden(['reference_path', 'reference_mime', 'notes'])]
class Generation extends Model
{
    /** @use HasFactory<GenerationFactory> */
    use HasFactory;
}
