const fieldContainerElement = document.getElementById("contentSection");
const closeModalButton = document.getElementById("close");
const modalContainer = document.getElementById("modalBackground");
const authMode = {
    active:false,
};
var MasterArray=[];
/*
var MasterArray=[
    {
    "typ":"section",
    "fieldType":"",
    "descText":"Section-1",
    "index":"0",
    "childs":[	
        {"typ":"field","fieldType":"text","descText":"Check: Chipping","inspectionClass":"critical", specDef:"visual",},	
        {"typ":"field","fieldType":"text","descText":"Check: Rough Edges ", "inspectionClass":"minor", specDef:"visual",},	
        {"typ":"field","fieldType":"numerical",
            "descText":"Measure Widht of Cam Flank",
            "meanValue":"65",
            "maxCheck":null,
            "minCheck":null,
            "inspectionClass":"major", 
            specDef:"65 +/- 2",
	    }
	]
    },
    {
        "typ":"section",
        "fieldType":"",
        "descText":"Section-2",
        "index":"1",
        "childs":[	
            {"typ":"field","fieldType":"text","descText":"Check: scratch Mark", "inspectionClass":"critical", specDef:"visual",},	
            {"typ":"field","fieldType":"numerical",
                "descText":"Measure pin lengeht",
                "meanValue":"50",
                "maxCheck":40,
                "minCheck":60,
                specDef:"50 +/- 10",
                "inspectionClass":"minor",
            }
        ]
    },
];
*/
var ReworkArray=[];

async function actionOnAuthModeSelection(event){
    if(event.target.checked){
        authMode.active=true;
        populateForm(MasterArray,fieldContainerElement,);
        return true;
    }
    if(!event.target.checked){
        authMode.active=false;
        saveAuthoredCheckSheetWithBackend();
        populateForm(MasterArray,fieldContainerElement,);
        return true;
    }
    return false;
};


function setNewSerialNumber(array){
    array=array.map((JsonObject,index)=>{
        JsonObject["index"]=index;
        return JsonObject;
    })
    return array;
}

//topFilter function
async function populateOptionInTopFilter(){
    const selectElem= document.getElementById("operationSelector");
    selectElem.innerHTML='';
    const operationArray = MasterArray.map(section=>section.descText);
    operationArray.push("All"); // for all elements
    operationArray.push("All & Rework");
    operationArray.push("Rework");
    createOptionElements(selectElem,operationArray,"Select Operation");
    selectElem.value="All & Rework";
    selectElem.onchange=()=>{
        populateForm(MasterArray,fieldContainerElement,);
    }
} 

function provideTopFilterTruthy(key){
    const selectElem= document.getElementById("operationSelector");
    if(key==selectElem.value){
        return true;
    }
    if(selectElem.value=='All' && key!="Rework"){
        return true;
    }
    if(selectElem.value=="All & Rework"){
        return true;
    }
    return false;
}

//functions on the checklist
async function onClickNewAdd(elem){
    //console.log(elem.getAttribute("index"));
    const modalTempElem = document.getElementById("modalStartContent");
    modalTempElem.children[0].setAttribute("data-index",parseInt(elem.getAttribute("index"))+1);
    modalTempElem.children[0].setAttribute("data-mode","copy");
    modalContainer.appendChild(modalTempElem.children[0]);
    modalContainer.style.display="flex";
}

async function onClickEdit(elem){
    const modalTempElem = document.getElementById("modalStartContent");
    const index = parseInt(elem.getAttribute("index"));
    const JsonObj=MasterArray[index];
    generateModalForEdit(JsonObj,modalTempElem);
    return true;
} 

async function onClickDelete(elem){
    const index = parseInt(elem.getAttribute("index"));
    MasterArray.splice(index, 1);
    MasterArray=setNewSerialNumber(MasterArray);
    populateForm(MasterArray,fieldContainerElement,);
}

async function displayPicOnModal(event,elem){
    const tempElem = elem.cloneNode();
    tempElem.style = "height:50%;width:auto;"
    const imageContainer = htmlToElement(
            document.getElementById("modalPicContainer").innerHTML.slice()
            );
    imageContainer.appendChild(tempElem)
    modalContainer.appendChild(imageContainer);
    modalContainer.style.display="flex";
    const closeButton=imageContainer.querySelector("span#closePic");
    closeButton.onclick=closePicModalFunction;
    return true;
}

function AddSectionBlock(ElemJsonObj, sectionDetailArray){
    sectionDetailArray.splice(ElemJsonObj.index,0,ElemJsonObj);
    sectionDetailArray= setNewSerialNumber(sectionDetailArray);
    return sectionDetailArray;
}
function updateSectionBlock(ElemJsonObj, sectionDetailArray){
    sectionDetailArray[ElemJsonObj.index]=ElemJsonObj;
    return sectionDetailArray;
}


//functions for section's DOM Rendering of checklist

function generateDOMattributes(txt){
    const classMap= new Map() ;
    classMap.set("section",["sectionContainer",]);
    classMap.set("sn-index",["sectionItem", "itemSmall"]);
    classMap.set("name",["sectionItem", "itemMedium"]);
    classMap.set("inspectionSection",["sectionItem", "inspectionSubSection"]);
    classMap.set("fieldSubSection",["subSectionItem"]);
    classMap.set("inspectionContainer",["inspectionParam"]);
    classMap.set("inspectionName",[""]); //not used since textNode has to be used
    classMap.set("textInput",[""]);
    classMap.set("authorImg",["sectionImg"]);
    classMap.set("authorSection",["sectionItem", "itemMedium"]);
    classMap.set("numerical",[""]);
    classMap.set("yesNoSelector",[""]);
    classMap.set("classContainer", ["inspectionParam", "inspectionHelperSmall",]);
    classMap.set("specContainer",["inspectionParam", "inspectionHelper",]);
    classMap.set("multipleSelector",["multipleSelectorContainer",]);
    const DomMap = new Map();
    DomMap.set("section","div");
    DomMap.set("sn-index","div");
    DomMap.set("name","div");
    DomMap.set("inspectionSection","div");
    DomMap.set("fieldSubSection","div");
    DomMap.set("inspectionContainer","div");
    DomMap.set("inspectionName","div");//not used since textNode has to be used
    DomMap.set("textInput","input");
    DomMap.set("authorImg","img");
    DomMap.set("authorSection","div");
    DomMap.set("numerical","input");
    DomMap.set("yesNoSelector","select");
    DomMap.set("classContainer","div");
    DomMap.set("specContainer","div");
    DomMap.set("multipleSelector","div");
    return {
        classArray:classMap.get(txt),
        domTyp:DomMap.get(txt),
    };
}

