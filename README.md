# ruian-elastic
Import of RUIA VFR into elasticsearch index. Hobby project. Just for fun. Have fun too if you want. 

# Use
Description of the data can be found at [CUZK pages](http://www.cuzk.cz/Uvod/Produkty-a-sluzby/RUIAN/2-Poskytovani-udaju-RUIAN-ISUI-VDP/Vymenny-format-RUIAN/Vymenny-format-RUIAN-%28VFR%29.aspx)

Download data from [VDP application](http://vdp.cuzk.cz/vdp/ruian/vymennyformat/vyhledej?vf.pu=S&_vf.pu=on&_vf.pu=on&vf.cr=U&vf.up=OB&vf.ds=K&_vf.vu=on&_vf.vu=on&_vf.vu=on&_vf.vu=on&vf.uo=A&search=Vyhledat)
.

Run 
`node parse-ruian.js ST-file.xml city-file.xml`
Look at the code for elastic config.
Some scripts laying around for mapping creation etc.

* ST-file - file containing administratovi regions of Czechia - it is used to enrich during denormalization (20170731_ST_UKSH.xml - for naming conventio look at CUZK documentation)
* city-file - file containing data about a city/town/vilage (20170731_OB_554782_UKSH.xml - data for prague - the biggest one - it takes ~10 minutes to prcess on my notebook)

Work In Progress ... or stalled ... it depends

