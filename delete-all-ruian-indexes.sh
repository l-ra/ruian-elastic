
INDICES="obec okres orp cast-obec vusc ulice parcela katastralni-uzemi adresni-misto region-soudrznosti pou kraj stavebni-objekt"


for IDX in $INDICES; do 
	curl -XDELETE http://localhost:9200/$IDX
done