async function generateSection(itemSection)
{
    const selfElem= produceElement("section");
    const index = parseInt(itemSection["index"]);
    selfElem.setAttribute("data-index", index);
    //add index fieldContainer
    selfElem.appendChild(
        generateFieldElement(
        {
            "typ":"sn-index",
            "indexValue":index+1, //array is 0-indexed, serial no. myst be 1-indexed
        }
        ));
    //add description index Element
    selfElem.appendChild(
        generateFieldElement(
            {
                "typ":"name",
                "descText":itemSection["descText"],
            }
        )
    )
    //add inspection field Element
    addFieldElementsToSection(selfElem,itemSection["childs"], index);
    selfElem.appendChild(statusElement());
    if(authMode.active){
        selfElem.appendChild(authorSegment(index));
    }
    return selfElem;
}

async function addFieldElementsToSection(sectionElem, fieldArray, index)
{   
    const selfElem=produceElement("inspectionSection");
    for(let i=0;i<fieldArray.length;i++){
        selfElem.appendChild(generateFieldElement(fieldArray[i]));
    }
    sectionElem.appendChild(selfElem);
}

function produceElement(text){
    if(text=="yesNoSelector"){
        const elemTemplateContainer = document.getElementById("Go-NoGo InspectionView");
        const elem = elemTemplateContainer.children[0].cloneNode(true);
        return elem; 
    }
    const{ classArray: className, domTyp:tag}=generateDOMattributes(text);
    const selfElem = document.createElement(tag);
    applyAttributes(selfElem,className);
    return selfElem;
}

function generateFieldElement(fieldTag){
    if (fieldTag["typ"]=="sn-index"){
        const selfElem= produceElement("sn-index");
        selfElem.innerHTML=fieldTag["indexValue"];
        return selfElem;
    }
    if(fieldTag["typ"]=="name"){
        const selfElem=produceElement("name");
        selfElem.innerHTML=fieldTag["descText"];
        return selfElem;
    }
    if(fieldTag["typ"]=="field"){
        const selfElem=generateInspectionElement(fieldTag);
        return selfElem;
    }
}

function generateInspectionClassification(classType){
    const elem=document.createElement("img");
    if(classType=='critical'){
        elem.src="/assets/img/icons/fullCircle.svg"
    }
    if(classType=="major"){
        elem.src="/assets/img/icons/halfCircle.svg";
    }
    if(classType=="minor"){
        elem.src="/assets/img/icons/emptyCircle.svg";
    }
    //elem.classList.add()
    return elem;
}

function generateInspectionElement(fieldTag){
    const selfElem= produceElement("fieldSubSection");
    const classContainer=produceElement("classContainer");
    const specificationContainer= produceElement("specContainer");
    classContainer.appendChild(generateInspectionClassification(fieldTag["inspectionClass"]));
    specificationContainer.appendChild(document.createTextNode(fieldTag["specDef"]));
    const inspectionContainer1= produceElement("inspectionContainer");
    const inspectionContainer2=produceElement("inspectionContainer");
    if(fieldTag["fieldType"]=="text"){
        const inspectionName=document.createTextNode(fieldTag["descText"]);
        const valueContainer=produceElement("textInput");
        inspectionContainer1.appendChild(inspectionName);
        inspectionContainer2.appendChild(valueContainer);
    }
    if(fieldTag["fieldType"]=="numerical"){
        const inspectionName=document.createTextNode(fieldTag["descText"]);
        const valueContainer=produceElement("numerical");
        valueContainer.setAttribute("type","number");
        valueContainer.setAttribute("min", fieldTag["minCheck"]);
        valueContainer.setAttribute("max", fieldTag["maxCheck"]);
        valueContainer.setAttribute("data-field-mean",fieldTag["meanValue"]);
        inspectionContainer1.appendChild(inspectionName);
        inspectionContainer2.appendChild(valueContainer);
    }
    if(fieldTag["fieldType"]=="yesNoSelector"){
        const inspectionName=document.createTextNode(fieldTag["descText"]);
        const valueContainer=produceElement("yesNoSelector");
        inspectionContainer1.appendChild(inspectionName);
        inspectionContainer2.appendChild(valueContainer);
    }
    if(fieldTag["fieldType"]=="multipleSelector"){
        const inspectionName=document.createTextNode(fieldTag["descText"]);
        const valueContainer=produceElement("multipleSelector");
        const elemTemplate= document.getElementById("multipleSelector View subElement").innerHTML.slice();
        const name =AlphaNumeric(10);
        fieldTag["multipleOptions"].forEach(tag => {
            let bufferHTML=elemTemplate.slice();
            bufferHTML=bufferHTML.replace("{$$%%LabelText%%$$}",tag);
            bufferHTML=bufferHTML.replace("{$$%%name%%$$}", name);
            valueContainer.insertAdjacentHTML("beforeend",bufferHTML);
        });
        valueContainer.setAttribute("onclick","modifyColor(event,this)");
        inspectionContainer1.appendChild(inspectionName);
        inspectionContainer2.appendChild(valueContainer);
    }
    if(fieldTag["fieldType"]=="incrementSelector"){
        const inspectionName=document.createTextNode(fieldTag["descText"]);
        const htmlTemplate=document.getElementById("incrementSelectorView").innerHTML.slice();
        let htmlResult=htmlTemplate.replace("moverVal=-1",`moverVal=${-parseFloat(fieldTag["addDecrement"])}`);
        htmlResult=htmlResult.replace("moverVal=1",`moverVal=${parseFloat(fieldTag["addIncrement"])}`);
        const valueContainer = htmlToElement(htmlResult);
        valueContainer.children[1].value= parseFloat(fieldTag["meanValue"]);//set the mean value;
        inspectionContainer1.appendChild(inspectionName);
        inspectionContainer2.appendChild(valueContainer);
    }
    if(fieldTag["fieldType"]=="pictureField"){
        const inspectionName=document.createTextNode(fieldTag["descText"]);
        const imgElem= document.createElement('img');
        imgElem.src=fieldTag['imageData'];
        imgElem.alt="Support Picture";
        imgElem.style="height:52px;width:52px; border: 2px outset black; cursor:pointer;";
        imgElem.setAttribute("onclick","displayPicOnModal(event,this)");
        const valueContainer=produceElement("textInput");
        inspectionContainer1.appendChild(inspectionName);
        inspectionContainer1.appendChild(imgElem);
        inspectionContainer2.appendChild(valueContainer);
    }
    if (fieldTag["fieldType"]=="externalSourceField"){
        const inspectionName=document.createTextNode(fieldTag["descText"]);
        const valueContainer=produceElement("textInput");
        inspectionContainer1.appendChild(inspectionName);
        inspectionContainer2.appendChild(valueContainer);
    }
    selfElem.appendChild(classContainer);
    selfElem.appendChild(specificationContainer);
    selfElem.appendChild(inspectionContainer1);
    selfElem.appendChild(inspectionContainer2);
    return selfElem;
}

