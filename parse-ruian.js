const libxmljs = require('libxmljs')
const fs=require('fs')

let parser = new libxmljs.SaxPushParser();

let ciselnikyJson=fs.readFileSync("ciselniky-mapa.json")
let ciselniky=JSON.parse(ciselnikyJson)
let ciselnikyIndex=[];

ciselniky.forEach((ciselnik)=>{
	ciselnik.xmlName.forEach((xmlName)=>{
		ciselnik.values.forEach((value)=>{
			let key=`${xmlName}-${value.id}`
			ciselnikyIndex[key]=`${ciselnik.prefix}-${value.meaning}`
		})
	})
})


function ciselnikLookup(ciselnikyIndex, xmlName, kod){
	return ciselnikyIndex[`${xmlName}-${kod}`]
}

// connect any callbacks here
parser
  .on('startDocument', ()=>{})
  .on('startElementNS',	startElementNs )
  .on('characters',	characters )
  .on('endElementNS',	endElementNs )
  .on('endDocument', ()=> {stream.close();})


let file=process.argv[2];
let stream=fs.createReadStream(file, {encoding:'utf-8'});

stream.on('data',(chunk)=>{
	//console.log("chunk:", chunk);
  	parser.push(chunk);
})

let stavebniObjekty=[];
let stavebniObjekt=null;
let nextTextConsumer=null;
let cislaDomovni=null;

