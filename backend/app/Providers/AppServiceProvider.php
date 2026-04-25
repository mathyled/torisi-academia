<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (app()->environment('local') && $this->databaseIsEmpty()) {
            \Illuminate\Support\Facades\Artisan::call('migrate:fresh', ['--seed' => true]);
        }
    }

    private function databaseIsEmpty(): bool
    {
        try {
            return \Illuminate\Support\Facades\DB::table('users')->count() === 0;
        } catch (\Exception $e) {
            return true;
        }
    }
}