function authorSegment(index){
    //const elem1 = createElement("authorImg","add.png",index);
    const elem1 = produceElement("authorImg");
    elem1.src="/assets/img/icons/remove.svg";
    elem1.setAttribute('index',index);
    elem1.setAttribute('onclick',"onClickDelete(this)");
    //const elem2 = createElement("authorImg","edit.png",index);
    const elem2 = produceElement("authorImg");
    elem2.src="/assets/img/icons/edit.png";
    elem2.setAttribute('index',index);
    elem2.setAttribute('onclick',"onClickEdit(this)");
    //const parentElem =createElement("authorSection","",index);
    const parentElem = produceElement("authorSection");
    parentElem.appendChild(elem1);
    parentElem.appendChild(elem2);
    return parentElem;
}

function statusElement(){
    let statHtml='<div class="sectionItem itemMedium"> Not Validated </div>';
    return htmlToElement(statHtml);
}
function sectionDividerElementAuthoring(index, htmlString)
{
    const htmlNode=htmlToElement(htmlString);
    htmlNode.setAttribute('index',index);
    return htmlNode;
}

async function generateFormAccessories(){
    const mainBox = document.getElementById("main");
    const authoringSwitchContainer = await authoringModeTemplateGeneratedElement();
    const authModeSwitch = authoringSwitchContainer.querySelector("#authoringModeSwitch");
    const checkFixedHeader = await checkListHeaderGeneratedElement();
    authModeSwitch.addEventListener("input", actionOnAuthModeSelection);
    mainBox.insertAdjacentElement('beforebegin', authoringSwitchContainer);
    mainBox.insertAdjacentElement('beforebegin', checkFixedHeader);
}
async function populateForm(recordArray, formElem){
    let formHeader= document.getElementById("sectionTableHeaderNone");
    let sectionDividerContainer = document.getElementById("sectionDividerTemplateContainerNone");
    if(authMode.active){
        formHeader= document.getElementById("sectionTableHeaderAuth");
        sectionDividerContainer = document.getElementById("sectionDividerTemplateContainerAuth");
    }
    formElem.innerHTML="";
    formElem.appendChild(htmlToElement(formHeader.innerHTML));
    for(let i=0; i<recordArray.length;i++)
    {
        if(provideTopFilterTruthy(recordArray[i].descText)){
            formElem.appendChild(await generateSection(recordArray[i]));
            formElem.appendChild(sectionDividerElementAuthoring(i,sectionDividerContainer.innerHTML));
        }  
    }
    if(provideTopFilterTruthy("Rework")){
        formElem.appendChild(await generateReworkSection());
    }
}

async function getCheckSheetJSONDataFromBackend(){
    await getCheckSheetData();
}

async function initiateChecklistPresenting(){
    operatorLogin();
    //generateFormAccessories();
    populateOptionInTopFilter();
    await getCheckSheetJSONDataFromBackend();
    populateForm(MasterArray,fieldContainerElement,);
}
initiateChecklistPresenting(); //entryPoint

//Field Configurator Handling: modal view
const modalHandler = document.getElementById("modal");
const fieldAddEventRadio = document.getElementById("fieldAddEventRadio");
const fieldNoEventRadio = document.getElementById("fieldNoEventRadio");
fieldAddEventRadio.addEventListener('input', addMoreElementsHandler);
fieldNoEventRadio.addEventListener('input', hideOptionsFieldSelectorContainer);
const optionFieldSelector= document.getElementById("optionFieldSelector");
optionFieldSelector.addEventListener('input', createContainerDOM,false);


function hideOptionsFieldSelectorContainer(event){
    const optionFieldSelectorContainer = document.getElementById("optionFieldSelectorContainer");
    if(event.target.checked){
        optionFieldSelectorContainer.classList.add("hideContainer"); 
    }
}

function addMoreElementsHandler(event){
    const optionFieldSelectorContainer = document.getElementById("optionFieldSelectorContainer");
    if(event.target.checked){
        optionFieldSelectorContainer.classList.remove("hideContainer");
    }
   
}

async function createContainerDOM(event){
    const requestBlock=document.getElementById("RequestBlock");
    const container = requestBlock.parentElement;
    const idName= event.target.value;
    if (idName!=="0")
    {
        const elem= document.getElementById(idName);
        let html = elem.innerHTML.slice();
        html = addNameFieldToRadioSet(html);
        const elemNode= htmlToElement(html);
        if(idName=="External Source Field"){
            const selectElem=elemNode.querySelector('select[name="sourceList"]');
            dataSourceRenderFunction(selectElem);
        }
        //container.insertAdjacentHTML("beforebegin", html);
        container.insertAdjacentElement("beforebegin",elemNode);
        event.target.value="0";
        fieldNoEventRadio.click();
        return;
    }
    return 
}

function addNameFieldToRadioSet(htmlString, length=9)
{
    const identifier1 = "$specLimitUpper$";
    const identifier2 = "$specLimitLower$";
    const identifier3 = "$$classificationCategory$$";
    const name1 = AlphaNumeric(length);
    const name2 = AlphaNumeric(length);
    htmlString= htmlString.replaceAll(identifier1,name1);
    htmlString= htmlString.replaceAll(identifier2,name2);
    htmlString =htmlString.replaceAll(identifier3,name1);
    return htmlString;
}

function checkValPresent(elemString, val){
    const vals=elemString.split(" ");
    return vals.includes(val);
}

function checkSelectionFromRadioSet(containerElem){
    const radioSet= containerElem.querySelectorAll('input[type="radio"]');
    for (i=0;i<radioSet.length;i++){
        if(radioSet[i].checked){
            return radioSet[i].getAttribute('data-field-tag');
        }
    }
}

