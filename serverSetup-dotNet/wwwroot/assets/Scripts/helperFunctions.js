function applyAttributes(elem,classArray){
    let classString = "";
    for (let i=0; i <classArray.length; i++){
        classString=classString+" "+ classArray[i]+" ";
    }
    elem.setAttribute('class',classString);
    return elem;
}

function generateDomElement(typ, classDetail, innerText){
    const elem = document.createElement(typ);
    applyAttributes(elem,classDetail);
    elem.innerText=innerText;
    return elem;
}

function htmlToElement(htmlString) {
	//ref:
		//https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro/35385518#35385518
		//https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro/35385518#35385518
		let template = document.createElement('template');
		html = htmlString.trim(); // Never return a text node of whitespace as the result
		template.innerHTML = html;
		return template.content.firstChild;
}


function htmlToMultiElement(htmlString){
	//ref:
		//https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro/35385518#35385518
		//https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro/35385518#35385518
		let template = document.createElement('template');
		html = htmlString.trim(); // Never return a text node of whitespace as the result
		template.innerHTML = html;
		return template.content.children;
}


//preparing payloads 
async function formDatatoJson(form){
    data = new FormData(form);
    const result= {};
    result.email= data.get("email");
    result.password = sha256(data.get("password")); // for time being until problem of crypto.sublte.digest is solved
    //result.password =  await digestMessage(data.get("password"));
    return result;
}


//sending post request to server
async function postJsonData(url , Jsondata, authKey="qdasAuthToken"){ 
    let options={
      method: 'POST',
      headers: {
        Accept: 'application/json',
        "Content-Type": 'application/json',
        authToken:getKeyValueFromStorage(authKey)
      },
      body: JSON.stringify(Jsondata),
      cache: 'default',
      redirect:'manual',
    }
    let response = await fetch(url, options);
    const status = response.status  
    const data = await response.text();
    return { status:status, data:data }
  };

function responseToJson(textData){
    return JSON.parse(textData);
}


//supporting rendering functions

async function setOptionToSelectElement(selectElem,value){
	for(i=0;i<selectElem.options.length;i++){
		if(selectElem.options[i].value==value)
		{
			selectElem.options.selectedIndex=i;
			return true;
		}
	}
	return false;
}

//local storage functions

function storeInLocalStorage(key,value){
    localStorage.setItem(key,value);
    return true;
}

function getKeyValueFromStorage(key){
    const result = localStorage.getItem(key);
    return result;
}

// local cookie functions

async function setCookie(name,value){
    document.cookie=`${name}=${value}`
    return true
}


// field Validators
async function validateField(inputElement){
    if (inputElement.value=""){
        return false;
    }
}

//crypto functions 


//random generators
function AlphaNumeric(length){
	//ref : https://github.com/30-seconds/30-seconds-of-code/blob/master/snippets/randomAlphaNumeric.md
	let s = '';
	Array.from({ length }).some(() => {
    s += Math.random().toString(36).slice(2);
    return s.length >= length;
  });
  return s.slice(0, length);
};


async function digestMessage(message){
    const encoder = new TextEncoder();
    const msgUint8 = encoder.encode(message); //encoded as utf-8
    const hashBuffer = await crypto.subtle.digest("SHA-256",msgUint8);
    const hashArray=Array.from(new Uint8Array(hashBuffer)); //get byte array
    const hashHex= hashArray.map((b)=>b.toString(16).padStart(2,"0")).join("");
    return hashHex;
    //should modify to return in base64String : 
    //ref:https://developer.mozilla.org/en-US/docs/Web/API/btoa
    //https://stackoverflow.com/questions/9267899/arraybuffer-to-base64-encoded-string
} 

//borrowed from 
//https://github.com/geraintluff/sha256/blob/gh-pages/sha256.js
//https://geraintluff.github.io/sha256/
//https://github.com/geraintluff?tab=repositories
//https://stackoverflow.com/questions/59777670/how-can-i-hash-a-string-with-sha256-in-js 
//https://www.movable-type.co.uk/scripts/sha256.html

