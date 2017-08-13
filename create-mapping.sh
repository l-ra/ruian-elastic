#!/bin/bash 
INDICES="obec okres orp cast-obec vusc ulice parcela katastralni-uzemi adresni-misto region-soudrznosti pou kraj stavebni-objekt"

for IDX in $INDICES; do 
curl -XPUT "http://localhost:9200/$IDX" -H 'Content-Type: application/json' -d'
{
  "mappings": {
    "_default_": {
      "properties": {
        "position": {
          "type": "geo_point"
        }
      }
    }
  }
}
'
done