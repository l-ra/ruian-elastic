const es=require('elasticsearch')
const proj4 = require('proj4')
const common=require('./common.js')
const ciselniky=require('./ciselniky.js')
const xmlproc=require('./xml-processor.js')

var esClient = new es.Client({
  host: '127.0.0.1:9200',
  log: 'error'
});

proj4.defs("EPSG:4326","+proj=longlat +datum=WGS84 +no_defs");
proj4.defs("EPSG:5514","+proj=krovak +lat_0=49.5 +lon_0=24.83333333333333 +alpha=30.28813972222222 +k=0.9999 +x_0=0 +y_0=0 +ellps=bessel +towgs84=589,76,480,0,0,0,0 +units=m +no_defs");

let file=process.argv[2];

let stavebniObjekty=[];

let matched=[
	{
		prefix:'vf',
		name:'Obec'
	},
	{
		prefix:'vf',
		name:'CastObec'
	},
	{
		prefix:'vf:',
		name:'KatastralniUzemi',
		hasAttr: 'id'
	},
	{
		prefix:'vf',
		name:'Zsj',
		hasAttr: 'id'
	},
	{
		prefix:'vf',
		name:'Ulice',
		hasAttr: 'id'
	},
	{
		prefix:'vf',
		name:'Parcela',
		hasAttr: 'id'
	},
	{
		prefix:'vf',
		name:'AdresniMisto',
	}
];

xmlproc.processFile(matched, file, processElement);

function processElement(doc){
	switch(doc.root().name()){
		case 'Obec': 
			processObec(doc);
			break;
		case 'CastObce': 
			processCastObce(doc);
			break;
		case 'AdresniMisto': 
			processAdresniMisto(doc)
			;break;
		case 'StavebniObjekt': 
			processStavebniObjekt(doc);
			break;		
		case 'Parcela': 
			processParcela(doc);
			break;		
		case 'Ulice': 
			processUlice(doc);
			;break;		
		case 'Zsj': 
			processZsj(doc);
			break;		
		case 'KatastralniUzemi': 
			processKU(doc);
			break;		
	}
}


function processObec(doc){
	//let o={};
	//o.type="obec";
	//o.id="/Obec/@gml.Id"
	console.log("Obec:\n"+doc.toString())
}

function processCastObce(doc){
};

function processAdresniMisto(doc){

}

function processStavebniObjekt(doc){

}

function processParcela(doc){
}

function processUlice(doc){

}

function processZsj(doc){

}

function processKU(doc){
}





// function startElementNs(elem, attrs, prefix, uri, namespace){

// 	try {
// 		switch (`${prefix}:${elem}`){
// 			case 'vf:StavebniObjekty': ; break;
// 			case 'vf:StavebniObjekt' : 
// 				stavebniObjekt={}; 
// 				stavebniObjekt.tags=[];
// 				stavebniObjekt.typ="stavebni-objekt";
// 			case 'soi:Kod':
// 				setNextTextConsumer((text)=>{ 
// 					if (stavebniObjekt){
// 						stavebniObjekt.kod=text; 
// 						nextTextConsumer=null;					
// 					}
// 				} )
// 			break;
// 			case 'soi:CislaDomovni':
// 				cislaDomovni=[];
// 			break;
// 			case 'com:CisloDomovni':
// 				setNextTextConsumer((text)=>{ 
// 					cislaDomovni.push(text); 
// 					nextTextConsumer=null;
// 				})
// 			break;
// 			case 'pai:Id':
// 				setNextTextConsumer((text)=>{ 
// 					if (stavebniObjekt){
// 						stavebniObjekt.identifikacniParcela=text; 
// 					}
// 				})
// 			break;
// 			case 'soi:TypStavebnihoObjektuKod':
// 				setNextTextConsumer((text)=>{ 
// 					if (stavebniObjekt){
// 						stavebniObjekt.typStavebnihoObjektu=text; 
// 						stavebniObjekt.tags.push(
// 							ciselnikLookup(ciselnikyIndex,
// 						       'soi:TypStavebnihoObjektuKod',
// 						       text
// 						     )
// 						);
// 					}
// 				})
// 			break;

// 			case 'soi:ZpusobVyuzitiKod':
// 				nextTextConsumer=(text)=>{ 
// 					if (stavebniObjekt){
// 						stavebniObjekt.zpusobVyuziti=text; 
// 						stavebniObjekt.tags.push(
// 							ciselnikLookup(ciselnikyIndex,
// 						       'soi:ZpusobVyuzitiKod',
// 						       text
// 						     )
// 						);
// 						nextTextConsumer=null;
// 					}
// 				}
// 			break;

// 			case 'coi:Kod':
// 				nextTextConsumer=(text)=>{ 
// 					if (stavebniObjekt){
// 						stavebniObjekt.castObce=text; 
// 						nextTextConsumer=null;
// 					}
// 				}
// 			break;

// 			case 'soi:IsknBudovaId':
// 				nextTextConsumer=(text)=>{ 
// 					if (stavebniObjekt){
// 						stavebniObjekt.isknBudovaId=text; 
// 						nextTextConsumer=null;
// 					}
// 				}
// 			break;

