const es = require('elasticsearch')
const proj4 = require('proj4')
const esUtils = require('./es-utils.js')
const ciselniky = require('./ciselniky.js')
const xmlproc = require('./xml-processor.js')

var esClient = new es.Client({
	host: '127.0.0.1:9200',
	log: 'error'
});

proj4.defs("EPSG:4326", "+proj=longlat +datum=WGS84 +no_defs");
proj4.defs("EPSG:5514", "+proj=krovak +lat_0=49.5 +lon_0=24.83333333333333 +alpha=30.28813972222222 +k=0.9999 +x_0=0 +y_0=0 +ellps=bessel +towgs84=589,76,480,0,0,0,0 +units=m +no_defs");

function parsePos(strSjstk) {
	return proj4("EPSG:5514", "EPSG:4326", strSjstk.split(" "))
}


let file = process.argv[2];

let stavebniObjekty = [];

let matched = [
	{
		prefix: 'vf',
		name: 'StavebniObjekt'
	},
	{
		prefix: 'vf',
		name: 'CastObce'
	},
	{
		prefix: 'vf',
		name: 'Obec'
	},
	{
		prefix: 'vf:',
		name: 'KatastralniUzemi',
		hasAttr: 'id'
	},
	{
		prefix: 'vf',
		name: 'Zsj',
		hasAttr: 'id'
	},
	{
		prefix: 'vf',
		name: 'Ulice',
		hasAttr: 'id'
	},
	{
		prefix: 'vf',
		name: 'Parcela',
		hasAttr: 'id'
	},
	{
		prefix: 'vf',
		name: 'AdresniMisto',
	}
];

xmlproc.processFile(matched, file, processElement);

function processElement(doc) {
	switch (doc.root().name()) {
		case 'Obec':
			processObec(doc);
			break;
		case 'CastObce':
			processCastObce(doc);
			break;
		case 'AdresniMisto':
			processAdresniMisto(doc)
				; break;
		case 'StavebniObjekt':
			processStavebniObjekt(doc);
			break;
		case 'Parcela':
			processParcela(doc);
			break;
		case 'Ulice':
			processUlice(doc);
			; break;
		case 'Zsj':
			processZsj(doc);
			break;
		case 'KatastralniUzemi':
			processKU(doc);
			break;
	}
}

function getPosition(doc, ns, xpath, obj, propName){
	let tmp={}
	xmlproc.getValue(doc,ns,xpath,tmp, "pos");
	if (tmp.pos){
		obj[propName]=Array.isArray(tmp.pos)?parsePos(tmp.pos[0]):parsePos(tmp.pos);
	}
}

function processObec(doc) {
	let ns = getNamespaces(doc)
	let o = {};
	o.type = "obec";
	xmlproc.getValueAttr(doc,ns,"@gml:id",o , "id");
	xmlproc.getValue(doc,ns,"obi:Nazev",o , "nazev");
	xmlproc.getValue(doc,ns,"obi:Okres/oki:Kod",o , "okres");
	getPosition(doc,ns,"obi:Geometrie/obi:DefinicniBod//gml:pos",o,"position");	
}

function processCastObce(doc) {
	let ns = getNamespaces(doc)
	let o = {};
	o.type = "cast-obec";
	xmlproc.getValueAttr(doc,ns,"@gml:id",o , "id");
	xmlproc.getValue(doc,ns,"coi:Nazev",o , "nazev");
	xmlproc.getValue(doc,ns,"coi:Obec/obi:Kod",o , "obec");
	getPosition(doc,ns,"coi:Geometrie/coi:DefinicniBod//gml:pos",o,"position");	
};

function processAdresniMisto(doc) {
	let ns = getNamespaces(doc)
	let o = {};
	o.type = "adresni-misto";
	xmlproc.getValueAttr(doc,ns,"@gml:id",o , "id");
	xmlproc.getValue(doc,ns,"ami:CisloDomovni",o , "cisloDomovni");
	xmlproc.getValue(doc,ns,"ami:Psc",o , "psc");
	xmlproc.getValue(doc,ns,"ami:StavebniObjekt/soi:Kod",o , "stavebniObjekt");
	xmlproc.getValue(doc,ns,"ami:Ulice/uli:Kod",o , "ulice");
	getPosition(doc,ns,"ami:Geometrie/ami:DefinicniBod//gml:pos",o,"position");	
}

