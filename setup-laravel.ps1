$env:Path = "C:\Users\$env:USERNAME\.config\herd\bin;C:\Users\$env:USERNAME\.config\herd\bin\php84;$env:Path"
Set-Location "c:\Users\$env:USERNAME\Escritorio\repos\torisi-academia"

if (Test-Path "backend") {
    Remove-Item -Recurse -Force "backend"
}

composer create-project laravel/laravel:^11.0 backend --no-interaction
