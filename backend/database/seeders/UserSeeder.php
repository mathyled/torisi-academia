<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Admin
        User::create(['name' => 'Administrador ITA', 'email' => 'admin@ita.edu.pe', 'password' => Hash::make('password'), 'role' => 'admin', 'dni' => null]);

        // Teachers (20) - nombres con acentos para display, emails sin acentos
        $teachers = [
            ['name' => 'Ing. Carlos Rios', 'email' => 'carlos.rios@ita.edu.pe', 'dni' => '08765432'],
            ['name' => 'Ing. Patricia Vega', 'email' => 'patricia.vega@ita.edu.pe', 'dni' => '09876541'],
            ['name' => 'Ing. Jorge Llanos', 'email' => 'jorge.llanos@ita.edu.pe', 'dni' => '07654321'],
            ['name' => 'Ing. Marta Sanchez', 'email' => 'marta.sanchez@ita.edu.pe', 'dni' => '06543210'],
            ['name' => 'Ing. Luis Garcia', 'email' => 'luis.garcia@ita.edu.pe', 'dni' => '05432109'],
            ['name' => 'Ing. Ana Martinez', 'email' => 'ana.martinez@ita.edu.pe', 'dni' => '04321098'],
            ['name' => 'Ing. Pedro Lopez', 'email' => 'pedro.lopez@ita.edu.pe', 'dni' => '03210987'],
            ['name' => 'Ing. Maria Gonzalez', 'email' => 'maria.gonzalez@ita.edu.pe', 'dni' => '02109876'],
            ['name' => 'Ing. Juan Rodriguez', 'email' => 'juan.rodriguez@ita.edu.pe', 'dni' => '01987654'],
            ['name' => 'Ing. Carmen Fernandez', 'email' => 'carmen.fernandez@ita.edu.pe', 'dni' => '01876543'],
            ['name' => 'Ing. Roberto Diaz', 'email' => 'roberto.diaz@ita.edu.pe', 'dni' => '01765432'],
            ['name' => 'Ing. Laura Ruiz', 'email' => 'laura.ruiz@ita.edu.pe', 'dni' => '01654321'],
            ['name' => 'Ing. Miguel Castro', 'email' => 'miguel.castro@ita.edu.pe', 'dni' => '01543210'],
            ['name' => 'Ing. Sofia Morales', 'email' => 'sofia.morales@ita.edu.pe', 'dni' => '01432109'],
            ['name' => 'Ing. Diego Torres', 'email' => 'diego.torres@ita.edu.pe', 'dni' => '01321098'],
            ['name' => 'Ing. Elena Ramirez', 'email' => 'elena.ramirez@ita.edu.pe', 'dni' => '01210987'],
            ['name' => 'Ing. Fernando Herrera', 'email' => 'fernando.herrera@ita.edu.pe', 'dni' => '01109876'],
            ['name' => 'Ing. Isabel Flores', 'email' => 'isabel.flores@ita.edu.pe', 'dni' => '01098765'],
            ['name' => 'Ing. Ricardo Cruz', 'email' => 'ricardo.cruz@ita.edu.pe', 'dni' => '00987654'],
            ['name' => 'Ing. Patricia Ortiz', 'email' => 'patricia.ortiz@ita.edu.pe', 'dni' => '00876543'],
        ];

        foreach ($teachers as $teacher) {
            User::create([
                'name' => $teacher['name'],
                'email' => $teacher['email'],
                'password' => Hash::make('password'),
                'role' => 'teacher',
                'dni' => $teacher['dni']
            ]);
        }

        // Students (79) - emails generados sin acentos
        $firstNames = ['Juan', 'Maria', 'Carlos', 'Ana', 'Luis', 'Rosa', 'Pedro', 'Carmen', 'Jose', 'Miguel', 'Elena', 'Francisco', 'Laura', 'Antonio', 'Isabel', 'Diego', 'Sofia', 'Javier', 'Lucia', 'Fernando', 'Marta', 'Roberto', 'Patricia', 'Ricardo', 'Adriana', 'Gabriel', 'Valentina', 'Alejandro', 'Daniela', 'Andres', 'Natalia', 'Sergio', 'Camila', 'Mateo', 'Valeria', 'Sebastian', 'Renata', 'Leonardo', 'Ximena', 'Emiliano', 'Regina', 'Thiago', 'Antonella', 'Joaquin', 'Victoria', 'Bruno', 'Emilia', 'Facundo', 'Bianca', 'Lucas', 'Olivia', 'Martin', 'Zoe', 'Dante', 'Sara', 'Iker', 'Noa', 'Leo', 'Luna', 'Ian', 'Gaia', 'Noah', 'Emma', 'Oliver', 'Ava', 'Elijah', 'Charlotte', 'William', 'Sophia', 'Amelia', 'James', 'Isabella', 'Lucas', 'Mia', 'Henry', 'Evelyn', 'Alexander', 'Harper'];
        $lastNames = ['Mamani', 'Torres', 'Salas', 'Ccopa', 'Quispe', 'Paredes', 'Huanca', 'Ramos', 'Flores', 'Garcia', 'Lopez', 'Gonzalez', 'Rodriguez', 'Fernandez', 'Diaz', 'Ruiz', 'Castro', 'Morales', 'Ramirez', 'Herrera', 'Cruz', 'Ortiz', 'Jimenez', 'Moreno', 'Munoz', 'Alvarez', 'Romero', 'Alonso', 'Gutierrez', 'Navarro', 'Rivas', 'Serrano', 'Blanco', 'Molina', 'Ortega', 'Delgado', 'Soto', 'Lara', 'Vargas', 'Leon', 'Mendoza', 'Castillo', 'Cortes', 'Santos', 'Prieto', 'Gil', 'Marin', 'Rojas', 'Sanz', 'Cabrera', 'Nunez', 'Iglesias', 'Ferrer', 'Vidal', 'Pascual', 'Rubio', 'Moya', 'Santiago', 'Benitez', 'Medina', 'Arias', 'Reyes', 'Crespo', 'Vega', 'Hidalgo', 'Calvo', 'Perales'];

        for ($i = 0; $i < 79; $i++) {
            $firstName = $firstNames[$i % count($firstNames)];
            $lastName = $lastNames[$i % count($lastNames)];
            $fullName = $firstName . ' ' . $lastName;
            // Email sin acentos: solo minusculas, sin espacios extra
            $email = strtolower(str_replace(' ', '.', $fullName)) . ($i > 0 ? $i : '') . '@ita.edu.pe';
            
            User::create([
                'name' => $fullName,
                'email' => $email,
                'password' => Hash::make('password'),
                'role' => 'student',
                'dni' => str_pad(rand(10000000, 99999999), 8, '0', STR_PAD_LEFT)
            ]);
        }
    }
}
