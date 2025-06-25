<?php
// APCu Cache Management Utility for Virtual Flight Online (Database-Free Version)

// Check if APCu is available
if (!extension_loaded('apcu') || !apcu_enabled()) {
    echo "<h1>APCu Cache Management</h1>";
    echo "<p style='color: red;'>❌ APCu extension not available or not enabled</p>";
    echo "<p>Please install and enable APCu extension for PHP.</p>";
    exit;
}

// Handle cache operations
$action = $_GET['action'] ?? '';
$message = '';

switch ($action) {
    case 'clear_all':
        if (apcu_clear_cache()) {
            $message = "<p style='color: green;'>✅ All APCu cache cleared successfully</p>";
        } else {
            $message = "<p style='color: red;'>❌ Failed to clear APCu cache</p>";
        }
        break;
        
    case 'clear_vfo':
        // Clear only VFO-related cache entries
        $info = apcu_cache_info();
        $cleared = 0;
        foreach ($info['cache_list'] as $entry) {
            if (strpos($entry['info'], 'vfo_') === 0) {
                if (apcu_delete($entry['info'])) {
                    $cleared++;
                }
            }
        }
        $message = "<p style='color: green;'>✅ Cleared {$cleared} VFO cache entries</p>";
        break;
}

// Get APCu info
$info = apcu_cache_info();
$sma_info = apcu_sma_info();

