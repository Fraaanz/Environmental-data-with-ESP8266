<?php

include 'mysqlconnection.php';

$con = new mysqli($servername, $username, $password, $dbname);
if (mysqli_connect_errno()) {
  echo "Failed to connect to MySQL: " . mysqli_connect_error();
}

// Default: Query all from last X days in the past.
$xDaysPast = 3;

// Default: Leave out every X row (id). 
$leaveOut = 60;

// Default: Query this columns from db table.
$queryCol = "reading_time, value1, value2, value3";

//Modify query variables by URL -> www.website.de/get-data.php?xDaysPast=3&leaveOut=60&queryCol=value1%2C+value2%2C+value3
if (isset($_GET['xDaysPast'])) {
  $xDaysPast = $_GET['xDaysPast'];
  //echo $xDaysPast;
}
if (isset($_GET['leaveOut'])) {
  $leaveOut = $_GET['leaveOut'];
  //echo $leaveOut;
}
if (isset($_GET['queryCol'])) {
  $queryCol = $_GET['queryCol'];
  //echo $queryCol;
}

$rows = array();

for ($i = 1; $i <= $xDaysPast; $i++) {

  $dayQuery = date("Y-m-j", strtotime('-' . $i+1 . ' days'));
  //echo '<br><br><b>' . $dayQuery . '</b><br><br>';

  $query = "
  SELECT id, reading_time, " . $queryCol . " 
  FROM SensorData 
  WHERE reading_time 
  LIKE '%" . $dayQuery . "%' AND id % " . $leaveOut . " = 0
  ORDER BY id DESC
  ";

  $result = mysqli_query($con, $query);

  while ($row = $result->fetch_assoc()) {
    $rows[] = $row;
  }
}

echo json_encode($rows);

mysqli_close($con);
