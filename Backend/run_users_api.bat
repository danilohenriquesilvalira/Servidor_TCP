@echo off
echo Compilando API de Usuarios EDP...
go build -o users-api.exe ./cmd/users

if %ERRORLEVEL% EQU 0 (
    echo Compilacao bem sucedida! Iniciando servidor...
    echo.
    users-api.exe
) else (
    echo Erro na compilacao!
    pause
)