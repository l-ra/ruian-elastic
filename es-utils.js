



module.exports.sendToElastic =(client,data)=>{
	let body=[];
	data.forEach((doc)=>{
		body.push({index: {_index:doc.type, _type:doc.type, _id: doc.id}});
		body.push(doc)
	})
	client.bulk(
		{
			body: body
		},
		(err,res)=>{
			if (err)
				console.log("ES error while bulk",err);
			else 
				console.log("indexed:"+data.length);
		}
	)
}

