/* 
the beast is intendedd to process large files containing a lot of smaller elements.
Put every element you are interested in into an array matchedElements in the form "prefix:name#prefix:name ....."
Every such element is processed and extracted and passed as DOM document containing only the element to callback
After the callback is finished, document is discarded. 
Once element is matched, no matching inside the element is done.
You can use xpath on the document
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

    function startElementNs(elem, attrs, prefix, uri, namespace) {
        //console.log(`${prefix}:${elem}`)
        try {
            if (currentElement != null) {
                //indent=indent+"  "
                //console.log(indent+"START: found child element:"+elem)
                let elm = new libxmljs.Element(doc, elem);
                elm.namespace(prefix, uri)
                elm.attr(attrs)
                currentElement.addChild(elm)
                currentElement = elm;
            }
            else if (matchedElements.indexOf(`${prefix}:${elem}`) >= 0) {
                ///console.log("starting root element:" + elem);
                doc = new libxmljs.Document();
                let elm = new libxmljs.Element(doc, elem);
                elm.namespace(prefix, uri)
                elm.attr(attrs)
                doc.root(elm)
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

module.exports.processFile=processFile;