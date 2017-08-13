const es = require('elasticsearch')
const proj4 = require('proj4')
const esUtils = require('./es-utils.js')
const ciselniky = require('./ciselniky.js')
const xmlproc = require('./xml-processor.js')
const fs=require('fs')


var esClient = new es.Client({
	host: '127.0.0.1:9200',
	log: 'error'
});

proj4.defs("EPSG:4326", "+proj=longlat +datum=WGS84 +no_defs");
proj4.defs("EPSG:5514", "+proj=krovak +lat_0=49.5 +lon_0=24.83333333333333 +alpha=30.28813972222222 +k=0.9999 +x_0=0 +y_0=0 +ellps=bessel +towgs84=589,76,480,0,0,0,0 +units=m +no_defs");

function parsePos(strSjstk) {
	return proj4("EPSG:5514", "EPSG:4326", strSjstk.split(" "))
}

let nsDef=JSON.parse(fs.readFileSync("ns-def.json"));

let stat = process.argv[2]
let obec = process.argv[3];

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
		prefix: 'vf',
		name: 'KatastralniUzemi',
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
	},
	{
		prefix: 'vf',
		name: 'AdresniMisto',
	},
	{
		prefix: 'vf',
		name: 'RegionSoudrznosti',
	},
	{
		prefix: 'vf',
		name: 'Kraj',
	},
	{
		prefix: 'vf',
		name: 'Vusc',
		hasAttr: 'id'
	},
	{
		prefix: 'vf',
		name: 'Okres',
	},
	{
		prefix: 'vf',
		name: 'Orp',
		hasAttr: 'id'
	},
	{
		prefix: 'vf',
		name: 'Pou',
		hasAttr: 'id'
	},
];

xmlproc.processFile(matched, stat, processElement, ()=>{
	xmlproc.processFile(matched, obec, processElement, finished);
})

let obce = {};
let castiObce = {};
let adresniMista = {};
let stavebniObjekty = {};
let parcely = {};
let ulice = {};
let katUzemi = {};
let regionSoudr ={};
let kraje = {};
let vusc = {};
let okresy = {};
let orp = {};
let pou = {};

function processElement(doc, nsDef) {
	switch (doc.root().name()) {
		case 'Obec':
			let o = processObec(doc, nsDef);
			obce[o.id] = o;
			break;
		case 'CastObce':
			let co = processCastObce(doc, nsDef);
			castiObce[co.id] = co;
			break;
		case 'AdresniMisto':
			let am = processAdresniMisto(doc, nsDef);
			adresniMista[am.id] = am;
			break;
		case 'StavebniObjekt':
			let so = processStavebniObjekt(doc, nsDef);
			stavebniObjekty[so.id] = so;
			break;
		case 'Parcela':
			let par = processParcela(doc, nsDef);
			parcely[par.id] = par;
			break;
		case 'Ulice':
			let ul = processUlice(doc, nsDef);
			ulice[ul.id] = ul;
			; break;
		case 'KatastralniUzemi':
			let ku = processKU(doc, nsDef);
			katUzemi[ku.id] = ku;
			break;
		case 'RegionSoudrznosti':
			let rs = processRegSoudr(doc, nsDef);
			regionSoudr[rs.id] = rs;
			break;
		case 'Kraj':
			let kr = processKraj(doc, nsDef);
			kraje[kr.id] = kr;
			break;
		case 'Vusc':
			let vc = processVusc(doc, nsDef);
			vusc[vc.id] = vc;
			break;
		case 'Okres':
			let ok = processOkres(doc, nsDef);
			okresy[ok.id] = ok;
			break;
		case 'Orp':
			let or = processOrp(doc, nsDef);
			orp[or.id] = or;
			break;
		case 'Pou':
			let p = processPou(doc, nsDef);
			pou[p.id] = p;
			break;
	}
}

function getPosition(doc, ns, xpath, obj, propName) {
	let tmp = {}
	xmlproc.getValue(doc, ns, xpath, tmp, "pos");
	if (tmp.pos) {
		obj[propName] = Array.isArray(tmp.pos) ? parsePos(tmp.pos[0]) : parsePos(tmp.pos);
	}
}