function generateFieldTag(elem){
    const jsonTag={};
    if(elem.getAttribute("data-field-type")=="name"){
        jsonTag["typ"]="name";
        jsonTag["fieldType"]="";
        jsonTag["descText"]=getDepthvalue(elem.cloneNode(true),[],'input[data-field-input="answer"]');
    }
    if (elem.getAttribute("data-field-type")=="text"){
        jsonTag["typ"]="field";
        jsonTag["fieldType"]="text";
        jsonTag["descText"]=getDepthvalue(elem.cloneNode(true),[0],'input[data-field-input="answer"]');
        const tempNode = getDepthElem(elem,[],'div.characteristicClassification');
        jsonTag["inspectionClass"]=checkSelectionFromRadioSet(tempNode);
        jsonTag["specDef"]=getDepthvalue(elem.cloneNode(true),[1],'input[data-field-input="answer"]');
    }
    if (elem.getAttribute("data-field-type")=="numerical"){
        jsonTag["typ"]="field";
        jsonTag["fieldType"]="numerical";
        jsonTag["descText"]=getDepthvalue(elem.cloneNode(true),[0],'input[data-field-input="answer"]');
        //jsonTag["childs"]=[]; // not required anymore 
        jsonTag["meanValue"]=getDepthvalue(elem.cloneNode(true),[1],'input[data-field-input="answer"]');
        //check if USL is there? 
        if (getDepthvalue(elem.cloneNode(true),[2],'input[data-field-input="check"]')){
            jsonTag["maxCheck"]=getDepthvalue(elem.cloneNode(true),[2],'input[data-field-input="answer"]');
        }else{
            jsonTag["maxCheck"]=null;
        }
        //check if LSL is there? 
        if (getDepthvalue(elem.cloneNode(true),[3],'input[data-field-input="check"]')){
            jsonTag["minCheck"]=getDepthvalue(elem.cloneNode(true),[3],'input[data-field-input="answer"]');
        }else{
            jsonTag["minCheck"]=null;
        }
        const tempNode = getDepthElem(elem,[],'div.characteristicClassification');
        jsonTag["inspectionClass"]=checkSelectionFromRadioSet(tempNode);
        jsonTag["specDef"]=getDepthvalue(elem.cloneNode(true),[4],'input[data-field-input="answer"]');
    }
    if(elem.getAttribute("data-field-type")=="yesNoSelector"){
        jsonTag["typ"]="field",
        jsonTag["fieldType"]="yesNoSelector",
        jsonTag["descText"]=getDepthvalue(elem.cloneNode(true),[],'input[data-field-input="answer"]');
        const tempNode = getDepthElem(elem,[],'div.characteristicClassification');
        jsonTag["inspectionClass"]=checkSelectionFromRadioSet(tempNode);
        jsonTag["specDef"]=getDepthvalue(elem.cloneNode(true),[1],'input[data-field-input="answer"]');
    }
    if(elem.getAttribute("data-field-type")=="multipleSelector"){
        jsonTag["typ"]="field",
        jsonTag["fieldType"]="multipleSelector",
        jsonTag["descText"] =getDepthvalue(elem.cloneNode(true),[],'input[data-field-input="answer"]');
        const tempNode = getDepthElem(elem,[],'div.characteristicClassification');
        jsonTag["inspectionClass"]=checkSelectionFromRadioSet(tempNode);
        jsonTag["specDef"]=getDepthvalue(elem.cloneNode(true),[2],'input[data-field-input="answer"]');
        const temp2Node= getDepthElem(elem.cloneNode(true),[1],null);
        const inputCollection=temp2Node.querySelectorAll('input[data-field-input="answer"]');
        const multipleOptions = []
        for (i=0;i<inputCollection.length;i++){
            multipleOptions.push(inputCollection[i].value); 
        }
        multipleOptions.pop(); // last element is from the hiddenContainer template element
        jsonTag["multipleOptions"]=multipleOptions;
    }
    if(elem.getAttribute("data-field-type")=="incrementSelector"){
        jsonTag["typ"]="field",
        jsonTag["fieldType"]="incrementSelector",
        jsonTag["descText"] =getDepthvalue(elem.cloneNode(true),[0],'input[data-field-input="answer"]');
        const tempNode = getDepthElem(elem,[],'div.characteristicClassification');
        jsonTag["inspectionClass"]=checkSelectionFromRadioSet(tempNode);
        jsonTag["specDef"]=getDepthvalue(elem.cloneNode(true),[2],'input[data-field-input="answer"]');
        const incrementContainer = getDepthElem(elem.cloneNode(true),[1],null);
        const collectionValue=incrementContainer.querySelectorAll('input[data-field-input="answer"]');
        jsonTag["meanValue"]=parseFloat(collectionValue[0].value);
        jsonTag["addIncrement"]=parseFloat(collectionValue[1].value);
        jsonTag["addDecrement"]=parseFloat(collectionValue[2].value);
    }
    if(elem.getAttribute("data-field-type")=="pictureField"){
        jsonTag["typ"]="field",
        jsonTag["fieldType"]="pictureField",
        jsonTag["descText"]= getDepthvalue(elem.cloneNode(true),[0],'input[data-field-input="answer"]');
        const tempNode = getDepthElem(elem,[],'div.characteristicClassification');
        jsonTag["inspectionClass"]=checkSelectionFromRadioSet(tempNode);
        jsonTag["specDef"]=getDepthvalue(elem.cloneNode(true),[2],'input[data-field-input="answer"]');
        const imageContainer = getDepthElem(elem,[1],null);
        jsonTag["imageData"]=imageContainer.getAttribute("data-field-image-data");
    }
    if(elem.getAttribute("data-field-type")=="externalSourceField"){
        jsonTag["typ"]="field",
        jsonTag["fieldType"]="externalSourceField",
        jsonTag["descText"]=getDepthvalue(elem.cloneNode(true),[0],'input[data-field-input="answer"]');
        const tempNode = getDepthElem(elem,[],'div.characteristicClassification');
        jsonTag["inspectionClass"]=checkSelectionFromRadioSet(tempNode);
        jsonTag["specDef"]=getDepthvalue(elem.cloneNode(true),[2],'input[data-field-input="answer"]');
        const sourceSelector=elem.querySelector('select[name="sourceList"]');
        const sourceFieldSelector=elem.querySelector('select[name="sourceFieldList"]');
        jsonTag["dataSource"]=sourceSelector.options[sourceSelector.options.selectedIndex].value;
        jsonTag["sourceField"]=sourceFieldSelector.options[sourceFieldSelector.options.selectedIndex].value;
    }
    return jsonTag;   
}

