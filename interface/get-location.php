<?php

include 'mysqlconnection.php';

$con = new mysqli($servername, $username, $password, $dbname);
if (mysqli_connect_errno()) {
  echo "Failed to connect to MySQL: " . mysqli_connect_error();
}

$rows = array();

  $dayQuery = date("Y-m-j", strtotime('-' . $i . ' days'));
  //echo '<br><br><b>' . $dayQuery . '</b><br><br>';

  $query = "SELECT location FROM SensorData LIMIT 1";

  $result = mysqli_query($con, $query);

  while ($row = $result->fetch_assoc()) { 
    $rows[] = $row;
  }

echo json_encode($rows);

mysqli_close($con);
