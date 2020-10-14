<?php

$servername = "YOURSERVER";

// REPLACE with your Database name
$dbname = "YOURDBNAME";
// REPLACE with Database user
$username = "YOURNAME";
// REPLACE with Database user password
$password = "YOURPASS";

$con = new mysqli($servername, $username, $password, $dbname);

// Check connection
if (mysqli_connect_errno()) {
  echo "Failed to connect to MySQL: " . mysqli_connect_error();
}

$query = "SELECT id, reading_time, value1, value2 FROM SensorData ORDER BY id DESC LIMIT 1000";

$result = mysqli_query($con, $query);

$rows = array();
while ($r = mysqli_fetch_array($result)) {
  $rows[] = $r;
}
echo json_encode($rows);

mysqli_close($con);
