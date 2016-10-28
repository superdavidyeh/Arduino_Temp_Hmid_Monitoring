#include "DHT.h"
//#include <dht11.h>
#include <Wire.h>
#include <Ciao.h>

#define CONNECTOR     "rest" 
#define SERVER_ADDR   "192.168.30.133"
#define DHT11_PIN 4
#define DHT22_PIN 5

#define DHTTYPE DHT22
#define DHTTYPE11 DHT11
//dht11 DHT;
DHT dht22(DHT22_PIN, DHTTYPE);
DHT dht11(DHT11_PIN, DHTTYPE11);

void setup() {
  //初始DHT11 && DHT22
  Serial.begin(9600);
  dht22.begin();
  dht11.begin();  
  
  Ciao.begin(); // CIAO INIT
  }
 
void loop() {
    //READ PIN4
    //hum=DHT.humidity;
    //temp=DHT.temperature;
    //READ PIN5
    float h1 = dht11.readHumidity();
    float h = dht22.readHumidity();
    // Read temperature as Celsius (the default)
    float t1 = dht11.readTemperature();
    float t = dht22.readTemperature();
  
    //Serial.println("DHT11_HUMD:" + DHT.humidity);
    //Serial.println("DHT11_TEMP:" + DHT.temperature);
  Serial.print("22->Humidity: ");
  Serial.print(h);
  Serial.print(" %\t");
  Serial.print("Temperature: ");
  Serial.print(t);
  Serial.println(" *C ");    
  Serial.print("11->Humidity: ");
  Serial.print(h1);
  Serial.print(" %\t");
  Serial.print("Temperature: ");
  Serial.print(t1);
  Serial.println(" *C ");
      String uri ="";
      if (isnan(h1) || isnan(t1)){
        uri = "/err?p=4";
      }else{
        uri = "/th?p=4&t="+ String(t1) +"&h=" + String(h1);
      }
    Ciao.println("Send To Server : " + String(SERVER_ADDR) + uri); 
    CiaoData data = Ciao.write(CONNECTOR, SERVER_ADDR, uri);

      String uri2 ="";
      if (isnan(h) || isnan(t)){
        uri2 = "/err?p=3";
      }else{
        uri2 = "/th?p=3&t="+ String(t) +"&h=" + String(h);
      }    
    Ciao.println("Send To Server : " + String(SERVER_ADDR) + uri2); 
    CiaoData data2 = Ciao.write(CONNECTOR, SERVER_ADDR, uri2); 
   
delay(30000);   
}
