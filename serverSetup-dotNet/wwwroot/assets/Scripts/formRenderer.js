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
async function populateOptionInTopFilter(defaultFilter="All"){
    const selectElem= document.getElementById("operationSelector");
    selectElem.innerHTML='';
    const operationArray = MasterArray.map(section=>section.descText);
    operationArray.push("All"); // for all elements
    operationArray.push("All & Rework");
    operationArray.push("Rework");
    createOptionElements(selectElem,operationArray,"Select Operation");
    selectElem.value=defaultFilter ? defaultFilter : "All" ;
    selectElem.onchange=()=>{
        populateForm(MasterArray,fieldContainerElement,);
    }
} 

function provideTopFilterTruthy(key){
    const selectElem= document.getElementById("operationSelector");
    if(selectElem.value=="0"){
        return false;
    }
    if(key==selectElem.value){
        return true;
    }
    if(key=="$#header$#"){
        if(selectElem.value=="Rework"){
            return false;
        }
        return true;
    }
    /* //currently it is not required
    if(key=="$#ReworkHeader$#"){
        if(selectElem.value=="Rework" || selectElem.value=="All & Rework"){
            return true;
        }
        return false;
    }
    */
    if(selectElem.value=='All' && key!="Rework"){
        return true;
    }
    if(selectElem.value=="All & Rework"){
        return true;
    }
    return false;
}

//functions on the checklist
async function onClickNewAdd(elem){ //function to intiate new section and rasining new modal
    //console.log(elem.getAttribute("index"));
    const modalTempElem = document.getElementById("modalStartContent");
    modalTempElem.children[0].setAttribute("data-index",parseInt(elem.getAttribute("index"))+1);
    modalTempElem.children[0].setAttribute("data-uid",uuidv4()); // providing new uuid to new section;
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
    classMap.set("textInput",["inputField"]);
    classMap.set("authorImg",["sectionImg"]);
    classMap.set("authorSection",["sectionItem", "itemMedium"]);
    classMap.set("numerical",["inputField"]);
    classMap.set("yesNoSelector",[""]);
    classMap.set("classContainer", ["inspectionParam", "inspectionHelperSmall","statusElement"]);
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

async function generateSection(itemSection, typeSection="normal")
{
    const selfElem= produceElement("section");
    selfElem.setAttribute("data-type-section",typeSection);
    const index = parseInt(itemSection["index"]);
    selfElem.setAttribute("data-index", index); 
    selfElem.setAttribute("data-uid", itemSection["uid"]);
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
                "dataTagIndicator":"station",
            }
        )
    )
    //add inspection field Element
    addFieldElementsToSection(selfElem,itemSection["childs"], index);
    addStatusElement(selfElem,itemSection["childs"],typeSection);
    //selfElem.appendChild(statusElement());
    if(authMode.active){
        selfElem.appendChild(authorSegment(index));
    }
    selfElem.addEventListener('evaluation',function(e,elem=this){
        evaluationReceiver(e,elem);
    });
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
        if(fieldTag["dataTagIndicator"]=="station") {
            selfElem.setAttribute("data-detail-name","station");    
        }
        return selfElem;
    }
    if(fieldTag["typ"]=="field"){
        const selfElem=generateInspectionElement(fieldTag);
        return selfElem;
    }
}

