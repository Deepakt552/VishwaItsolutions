<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Services\RepairServices;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class McpController extends Controller
{
    public function serverCard(): JsonResponse
    {
        return response()->json([
            'schemaVersion' => '2025-06-18',
            'name' => 'vishwa-it-solutions',
            'title' => 'Vishwa IT Solutions',
            'version' => '1.0.0',
            'description' => 'Read-only MCP server for Vishwa IT Solutions — computer repair services, '.RepairServices::visitingCharge().' visiting charge details, workshop contact info, and pre-owned device inventory in Nalasopara East.',
            'homepage' => route('home'),
            'endpoint' => url('/api/mcp'),
            'transport' => [
                'type' => 'streamable-http',
                'url' => url('/api/mcp'),
            ],
            'capabilities' => [
                'tools' => ['listChanged' => false],
                'resources' => ['subscribe' => false, 'listChanged' => false],
                'prompts' => ['listChanged' => false],
            ],
            'authentication' => [
                'required' => false,
            ],
            'tools' => $this->toolDefinitions(),
        ], 200, [
            'Access-Control-Allow-Origin' => '*',
            'Cache-Control' => 'public, max-age=3600',
        ]);
    }

    public function handle(Request $request): JsonResponse
    {
        $id = $request->input('id');
        $method = (string) $request->input('method', '');
        $params = is_array($request->input('params')) ? $request->input('params') : [];

        return match ($method) {
            'initialize' => response()->json([
                'jsonrpc' => '2.0',
                'id' => $id,
                'result' => [
                    'protocolVersion' => '2025-06-18',
                    'capabilities' => [
                        'tools' => ['listChanged' => false],
                    ],
                    'serverInfo' => [
                        'name' => 'vishwa-it-solutions',
                        'version' => '1.0.0',
                    ],
                ],
            ]),
            'tools/list' => response()->json([
                'jsonrpc' => '2.0',
                'id' => $id,
                'result' => [
                    'tools' => $this->toolDefinitions(),
                ],
            ]),
            'tools/call' => $this->callTool($id, (string) ($params['name'] ?? ''), is_array($params['arguments'] ?? null) ? $params['arguments'] : []),
            default => response()->json([
                'jsonrpc' => '2.0',
                'id' => $id,
                'error' => [
                    'code' => -32601,
                    'message' => 'Method not found.',
                ],
            ], 200),
        };
    }

    /**
     * @param  array<string, mixed>  $arguments
     */
    private function callTool(mixed $id, string $name, array $arguments): JsonResponse
    {
        $result = match ($name) {
            'get_business_info' => [
                'name' => 'Vishwa IT Solutions',
                'phone' => '+91 76667 04188',
                'whatsapp' => 'https://wa.me/917666704188',
                'address' => 'Room no. 2, Chauhan Chawl, Hans Vijay Nagar, Hawai Pada, Nalasopara East, Vasai-Virar, Maharashtra 401209',
                'visiting_charge_inr' => RepairServices::VISITING_CHARGE_INR,
                'visiting_charge_policy' => RepairServices::visitingCharge().' visiting charge includes repair of any software-related problem. If there is a hardware fault, only the cost of replacement parts applies.',
                'specialties' => ['Chip-Level Repairing', 'MacBook Repair', 'All-in-One Systems', 'Laptop & PC Repair', 'Networking', 'Data Recovery', 'Office IT Support (AMC)'],
                'service_areas' => [
                    'palghar_vasai_virar' => ['Nalasopara East', 'Nalasopara West', 'Vasai', 'Virar', 'Palghar', 'Boisar'],
                    'mumbai_western_line' => ['Mira Road', 'Bhayandar', 'Dahisar', 'Borivali', 'Kandivali', 'Malad', 'Goregaon', 'Andheri', 'Bandra', 'Dadar'],
                    'mumbai_central_line' => ['Thane', 'Mulund', 'Bhandup', 'Ghatkopar', 'Kurla', 'Sion', 'Kalyan', 'Dombivli'],
                ],
                'website' => route('home'),
            ],
            'search_products' => $this->searchProducts($arguments),
            default => null,
        };

        if ($result === null) {
            return response()->json([
                'jsonrpc' => '2.0',
                'id' => $id,
                'error' => ['code' => -32602, 'message' => 'Unknown tool: '.$name],
            ]);
        }

        return response()->json([
            'jsonrpc' => '2.0',
            'id' => $id,
            'result' => [
                'content' => [[
                    'type' => 'text',
                    'text' => json_encode($result, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT),
                ]],
            ],
        ]);
    }

    /**
     * @param  array<string, mixed>  $arguments
     * @return array<string, mixed>
     */
    private function searchProducts(array $arguments): array
    {
        $query = Product::available()->orderByDesc('featured')->latest('id');
        $term = isset($arguments['query']) && is_string($arguments['query']) ? trim($arguments['query']) : '';
        $category = isset($arguments['category']) && is_string($arguments['category']) ? trim($arguments['category']) : '';

        if ($term !== '') {
            $like = '%'.addcslashes($term, '%_\\').'%';
            $query->where(function ($q) use ($like): void {
                $q->where('name', 'like', $like)
                    ->orWhere('processor', 'like', $like)
                    ->orWhere('category', 'like', $like);
            });
        }

        if ($category !== '' && in_array($category, Product::CATEGORIES, true)) {
            $query->where('category', $category);
        }

        $items = $query->limit(10)->get(['id', 'name', 'slug', 'category', 'condition', 'price', 'processor', 'ram_gb', 'storage_gb', 'storage_type'])
            ->map(fn (Product $product): array => [
                'name' => $product->name,
                'url' => route('storefront.product', $product->slug),
                'category' => $product->category,
                'condition' => $product->condition,
                'price_inr' => $product->price !== null ? (float) $product->price : null,
                'processor' => $product->processor,
                'ram_gb' => $product->ram_gb,
                'storage' => $product->storage_gb ? trim($product->storage_gb.' GB '.($product->storage_type ?? '')) : null,
            ])->all();

        return ['count' => count($items), 'products' => $items];
    }

    /** @return list<array<string, mixed>> */
    private function toolDefinitions(): array
    {
        return [
            [
                'name' => 'get_business_info',
                'description' => 'Get Vishwa IT Solutions workshop address, phone, WhatsApp link, '.RepairServices::visitingCharge().' visiting charge policy, and repair specialties.',
                'inputSchema' => [
                    'type' => 'object',
                    'properties' => (object) [],
                ],
            ],
            [
                'name' => 'search_products',
                'description' => 'Search available pre-owned laptops, desktops, workstations, and accessories in stock at Vishwa IT Solutions.',
                'inputSchema' => [
                    'type' => 'object',
                    'properties' => [
                        'query' => [
                            'type' => 'string',
                            'description' => 'Search keyword such as model name or processor (e.g. ThinkPad, Core i5).',
                        ],
                        'category' => [
                            'type' => 'string',
                            'enum' => Product::CATEGORIES,
                            'description' => 'Optional device category filter.',
                        ],
                    ],
                ],
            ],
        ];
    }
}
