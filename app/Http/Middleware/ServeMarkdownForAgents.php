<?php

namespace App\Http\Middleware;

use App\Models\Post;
use App\Models\Product;
use App\Services\RepairServices;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ServeMarkdownForAgents
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($this->wantsMarkdown($request)) {
            $markdown = $this->renderMarkdown($request);

            if ($markdown !== null) {
                return response($markdown, 200, [
                    'Content-Type' => 'text/markdown; charset=UTF-8',
                    'Vary' => 'Accept',
                ]);
            }
        }

        $response = $next($request);

        if ($request->isMethod('GET') && ! $request->is('admin/*', 'api/*', 'dashboard', 'settings/*')) {
            $existingVary = (string) $response->headers->get('Vary', '');
            if (! str_contains(strtolower($existingVary), 'accept')) {
                $response->headers->set('Vary', $existingVary === '' ? 'Accept' : $existingVary.', Accept');
            }
        }

        return $response;
    }

    private function wantsMarkdown(Request $request): bool
    {
        if (! $request->isMethod('GET')) {
            return false;
        }

        $accept = strtolower((string) $request->header('Accept', ''));

        if (! str_contains($accept, 'text/markdown')) {
            return false;
        }

        return ! $request->is('admin/*', 'api/*', 'dashboard', 'settings/*', 'login', 'logout', 'reviews/live', 'media/*');
    }

    private function renderMarkdown(Request $request): ?string
    {
        $path = '/'.ltrim($request->path(), '/');
        $path = $path === '//' ? '/' : $path;

        return match ($path) {
            '/' => $this->homeMarkdown(),
            '/about' => $this->aboutMarkdown(),
            '/services' => $this->servicesMarkdown(),
            '/shop' => $this->shopMarkdown(),
            '/blog' => $this->blogMarkdown(),
            '/contact' => $this->contactMarkdown(),
            '/terms' => $this->termsMarkdown(),
            '/review-sources' => $this->reviewSourcesMarkdown(),
            default => null,
        };
    }

    private function homeMarkdown(): string
    {
        $products = Product::available()->orderByDesc('featured')->latest('id')->limit(6)->get(['name', 'slug', 'category', 'condition', 'price', 'processor', 'ram_gb', 'storage_gb', 'storage_type']);
        $posts = Post::published()->latest('published_at')->latest('id')->limit(5)->get(['title', 'slug', 'excerpt', 'published_at']);

        $lines = [
            '# Vishwa IT Solutions — Laptop & PC Repair in Nalasopara East',
            '',
            'Vishwa IT Solutions provides laptop & PC repair, chip-level motherboard repairing, MacBook & All-in-One (AIO) system repair, networking, data recovery, office IT support (AMC), and tested pre-owned computers in Nalasopara East, Vasai-Virar, Maharashtra.',
            '',
            '## Visiting Charges & Repair Policy',
            '- **Visiting Charge:** '.RepairServices::visitingCharge().' (includes diagnosis and repair of any software-related problem).',
            '- **Hardware Faults:** Only the cost of replacement parts is charged extra (confirmed before repair).',
            '',
            '## Core Services',
            '- **Laptop & PC Repair:** Chip-level motherboard repairing, MacBook repair, All-in-One (AIO) systems, screens, keyboards, charging, power & overheating fixes.',
            '- **Networking:** Wi-Fi, routers, switches & structured cabling for homes and offices.',
            '- **Data Recovery:** Hard drives, SSDs, USB drives & backup setup.',
            '- **IT Support & Upgrades:** Windows setup, drivers, SSD & RAM upgrades.',
            '- **Office IT Support (AMC):** Ongoing scheduled maintenance for business computers and networks.',
            '',
            '## Frequently Asked Questions',
            '- **What are the visiting and repair charges?** Our visiting charge is '.RepairServices::visitingCharge().', which includes repairing any software-related problem. If there is a hardware fault, only the cost of replacement parts applies.',
            '- **Do you repair MacBooks, All-in-One PCs, and chip-level faults?** Yes — we handle chip-level motherboard repairing, MacBook repairs, All-in-One systems, and all major Windows laptops and desktops.',
            '- **Can I visit the workshop?** Yes, call +91 76667 04188 before visiting Room no. 2, Chauhan Chawl, Hans Vijay Nagar, Hawai Pada, Nalasopara East, Vasai-Virar, Maharashtra 401209.',
            '',
        ];

        if ($products->isNotEmpty()) {
            $lines[] = '## Available Pre-owned Devices';
            foreach ($products as $product) {
                $price = $product->price !== null ? '₹'.number_format((float) $product->price, 0) : 'Ask for price';
                $lines[] = sprintf('- [%s](%s) (%s · %s · %s)', $product->name, route('storefront.product', $product->slug), $product->category, $product->condition, $price);
            }
            $lines[] = '';
        }

        if ($posts->isNotEmpty()) {
            $lines[] = '## Latest Articles';
            foreach ($posts as $post) {
                $lines[] = sprintf('- [%s](%s) — %s', $post->title, route('storefront.article', $post->slug), $post->excerpt);
            }
            $lines[] = '';
        }

        $lines = array_merge($lines, $this->linksFooter());

        return implode("\n", $lines)."\n";
    }

    private function aboutMarkdown(): string
    {
        return implode("\n", array_merge([
            '# About Vishwa IT Solutions',
            '',
            'Vishwa IT Solutions is a local computer repair workshop and IT support provider serving Nalasopara East and the Vasai-Virar region in Maharashtra, India.',
            '',
            '## What We Specialize In',
            '- Chip-level motherboard repairing for laptops and desktops',
            '- MacBook logic board, display, battery, keyboard & macOS repair',
            '- All-in-One (AIO) desktop repair and hardware upgrades',
            '- Office IT maintenance plans (AMC) and networking setup',
            '- Tested pre-owned laptops, desktops, and workstations',
            '',
            '## Location & Contact',
            '- **Address:** Room no. 2, Chauhan Chawl, Hans Vijay Nagar, Hawai Pada, Nalasopara East, Vasai-Virar, Maharashtra 401209',
            '- **Phone / WhatsApp:** +91 76667 04188',
            '',
        ], $this->linksFooter()))."\n";
    }

    private function servicesMarkdown(): string
    {
        return implode("\n", array_merge([
            '# Computer Repair & IT Services — Vishwa IT Solutions',
            '',
            '## Visiting Charge',
            '- **'.RepairServices::visitingCharge().' Visiting Charge** — includes repair of any software-related problem.',
            '- **Hardware Faults** — only the cost of replacement parts applies.',
            '',
            '## Specialized Hardware Repairs',
            '- **Chip-Level Repairing:** Motherboard IC, power rail & micro-soldering diagnostics.',
            '- **MacBook Repair:** Logic board, screen, battery, keyboard & macOS troubleshooting.',
            '- **All-in-One Systems:** Display panels, internal power supply, SSD/RAM & board-level repair.',
            '',
            '## Service Categories',
            '- Laptop & PC repair',
            '- Networking (Wi-Fi, routers, switches, cabling)',
            '- Data recovery (HDD, SSD, USB drives & backups)',
            '- IT support & upgrades (Windows, RAM, SSD)',
            '- Office IT support & annual maintenance contracts (AMC)',
            '',
        ], $this->linksFooter()))."\n";
    }

    private function shopMarkdown(): string
    {
        $products = Product::available()->orderByDesc('featured')->latest('id')->limit(24)->get(['name', 'slug', 'category', 'condition', 'price', 'processor', 'ram_gb', 'storage_gb', 'storage_type']);
        $lines = [
            '# Pre-owned Computers & Accessories — Vishwa IT Solutions',
            '',
            'Browse tested pre-owned laptops, desktops, workstations, and accessories available in Nalasopara East.',
            '',
        ];

        if ($products->isEmpty()) {
            $lines[] = 'No devices are currently listed online. Contact us on WhatsApp (+91 76667 04188) for current workshop stock.';
        } else {
            foreach ($products as $product) {
                $price = $product->price !== null ? '₹'.number_format((float) $product->price, 0) : 'Ask for price';
                $specs = array_filter([
                    $product->processor,
                    $product->ram_gb ? $product->ram_gb.' GB RAM' : null,
                    $product->storage_gb ? trim($product->storage_gb.' GB '.($product->storage_type ?? '')) : null,
                ]);
                $lines[] = sprintf('- [%s](%s) — %s | %s | %s%s', $product->name, route('storefront.product', $product->slug), $product->category, $product->condition, $price, $specs ? ' | '.implode(', ', $specs) : '');
            }
        }

        $lines[] = '';

        return implode("\n", array_merge($lines, $this->linksFooter()))."\n";
    }

    private function blogMarkdown(): string
    {
        $posts = Post::published()->latest('published_at')->latest('id')->limit(15)->get(['title', 'slug', 'excerpt', 'published_at']);
        $lines = [
            '# IT Advice, Buying Guides & Repair Tips — Vishwa IT Solutions',
            '',
        ];

        if ($posts->isEmpty()) {
            $lines[] = 'Practical guides and repair tips will be published here soon.';
        } else {
            foreach ($posts as $post) {
                $lines[] = sprintf('- [%s](%s) (%s) — %s', $post->title, route('storefront.article', $post->slug), $post->published_at?->toDateString() ?? 'Recent', $post->excerpt);
            }
        }

        $lines[] = '';

        return implode("\n", array_merge($lines, $this->linksFooter()))."\n";
    }

    private function contactMarkdown(): string
    {
        return implode("\n", array_merge([
            '# Contact Vishwa IT Solutions',
            '',
            '- **Phone / WhatsApp:** +91 76667 04188',
            '- **Address:** Room no. 2, Chauhan Chawl, Hans Vijay Nagar, Hawai Pada, Nalasopara East, Vasai-Virar, Maharashtra 401209',
            '- **Visiting Charge:** '.RepairServices::visitingCharge().' (includes software-related repairs; hardware parts billed separately)',
            '',
        ], $this->linksFooter()))."\n";
    }

    private function termsMarkdown(): string
    {
        return implode("\n", array_merge([
            '# Terms of Service & Privacy — Vishwa IT Solutions',
            '',
            '- **Visiting & Diagnostic Charge:** '.RepairServices::visitingCharge().' per visit covers software troubleshooting and repair. Any hardware replacement parts are quoted and approved by the customer before installation.',
            '- **Data Privacy:** Customer drives and devices are handled confidentially. Customers are advised to back up important data prior to repair whenever possible.',
            '- **Enquiries & Analytics:** Contact form messages are used strictly to respond to your service or product enquiry. Basic anonymised visit counts are used to understand site traffic.',
            '',
        ], $this->linksFooter()))."\n";
    }

    private function reviewSourcesMarkdown(): string
    {
        return implode("\n", array_merge([
            '# Review Sources & Privacy — Vishwa IT Solutions',
            '',
            'Vishwa IT Solutions links to and displays customer reviews from Google Maps and Justdial.',
            '',
        ], $this->linksFooter()))."\n";
    }

    /** @return list<string> */
    private function linksFooter(): array
    {
        return [
            '## Key Pages',
            '- [Home]('.route('home').')',
            '- [About]('.route('storefront.about').')',
            '- [Services]('.route('storefront.services').')',
            '- [Shop]('.route('storefront.shop').')',
            '- [Blog]('.route('storefront.blog').')',
            '- [Contact]('.route('storefront.contact').')',
            '- [Terms & Privacy]('.route('storefront.terms').')',
            '- [LLMs Guide]('.url('/llms.txt').')',
            '- [MCP Server Card]('.url('/.well-known/mcp/server-card.json').')',
        ];
    }
}