function processStavebniObjekt(doc) {
	let ns = getNamespaces(doc)
	let o = {};
	o.type = "stavebni-objekt";
	xmlproc.getValueAttr(doc,ns,"@gml:id",o , "id");
	xmlproc.getValue(doc,ns,"soi:CislaDomovni/com:CisloDomovni",o , "cisloDomovni");
	xmlproc.getValue(doc,ns,"soi:IdentifikacniParcela/pai:Kod",o , "identifikacniParcela");
	xmlproc.getValue(doc,ns,"soi:TypStavebnihoObjektuKod",o , "typStavebnihoObjektu");
	xmlproc.getValue(doc,ns,"soi:ZpusobVyuzitiKod",o , "zpusobVyuziti");
	xmlproc.getValue(doc,ns,"soi:CastObce/coi:Kod",o , "castObce");
	xmlproc.getValue(doc,ns,"soi:DruhKonstrukceKod",o , "zpusobVyuziti");
	xmlproc.getValue(doc,ns,"coi:PocetBytu",o , "pocetBytu");
	xmlproc.getValue(doc,ns,"coi:PocetPodlazi",o , "pocetPodlazi");
	xmlproc.getValue(doc,ns,"soi:PripojeniKanalizaceKod",o , "pripojeniKanalizace");
	xmlproc.getValue(doc,ns,"soi:PripojeniPlynKod",o , "pripojeniPlyn");
	xmlproc.getValue(doc,ns,"soi:VybaveniVytahemKod",o , "vybaveniVytahem");
	xmlproc.getValue(doc,ns,"soi:ZpusobVytapeniKod",o , "zpusobVytapeni");
	getPosition(doc,ns,"soi:Geometrie/soi:DefinicniBod//gml:pos",o,"position");	
}

function processParcela(doc) {
	let ns = getNamespaces(doc)
	let o = {};
	o.type = "parcela";
	xmlproc.getValueAttr(doc,ns,"@gml:id",o , "id");
	xmlproc.getValue(doc,ns,"pai:KmenoveCislo",o , "kmenoveCislo");
	xmlproc.getValue(doc,ns,"pai:VymeraParcely",o , "vymera");
	xmlproc.getValue(doc,ns,"pai:DruhCislovaniKod",o , "druhCislovani");
	xmlproc.getValue(doc,ns,"pai:DruhPozemkuKod",o , "druhPozemku");
	xmlproc.getValue(doc,ns,"pai:KatastralniUzemi/kui:Kod",o , "katastralniUzemi");
	getPosition(doc,ns,"pai:Geometrie/pai:DefinicniBod//gml:pos",o,"position");	
}

function processUlice(doc) {
	let ns = getNamespaces(doc)
	let o = {};
	o.type = "ulice";
	xmlproc.getValueAttr(doc,ns,"@gml:id",o , "id");
	xmlproc.getValue(doc,ns,"uli:Nazev",o , "nazev");
	xmlproc.getValue(doc,ns,"uli:Obec/obi:Kod",o , "obec"); 
}

function processKU(doc) {
	let ns = getNamespaces(doc)
	let o = {};
	o.type = "katastralni-uzemi";
	xmlproc.getValueAttr(doc,ns,"@gml:id",o , "id");
	xmlproc.getValue(doc,ns,"kui:Nazev",o , "nazev");
	xmlproc.getValue(doc,ns,"kui:ExistujeDigitalniMapa",o , "existujeDigitalniMapa");
	xmlproc.getValue(doc,ns,"kui:Obec/obi:Kod",o , "obec");
	getPosition(doc,ns,"kui:Geometrie/kui:DefinicniBod//gml:pos",o,"position");	
}