function processObec(doc,nsDef) {
	let ns = xmlproc.getNamespaces(doc,nsDef)
	let o = {};
	o.type = "obec";
	xmlproc.getValueAttr(doc, ns, "@gml:id", o, "id");
	xmlproc.getValue(doc, ns, "obi:Nazev", o, "nazev");
	xmlproc.getValue(doc, ns, "obi:Okres/oki:Kod", o, "okres");
	xmlproc.getValue(doc, ns, "obi:Pou/pui:Kod", o, "pou");
	getPosition(doc, ns, "obi:Geometrie/obi:DefinicniBod//gml:pos", o, "position");
	return o;
}

function processCastObce(doc,nsDef) {
	let ns = xmlproc.getNamespaces(doc,nsDef)
	let o = {};
	o.type = "cast-obec";
	xmlproc.getValueAttr(doc, ns, "@gml:id", o, "id");
	xmlproc.getValue(doc, ns, "coi:Nazev", o, "nazev");
	xmlproc.getValue(doc, ns, "coi:Obec/obi:Kod", o, "obec");
	getPosition(doc, ns, "coi:Geometrie/coi:DefinicniBod//gml:pos", o, "position");
	return o;
};

function processAdresniMisto(doc,nsDef) {
	let ns = xmlproc.getNamespaces(doc,nsDef)
	let o = {};
	o.type = "adresni-misto";
	xmlproc.getValueAttr(doc, ns, "@gml:id", o, "id");
	xmlproc.getValue(doc, ns, "ami:CisloDomovni", o, "cisloDomovni");
	xmlproc.getValue(doc, ns, "ami:Psc", o, "psc");
	xmlproc.getValue(doc, ns, "ami:StavebniObjekt/soi:Kod", o, "stavebniObjekt");
	xmlproc.getValue(doc, ns, "ami:Ulice/uli:Kod", o, "ulice");
	getPosition(doc, ns, "ami:Geometrie/ami:DefinicniBod//gml:pos", o, "position");
	return o;
}

function processStavebniObjekt(doc,nsDef) {
	let ns = xmlproc.getNamespaces(doc,nsDef)
	let o = {};
	o.type = "stavebni-objekt";
	xmlproc.getValueAttr(doc, ns, "@gml:id", o, "id");
	xmlproc.getValue(doc, ns, "soi:CislaDomovni/com:CisloDomovni", o, "cisloDomovni");
	xmlproc.getValue(doc, ns, "soi:IdentifikacniParcela/pai:Kod", o, "identifikacniParcela");
	xmlproc.getValue(doc, ns, "soi:TypStavebnihoObjektuKod", o, "typStavebnihoObjektu");
	xmlproc.getValue(doc, ns, "soi:ZpusobVyuzitiKod", o, "zpusobVyuziti");
	xmlproc.getValue(doc, ns, "soi:CastObce/coi:Kod", o, "castObce");
	xmlproc.getValue(doc, ns, "soi:DruhKonstrukceKod", o, "zpusobVyuziti");
	xmlproc.getValue(doc, ns, "coi:PocetBytu", o, "pocetBytu");
	xmlproc.getValue(doc, ns, "coi:PocetPodlazi", o, "pocetPodlazi");
	xmlproc.getValue(doc, ns, "soi:PripojeniKanalizaceKod", o, "pripojeniKanalizace");
	xmlproc.getValue(doc, ns, "soi:PripojeniPlynKod", o, "pripojeniPlyn");
	xmlproc.getValue(doc, ns, "soi:VybaveniVytahemKod", o, "vybaveniVytahem");
	xmlproc.getValue(doc, ns, "soi:ZpusobVytapeniKod", o, "zpusobVytapeni");
	getPosition(doc, ns, "soi:Geometrie/soi:DefinicniBod//gml:pos", o, "position");
	return o;
}

