<?php

$servername = "YOURSERVER";

// REPLACE with your Database name
$dbname = "YOURDBNAME";
// REPLACE with Database user
$username = "YOURNAME";
// REPLACE with Database user password
$password = "YOURPASS";

$api_key_value = "APIKEY";

$api_key = $sensor = $location = $value1 = $value2 = "";


$api_key = test_input($_GET["api_key"]);
if ($api_key == $api_key_value) {
  $sensor = test_input($_GET["sensor"]);
  $location = test_input($_GET["location"]);
  $value1 = test_input($_GET["value1"]);
  $value2 = test_input($_GET["value2"]);

  // Create connection
  $conn = new mysqli($servername, $username, $password, $dbname);
  // Check connection
  if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
  }

  $sql = "INSERT INTO SensorData (sensor, location, value1, value2)
        VALUES ('" . $sensor . "', '" . $location . "', '" . $value1 . "', '" . $value2 . "')";

  if ($conn->query($sql) === TRUE) {
    echo "New record created successfully";
  } else {
    echo "Error: " . $sql . "<br>" . $conn->error;
  }

  $conn->close();
} else {
  echo "Wrong API Key provided!";
}

function test_input($data)
{
  $data = trim($data);
  $data = stripslashes($data);
  $data = htmlspecialchars($data);
  return $data;
}