function generateInspectionClassification(classType){
    const elem=document.createElement("img");
    elem.classList.add("chrClass");
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

function valueContainerDataTagAdd(valueContainer, fieldType){
    valueContainer.setAttribute("data-detail-input",null);
    valueContainer.setAttribute('data-detail-inputtype',fieldType);
    assignDataUpdateFunction(valueContainer, fieldType);
    return valueContainer;
}

function prepareParameterElement(inspectionContainer, fieldTag){
    inspectionContainer.setAttribute("data-detail-name","operation");
    inspectionContainer.setAttribute("data-uid",fieldTag["uid"]);
    return inspectionContainer;
}

async function assignDataUpdateFunction(valueContainer,fieldType){
    if(valueContainer.type=="text" || 
        valueContainer.type=="number" || 
        valueContainer.type=="select-multiple" )
        {
            valueContainer.setAttribute('oninput', "setInputUpdateOnParentDataTag(event,this);");
        }
    if (valueContainer.type== "multipleSelector"){
        valueContainer.setAttribute('oninput',"evaluateElemWithDispatchStatus(event,this);");
    }
    return valueContainer;
} 

async function setInputUpdateOnParentDataTag(event, elem){
    elem.setAttribute("data-detail-input",elem.value);
    await evaluateElemForStatus(elem);
    dispatchEvaluationOnInspectionValue(event, elem);
    return ;
}

async function evaluateElemWithDispatchStatus(event, elem){
    await evaluateElemForStatus(elem);
    dispatchEvaluationOnInspectionValue(event, elem);
    return ;
}

function generateInspectionElement(fieldTag){
    const selfElem= produceElement("fieldSubSection");
    const classContainer=produceElement("classContainer");
    const specificationContainer= produceElement("specContainer");
    classContainer.appendChild(generateInspectionClassification(fieldTag["inspectionClass"]));
    specificationContainer.appendChild(document.createTextNode(fieldTag["specDef"]));
    const inspectionContainer1= produceElement("inspectionContainer");
    prepareParameterElement(inspectionContainer1,fieldTag);
    const inspectionContainer2=produceElement("inspectionContainer");
    if(fieldTag["fieldType"]=="text"){
        const inspectionName=document.createTextNode(fieldTag["descText"]);
        const valueContainer=produceElement("textInput");
        valueContainerDataTagAdd(valueContainer,fieldTag["fieldType"]);
        inspectionContainer1.appendChild(inspectionName);
        inspectionContainer2.appendChild(valueContainer);
    }
    if(fieldTag["fieldType"]=="numerical"){
        const inspectionName=document.createTextNode(fieldTag["descText"]);
        const valueContainer=produceElement("numerical");
        valueContainerDataTagAdd(valueContainer,fieldTag["fieldType"]);
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
        valueContainerDataTagAdd(valueContainer,fieldTag["fieldType"]);
        inspectionContainer1.appendChild(inspectionName);
        inspectionContainer2.appendChild(valueContainer);
    }
    if(fieldTag["fieldType"]=="multipleSelector"){
        const inspectionName=document.createTextNode(fieldTag["descText"]);
        const valueContainer=produceElement("multipleSelector");
        valueContainer.type="multipleSelector";
        valueContainerDataTagAdd(valueContainer,fieldTag["fieldType"]);
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
        valueContainerDataTagAdd(valueContainer.children[1],fieldTag["fieldType"]); //input field is within the value container
        valueContainer.children[1].value= parseFloat(fieldTag["meanValue"]);//set the mean value;
        valueContainer.children[1].setAttribute("min", fieldTag["minCheck"]);
        valueContainer.children[1].setAttribute("max", fieldTag["maxCheck"]);
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
        valueContainerDataTagAdd(valueContainer,fieldTag["fieldType"]);
        inspectionContainer1.appendChild(inspectionName);
        inspectionContainer1.appendChild(imgElem);
        inspectionContainer2.appendChild(valueContainer);
    }
    if (fieldTag["fieldType"]=="externalSourceField"){
        const inspectionName=document.createTextNode(fieldTag["descText"]);
        const valueContainer=produceElement("textInput");
        valueContainerDataTagAdd(valueContainer,fieldTag["fieldType"]);
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

async function addStatusElement(elem, childArray, type="normal"){
    const statusContainer = statusElementContainer(); 
    for(i=0;i<childArray.length;i++){
        statusContainer.appendChild(statusElement(i,childArray,type));
    }
    elem.appendChild(statusContainer);
} 

function statusElementContainer(){
    let statHtml=
                `<div class="sectionItem statusSubSection itemMedium" data-section-type="status"></div>`
    return htmlToElement(statHtml);
}
function statusElement(index,childArray, type='normal')
{
    let statHtml=`
                <div class="statusElement" data-detail-status="null" data-detail-status-index="${index}">  <span name="textElem"> No Input yet <span> 
                </div>`;
    if(type=='rework')
    {
        statHtml=`
                <div class="statusElement popup" data-detail-status="null"  data-detail-status-index="${index}" data-detail-reworkremarks="${childArray[i].reworkRemarks}"
                data-detail-reworkreason="${childArray[i].reworkReason}"  
                onclick="remarkShowToggle(event,this)"> 
                        <span class="popuptext" data-type-remarks="${childArray[i].reworkRemarks}">
                        Reason:${childArray[i].reworkReason} -
                        <br/>
                        <span>${childArray[i].reworkRemarks}</span></span>
                        <span name="textElem"> No Input yet </span> 
                        <img src = "/assets/img/icons/remark_note.svg" alt="remarks"/>
                </div>`;
    }
    return htmlToElement(statHtml);
}
function sectionDividerElementAuthoring(index, htmlString)
{
    const htmlNode=htmlToElement(htmlString);
    htmlNode.setAttribute('index',index);
    return htmlNode;
}

async function generateFormAccessories(type){
    const mainBox = document.getElementById("main");
    if(type=="author"){
        const authoringSwitchContainer = await authoringModeTemplateGeneratedElement();
        const authModeSwitch = authoringSwitchContainer.querySelector("#authoringModeSwitch");
        authModeSwitch.addEventListener("input", actionOnAuthModeSelection);
        mainBox.insertAdjacentElement('beforebegin', authoringSwitchContainer);
    }
    const checkFixedHeader = await checkListHeaderGeneratedElement();
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
    if(provideTopFilterTruthy("$#header$#"))
    {
        formElem.appendChild(htmlToElement(formHeader.innerHTML));
        if(authMode.active){
            formElem.appendChild(sectionDividerElementAuthoring(-1,sectionDividerContainer.innerHTML));
        };
    }
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
    if(mode = new URLSearchParams(window.location.search).get("mode")!="author") {
        formElem.appendChild(saveFormElement());
    }
}

async function renderForm(){
    const mode = getLocalOrThenUrl('mode');
    const filter = getLocalOrThenUrl('filter');
    //const mode = new URLSearchParams(window.location.search).get("mode");
    //const filter = new URLSearchParams(window.location.search).get("filter");
    generateFormAccessories(mode);
    await getCheckSheetJSONDataFromBackend();
    await populateOptionInTopFilter(defaultFilter=filter);
    populateForm(MasterArray,fieldContainerElement,);
    populateHeader();
}

async function getCheckSheetJSONDataFromBackend(){
    const model = getLocalOrThenUrl("model");
    const checkSheetName= getLocalOrThenUrl("sheet"); //new URLSearchParams(window.location.search).get("sheet");
    const sheetID = getLocalOrThenUrl("sid");//new URLSearchParams(window.location.search).get("sid");
    //await getCheckSheetData(model,checkSheetName);
    await getCheckSheetData(sheetID, model,checkSheetName);
}
function saveFormElement(){
    const button = document.createElement("button");
    button.classList.add("btn-primary");
    button.style.margin='10px';
    button.innerHTML="Save Inspection";
    button.setAttribute('onclick',"onSaveButtonPress(event, this);");
    return button;
}

async function initiateChecklistPresenting(){
    const mode = new URLSearchParams(window.location.search).get("mode");
    let byPass = true;
    if(mode!="author"){
        operatorLogin();
        byPass= false;
    }
    if (byPass){
        renderForm();
    }
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

async function createContainerDOM(event){ //creates new field in the modal
    const requestBlock=document.getElementById("RequestBlock");
    const container = requestBlock.parentElement;
    const idName= event.target.value;
    if (idName!=="0")
    {
        const elem= document.getElementById(idName);
        let html = elem.innerHTML.slice();
        html = addNameFieldToRadioSet(html);
        const elemNode= htmlToElement(html);
        elemNode.setAttribute("data-uid", uuidv4());//adding new UID to created field 
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
    const name3 = AlphaNumeric(length);
    htmlString= htmlString.replaceAll(identifier1,name1);
    htmlString= htmlString.replaceAll(identifier2,name2);
    htmlString =htmlString.replaceAll(identifier3,name3);
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
    jsonTag["uid"]=elem.getAttribute('data-uid');
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
        jsonTag["maxCheck"]=parseFloat(collectionValue[3].value);
        jsonTag["minCheck"]=parseFloat(collectionValue[4].value);
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
    inputElement.checked=value;
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
    elem.setAttribute("data-uid", JsonObj["uid"]);//adding uid to elem 
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
             JsonObj["maxCheck"]!=null)
            {
                setDepthvalue(elem,[2],'input[data-field-input="check"]', true);
                setDepthvalue(elem,[2],'input[value="no"]', false);
                setDepthvalue(elem,[2],'input[data-field-input="answer"]',JsonObj["maxCheck"]);  
            }
        if ( //lsl setting
             JsonObj["minCheck"]!=null)
            {
                setDepthvalue(elem,[3],'input[data-field-input="check"]', true);
                setDepthvalue(elem,[3],'input[value="no"]', false);
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
        inputContainer.children[8].value=JsonObj["maxCheck"];
        inputContainer.children[10].value=JsonObj["minCheck"]; 
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
    result["uid"]=mainModal.getAttribute("data-uid");
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
    modal.setAttribute("data-index", parseInt(JsonObj["index"]));
    modal.setAttribute("data-uid", JsonObj["uid"]);
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

async function modifyColor(event,elem){
    const collection = elem.children;
    for (i=0;i<collection.length;i++){
        if(collection[i].children[0].checked){
            collection[i].classList.add("multipleSelectorLabelSelected");
            elem.setAttribute('data-detail-input',collection[i].innerText);
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
    //also add this value on parentElement : 
    inputElem.setAttribute('data-detail-input', inputElem.value);
    inputElem.dispatchEvent(new Event("input",{bubbles:true})); //Ref: https://stackoverflow.com/questions/35659430/how-do-i-programmatically-trigger-an-input-event-without-jquery
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
                <input class="headerInput"  id="ESNInput" type="text" placeholder="ESN Details">
            </div>
            <div class="headerRowItem">
                <label for="ESN">Model Number</label>
                <input class="headerInput" disabled id="ModelNum" type="text" placeholder="Model Number">
            </div>
        </div>
        <div class="headerRow">
            <div class="headerRowItem">
                <label for="order">Shop Order</label>
                <input class="headerInput" disabled id="orderNum" type="text" placeholder="order Number">
            </div>
            <div class="headerRowItem">
                <label for="date">Date of Acceptance</label>
                <input class="headerInput" disabled id="DateEntry" type="text" placeholder="Date Entry">
            </div>
        </div>
    </div>
    `;
    return htmlToElement(htmlString);
}
async function populateHeader(){
    const ESNInputValue = document.getElementById("ESNInput");
    const dateTimeBlock = document.getElementById("DateEntry");
    const ModelNum = document.getElementById("ModelNum");
    const orderNum = document.getElementById("orderNum");
    const pageTopHeader = document.getElementById('pageTopHeader');
    dateTimeBlock.value=getISOTimeStringWithOffset();
    ModelNum.value = getLocalOrThenUrl("model");
    orderNum.value= "CO123";
    ESNInputValue.value=AlphaNumeric(8);
    pageTopHeader.innerHTML="CheckList: "+ `${getLocalOrThenUrl('sheet')}`+` (Model: ${ModelNum.value})`;
}


//communication with the backend
async function getCheckSheetData(sheetID, model,checkSheetName){
    /*
    const checkSheetDetail={
        status:"QSK60",
        shortDesc:"QSK60Total",
    };*/
    /*
    const checkSheetDetail={
        status:model,
        shortDesc:checkSheetName,
    };*/
    const checkSheetDetail={
        sheetID: sheetID,  
    }
    const response= await postJsonData("/GetCheckSheetData" , checkSheetDetail,);
    if(response.status==200){
        tempArray=responseToJson(response).sheetArray;
        await sortMasterArrayfromBackend(tempArray);
        MasterArray= tempArray;
        return MasterArray;
    }
}
async function sortMasterArrayfromBackend (responseArray){
    responseArray.sort((a,b)=>{
        if(a.index > b.index){
            return 1;
        }
        if (a.index < b.index){
            return -1;
        }
        return 0;
    });
}
async function saveAuthoredCheckSheetWithBackend(){
    const model = new URLSearchParams(window.location.search).get("model");
    const checkSheetName= new URLSearchParams(window.location.search).get("sheet");
    const sheetID = new URLSearchParams(window.location.search).get("sid");
    const checkSheetJSONTemplate={
            model:model,
            sheetName:checkSheetName,
            sheetID: sheetID,
            sheetArray:MasterArray,
    }
    const {status, data}= await postJsonData("/saveAuthorCheckSheet" , checkSheetJSONTemplate,);

    //console.log(status, "checksheetSave");
}

//operator login functions: 
async function operatorLogin(){
    const key = "operatorWWID";
    const operatorLogged=getKeyValueFromStorage(key);
    if(!operatorLogged)
    {
        //const modalContentTemplate = document.getElementById("modal_template");
        const modalContentTemplate= generateLoginTemplate();
        const modelSelector=modalContentTemplate.querySelector('select[name="modelSelection"]');
        getCheckSheetInventory().then(
            allSheetArray=>{
                const modelSet = new Set(allSheetArray
                                            .filter(item=>item.status=='active')
                                            .map( item => {
                                                return item.model;       
                }));
                createOptionElements(modelSelector, modelSet, "Choose Model");
            }     
        );
        modalContainer.appendChild(modalContentTemplate);
        modalContainer.style.display='flex';
        return ;
    }
    renderForm();
    modalContainer.style.display='none';
    return ;  
}
async function getCheckSheetInventory(){
    const response = await postJsonData("/UserCheckSheets","getCheckSheets",);
    return responseToJson(response);
}
function generateLoginTemplate(){
    const htmlString =`
    <div class="modal" id="modal">
            <div class="modalHeading">
                Login to fill the Inspection Details
            </div>
            <div class="modalSection">
                <div class="inputType">
                    <label for="issueType">
                        Enter your WWID
                    </label>
                    <input type="text" class="inputLarge" id="WWID">
                </div>
            </div>
            <div class="modalSection">
                <div class="inputType">
                    <label for="issueType">
                        Enter login password
                    </label>
                    <input type="password" class="inputLarge" id="login_password">
                </div>
            </div>
            <div class="modalSection">
                <div class="inputType">
                    <span>Select  Applicable Model :  </span>
                    <div class="inputType " id="modelProvider">
                        <select name="modelSelection" onchange="activateCheckSheetOption(event,this)">
                        </select>
                        &nbsp; &nbsp;
                        <select class="hideContainer" name="checkSheetSelection" onchange="activateCheckSheetOption(event,this)" >
                        </select>
                        <select class="hideContainer" name="checkSheetOperationSelection">
                        </select>
                    </div>
                </div>
            </div>
            <div class="hideContainer">
                <div class="modalSection big_input_box">
                    <label for="Decription"> Description about the Issue</label>
                    <textarea name="Description" id="issueDescription"></textarea>
                </div>
            </div>
            <button class="modalButton btn-primary" onclick="operatorLoginDetails(event,this)">Initiate</button>
        </div> 
    `; 
    return htmlToElement(htmlString);
}

async function activateCheckSheetOption(event,currentSelectorElem){
    const modelSelectorContainer = currentSelectorElem.parentElement;
    let zeroOption, linkedSelectorElem, optionResultArray ; 
    if(currentSelectorElem.name=="modelSelection") {
        zeroOption = "CheckSheet";
        linkedSelectorElem= modelSelectorContainer.querySelector('select[name=checkSheetSelection]');
        const sheetInventory = await getCheckSheetInventory();
        optionResultArray =  sheetInventory
        .filter(modelSheets=>modelSheets.status=='active')
        .filter(modelSheets=>modelSheets.model==currentSelectorElem.value)
                                             .map(sheet=>{ return {name:sheet.sheetName , sheetID:sheet.sheetID};});
    }
    if(currentSelectorElem.name=="checkSheetSelection"){
        zeroOption="Operation Station";
        const model = modelSelectorContainer.querySelector('select[name="modelSelection"]');
        linkedSelectorElem= modelSelectorContainer.querySelector('select[name=checkSheetOperationSelection]');
        const sheetId = currentSelectorElem.options[currentSelectorElem.options.selectedIndex].getAttribute("data-id-sheetid");
        if(currentSelectorElem.value!="0"){
            const sheetMasterArray = await getCheckSheetData(sheetId,model.value,currentSelectorElem.value);
            optionResultArray = sheetMasterArray.map(sheetSection=>{ return {name:sheetSection.descText};});
            if(optionResultArray.length>0){
                optionResultArray.push({name:"Rework"});
            }
        }
        
    }
    if(currentSelectorElem.value!="0")
    {      
        linkedSelectorElem.innerHTML=""; //remove existing data
        const initialOption = htmlToElement(`<option value="0" selected> Choose ${zeroOption}</option>`);
        linkedSelectorElem.appendChild(initialOption);
        optionResultArray.forEach(item=>{
            const child=document.createElement("option");
            child.value=item.name;
            child.innerText=item.name;
            if (linkedSelectorElem.name=='checkSheetSelection'){
                child.setAttribute("data-id-sheetID", item.sheetID);     
            }
            linkedSelectorElem.appendChild(child);
            });
        linkedSelectorElem.classList.remove("hideContainer");
        return ;
    }
    linkedSelectorElem.value="0"; //linkedSelectorElem.options.selectedIndex=0;
    if(currentSelectorElem.name=="modelSelection"){
            linkedSelectorElem.onchange();
    }
    linkedSelectorElem.classList.add("hideContainer");
    return;
}

async function operatorLoginDetails(event,buttonElem){
    const {status, error}= isCheckFormInputAvailable(buttonElem);
    if (!status){
        window.alert(error);
        return ;
    }
    storeInLocalStorage("operatorWWID","temp-operator"); //correctionPending : this should be temproary storage
    const modalElem= buttonElem.parentElement;
    const model = modalElem.querySelector('select[name="modelSelection"]').value;
    const checkSheet= modalElem.querySelector('select[name=checkSheetSelection]');
    const sheetID = checkSheet.options[checkSheet.options.selectedIndex].getAttribute("data-id-sheetid")
    const operation= modalElem.querySelector('select[name=checkSheetOperationSelection]').value;
    window.location.href=`/checkSheet?sid=${sheetID}&model=${model}&sheet=${checkSheet.value}&mode=operator&filter=${operation}`;
    storeInLocalStorage('model', model);
    storeInLocalStorage('sheet', checkSheet.value);
    storeInLocalStorage('sid', sheetID);
    storeInLocalStorage('filter',operation);
    storeInLocalStorage('mode','operator');
    renderForm();
    modalContainer.style.display='none';  
}

function isCheckFormInputAvailable(buttonElem){
    const parent = buttonElem.parentElement;
    if (parent.querySelector('select[name="modelSelection"]').value=="0"){
        return {
            status:false ,
            error: "model not provided",
        };
    }
    if (parent.querySelector('select[name="checkSheetSelection"]').value=="0"){
        return {
            status:false,
            error: "checkSheet name not provided",
        };
    }
    if(parent.querySelector('select[name="checkSheetOperationSelection"]').value=="0"){
        return {
            status:false,
            error:"operation was not provided",
        };
    }
    return {
        status:true,
        error:"",
    };
}


function checkFormSaveReadiness(){
    let result = true;
    for (let elem of document.querySelectorAll('div[data-detail-status]') ) 
    {
        if(elem.innerText=="No Input yet"
        || elem.innerText=="No Input")
        {
            elem.classList.remove('highlightNormal');
            elem.classList.add('highlightError');
            result = false; 
            break;
        };
    }
    return result;
}

//checkSheet Save functions:
async function onSaveButtonPress(event,buttonElem)
{
    if (!checkFormSaveReadiness()){
        return ; // escape saving the form if form is not ready;
    }
    //let messageBeforeSending = window.confirm("Confirm to save the form");
    let [response1, response2 ] = await Promise.all([
        saveFieldsForm(event, buttonElem),
        reworkInspectionSave(event,buttonElem),
    ]);
    console.log("response", response1.status, response2.status);
    if (response1.status==200 && response2.status==200) {
        let UIinput= window.confirm("Data Successfully Submitted !");
        location.reload(true); //https://www.freecodecamp.org/news/javascript-refresh-page-how-to-reload-a-page-in-js/
        return ;
    };    
}

async function saveFieldsForm(event, buttonElem){
    const formContainer = buttonElem.parentElement;
    const ESN = document.getElementById("ESNInput").value;
    const dateTimeBlock = document.getElementById("DateEntry").value;
    const pageTopHeader = document.getElementById('pageTopHeader');
    const paramSets = new Array();
    const result = 
        Array.from(formContainer.querySelectorAll('div.sectionContainer[data-type-section="normal"]'))
        .filter(
                (sectionContainer)=>sectionContainer.getAttribute('data-index')!=null)
        .forEach((sectionContainer)=>{
            const stationName = sectionContainer.querySelector('div[data-detail-name="station"]').innerText;
            //const paramSets = new Array(); // this construction is now passed to current function's block scope
            sectionContainer.querySelector("div.inspectionSubSection")
                            .querySelectorAll("div.subSectionItem")
                            .forEach(subSectionItem =>{
                                const paramName = subSectionItem.querySelector('[data-detail-name="operation"]').getAttribute("data-uid");
                                const inputValue = subSectionItem.querySelector('[data-detail-input]').getAttribute("data-detail-input");
                                if(inputValue!=null && inputValue!="" && inputValue!="null") {
                                    paramSets.push(
                                        {   fieldID:paramName, 
                                            fieldValue:inputValue,
                                            dateTime : dateTimeBlock,
                                            operatorID: getLocalOrThenUrl("operatorWWID"),
                                            formSN : ESN,
                                            stationID : getLocalOrThenUrl("filter"),
                                        });
                                }
                            });//closing for each 
            // below code is not needed because forEach is utilized instead of Map
            //returning map values
            //return {stationName:stationName,valueSets:paramSets};
            //return paramSets;
        });
    const sheetID = getLocalOrThenUrl('sid');
    const payload = { ESN:ESN, sheetId: sheetID, formUpdates:paramSets};
    const response = await postJsonData("/formDataUpdate",payload,);
    /* note : not needed anymore since handled by the location.reload();
    clearField(buttonElem);
    //populateHeader();
    */
    //console.log(response);
    
    return response;
} 

async function clearField(buttonElem){
    const formContainer = buttonElem.parentElement;
    const result = Array.from(formContainer.querySelectorAll("div.sectionContainer"))
        .filter(
                (sectionContainer)=>sectionContainer.getAttribute('data-index')!=null)
        .forEach((sectionContainer)=>{
            const stationName = sectionContainer.querySelector('div[data-detail-name="station"]').innerText;
            const paramSets = new Array();
            sectionContainer.querySelector("div.inspectionSubSection")
                            .querySelectorAll("div.subSectionItem")
                            .forEach(subSectionItem =>{
                                const paramName = subSectionItem.querySelector('[data-detail-name="operation"]').innerText;
                                subSectionItem.querySelector('[data-detail-input]').value="";
                            });//closing forEach on fields
        //closing forEach on sectionContainers; 
        });
    return result;

}

async function onBodyLoad(){ 
    console.log("body loaded");
}

async function LogOutUser(event, elem){
    if(elem.value=="logout"){
        localStorage.clear();
        location.reload();
    }
}

async function remarkShowToggle(event,elem){
   // ref: https://www.w3schools.com/howto/howto_js_popup.asp
    const popup = elem.querySelector("span.popuptext");
    popup.classList.toggle("show");
}