function processParcela(doc,nsDef) {
	let ns = xmlproc.getNamespaces(doc,nsDef)
	let o = {};
	o.type = "parcela";
	xmlproc.getValueAttr(doc, ns, "@gml:id", o, "id");
	xmlproc.getValue(doc, ns, "pai:KmenoveCislo", o, "kmenoveCislo");
	xmlproc.getValue(doc, ns, "pai:VymeraParcely", o, "vymera");
	xmlproc.getValue(doc, ns, "pai:DruhCislovaniKod", o, "druhCislovani");
	xmlproc.getValue(doc, ns, "pai:DruhPozemkuKod", o, "druhPozemku");
	xmlproc.getValue(doc, ns, "pai:KatastralniUzemi/kui:Kod", o, "katastralniUzemi");
	getPosition(doc, ns, "pai:Geometrie/pai:DefinicniBod//gml:pos", o, "position");
	return o;
}

function processUlice(doc,nsDef) {
	let ns = xmlproc.getNamespaces(doc,nsDef)
	let o = {};
	o.type = "ulice";
	xmlproc.getValueAttr(doc, ns, "@gml:id", o, "id");
	xmlproc.getValue(doc, ns, "uli:Nazev", o, "nazev");
	xmlproc.getValue(doc, ns, "uli:Obec/obi:Kod", o, "obec");
	return o;
}

function processKU(doc,nsDef) {
	let ns = xmlproc.getNamespaces(doc,nsDef)
	let o = {};
	o.type = "katastralni-uzemi";
	xmlproc.getValueAttr(doc, ns, "@gml:id", o, "id");
	xmlproc.getValue(doc, ns, "kui:Nazev", o, "nazev");
	xmlproc.getValue(doc, ns, "kui:ExistujeDigitalniMapa", o, "existujeDigitalniMapa");
	xmlproc.getValue(doc, ns, "kui:Obec/obi:Kod", o, "obec");
	getPosition(doc, ns, "kui:Geometrie/kui:DefinicniBod//gml:pos", o, "position");
	return o;
}

function processRegSoudr(doc,nsDef){
	let ns = xmlproc.getNamespaces(doc,nsDef)
	let o = {};
	o.type = "region-soudrznosti";
	xmlproc.getValueAttr(doc, ns, "@gml:id", o, "id");
	xmlproc.getValue(doc, ns, "rsi:Nazev", o, "nazev");
	xmlproc.getValue(doc, ns, "rsi:NutsLau", o, "nutsLau");
	getPosition(doc, ns, "rsi:Geometrie/rsi:DefinicniBod//gml:pos", o, "position");
	return o;
}

function processKraj(doc,nsDef){
	let ns = xmlproc.getNamespaces(doc,nsDef)
	let o = {};
	o.type = "kraj";
	xmlproc.getValueAttr(doc, ns, "@gml:id", o, "id");
	xmlproc.getValue(doc, ns, "kri:Nazev", o, "nazev");

	getPosition(doc, ns, "kri:Geometrie/kri:DefinicniBod//gml:pos", o, "position");
	return o;
}

function processVusc(doc,nsDef){
	let ns = xmlproc.getNamespaces(doc,nsDef)
	let o = {};
	o.type = "vusc";
	xmlproc.getValueAttr(doc, ns, "@gml:id", o, "id");
	xmlproc.getValue(doc, ns, "vci:Nazev", o, "nazev");
	xmlproc.getValue(doc, ns, "vci:RegionSoudrznosti/rsi:Kod", o, "regionSoudrznosti");
	xmlproc.getValue(doc, ns, "vci:NutsLau", o, "nutsLau");
	getPosition(doc, ns, "vci:Geometrie/vci:DefinicniBod//gml:pos", o, "position");
	return o;
}

function processOkres(doc,nsDef){
	let ns = xmlproc.getNamespaces(doc,nsDef)
	let o = {};
	o.type = "okres";
	xmlproc.getValueAttr(doc, ns, "@gml:id", o, "id");
	xmlproc.getValue(doc, ns, "oki:Nazev", o, "nazev");
	xmlproc.getValue(doc, ns, "oki:Kraj/kri:Kod", o, "kraj");
	xmlproc.getValue(doc, ns, "oki:Vusc/vci:Kod", o, "");
	xmlproc.getValue(doc, ns, "oki:NutsLau", o, "nutsLau");
	getPosition(doc, ns, "oki:Geometrie/pai:DefinicniBod//gml:pos", o, "position");
	return o;
}

