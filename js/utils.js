
utils = {}; //utility functions

// ==== OBJECT ORIENTED JAVASCRIPT ===============

// Utility function to print a array of items but just show number and last.
utils.consolearr  = (arr) => ((arr && arr.length >0) ? [arr.length+" items inc:", arr[arr.length-1]] : arr );
//Return true if two shortish arrays a and b intersect or if b is not an array, then if b is in a
//Note there are better solutions exist for longer arrays
//This is intended for comparing two sets of probably equal, but possibly just intersecting URLs
utils.intersects = (a,b) =>  (Array.isArray(b) ? a.some(x => b.includes(x)) : a.includes(b));

// Utility functions

utils.mergeTypedArraysUnsafe = function(a, b) { // Take care of inability to concatenate typed arrays such as Uint8
    //http://stackoverflow.com/questions/14071463/how-can-i-merge-typedarrays-in-javascript also has a safe version
    const c = new a.constructor(a.length + b.length);
    c.set(a);
    c.set(b, a.length);
    return c;
};

//TODO-STREAM, use this code and return stream from p_rawfetch that this can be applied to
utils.p_streamToBuffer = function(stream, verbose) {
    // resolve to a promise that returns a stream.
    // Note this comes form one example ...
    // There is another example https://github.com/ipfs/js-ipfs/blob/master/examples/exchange-files-in-browser/public/js/app.js#L102 very different
    return new Promise((resolve, reject) => {
        try {
            let chunks = [];
            stream
                .on('data', (chunk) => { if (verbose) console.log('on', chunk.length); chunks.push(chunk); })
                .once('end', () => { if (verbose) console.log('end chunks', chunks.length); resolve(Buffer.concat(chunks)); })
                .on('error', (err) => { // Note error behavior untested currently
                    console.log("Error event in p_streamToBuffer",err);
                    reject(new errors.TransportError('Error in stream'))
                });
            stream.resume();
        } catch (err) {
            console.log("Error thrown in p_streamToBuffer", err);
            reject(err);
        }
    })
};
//TODO-STREAM, use this code and return stream from p_rawfetch that this can be applied to
//TODO-STREAM debugging in streamToBuffer above, copy to here when fixed above
utils.p_streamToBlob = function(stream, mimeType, verbose) {
    // resolve to a promise that returns a stream - currently untested as using Buffer
    return new Promise((resolve, reject) => {
        try {
            let chunks = [];
            stream
                .on('data', (chunk)=>chunks.push(chunk))
                .once('end', () =>
                    resolve(mimeType
                        ? new Blob(chunks, { type: mimeType })
                        : new Blob(chunks)))
                .on('error', (err) => { // Note error behavior untested currently
                    console.log("Error event in p_streamToBuffer",err);
                    reject(new errors.TransportError('Error in stream'))
                });
            stream.resume();
        } catch(err) {
            console.log("Error thrown in p_streamToBlob",err);
            reject(err);
        }
    })
};

utils.stringfrom = function(foo, hints={}) {
    try {
        // Generic way to turn anything into a string
        if (foo.constructor.name === "Url") // Can't use instanceof for some bizarre reason
            return foo.href;
        if (typeof foo === "string")
            return foo;
        return foo.toString();  // Last chance try and convert to a string based on a method of the object (could check for its existence)
    } catch (err) {
        throw new errors.CodingError(`Unable to turn ${foo} into a string ${err.message}`)
    }
};
utils.objectfrom = function(data, hints={}) {
    // Generic way to turn something into a object (typically expecting a string, or a buffer)
    return (typeof data === "string" || data instanceof Buffer) ? JSON.parse(data) : data;
}

utils.keyFilter = function(dic, keys) {
    // Utility to return a new dic containing each of keys (equivalent to python { dic[k] for k in keys }
    return keys.reduce(function(prev, key) { prev[key] = dic[key]; return prev; }, {});
}

exports = module.exports = utils;
