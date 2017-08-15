const fs=require('fs')

//FIXME: hardcoded filename
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


function ciselnikLookup( xmlName, kod){
	let ret=ciselnikyIndex[`${xmlName}-${kod}`];
	if (!ret){
		return null
	}
	else {
		return ret;
	}
}

module.exports.ciselnikLookup=ciselnikLookup