function processOrp(doc,nsDef){
	let ns = xmlproc.getNamespaces(doc,nsDef)
	let o = {};
	o.type = "orp";
	xmlproc.getValueAttr(doc, ns, "@gml:id", o, "id");
	xmlproc.getValue(doc, ns, "opi:Nazev", o, "nazev");
	xmlproc.getValue(doc, ns, "opi:SpravniObecKod", o, "spravniObecKod");
	xmlproc.getValue(doc, ns, "opi:Vusc/vci:Kod", o, "vusc");
	getPosition(doc, ns, "opi:Geometrie/pai:DefinicniBod//gml:pos", o, "position");
	return o;
}

function processPou(doc,nsDef){
	let ns = xmlproc.getNamespaces(doc,nsDef)
	let o = {};
	o.type = "pou";
	xmlproc.getValueAttr(doc, ns, "@gml:id", o, "id");
	xmlproc.getValue(doc, ns, "pui:Nazev", o, "nazev");
	xmlproc.getValue(doc, ns, "pui:SpravniObecKod", o, "spravniObecKod");
	xmlproc.getValue(doc, ns, "pui:Orp/opi:Kod", o, "orp");
	getPosition(doc, ns, "pui:Geometrie/pui:DefinicniBod//gml:pos", o, "position");
	return o;
}

function finished() {
	console.log(`pocty:
obce: ${Object.keys(obce).length}
castiObce: ${Object.keys(castiObce).length} 
adresniMista: ${Object.keys(adresniMista).length} 
stavebniObjekty: ${Object.keys(stavebniObjekty).length} 
parcely: ${Object.keys(parcely).length} 
ulice: ${Object.keys(ulice).length} 
katUzemi: ${Object.keys(katUzemi).length} 
regionSoudr: ${Object.keys(regionSoudr).length} 
kraje: ${Object.keys(kraje).length} 
vusc: ${Object.keys(vusc).length} 
okresy: ${Object.keys(okresy).length} 
orp: ${Object.keys(orp).length} 
pou: ${Object.keys(pou).length} 
`)

// esClient.indices.putMapping(
// 	{
// 		index:"obec,okres,orp,cast-obec,vusc,ulice,parcela,katastralni-uzemi,adresni-misto,region-soudrznosti,pou,kraj,stavebni-objekt",
// 		body: {
// 			properties: {
// 				position:{
// 					type: geo_point
// 				}
// 			}
// 		}
// 	},
// )

esUtils.sendToElastic(esClient,obce);
esUtils.sendToElastic(esClient,castiObce);
esUtils.sendToElastic(esClient,adresniMista);
esUtils.sendToElastic(esClient,stavebniObjekty);
esUtils.sendToElastic(esClient,parcely);
esUtils.sendToElastic(esClient,ulice);
esUtils.sendToElastic(esClient,katUzemi);
esUtils.sendToElastic(esClient,regionSoudr);
esUtils.sendToElastic(esClient,kraje);
esUtils.sendToElastic(esClient,okresy);
esUtils.sendToElastic(esClient,vusc);
esUtils.sendToElastic(esClient,orp);
esUtils.sendToElastic(esClient,pou);

	//enrich adresni misto
	// Object.keys(adresniMista).map((key) => {
	// 	let elm = adresniMista[key];
	// 	console.log("AM:"+key)
	// 	if (elm.obec) {
	// 		console.log("adresa s obci !!!")
	// 		let obecId = "OB." + elm.obec;
	// 		elm.obec = {
	// 			id: obecId,
	// 			nazev: obce[obecId].nazev,
	// 		}
	// 	}
	// 	else {
	// 		console.log("adresa bez obce")
	// 	}

	// 	if (elm.ulice) {
	// 		console.log("adresa s ulici !!!")
	// 		let uliceId = "UL." + elm.ulice;
	// 		elm.ulice = {
	// 			id: uliceId,
	// 			nazev: ulice[uliceId].nazev
	// 		}
	// 		console.log("adresa s ulici: "+elm.ulice.nazev)
	// 	}
	// 	else {
	// 		console.log("adresa bez ulice")
	// 	}
	// })


}