?>
<!DOCTYPE html>
<html>
<head>
    <title>VFO APCu Cache Management</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { border-collapse: collapse; width: 100%; margin: 10px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .stats { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 10px 0; }
        .button { display: inline-block; padding: 10px 20px; background-color: #007cba; color: white; text-decoration: none; border-radius: 5px; margin: 5px; }
        .button:hover { background-color: #005a87; }
        .danger { background-color: #dc3545; }
        .danger:hover { background-color: #c82333; }
        .nav { margin-bottom: 20px; }
        .nav a { margin-right: 15px; color: #007cba; text-decoration: none; }
    </style>
</head>
<body>
    <div class="nav">
        <a href="radar_test.php">← Back to Radar Test</a>
        <a href="status.php">Main Page</a>
        <a href="radar.php">Radar Display</a>
    </div>

    <h1>🚀 VFO APCu Cache Management (Database-Free)</h1>
    
    <?php echo $message; ?>
    
    <div class="stats">
        <h2>📊 Cache Statistics</h2>
        <p><strong>Cache Type:</strong> <?php echo $info['cache_type']; ?></p>
        <p><strong>Start Time:</strong> <?php echo date('Y-m-d H:i:s', $info['start_time']); ?></p>
        <p><strong>Uptime:</strong> <?php echo gmdate('H:i:s', time() - $info['start_time']); ?></p>
        <p><strong>Cached Files:</strong> <?php echo $info['num_entries']; ?></p>
        <p><strong>Cache Hits:</strong> <?php echo number_format($info['num_hits']); ?></p>
        <p><strong>Cache Misses:</strong> <?php echo number_format($info['num_misses']); ?></p>
        <p><strong>Hit Rate:</strong> <?php echo $info['num_hits'] > 0 ? round(($info['num_hits'] / ($info['num_hits'] + $info['num_misses'])) * 100, 2) . '%' : '0%'; ?></p>
        <p><strong>Storage:</strong> APCu Memory Only (No Database)</p>
    </div>
    
    <div class="stats">
        <h2>💾 Memory Usage</h2>
        <p><strong>Total Memory:</strong> <?php echo number_format($sma_info['num_seg'] * $sma_info['seg_size'] / 1024 / 1024, 2); ?> MB</p>
        <p><strong>Available Memory:</strong> <?php echo number_format($sma_info['avail_mem'] / 1024 / 1024, 2); ?> MB</p>
        <p><strong>Used Memory:</strong> <?php echo number_format(($sma_info['num_seg'] * $sma_info['seg_size'] - $sma_info['avail_mem']) / 1024 / 1024, 2); ?> MB</p>
        <p><strong>Memory Usage:</strong> <?php echo round((($sma_info['num_seg'] * $sma_info['seg_size'] - $sma_info['avail_mem']) / ($sma_info['num_seg'] * $sma_info['seg_size'])) * 100, 2); ?>%</p>
    </div>
    
    <h2>🛠️ Cache Operations</h2>
    <a href="?action=clear_vfo" class="button" onclick="return confirm('Clear VFO cache entries?')">Clear VFO Cache</a>
    <a href="?action=clear_all" class="button danger" onclick="return confirm('Clear ALL cache entries? This will affect other applications too!')">Clear All Cache</a>
    <a href="?" class="button">Refresh Stats</a>
    
    <h2>📋 Current Cache Entries</h2>
    <table>
        <thead>
            <tr>
                <th>Key</th>
                <th>Type</th>
                <th>Size (bytes)</th>
                <th>Created</th>
                <th>Modified</th>
                <th>TTL</th>
                <th>Hits</th>
            </tr>
        </thead>
        <tbody>
            <?php
            $vfo_entries = 0;
            $position_entries = 0;
            $history_entries = 0;
            $other_vfo = 0;
            
            if (isset($info['cache_list'])) {
                foreach ($info['cache_list'] as $entry) {
                    $is_vfo = strpos($entry['info'], 'vfo_') === 0;
                    $entry_type = 'Other';
                    
                    if ($is_vfo) {
                        $vfo_entries++;
                        if (strpos($entry['info'], 'vfo_position_') === 0) {
                            $position_entries++;
                            $entry_type = 'Aircraft Position';
                        } elseif (strpos($entry['info'], 'vfo_history_') === 0) {
                            $history_entries++;
                            $entry_type = 'Flight History';
                        } elseif (strpos($entry['info'], 'vfo_rate_') === 0) {
                            $other_vfo++;
                            $entry_type = 'Rate Limit';
                        } else {
                            $other_vfo++;
                            $entry_type = 'VFO Data';
                        }
                    }
                    
                    echo "<tr" . ($is_vfo ? " style='background-color: #e8f4f8;'" : "") . ">";
                    echo "<td>" . htmlspecialchars($entry['info']) . ($is_vfo ? " <strong>(VFO)</strong>" : "") . "</td>";
                    echo "<td>" . $entry_type . "</td>";
                    echo "<td>" . number_format($entry['mem_size']) . "</td>";
                    echo "<td>" . date('H:i:s', $entry['creation_time']) . "</td>";
                    echo "<td>" . date('H:i:s', $entry['mtime']) . "</td>";
                    echo "<td>" . ($entry['ttl'] > 0 ? $entry['ttl'] . 's' : 'No limit') . "</td>";
                    echo "<td>" . number_format($entry['num_hits']) . "</td>";
                    echo "</tr>";
                }
            }
            ?>
        </tbody>
    </table>
    
    <div class="stats">
        <p><strong>VFO Cache Breakdown:</strong></p>
        <ul>
            <li>Aircraft Positions: <?php echo $position_entries; ?></li>
            <li>Flight Histories: <?php echo $history_entries; ?></li>
            <li>Other VFO Data: <?php echo $other_vfo; ?></li>
            <li><strong>Total VFO Entries: <?php echo $vfo_entries; ?> of <?php echo $info['num_entries']; ?> total</strong></li>
        </ul>
    </div>
    
    <h2>🔍 Test Cache Performance</h2>
    <p><a href="radar_data.php" target="_blank">Test Radar Data API</a> - Check X-Cache-Info header</p>
    <p><a href="status_json.php" target="_blank">Test Status JSON API</a></p>
    
    <hr>
    <p><small>Last updated: <?php echo date('Y-m-d H:i:s'); ?></small></p>
</body>
</html>