function getDepthvalue(elem, depths, type){
    let parentElem=elem;
    for (let i=0;i<depths.length;i++){    
        const childElem=getChildElemAtDepth(parentElem,depths[i]);
        parentElem=childElem;
    }
    //ref:https://javascript.info/searching-elements-dom#getelementsby
   const inputElement=parentElem.querySelector(type);
   if (inputElement.type=="radio"){
    if (inputElement.checked){
        return true;
    }
    return false;
   }
   return inputElement.value;
}

function getDepthElem(elem, depths, type){
    let parentElem=elem;
    for (let i=0;i<depths.length;i++){    
        const childElem=getChildElemAtDepth(parentElem,depths[i]);
        parentElem=childElem;
    }
    //ref:https://javascript.info/searching-elements-dom#getelementsby
   if(type!=null){
    const inputElement=parentElem.querySelector(type);
    return inputElement;
   }
   return parentElem;
}

function setDepthvalue(elem, depths, type, value){
    let parentElem=elem;
    for (let i=0;i<depths.length;i++){    
        const childElem=getChildElemAtDepth(parentElem,depths[i]);
        parentElem=childElem;
    }
    //ref:https://javascript.info/searching-elements-dom#getelementsby
   const inputElement=parentElem.querySelector(type);
   if (inputElement.type=="radio")
   {
    inputElement.checked=true;
    return true;
   }
   inputElement.value=value;
   return true;
}

function getChildElemAtDepth(parentElem,depth) {
    return parentElem.children[depth];
}

function elemTypToIdName(typ){
    if(typ=="text")
    {
        return "Text field";
    }
    if(typ=="numerical")
    {
        return "Numerical Field";
    }
    if(typ=="yesNoSelector"){
        return "Go-NoGo Field";
    }
    if(typ=="multipleSelector"){
        return "Multiple Selector";
    }
    if(typ=="incrementSelector"){
        return "Increment Selector";
    }
    if(typ=="pictureField"){
        return "Picture Field";
    }
    if (typ=="externalSourceField"){
        return "External Source Field";
    }
}

function generateModalEditElementDom(JsonObj){
    const typ = JsonObj["fieldType"];
    const idName = elemTypToIdName(typ); // see improvement can this automated to collect the names 
    const elem= document.getElementById(idName);
    let html = elem.innerHTML.slice();
    html = addNameFieldToRadioSet(html);
    const resultElem = htmlToElement(html);
    fillValuesToPopulatedElementDom(resultElem,JsonObj);
    return resultElem;
}

async function fillValuesToPopulatedElementDom(elem,JsonObj)
{
    if(JsonObj["fieldType"]=="text"){
        setDepthvalue(elem,[0],'input[data-field-input="answer"]',JsonObj["descText"]);
        setDepthvalue(elem,[1],'input[data-field-input="answer"]',JsonObj["specDef"]);
        setDepthvalue(elem,[2],`input[data-field-tag="${JsonObj['inspectionClass']}"]`,true);
        return elem;
    }
    if (JsonObj["fieldType"]=="numerical"){
        setDepthvalue(elem,[0],'input[data-field-input="answer"]',JsonObj["descText"]);
        setDepthvalue(elem,[1],'input[data-field-input="answer"]',JsonObj["meanValue"]);
        if ( //usl setting
            getDepthvalue(elem,[2],'input[data-field-input="check"]')!=null)
            {
                setDepthvalue(elem,[2],'input[data-field-input="check"]', true);
                setDepthvalue(elem,[2],'input[data-field-input="answer"]',JsonObj["maxCheck"]);  
            }
        if ( //lsl setting
            getDepthvalue(elem,[3],'input[data-field-input="check"]')!=null)
            {
                setDepthvalue(elem,[3],'input[data-field-input="check"]', true);
                setDepthvalue(elem,[3],'input[data-field-input="answer"]',JsonObj["minCheck"]);  
            }
        setDepthvalue(elem,[4],'input[data-field-input="answer"]',JsonObj["specDef"]);
        setDepthvalue(elem,[5],`input[data-field-tag="${JsonObj['inspectionClass']}"]`,true);
        return elem;
    }
    if(JsonObj["fieldType"]=="yesNoSelector"){
        setDepthvalue(elem,[],'input[data-field-input="answer"]',JsonObj["descText"]);
        setDepthvalue(elem,[1],'input[data-field-input="answer"]',JsonObj["specDef"]);
        setDepthvalue(elem,[2],`input[data-field-tag="${JsonObj['inspectionClass']}"]`,true);
        return elem;
    }
    if (JsonObj["fieldType"]=="multipleSelector"){
        setDepthvalue(elem,[0],'input[data-field-input="answer"]',JsonObj["descText"]);
        const inputElemContainer= getDepthElem(elem,[1],null);
        const tempElem =inputElemContainer.querySelector("div.InputBox");
        const markElem= inputElemContainer.querySelector("div.hideContainer");
        const templateHtml=tempElem.outerHTML.slice();
        inputElemContainer.removeChild(tempElem);
        JsonObj["multipleOptions"].forEach((tag,index) => {
            const childNode= htmlToElement(templateHtml);
            childNode.children[0].innerText=index+1; //setting the label value
            setDepthvalue(childNode,[],'input[data-field-input="answer"]',tag);
            markElem.insertAdjacentElement('beforebegin',childNode);
        });
        setDepthvalue(elem,[2],'input[data-field-input="answer"]',JsonObj["specDef"]);
        setDepthvalue(elem,[3],`input[data-field-tag="${JsonObj['inspectionClass']}"]`,true);
    }
    if(JsonObj["fieldType"]=="incrementSelector"){
        setDepthvalue(elem,[0],'input[data-field-input="answer"]',JsonObj["descText"]);
        setDepthvalue(elem,[2],'input[data-field-input="answer"]',JsonObj["specDef"]);
        setDepthvalue(elem,[3],`input[data-field-tag="${JsonObj['inspectionClass']}"]`,true);
        const inputContainer=getDepthElem(elem,[1],null);
        inputContainer.children[1].value=JsonObj["meanValue"];
        inputContainer.children[3].value=JsonObj["addIncrement"];
        inputContainer.children[5].value=JsonObj["addDecrement"]; 
    }
    if(JsonObj["fieldType"]=="pictureField"){
        setDepthvalue(elem,[0],'input[data-field-input="answer"]',JsonObj["descText"]);
        setDepthvalue(elem,[2],'input[data-field-input="answer"]',JsonObj["specDef"]);
        setDepthvalue(elem,[3],`input[data-field-tag="${JsonObj['inspectionClass']}"]`,true);
        const pictureContainer= getDepthElem(elem,[1],null);
        pictureContainer.setAttribute("data-field-image-data",JsonObj["imageData"]);
    }
    if(JsonObj["fieldType"]=="externalSourceField"){
        setDepthvalue(elem,[0],'input[data-field-input="answer"]',JsonObj["descText"]);
        setDepthvalue(elem,[2],'input[data-field-input="answer"]',JsonObj["specDef"]);
        setDepthvalue(elem,[3],`input[data-field-tag="${JsonObj['inspectionClass']}"]`,true);
        const sourceSelector= elem.querySelector('select[name="sourceList"]');
        await dataSourceRenderFunction(sourceSelector);
        await setOptionToSelectElement(sourceSelector,JsonObj["dataSource"]);
        sourceSelector.onchange=fieldRenderFunction;
        await sourceSelector.onchange(); // to get the sourceFieldElement activated;
        const sourceFieldSelector = elem.querySelector('select[name="sourceFieldList"]');
        setOptionToSelectElement(sourceFieldSelector,JsonObj["sourceField"]);
    }
    return elem;
}

