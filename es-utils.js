

module.exports.sendToElastic = (client, data) => {
	let body = [];
	let dataLen;

	if (Array.isArray(data)) {
		dataLen = data.length;
		if (dataLen == 0) return;
		data.forEach((doc) => {
			body.push({ index: { _index: doc.type, _type: doc.type, _id: doc.id } });
			body.push(doc)
		})
	}
	else {
		dataLen = Object.keys(data).length;
		if (dataLen == 0) return;
		Object.keys(data).forEach((key) => {
			let doc = data[key];
			body.push({ index: { _index: doc.type, _type: doc.type, _id: key } });
			body.push(doc)
		})
	}

	indexPreparedBulk(client, body, 10000)
}

module.exports.ensureIndex=(client, settings, cbFinish, cbError)=>{
	client.indices.get({index:"obec"})
	.then(
		(result)=>{
			console.log("index exist");
			cbFinish();
		}
		,(reject)=>{
			console.log;("no index");
			if (cbError) cbError(reject);
		}
	)
	.catch( (err)=>{
		if (cbError) cbError(err);
	})
}

function indexPreparedBulk(client, bulk, maxBulk, cbFinish, cbError) {
	if (bulk.length<=0) {
		if (cbFinish) cbFinish();
		return;
	}
	client.bulk(
		{
			body: bulk.slice(0, maxBulk * 2)
		},
		(err, res) => {
			if (err){
				console.log("ES error while bulk", err);
				if (cbError) cbError(err);
			}
			else {
				let indexed=bulk.length>maxBulk/2?maxBulk:bulk.length/2;
				if (res.errors){
					console.log(JSON.stringify(res,true,4))
				}
				console.log(`indexed ${indexed} remaining ${bulk.length/2-indexed}` );
				process.nextTick(()=>{indexPreparedBulk(client, bulk.slice(maxBulk * 2),maxBulk);})
			}
		}
	)
}