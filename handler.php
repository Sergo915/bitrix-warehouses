<?php

declare(strict_types=1);

// Bitrix opens a local application handler with a POST request. Redirecting
// with 303 gives the SPA a clean GET navigation inside the iframe.
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Location: /local/app/pahest/dist/?v=' . time(), true, 303);
exit;