function deleteSelf(event, elem){
    const buttonContainer= elem.parentElement;
    const modalSection= buttonContainer.parentElement;
    const modal = modalSection.parentElement;
    modal.removeChild(modalSection);
    return true;
}

async function addOneMoreOption(event, elemButton){
   const inputBox = elemButton.parentElement;
   const inputBoxContainer= inputBox.parentElement;
   //retrieve the current index & prepare index for new element
   const labelElem= inputBox.querySelector("label");
   const labelNum= parseInt(labelElem.innerHTML)+1;
   //create new option elem
   const newElem= inputBoxContainer.querySelector("div.hideContainer").cloneNode(true);
   newElem.querySelector("label").innerHTML=labelNum;
   newElem.classList.add("InputBox");
   newElem.classList.remove("hideContainer");
   //insert new element besides the clicked element
   inputBox.insertAdjacentElement("afterend",newElem);
   return true;
}

async function deleteSelfOption(event, elemButton){
    const inputBox = elemButton.parentElement;
   const inputBoxContainer= inputBox.parentElement;
   inputBoxContainer.removeChild(inputBox);
   return true;
}

//saving modal- checksheet connection function

function productJsonObjFromModalContent(elem){
    const _parentSection=elem.parentElement;
    const mainModal=_parentSection.parentElement;
    const mode = mainModal.getAttribute("data-mode");
    const collection = mainModal.children;
    const result = {};
    result["childs"]=temp=[];
    for (let i=0;i<collection.length;i++){
        const valString=collection[i].getAttribute("data-kind");
        if(checkValPresent(valString,"field")){
            const field = generateFieldTag(collection[i]);
            temp.push(field);
        }
        if (checkValPresent(valString,"desc")){
            result["descText"]=getDepthvalue(collection[i].cloneNode(true),[],'input[data-field-input="answer"]');
        }
    }
    result["typ"]="section";
    result["index"]=mainModal.getAttribute("data-index");
    result["fieldType"]="";
    //console.log(JSON.stringify(result));
    return [result,mode];

}

async function cleanModalContent(elemModal){
    const collection = elemModal.children;
    elemModal.setAttribute("data-index",null);
    const descriptionNode = elemModal.querySelector('div[data-kind*="desc"]');
    setDepthvalue(descriptionNode,[],'input[data-field-input="answer"]',"");
    descriptionNode.value="";
    //ref : https://stackoverflow.com/a/56328426
    //ref : https://stackoverflow.com/questions/6795034/remove-multiple-children-from-parent
    const selectedChildCollection= elemModal.querySelectorAll('div[data-kind*="relative"]');
    for (child of selectedChildCollection){
        elemModal.removeChild(child);
    }
    return true;
}

async function generateModalForEdit(JsonObj, modalTempParent){
    const modal=modalTempParent.children[0];
    modal.setAttribute("data-index",parseInt(JsonObj["index"]));
    modal.setAttribute("data-mode","edit");
    setDepthvalue(modal,[2],'input[data-field-input="answer"]',JsonObj["descText"]);
    let endElementIndex=2;
    const JsonTagCollection= JsonObj["childs"];
    for(let i=0; i<JsonTagCollection.length;i++)
    {
        const htmlNode = generateModalEditElementDom(JsonTagCollection[i]);
        //modal.children[endElementIndex].insertAdjacentHTML("afterend",html);
        modal.children[endElementIndex].insertAdjacentElement("afterend",htmlNode);
        endElementIndex+=1;
    }
    modalContainer.appendChild(modal);
    modalContainer.style.display="flex";
    return true;
}

function saveModalContent(elem){
    const [resultObj,mode] = productJsonObjFromModalContent(elem);
    if (mode=="copy"){
        exampleArray=AddSectionBlock(resultObj,MasterArray);    
    }
    if(mode=="edit"){
        exampleArray=updateSectionBlock(resultObj,MasterArray);
    }
    populateForm(exampleArray,fieldContainerElement,);
    closeModalFunction();
}

closeModalButton.onclick=closeModalFunction;

async function closeModalFunction(){
    modalContainer.style.display="none";
    const modalTempElem = document.getElementById("modalStartContent");
    cleanModalContent(modalContainer.children[0]);
    modalTempElem.appendChild(modalContainer.children[0]);
}

async function closePicModalFunction(){
    modalContainer.style.display="none";
    modalContainer.innerHTML="";
}

async function doSomething (event, elem,){
    console.log(elem);
    console.log(event);
    console.log(this);
    
}

async function modifyColor(event,elem){
    const collection = elem.children;
    for (i=0;i<collection.length;i++){
        if(collection[i].children[0].checked){
            collection[i].classList.add("multipleSelectorLabelSelected");
            continue;
        }
        collection[i].classList.remove("multipleSelectorLabelSelected");
    }
}

async function storeUploadFile(event, elem){
    const parentElem= elem.parentElement;
    //attribute=>data-field-image-data=""
    var reader = new FileReader();
    reader.readAsDataURL(elem.files[0]);
    reader.onload= function(){
        parentElem.setAttribute("data-field-image-data", reader.result);
    }
    reader.onerror=function(error){
        confirm("Following Error : ", error);
    };
}

async function incrementDecrement(event, elem, moverVal=1){
    const inputElem = elem.parentNode.querySelector('input[type=number]');
    inputElem.value=parseFloat(inputElem.value)+moverVal;
    return true;
}