// 			case 'soi:DruhKonstrukceKod':
// 				nextTextConsumer=(text)=>{ 
// 					if (stavebniObjekt){
// 						stavebniObjekt.druhKonstrukce=text; 
// 						stavebniObjekt.tags.push(
// 							ciselnikLookup(ciselnikyIndex,
// 						       'soi:DruhKonstrukceKod',
// 						       text
// 						     )
// 						);
// 						nextTextConsumer=null;
// 					}
// 				}
// 			break;

// 			case 'soi:PocetBytu':
// 				nextTextConsumer=(text)=>{ 
// 					if (stavebniObjekt){
// 						stavebniObjekt.pocetBytu=Number(text); 
// 						nextTextConsumer=null;
// 					}
// 				}
// 			break;

// 			case 'soi:PocetPodlazi':
// 				nextTextConsumer=(text)=>{ 
// 					if (stavebniObjekt){
// 						stavebniObjekt.pocetPodlazi=Number(text); 
// 						nextTextConsumer=null;
// 					}
// 				}
// 			break;

// 			case 'soi:PripojeniKanalizaceKod':
// 				nextTextConsumer=(text)=>{ 
// 					if (stavebniObjekt){
// 						stavebniObjekt.pripojeniKanalizace=text; 
// 						stavebniObjekt.tags.push(
// 							ciselnikLookup(ciselnikyIndex,
// 						       'soi:PripojeniKanalizaceKod',
// 						       text
// 						     )
// 						);
// 						nextTextConsumer=null;
// 					}
// 				}
// 			break;

// 			case 'soi:PripojeniPlynKod':
// 				nextTextConsumer=(text)=>{ 
// 					if (stavebniObjekt){
// 						stavebniObjekt.pripojeniPlyn=text; 
// 						stavebniObjekt.tags.push(
// 							ciselnikLookup(ciselnikyIndex,
// 						       'soi:PripojeniPlynKod',
// 						       text
// 						     )
// 						);
// 						nextTextConsumer=null;
// 					}
// 				}
// 			break;

// 			case 'soi:PripojeniVodovodKod':
// 				nextTextConsumer=(text)=>{ 
// 					if (stavebniObjekt){
// 						stavebniObjekt.pripojeniVodovod=text; 
// 						stavebniObjekt.tags.push(
// 							ciselnikLookup(ciselnikyIndex,
// 						       'soi:PripojeniVodovodKod',
// 						       text
// 						     )
// 						);
// 						nextTextConsumer=null;
// 					}
// 				}
// 			break;

// 			case 'soi:VybaveniVytahemKod':
// 				nextTextConsumer=(text)=>{ 
// 					if (stavebniObjekt){
// 						stavebniObjekt.vybaveniVytahem=text; 
// 						stavebniObjekt.tags.push(
// 							ciselnikLookup(ciselnikyIndex,
// 						       'soi:VybaveniVytahemKod',
// 						       text
// 						     )
// 						);
// 						nextTextConsumer=null;
// 					}
// 				}
// 			break;

// 			case 'soi:ZpusobVytapeniKod':
// 				nextTextConsumer=(text)=>{ 
// 					if (stavebniObjekt){
// 						stavebniObjekt.zpusobVytapeni=text; 
// 						stavebniObjekt.tags.push(
// 							ciselnikLookup(ciselnikyIndex,
// 						       'soi:ZpusobVytapeniKod',
// 						       text
// 						     )
// 						);
// 						nextTextConsumer=null;
// 					}
// 				}
// 			break;

// 			case 'gml:pos':
// 				nextTextConsumer=(text)=>{ 
// 					if (stavebniObjekt){
// 						stavebniObjekt.definicniBod=text;
// 						let lonlat=proj4("EPSG:5514","EPSG:4326",text.split(" "))
// 						stavebniObjekt.location=lonlat;
// 						nextTextConsumer=null;
// 					}
// 				}
// 			break;

// 		}		
// 	}
// 	catch (error){
// 		console.error("startElement error:",error);
// 	}
// }

// function endElementNs(elem, prefix, uri){

// 	try {
// 		switch (`${prefix}:${elem}`){
// 			case 'vf:StavebniObjekty': 
// 				console.log("StaveniObjekty-end"); 
// 				commons.sendToElastic(esClient, old);
// 			break;
// 			case 'vf:StavebniObjekt' : 
// 				//console.log("stavebniObjekt:",stavebniObjekt);
// 				stavebniObjekt.id="SO."+stavebniObjekt.kod;
// 				stavebniObjekty.push(stavebniObjekt)
// 				stavebniObjekt=null; 
// 				if (stavebniObjekty.length>200){
// 					let old=stavebniObjekty;
// 					stavebniObjekty=[];
// 					commons.sendToElastic(esClient, old);
// 				}
// 			break;
// 			case 'soi:CislaDomovni':
// 				stavebniObjekt.cislaDomovni=cislaDomovni;
// 				cislaDomovni=null;
// 			break;
// 		}		
// 	}
// 	catch (error){
// 		console.error("endElement error:",error);
// 	}
	
// }


