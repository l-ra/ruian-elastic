/* 
the beast is intendedd to process large files containing a lot of smaller elements.
Every such element is processed and extracted and passed as DOM document containing only the element to callback
After the callback is finished, document is discarded. 
Once element is matched, no matching inside the element is done.
You can use xpath on the document

matchedElements:
{
    prefix: ''
    nsUri: ''
    name: ''
    hasAttr : '' 
}

*/   

const libxmljs = require('libxmljs')
const fs = require('fs')

function processFile(matchedElements, file, callback) {
    let parser = new libxmljs.SaxPushParser();
    let stream = fs.createReadStream(file, { encoding: 'utf-8' });
    stream.on('data', (chunk) => {
        //console.log("chunk:", chunk);
        parser.push(chunk);
    })
    parser
        .on('startDocument', () => { })
        .on('startElementNS', startElementNs)
        .on('characters', characters)
        .on('endElementNS', endElementNs)
        .on('endDocument', () => { stream.close(); })

    let doc = null;
    let currentElement = null;
    let indent = "";
    let nsDefs = {};

    function startElementNs(elem, attrs, prefix, uri, namespace) {
        //console.log(`${prefix}:${elem}`)
        try {
            //record namespace defs
            namespace.forEach((ns)=>{
                //console.log("storing namespace: "+ns[0]);
                nsDefs[ns[0]]=ns[1];
            });


            if (currentElement != null) {
                //inside matched element
                let elm = new libxmljs.Element(doc, elem);
                currentElement.addChild(elm)
                namespace.forEach((ns)=>{
                    elm.defineNamespace(ns[0],ns[1])
                })
                elm.namespace(prefix, uri)
                let a=[];
                attrs.forEach((attr)=>{
                    if (attr[1]){
                        a[attr[1]+":"+attr[0]]=attr[3]
                    }
                    else {
                        a[attr[0]]=attr[3]
                    }
                })
                elm.attr(a);
                currentElement = elm;
            }
            else if (isMatchedElement(matchedElements,elem, attrs, prefix, uri, namespace)) {
                //element just matched
                doc = new libxmljs.Document();
                let elm = new libxmljs.Element(doc, elem);
                doc.root(elm)
                Object.keys(nsDefs).forEach((ns)=>{
                    if (nsDefs.hasOwnProperty(ns)){
                        //console.log(`defining namespace: ${ns}:${nsDefs[ns]}`);
                        elm.defineNamespace(ns,nsDefs[ns])
                    }
                })
                elm.namespace(prefix, uri)
                let a=[];
                attrs.forEach((attr)=>{
                    if (attr[1]){
                        a[attr[1]+":"+attr[0]]=attr[3]
                    }
                    else {
                        a[attr[0]]=attr[3]
                    }
                })
                elm.attr(a);
                currentElement = elm
                //console.log("Started root element:"+elem)
            }
        }
        catch (error) {
            console.log("!!!Error: ", error)
        }
    }

    function endElementNs(elem, prefix, uri) {
        try {
            if (currentElement != null) {
                if (currentElement === doc.root()) {
                    callback(doc)
                    currentElement = null;
                    doc = null;
                }
                else {
                    //console.log(indent+"FINISHED child element:"+currentElement.name());
                    ///indent=indent.substring(2)
                    currentElement = currentElement.parent()
                }
            }

        }
        catch (error) {
            console.log("!!!Error: ", error)
        }
    }

    function characters(chars) {
        if (currentElement != null) {
            currentElement.addChild(new libxmljs.Text(doc, chars));
        }
    }

}

function isMatchedElement(matched, elem, attrs, prefix, uri, namespace){
    let found=false;
    matched.forEach((m)=>{
        let prefixMatch = !m.prefix || (m.prefix && prefix && m.prefix==prefix);
        let nameMatch = !m.name || m.name==elem;
        let uriMatch = !m.uri || (m.uri && uri && m.uri==uri);
        let hasAttrMatch = !m.hasAttr || (m.hasAttr && attrs && findAttrName(attrs,m.hasAttr));
        found=found || prefixMatch && nameMatch && uriMatch && hasAttrMatch  
    })
    return found;
}

function findAttrName(attrs, name){
    attrs.forEach((attr)=>{
        if ( attr[0] === name ) return true;
    })
    return false;
}


function getNamespaces(doc) {
	let namespaces = {};
	doc.root().namespaces().map((ns) => {
		return namespaces[ns.prefix()] = ns.href();
	});
	return namespaces;
}

function getValueAttr(doc, ns, xpath, obj, propName) {
	if (doc.root().find(xpath, ns).length > 0) {
		let val = doc.root().find(xpath, ns).map((elm) => {
			return elm.value();
		})
		if (val.length==1) obj[propName]=val[0]
		else obj[propName]=val;
	}
}


function getValue(doc, ns, xpath, obj, propName) {
	if (doc.root().find(xpath, ns).length > 0) {
		let val = doc.root().find(xpath, ns).map((elm) => {
			return elm.text();
		})
		if (val.length==1) obj[propName]=val[0]
		else obj[propName]=val;
	}
}


module.exports.processFile=processFile;
module.exports.getValue=getValue;
module.exports.getValueAttr = getValueAttr;
module.exports.getNamespaces = getNamespaces;