async function dataSourceRenderFunction(selectElem){
    const dataFields = await getExternalSourceFields();
    const sourceCollection=dataFields.map(sources=>sources.sourceName);
    selectElem.innerHTML=""; //remove existing options;
    const startOption=document.createElement('option');
    startOption.value='0'; // zeroth option
    startOption.innerText="Choose DataSource";
    selectElem.appendChild(startOption);
    sourceCollection.forEach(sourceName=>{
        const optionElement = document.createElement("option");
        optionElement.value=sourceName;
        optionElement.innerText=sourceName;
        selectElem.appendChild(optionElement);
    })
    return true;
}
async function fieldRenderFunction(event, elem){
    if(elem==undefined){
        elem=this; // for edit workflow, this is the only way to get handle of source selector
    }
    const chosenIndex = elem.options[elem.options.selectedIndex].value;
    const dataFields = await getExternalSourceFields();
    const result=dataFields.filter((sourceBlocks=>sourceBlocks.sourceName==chosenIndex));
    const selectElement= elem.parentElement.querySelector('select[name="sourceFieldList"]');
    if(result.length>0)
    {
        selectElement.innerHTML="";//remove existing options
        const startOption=document.createElement('option');
        startOption.value='0'; // zeroth option
        startOption.innerText="Choose Field";
        selectElement.appendChild(startOption);
        const sourceSelected=result[0];
        //add new option elements
        for(i=0; i<sourceSelected.fields.length;i++){
            const optionElement = document.createElement("option");
            optionElement.value=sourceSelected.fields[i].fieldName;
            optionElement.innerText=sourceSelected.fields[i].fieldName;
            selectElement.appendChild(optionElement);
        }
        selectElement.classList.remove('hideContainer');
        selectElement.children[0].selected=true;
        return true
    }
    selectElement.children[0].selected=true;
    selectElement.classList.add('hideContainer');
}


/*
fieldJson={
    'typ':"field",
    "fieldType":"numerical",
    "descText":"",
    childs:[]
}
*/

async function generateReworkSection() {
    const sectionBase = await reworkSectionConfiguratorBaseTemplate();
    const fieldset = sectionBase.querySelector('fieldset');
    populateRework(ReworkArray,fieldset);
    return sectionBase;
}
async function reworkSectionConfiguratorBaseTemplate(){
    const htmlString= 
    `
    <div class="reworkContainer">
        <fieldset>
            <legend>Rework Section</legend>
            <label for="reworkQuestion" onclick="OnCheckRework(event,this);">
                <span>Want to add details about rework ?</span>
                <input type="radio" name="reworkOption" value="1" "><label>Yes</label>
                <input type=radio name="reworkOption" value="0" checked><label>No</label>
            </label>
        </fieldset>
    </div>
    `;
    return htmlToElement(htmlString);
}

async function doSomething(event,elem){
    console.log(event.target.value,elem);
}
async function OnCheckRework(event, elem){
    const element = event.target;
    const parentElem=element.parentElement;
    const fieldset=parentElem.parentElement;
    const childrenCollection = fieldset.children;
    for (i=childrenCollection.length-1;i>1;i--){ // i>1 for legend & label to be spared from deletion 
        fieldset.removeChild(childrenCollection[i]);
    }
    if (element.value=="1"){
        fieldset.appendChild(await populateStations());
    }
    //
}
async function populateStations(){
    const htmlString=`
        <div class="reworkBaseIdentifier">
            <label for="stationSelector">
                select applicable station's Rework
            </label>
            <select name="stationSelector">
            </select>
            <br/>
        </div>
    `;
    const result = htmlToElement(htmlString);
    const selectorElem =result.querySelector('select[name=stationSelector]');
    const nameArray=MasterArray.map(obj=>obj.descText);
    createOptionElements(selectorElem, nameArray, nullDefinition='select station');
    selectorElem.setAttribute('onchange','onSelectStation(event,this);');
    return result; 
}
async function createOptionElements(selectorElem, optionItemArray, nullDefinition="select Option"){
    const nullOption = document.createElement('option');
    nullOption.value=0;
    nullOption.innerText = nullDefinition;
    selectorElem.appendChild(nullOption);
    optionItemArray.forEach((item,index)=>{
        const option = document.createElement('option');
        option.value=item;
        option.innerText=item;
        selectorElem.appendChild(option);
    });
    return selectorElem;
}
async function onSelectStation(event, elem){
    const reworkBaseIdentifier = elem.parentElement;
    const fieldset = reworkBaseIdentifier.parentElement;
    const childrenCollection=reworkBaseIdentifier.children;
    for (i=childrenCollection.length-1;i>2;i--){ // i>2 for label selector br element spared from deletion 
        reworkBaseIdentifier.removeChild(childrenCollection[i]);
    }
    if(elem.value!="0"){
        constructFieldSelector(reworkBaseIdentifier,elem.value);
    }
}
async function constructFieldSelector(parentElem,selectedStation){
    parentElem.appendChild(
        htmlToElement(
            `
            <label for="stationFieldSelector">
                select applicable Field in Rework
            </label>
            `
        )
    );
    const htmlString=`
    <select name="stationFieldSelector">
    </select>
    `;
    const result = htmlToElement(htmlString);
    const filteredArray=MasterArray.filter(section=>section.descText==selectedStation);
    const selectedStationContent = filteredArray[0];
    const optionArray = selectedStationContent.childs.map(child=>child.descText);
    createOptionElements(result,optionArray,"select applicable field");
    parentElem.appendChild(result);
    result.setAttribute("onchange","createDOMReworkInput(event, this);")
    return result;
}

async function createDOMReworkInput(event, elem){
    const reworkReasons = [
        'Part Replacement', 'Torquing Correction', 'Detailed Rework', 'Others' 
    ];
    const index=Array.prototype.indexOf.call(elem.parentElement.children, elem);
    const reworkBaseIdentifier = elem.parentElement;
    for(i=reworkBaseIdentifier.children.length-1; i>index;i--){
        reworkBaseIdentifier.removeChild(reworkBaseIdentifier.children[i]);
    }
    if (elem.value!="0" && elem.value!=undefined){
        const htmlString = `
            <div>   
                <label> select the rework type</label>
                <select name="reworkReason" onchange="displayReworkInputs(event,this);"> </select>
            </div>
            <div class="hideContainer" id="reworkInputs">
                <label for="replaceSpec">Provide change in final specification </label>
                <input type="text" name="replaceSpec" placeholder="Change detail"> <br/>
                <label for="reworkRemark"> Rework Remarks </label><br/>
                <textarea  name="reworkRemark" rows="5" cols="25" >Description & Remarks of rework content</textarea>
            </div>
            <div class="hideContainer" id="saveButton">
                <button onclick="pushReworkOnSave(event,this);"> Save Rework Details</button>
            </div>
        `;
        const reworkElemCollection= Array.prototype.slice.call(htmlToMultiElement(htmlString));
        for(j=0;j<reworkElemCollection.length;j++){
            reworkBaseIdentifier.insertAdjacentElement("beforeend", reworkElemCollection[j]); 
        }
        const selectorElem = reworkBaseIdentifier.querySelector('select[name="reworkReason"]');
        createOptionElements(selectorElem, reworkReasons, nullDefinition="select Rework Type");
        return true;
    }
    return false;
}