function startElementNs(elem, attrs, prefix, uri, namespace){

	try {
		switch (`${prefix}:${elem}`){
			case 'vf:StavebniObjekty': ; break;
			case 'vf:StavebniObjekt' : 
				stavebniObjekt={}; 
				stavebniObjekt.tags=[];
				stavebniObjekt.typ="stavební-objekt";
			case 'soi:Kod':
				nextTextConsumer=(text)=>{ 
					if (stavebniObjekt){
						stavebniObjekt.kod=text; 
						nextTextConsumer=null;					
					}
				} 
			break;
			case 'soi:CislaDomovni':
				cislaDomovni=[];
			break;
			case 'com:CisloDomovni':
				nextTextConsumer=(text)=>{ 
					cislaDomovni.push(text); 
					nextTextConsumer=null;
				}
			break;
			case 'pai:Id':
				nextTextConsumer=(text)=>{ 
					if (stavebniObjekt){
						stavebniObjekt.identifikacniParcela=text; 
						nextTextConsumer=null;
					}
				}
			break;
			case 'soi:TypStavebnihoObjektuKod':
				nextTextConsumer=(text)=>{ 
					if (stavebniObjekt){
						stavebniObjekt.typStavebnihoObjektu=text; 
						stavebniObjekt.tags.push(
							ciselnikLookup(ciselnikyIndex,
						       'soi:TypStavebnihoObjektuKod',
						       text
						     )
						);
						nextTextConsumer=null;
					}
				}
			break;

			case 'soi:ZpusobVyuzitiKod':
				nextTextConsumer=(text)=>{ 
					if (stavebniObjekt){
						stavebniObjekt.zpusobVyuziti=text; 
						stavebniObjekt.tags.push(
							ciselnikLookup(ciselnikyIndex,
						       'soi:ZpusobVyuzitiKod',
						       text
						     )
						);
						nextTextConsumer=null;
					}
				}
			break;

			case 'coi:Kod':
				nextTextConsumer=(text)=>{ 
					if (stavebniObjekt){
						stavebniObjekt.castObce=text; 
						nextTextConsumer=null;
					}
				}
			break;

			case 'soi:IsknBudovaId':
				nextTextConsumer=(text)=>{ 
					if (stavebniObjekt){
						stavebniObjekt.isknBudovaId=text; 
						nextTextConsumer=null;
					}
				}
			break;

			case 'soi:DruhKonstrukceKod':
				nextTextConsumer=(text)=>{ 
					if (stavebniObjekt){
						stavebniObjekt.druhKonstrukce=text; 
						stavebniObjekt.tags.push(
							ciselnikLookup(ciselnikyIndex,
						       'soi:DruhKonstrukceKod',
						       text
						     )
						);
						nextTextConsumer=null;
					}
				}
			break;

			case 'soi:PocetBytu':
				nextTextConsumer=(text)=>{ 
					if (stavebniObjekt){
						stavebniObjekt.pocetBytu=Number(text); 
						nextTextConsumer=null;
					}
				}
			break;

			case 'soi:PocetPodlazi':
				nextTextConsumer=(text)=>{ 
					if (stavebniObjekt){
						stavebniObjekt.pocetPodlazi=Number(text); 
						nextTextConsumer=null;
					}
				}
			break;

			case 'soi:PripojeniKanalizaceKod':
				nextTextConsumer=(text)=>{ 
					if (stavebniObjekt){
						stavebniObjekt.pripojeniKanalizace=text; 
						stavebniObjekt.tags.push(
							ciselnikLookup(ciselnikyIndex,
						       'soi:PripojeniKanalizaceKod',
						       text
						     )
						);
						nextTextConsumer=null;
					}
				}
			break;

			case 'soi:PripojeniPlynKod':
				nextTextConsumer=(text)=>{ 
					if (stavebniObjekt){
						stavebniObjekt.pripojeniPlyn=text; 
						stavebniObjekt.tags.push(
							ciselnikLookup(ciselnikyIndex,
						       'soi:PripojeniPlynKod',
						       text
						     )
						);
						nextTextConsumer=null;
					}
				}
			break;

			case 'soi:PripojeniVodovodKod':
				nextTextConsumer=(text)=>{ 
					if (stavebniObjekt){
						stavebniObjekt.pripojeniVodovod=text; 
						stavebniObjekt.tags.push(
							ciselnikLookup(ciselnikyIndex,
						       'soi:PripojeniVodovodKod',
						       text
						     )
						);
						nextTextConsumer=null;
					}
				}
			break;

			case 'soi:VybaveniVytahemKod':
				nextTextConsumer=(text)=>{ 
					if (stavebniObjekt){
						stavebniObjekt.vybaveniVytahem=text; 
						stavebniObjekt.tags.push(
							ciselnikLookup(ciselnikyIndex,
						       'soi:VybaveniVytahemKod',
						       text
						     )
						);
						nextTextConsumer=null;
					}
				}
			break;

			case 'soi:ZpusobVytapeniKod':
				nextTextConsumer=(text)=>{ 
					if (stavebniObjekt){
						stavebniObjekt.zpusobVytapeni=text; 
						stavebniObjekt.tags.push(
							ciselnikLookup(ciselnikyIndex,
						       'soi:ZpusobVytapeniKod',
						       text
						     )
						);
						nextTextConsumer=null;
					}
				}
			break;

			case 'gml:pos':
				nextTextConsumer=(text)=>{ 
					if (stavebniObjekt){
						stavebniObjekt.definicniBod=text; 
						nextTextConsumer=null;
					}
				}
			break;

		}		
	}
	catch (error){
		console.error("startElement error:",error);
	}
}

function endElementNs(elem, prefix, uri){

	try {
		switch (`${prefix}:${elem}`){
			case 'vf:StavebniObjekty': console.log("StaveniObjekty-end"); break;
			case 'vf:StavebniObjekt' : 
				console.log("stavebniObjekt:",stavebniObjekt);
				stavebniObjekty.push(stavebniObjekt)
				stavebniObjekt=null; 
			break;
			case 'soi:CislaDomovni':
				stavebniObjekt.cislaDomovni=cislaDomovni;
				cislaDomovni=null;
			break;
		}		
	}
	catch (error){
		console.error("endElement error:",error);
	}
	
}


function characters(chars){
	//console.log("chars:["+chars+"]");
	if (nextTextConsumer!=null)
		nextTextConsumer(chars);
}