#include "DHT.h"
#include <SPI.h>
#include <Ethernet.h>

byte mac[] = {0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF };
IPAddress ip(192, 168, 99, 208);
IPAddress gateway(192, 168, 99, 254);
IPAddress subnet(255, 255, 255, 0);
IPAddress dns1(192, 168, 10, 1);
EthernetClient client;
IPAddress server(192, 168, 30, 133);

#define DHT22_PIN 5
#define DHTTYPE DHT22

//dht11 DHT;
DHT dht22(DHT22_PIN, DHTTYPE);

void setup() {
    Serial.begin(9600);  
    Ethernet.begin(mac, ip, dns1, gateway, subnet);
    delay(1000);
   if (client.connect(server, 80)) {
    Serial.println("Server connected");
  } else {
    Serial.println("connected failed");
  }


  dht22.begin();
}
void loop() {
    //DHT22
    float h = dht22.readHumidity();
    float t = dht22.readTemperature();

  Serial.print("22->Humidity: ");
  Serial.print(h);
  Serial.print(" %\t");
  Serial.print("Temperature: ");
  Serial.print(t);
  Serial.println(" *C ");    

    String uri ="";
    if (isnan(h) || isnan(t)){
      uri = "/err?p=2";
    }else{
      uri = "/th?p=2&t="+ String(t) +"&h=" + String(h);
    }    
  // if (client.connect(server, 80)) {
  //  Serial.println("Server connected");
    // 發送HTTP請求
    client.println("GET "+ uri + " HTTP/1.1");
    client.println();
    Serial.println("Send pin data success");
 // } else {
    // if you couldn't make a connection:
 //   Serial.println("Send pin  failed");
 // }

delay(30000);   
}