async function displayReworkInputs(event,elem){
    const reworkBaseIdentifier= elem.parentElement.parentElement;
    const reworkInputElem=reworkBaseIdentifier.querySelector('div#reworkInputs');
    const buttonContainer = reworkBaseIdentifier.querySelector('div#saveButton')
    if(elem.value!="0"){
        reworkInputElem.classList.remove("hideContainer");
        buttonContainer.classList.remove('hideContainer');
        return true;
    }
    reworkInputElem.classList.add('hideContainer');
    buttonContainer.classList.add('hideContainer');
    return false;
}

async function pushReworkOnSave(event,elem){
    const fieldSet=elem.parentElement.parentElement.parentElement;
    const inputElem=fieldSet.querySelector('input[type="radio"][name="reworkOption"][value="0"]');
    const newSpecInput = fieldSet.querySelector('input[name="replaceSpec"][type="text"]').value;
    const reworkRemarks = fieldSet.querySelector('textarea[name="reworkRemark"]').value;
    const stationName = fieldSet.querySelector('select[name="stationSelector"]').value;
    const stationFieldName = fieldSet.querySelector('select[name="stationFieldSelector"]').value;  
    const sectionArray=MasterArray.filter(section=>section.descText==stationName)
                                  .filter(section=>{
                                    const result = section.childs.filter(child=>child.descText==stationFieldName);
                                    if(result.length>0){
                                        return true;
                                    }
                                    return false;
                                  }); //get only applicable section with the appropriate child
    const selectedFieldArray=sectionArray[0].childs.filter(child=>child.descText==stationFieldName); //get only applicable field;
    const newSection= JSON.parse(JSON.stringify(sectionArray[0]));
    newSection.childs=JSON.parse(JSON.stringify(selectedFieldArray));
    newSection.childs[0].reworkRemarks=reworkRemarks;
    newSection.childs[0].value=newSpecInput;
    ReworkArray.push(newSection);
    populateForm(MasterArray,fieldContainerElement,);
    inputElem.click();
}

async function populateRework(recordArray, formElem){
    let resultElem = htmlToElement('<div class="reWorkFieldContainerBox" id="reworkUpdates"></div>');
    let formHeader = document.getElementById("sectionTableHeaderNone");
    let sectionDividerContainer = document.getElementById("sectionDividerTemplateContainerNone");
    resultElem.appendChild(htmlToElement(formHeader.innerHTML));
    for(let i=0; i<recordArray.length; i++)
    {
        resultElem.appendChild(await generateSection(recordArray[i]));
        resultElem.appendChild(sectionDividerElementAuthoring(i,sectionDividerContainer.innerHTML));
    }
    formElem.insertAdjacentElement('afterend',resultElem);
    return resultElem;
}

async function authoringModeTemplateGeneratedElement(){
    const htmlString=`
    <div class="authoringCheckContainer">
        <fieldset>
            <legend>Authoring Mode</legend>
            <div class="toggleSwitchContainer">
                <label class="switch">
                    <input type="checkbox" id="authoringModeSwitch">
                    <span class="slider round"></span>
                </label>
            </div>
        </fieldset>
    </div>
    `;
    return htmlToElement(htmlString);
}
async function checkListHeaderGeneratedElement(){
    const htmlString=`
    <div class="checkListHeader">
        <div class="headerRow">
            <div class="headerRowItem">
                <label for="ESN">Engine Serial Number</label>
                <input class="headerInput" type="text" placeholder="ESN Details">
            </div>
            <div class="headerRowItem">
                <label for="ESN">Model Number</label>
                <input class="headerInput"  type="text" placeholder="Model Number">
            </div>
        </div>
        <div class="headerRow">
            <div class="headerRowItem">
                <label for="order">Shop Order</label>
                <input class="headerInput"  type="text" placeholder="order Number">
            </div>
            <div class="headerRowItem">
                <label for="date">Date of Acceptance</label>
                <input class="headerInput"  type="text" placeholder="Date Entry">
            </div>
        </div>
    </div>
    `;
    return htmlToElement(htmlString);
}

//communication with the backend
async function getCheckSheetData(){
    const checkSheetDetail={
        status:"QSK60",
        shortDesc:"QSK60Total",
    };
    const {status, data}= await postJsonData("/GetCheckSheetData" , checkSheetDetail,);
    if(status==200){
        MasterArray=responseToJson(data);
    }
}
async function saveAuthoredCheckSheetWithBackend(){
    const checkSheetJSONTemplate={
        checkSheetDetail:{
            status:"QSK60",
            shortDesc:"QSK60Total",
        },
        JsonString:JSON.stringify(MasterArray),
    }
    const {status, data}= await postJsonData("/saveAuthorCheckSheet" , checkSheetJSONTemplate,);

    console.log(status, "checksheetSave");
}

//operator login functions: 
async function operatorLogin(){
    const key = "operatorWWID";
    const operatorLogged=getKeyValueFromStorage(key);
    if(!operatorLogged)
    {
        const modalContentTemplate = document.getElementById("modal_template");
        modalContainer.innerHTML=modalContentTemplate.innerHTML;
        modalContainer.style.display='flex';
    }
}
async function activateCheckSheetOption(event,modelSelectElem){
    const modelSelectorContainer = modelSelectElem.parentElement;
    const checkSheetSelector= modelSelectorContainer.querySelector('select[name=checkSheetSelection]');
    const CHECKSHEETARRAY = ['Sample-1', "Sample-2"]; 
    if(modelSelectElem.value!="0")
    {      
        checkSheetSelector.innerHTML="";
        const initialOption = htmlToElement(`<option value="0" selected> Choose CheckSheet</option>`);
        checkSheetSelector.appendChild(initialOption);
        CHECKSHEETARRAY.forEach(sheetName=>{
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

async function operatorLoginDetails(event,buttonElem){
    storeInLocalStorage("operatorWWID","temp-operator");
    modalContainer.style.display='none';  
}