<?php

namespace App\Exceptions;

use RuntimeException;

class DemoQuotaExceeded extends RuntimeException
{
    public function __construct(
        public readonly int $used,
        public readonly int $requested,
        public readonly int $limit = 100,
    ) {
        parent::__construct('La cuota de la demo fue excedida.');
    }
}
