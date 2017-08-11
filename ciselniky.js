const fs=require('fs')

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
	return ciselnikyIndex[`${xmlName}-${kod}`]
}

module.exports.ciselnikLookup=ciselnikLookup