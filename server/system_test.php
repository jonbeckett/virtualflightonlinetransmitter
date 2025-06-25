<?php
/**
 * APCu System Test - Verify Virtual Flight Online is working without database
 */

header('Content-Type: text/html; charset=utf-8');

echo "<!DOCTYPE html><html><head><title>VFO APCu System Test</title></head><body>";
echo "<h1>🛩️ Virtual Flight Online - APCu System Test</h1>";

// Test APCu availability
echo "<h2>1. APCu Extension Test</h2>";
if (!extension_loaded('apcu')) {
    echo "❌ <strong>ERROR:</strong> APCu extension is not loaded.<br>";
    echo "Please install and enable the APCu extension.<br><br>";
} else {
    echo "✅ APCu extension is loaded.<br><br>";
}

if (!apcu_enabled()) {
    echo "❌ <strong>ERROR:</strong> APCu is not enabled.<br>";
    echo "Please enable APCu in your PHP configuration.<br><br>";
} else {
    echo "✅ APCu is enabled.<br><br>";
}

// Test APCu functionality
echo "<h2>2. APCu Functionality Test</h2>";
$test_key = 'vfo_test_' . time();
$test_data = ['test' => 'data', 'timestamp' => time()];

if (apcu_store($test_key, $test_data, 60)) {
    echo "✅ APCu write test successful.<br>";
    
    $retrieved = apcu_fetch($test_key);
    if ($retrieved && $retrieved['test'] === 'data') {
        echo "✅ APCu read test successful.<br>";
        apcu_delete($test_key);
        echo "✅ APCu delete test successful.<br><br>";
    } else {
        echo "❌ APCu read test failed.<br><br>";
    }
} else {
    echo "❌ APCu write test failed.<br><br>";
}

// Check for active aircraft data
echo "<h2>3. Aircraft Data Test</h2>";
$aircraft_count = 0;
$info = apcu_cache_info();
if (isset($info['cache_list'])) {
    foreach ($info['cache_list'] as $entry) {
        if (strpos($entry['info'], 'vfo_position_') === 0) {
            $aircraft_count++;
        }
    }
}

echo "Aircraft positions in cache: <strong>$aircraft_count</strong><br>";
if ($aircraft_count > 0) {
    echo "✅ Aircraft data found in APCu cache.<br><br>";
} else {
    echo "ℹ️ No aircraft data currently in cache (this is normal if no aircraft are transmitting).<br><br>";
}

// Memory usage
echo "<h2>4. Memory Usage</h2>";
$cache_info = apcu_cache_info();
if ($cache_info) {
    $memory_size = $cache_info['memory_type'] ?? 'unknown';
    $start_time = $cache_info['start_time'] ?? 0;
    $uptime = time() - $start_time;
    
    echo "Memory type: <strong>$memory_size</strong><br>";
    echo "Cache uptime: <strong>" . gmdate('H:i:s', $uptime) . "</strong><br>";
    echo "Cache entries: <strong>" . count($cache_info['cache_list'] ?? []) . "</strong><br><br>";
}

// Test endpoints
echo "<h2>5. Endpoint Accessibility Test</h2>";
$endpoints = [
    'transmit.php' => 'Aircraft position transmitter',
    'radar_data.php' => 'Radar data API',
    'status_json.php' => 'Aircraft list API',
    'read_whazzup_ivao.php' => 'IVAO format data',
    'read_whazzup_ivao_json.php' => 'IVAO JSON format data',
    'radar.php' => 'Radar display',
    'status.php' => 'Aircraft list',
    'apcu_manager.php' => 'Cache manager'
];

foreach ($endpoints as $file => $description) {
    if (file_exists($file)) {
        echo "✅ <strong>$description</strong> ($file) - File exists<br>";
    } else {
        echo "❌ <strong>$description</strong> ($file) - File missing<br>";
    }
}

echo "<br><h2>6. System Status Summary</h2>";
$all_good = extension_loaded('apcu') && apcu_enabled();

if ($all_good) {
    echo "🟢 <strong>System Status: OPERATIONAL</strong><br>";
    echo "The Virtual Flight Online system is ready to use with APCu caching.<br><br>";
    
    echo "<h3>Quick Links:</h3>";
    echo "<ul>";
    echo "<li><a href='radar.php'>🛩️ Radar Display</a></li>";
    echo "<li><a href='status.php'>📋 Aircraft List</a></li>";
    echo "<li><a href='apcu_manager.php'>⚙️ Cache Manager</a></li>";
    echo "<li><a href='radar_test.php'>🔧 System Test</a></li>";
    echo "</ul>";
} else {
    echo "🔴 <strong>System Status: CONFIGURATION REQUIRED</strong><br>";
    echo "Please fix the APCu configuration issues above.<br><br>";
}

echo "<hr>";
echo "<p><small>Virtual Flight Online - Database-Free APCu Version | " . date('Y-m-d H:i:s') . "</small></p>";
echo "</body></html>";
?>
