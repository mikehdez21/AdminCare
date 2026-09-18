<?php

namespace App\Http\Controllers;

abstract class Controller
{
    protected function safeError(string $message, \Throwable $exception): string
    {
        report($exception);

        return $message;
    }
}
