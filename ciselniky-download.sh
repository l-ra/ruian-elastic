#!/bin/bash
#wget http://www.cuzk.cz/CUZK/media/CiselnikyISUI/CE_ZPUSOB_VYUZITI_OBJEKTU/CE_ZPUSOB_VYUZITI_OBJEKTU.zip

LIST="\
CE_DRUH_KONSTRUKCE \
CE_PRIPOJENI_KANAL \
CE_PRIPOJENI_PLYNU \
CE_PRIPOJENI_VODY
CE_VYBAVENI_VYTAHEM
CE_ZPUSOB_VYTAPENI \
CE_ZPUSOB_VYUZITI_OBJEKTU \
CS_TYP_STAVEBNIHO_OBJEKTU \
CE_CHARAKTER_ZSJ \
CS_STATUS_OBCE \
CS_CLENENI_SM_ROZSAH \
CS_CLENENI_SM_TYP \
CS_DRUH_CISLOVANI_PARCEL \
CS_TYP_PRVKU"

for CIS in $LIST; do 
echo $CIS
wget -O ${CIS}.zip http://www.cuzk.cz/CUZK/media/CiselnikyISUI/${CIS}/${CIS}.zip
unzip ${CIS}.zip
rm ${CIS}.zip
mv ${CIS}*csv data.csv
iconv -f windows-1250 -t utf-8 data.csv >data.utf8.csv
rm data.csv
mv data.utf8.csv ${CIS}.csv
done



