#include "ESP8266HTTPClient.h"
#include "ESP8266WiFi.h"
#include "DHT.h"

#define DHTTYPE DHT22 // DHT 22  (AM2302), AM2321
#define DHTPIN D6
DHT dht(DHTPIN, DHTTYPE);

void setup()
{
  Serial.begin(9600);
  WiFi.begin("YOURWIFISSID", "YOURWIFIPASS");

  while (WiFi.status() != WL_CONNECTED)
  { 
    delay(500);
    Serial.println("Waiting for WIFI ...");
  }

  if (WiFi.status() == WL_CONNECTED)
  {
    Serial.println("---------------");
    Serial.println("WIFI connected!");
    Serial.println("---------------");
  }

  dht.begin();
}

void loop()
{

  if (WiFi.status() == WL_CONNECTED)
  {    
    delay(30000); 

    float h = dht.readHumidity();
    float t = dht.readTemperature();

    if (isnan(h) || isnan(t))
    {
      Serial.println("Failed to read from DHT sensor!");
      return;
    }

    Serial.print("Luftfeuchtigkeit: ");
    Serial.print(h);
    Serial.print(" %\t");
    Serial.print("Temperatur: ");
    Serial.print(t);
    Serial.println(" *C ");

    HTTPClient http;

    String postUrl = "http://YOURURL/esp8266-write-data.php";
    String postApiKey = "YOURAPIKEY";
    String postSensor = "DHT22";
    String postLocation = "WG";

    http.begin(postUrl + "?api_key=" + postApiKey + "&sensor=" + postSensor + "&location=" + postLocation + "&value1=" + t + "&value2=" + h);
    int httpCode = http.POST("");
    String payload = http.getString();

    Serial.println(httpCode); 
    Serial.println(payload);

    http.end();
  }
  else
  {
    Serial.println("Error in WiFi connection");
  }

}
