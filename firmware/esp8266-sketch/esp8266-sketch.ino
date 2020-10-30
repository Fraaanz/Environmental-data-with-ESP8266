#include "ESP8266HTTPClient.h"
#include "ESP8266WiFi.h"
#include "DHT.h"
#include "Wire.h"

#define DHTTYPE DHT22 // DHT 22  (AM2302), AM2321
#define DHTPIN D6
DHT dht(DHTPIN, DHTTYPE);

const int sampleWindow = 50;                              // Sample window width in mS (50 mS = 20Hz)
unsigned int sample;

#define MicPin A0

void setup()
{

  Serial.begin(9600);                               //Serial connection
  WiFi.begin("YOURWIFISSID", "YOURWIFIPASS"); //WiFi connection

  while (WiFi.status() != WL_CONNECTED)
  { //Wait for the WiFI connection completion

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

void loopPart1() {
   unsigned long startMillis= millis();                   // Start of sample window
   float peakToPeak = 0;                                  // peak-to-peak level
 
   unsigned int signalMax = 0;                            //minimum value
   unsigned int signalMin = 1024;                         //maximum value
 
                                                          // collect data for 50 mS
   while (millis() - startMillis < sampleWindow)
   {
      sample = analogRead(MicPin);                             //get reading from microphone
      if (sample < 1024)                                  // toss out spurious readings
      {
         if (sample > signalMax)
         {
            signalMax = sample;                           // save just the max levels
         }
         else if (sample < signalMin)
         {
            signalMin = sample;                           // save just the min levels
         }
      }
   }
   peakToPeak = signalMax - signalMin;                    // max - min = peak-peak amplitude
   float db = map(peakToPeak,20,900,49.5,90);             //calibrate for deciBels
   Serial.print(db);                                     //write calibrated deciBels
   Serial.print(" dB  ");   
   Serial.println(sample); 
   delay(500); 
}

void loopPart2() {
    

   unsigned long startMillis= millis();                   // Start of sample window
   float peakToPeak = 0;                                  // peak-to-peak level
 
   unsigned int signalMax = 0;                            //minimum value
   unsigned int signalMin = 1024;                         //maximum value
 
                                                          // collect data for 50 mS
   while (millis() - startMillis < sampleWindow)
   {
      sample = analogRead(MicPin);                             //get reading from microphone
      if (sample < 1024)                                  // toss out spurious readings
      {
         if (sample > signalMax)
         {
            signalMax = sample;                           // save just the max levels
         }
         else if (sample < signalMin)
         {
            signalMin = sample;                           // save just the min levels
         }
      }
   }
   peakToPeak = signalMax - signalMin;                    // max - min = peak-peak amplitude
   float db = map(peakToPeak,20,900,49.5,90);             //calibrate for deciBels
   Serial.print(db);                                     //write calibrated deciBels
   Serial.print(" dB  ");   

    float h = dht.readHumidity();
    // Read temperature as Celsius (the default)
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

    HTTPClient http; //Declare object of class HTTPClient

    String postUrl = "http://YOURURL/esp8266-write-data.php";
    String postApiKey = "YOURAPIKEY";
    String postSensor = "DHT22";
    String postLocation = "WG";

    http.begin(postUrl + "?api_key=" + postApiKey + "&sensor=" + postSensor + "&location=" + postLocation + "&value1=" + t + "&value2=" + h + "&value3=" + db);  //Specify request destination
    int httpCode = http.POST("");      //Send the request
    String payload = http.getString(); //Get the response payload

    Serial.println("URL:");
    Serial.println(httpCode); //Print HTTP return code
    Serial.println(payload);  //Print request response payload

    http.end(); //Close connection

    delay(30000); 
}

void loop()
{  
  if (WiFi.status() == WL_CONNECTED)
  { //Check WiFi connection status
    //loopPart1();
    loopPart2();
  }
  else
  {
    Serial.println("Error in WiFi connection");
  }
}
