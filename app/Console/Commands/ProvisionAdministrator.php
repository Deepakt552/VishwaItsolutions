<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

class ProvisionAdministrator extends Command
{
    protected $signature = 'vishwa:admin {email : Administrator email address} {--name= : Name for a new account}';

    protected $description = 'Create an administrator or grant access to an existing verified account';

    public function handle(): int
    {
        $email = strtolower(trim((string) $this->argument('email')));
        $validation = Validator::make(['email' => $email], ['email' => ['required', 'email', 'max:255']]);

        if ($validation->fails()) {
            $this->error($validation->errors()->first());

            return self::FAILURE;
        }

        $user = User::query()->where('email', $email)->first();
        if ($user && ! $user->hasVerifiedEmail()) {
            $this->error('Verify the existing account email before granting administrator access.');

            return self::FAILURE;
        }

        if (! $user) {
            $password = $this->secret('Set a password for the new administrator');
            $name = $this->option('name') ?: 'Vishwa Administrator';
            $validation = Validator::make(
                ['name' => $name, 'password' => $password],
                ['name' => ['required', 'string', 'max:120'], 'password' => ['required', 'string', Password::defaults(), 'min:12']],
            );

            if ($validation->fails()) {
                $this->error($validation->errors()->first());

                return self::FAILURE;
            }

            $user = new User(['name' => $name, 'email' => $email, 'password' => $password]);
            $user->email_verified_at = now();
        }

        $user->is_admin = true;
        $user->save();

        $this->info('Administrator access granted to '.$email.'.');

        return self::SUCCESS;
    }
}
