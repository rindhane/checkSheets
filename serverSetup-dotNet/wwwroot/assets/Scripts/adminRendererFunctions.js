const IssueTable= document.getElementById("IssueTable");
const modalContainer = document.getElementById("modalBackground");
//const closeModalButton = document.getElementById("close");
const sideBar = document.getElementById("sideBar")
const templateHTML = document.getElementById("modal_template");
let CHECKSHEETARRAY = [];

async function getCheckSheetUser(url="/UserCheckSheets"){
    const {status:stat, data:rawText}=await postJsonData(url,"give userData");
    if (rawText!=null && rawText!="" && rawText!=undefined){
        CHECKSHEETARRAY=responseToJson(rawText);    
    }
    return CHECKSHEETARRAY;
    /*
    const template= {
        shortDesc:"QSK60-AIO-Checksheet",
        status:"QSK60",
        //lastAction:"something",       
    }
    return [template];
    */
}

function generateDOMattributes(txt){
    const classMap= new Map() ;
    classMap.set("shortDesc",["item", "descBlock"]);
    classMap.set("lastAction",["item"]);
    classMap.set("status",["item"]);
    classMap.set("sn",["item", "shortBlock"]);
    classMap.set("itemSection" , ["itemSection",])
    const DomMap = new Map();
    DomMap.set("shortDesc","div");
    DomMap.set("lastAction","div");
    DomMap.set("status","div");
    DomMap.set("sn","div");
    DomMap.set("itemSection","div");
    return {
        classArray:classMap.get(txt),
        domTyp:DomMap.get(txt),
    };
}

function generateLastActionElement(){
    const htmlString = 
    `
    <div class=" item ">
        <img src="/assets/img/icons/remove.svg">
        <img src="/assets/img/icons/edit.png">
    </div>
    `;
    return htmlToElement(htmlString);
}

async function renderIssueTable(tableElem, issueBlock){
    const Header = `
    <div class="itemSection tableHeader">
        <div class="item shortBlock">Sr</div>
        <div class="item descBlock">CheckSheet Name</div>
        <div class="item">Model</div>
        <div class="item">Actions</div>
    </div>
    `;
    tableElem.innerHTML='';
    tableElem.appendChild(htmlToElement(Header));
    for(let i=0; i< issueBlock.length; i++){
        tableElem.appendChild(generateItemSectionDOM(issueBlock[i],i+1));
    }
    return tableElem;
}

function generateItemSectionDOM(issueObj, index){
    const keyArray=Object.keys(issueObj).filter(
        (key)=>{
            if(key==="issueID"){
                return false;
            }
            return true;
        }
    )
    const parentAttrib=generateDOMattributes('itemSection');
    const sectionElement=generateDomElement(parentAttrib.domTyp,parentAttrib.classArray,"");
    //adding 'sn' dom element 
    let attrib = generateDOMattributes('sn');
    let chilElem=generateDomElement(attrib.domTyp,attrib.classArray,index);
    sectionElement.appendChild(chilElem);
    keyArray.forEach( // loop to generate childElements and attach to sectionElement;
        element => {
        let attrib = generateDOMattributes(element);
        let chilElem=generateDomElement(attrib.domTyp,attrib.classArray,issueObj[element]);
        sectionElement.appendChild(chilElem);
    }); 
    sectionElement.appendChild(generateLastActionElement(issueObj["shortDesc"])); // adding edit & delete icons for action columns
    return sectionElement;
}

async function raiseModal(){
    modalContainer.innerHTML = templateHTML.innerHTML.slice();
    modalContainer.style.display="flex";
    try {
        onloadModal();
    }catch{

    }
};
function closeModal(){
    modalContainer.style.display="none";
};

async function saveNewCheckSheetDetails(event,elem){
    const masterParent= elem.parentElement;
    const checkSheetModel = masterParent.querySelector("input#Model_Details");
    const checkSheetName = masterParent.querySelector("input#Name_CheckSheet");
    const fromExistingElement=masterParent.querySelector('input[type="radio"]#yesTemplate');
    const refModelElement=masterParent.querySelector('select[name="modelSelection"]');
    const refSheetNameElement = masterParent.querySelector('select[name="checkSheetSelection"]');
    const checkSheetData ={
        newCheckSheet:{
            status:checkSheetModel.value,
            shortDesc:checkSheetName.value,
        },
        fromExisting:fromExistingElement.checked,
        refCheckSheet:{
            status:refModelElement.value,
            shortDesc:refSheetNameElement.value,
        },
    };
    const result= await postJsonData("/newCheckSheet", checkSheetData,);
    if (result.status ==200){
        closeModal();
        const answer = confirm("new checksheet submitted");
        renderIssueTable(IssueTable, await getCheckSheetUser() );
    }else {
        confirm('something went wrong');
    }
}

async function renderSidebar(){
    const tokenString = getKeyValueFromStorage("qdasAuthToken");
    const splitArray=tokenString.split('.'); 
    const claimString =splitArray[1]; // claims block
    const decoded = atob(claimString);
    const claimsObj=JSON.parse(decoded);
    console.log(claimsObj.level);
}

async function provideTemplateOption(event,elem){
    const parentElem= elem.parentElement;
    if (elem.checked==true) 
    {
        const modelSelector = parentElem.querySelector('select[name="modelSelection"]');
        const modelSelectorContainer = parentElem.querySelector('div#modelProvider');
        modelSelectorContainer.classList.remove("hideContainer");
        const result = CHECKSHEETARRAY.map(item=>item.status);//collecting all the models from the result;
        modelSelector.innerHTML="";
        const initialOption = htmlToElement(`<option value="0" selected> Choose Model</option>`);
        modelSelector.appendChild(initialOption);
        result.forEach(model=>{
            const child=document.createElement("option");
            child.value=model;
            child.innerText=model;
            modelSelector.appendChild(child);
        });
        return true;
    }
}

async function hideOption(event,elem){
    const parentElem= elem.parentElement;
    const modelSelectorContainer = parentElem.querySelector('div#modelProvider');
    if(elem.checked==true){
        modelSelectorContainer.classList.add("hideContainer");
        return ;
    }
}

async function activateCheckSheetOption(event,modelSelectElem){
    const modelSelectorContainer = modelSelectElem.parentElement;
    const checkSheetSelector= modelSelectorContainer.querySelector('select[name=checkSheetSelection]');
    if(modelSelectElem.value!="0")
    {      
        checkSheetSelector.innerHTML="";
        const initialOption = htmlToElement(`<option value="0" selected> Choose CheckSheet</option>`);
        checkSheetSelector.appendChild(initialOption);
        CHECKSHEETARRAY.filter(
            item=>item.status==modelSelectElem.value
            ).map(item=>item.shortDesc
            ).forEach(sheetName=>{
            const child=document.createElement("option");
            child.value=sheetName;
            child.innerText=sheetName;
            checkSheetSelector.appendChild(child);   
            });
        checkSheetSelector.classList.remove("hideContainer");
        return ;
    }
    checkSheetSelector.options.selectedIndex=0;
    checkSheetSelector.classList.add("hideContainer");
    return;
}