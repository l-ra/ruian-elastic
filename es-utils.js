



module.exports.sendToElastic = (client, data) => {
	let body = [];
	let dataLen;

	if (Array.isArray(data)) {
		dataLen=data.length;
		if (dataLen==0) return;
		data.forEach((doc) => {
			body.push({ index: { _index: doc.type, _type: doc.type, _id: doc.id } });
			body.push(doc)
		})
	}
	else {
		dataLen=Object.keys(data).length;
		if (dataLen==0) return;
		Object.keys(data).forEach((key)=>{
			let doc=data[key];
			body.push({ index: { _index: doc.type, _type: doc.type, _id: key } });
			body.push(doc)			
		})
	}

	client.bulk(
		{
			body: body
		},
		(err, res) => {
			if (err)
				console.log("ES error while bulk", err);
			else
				console.log("indexed:" + dataLen);
		}
	)
}