var sha256 = function sha256(ascii) {
	function rightRotate(value, amount) {
		return (value>>>amount) | (value<<(32 - amount));
	};
	
	var mathPow = Math.pow;
	var maxWord = mathPow(2, 32);
	var lengthProperty = 'length';
	var i, j; // Used as a counter across the whole file
	var result = '';

	var words = [];
	var asciiBitLength = ascii[lengthProperty]*8;
	
	//* caching results is optional - remove/add slash from front of this line to toggle
	// Initial hash value: first 32 bits of the fractional parts of the square roots of the first 8 primes
	// (we actually calculate the first 64, but extra values are just ignored)
	var hash = sha256.h = sha256.h || [];
	// Round constants: first 32 bits of the fractional parts of the cube roots of the first 64 primes
	var k = sha256.k = sha256.k || [];
	var primeCounter = k[lengthProperty];
	/*/
	var hash = [], k = [];
	var primeCounter = 0;
	//*/

	var isComposite = {};
	for (var candidate = 2; primeCounter < 64; candidate++) {
		if (!isComposite[candidate]) {
			for (i = 0; i < 313; i += candidate) {
				isComposite[i] = candidate;
			}
			hash[primeCounter] = (mathPow(candidate, .5)*maxWord)|0;
			k[primeCounter++] = (mathPow(candidate, 1/3)*maxWord)|0;
		}
	}
	
	ascii += '\x80'; // Append '1' bit (plus zero padding)
	while (ascii[lengthProperty]%64 - 56) ascii += '\x00'; // More zero padding
	for (i = 0; i < ascii[lengthProperty]; i++) {
		j = ascii.charCodeAt(i);
		if (j>>8) return; // ASCII check: only accept characters in range 0-255
		words[i>>2] |= j << ((3 - i)%4)*8;
	}
	words[words[lengthProperty]] = ((asciiBitLength/maxWord)|0);
	words[words[lengthProperty]] = (asciiBitLength)
	
	// process each chunk
	for (j = 0; j < words[lengthProperty];) {
		var w = words.slice(j, j += 16); // The message is expanded into 64 words as part of the iteration
		var oldHash = hash;
		// This is now the "working hash", often labelled as variables a...g
		// (we have to truncate as well, otherwise extra entries at the end accumulate
		hash = hash.slice(0, 8);
		
		for (i = 0; i < 64; i++) {
			var i2 = i + j;
			// Expand the message into 64 words
			// Used below if 
			var w15 = w[i - 15], w2 = w[i - 2];

			// Iterate
			var a = hash[0], e = hash[4];
			var temp1 = hash[7]
				+ (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) // S1
				+ ((e&hash[5])^((~e)&hash[6])) // ch
				+ k[i]
				// Expand the message schedule if needed
				+ (w[i] = (i < 16) ? w[i] : (
						w[i - 16]
						+ (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15>>>3)) // s0
						+ w[i - 7]
						+ (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2>>>10)) // s1
					)|0
				);
			// This is only used once, so *could* be moved below, but it only saves 4 bytes and makes things unreadble
			var temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) // S0
				+ ((a&hash[1])^(a&hash[2])^(hash[1]&hash[2])); // maj
			
			hash = [(temp1 + temp2)|0].concat(hash); // We don't bother trimming off the extra ones, they're harmless as long as we're truncating when we do the slice()
			hash[4] = (hash[4] + temp1)|0;
		}
		
		for (i = 0; i < 8; i++) {
			hash[i] = (hash[i] + oldHash[i])|0;
		}
	}
	
	for (i = 0; i < 8; i++) {
		for (j = 3; j + 1; j--) {
			var b = (hash[i]>>(j*8))&255;
			result += ((b < 16) ? 0 : '') + b.toString(16);
		}
	}
	return result;
};
