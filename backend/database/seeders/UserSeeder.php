<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create(['name' => 'Administrador ITA', 'email' => 'admin@ita.edu.pe', 'password' => Hash::make('password'), 'role' => 'admin', 'dni' => null]);
        User::create(['name' => 'Ing. Carlos Ríos', 'email' => 'carlos.rios@ita.edu.pe', 'password' => Hash::make('password'), 'role' => 'teacher', 'dni' => '08765432']);
        User::create(['name' => 'Ing. Patricia Vega', 'email' => 'patricia.vega@ita.edu.pe', 'password' => Hash::make('password'), 'role' => 'teacher', 'dni' => '09876541']);
        User::create(['name' => 'Ing. Jorge Llanos', 'email' => 'jorge.llanos@ita.edu.pe', 'password' => Hash::make('password'), 'role' => 'teacher', 'dni' => '07654321']);
        User::create(['name' => 'Luis Mamani Quispe', 'email' => 'luis.mamani@ita.edu.pe', 'password' => Hash::make('password'), 'role' => 'student', 'dni' => '74521836']);
        User::create(['name' => 'Ana Torres Paredes', 'email' => 'ana.torres@ita.edu.pe', 'password' => Hash::make('password'), 'role' => 'student', 'dni' => '71234567']);
        User::create(['name' => 'Kevin Salas Huanca', 'email' => 'kevin.salas@ita.edu.pe', 'password' => Hash::make('password'), 'role' => 'student', 'dni' => '73456789']);
        User::create(['name' => 'Rosa Ccopa Huanca', 'email' => 'rosa.ccopa@ita.edu.pe', 'password' => Hash::make('password'), 'role' => 'student', 'dni' => '72345678']);
    }
}
