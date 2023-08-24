async function pushReworkOnSave(event,elem){
    const fieldSet=elem.parentElement.parentElement;
    const inputElem=fieldSet.querySelector('input[type="radio"][name="reworkOption"][value="0"]');
    const newSpecInput = fieldSet.querySelector('input[name="replaceSpec"][type="text"]').value;
    const reworkRemarks = fieldSet.querySelector('textarea[name="reworkRemark"]').value;
    const reworkReason = fieldSet.querySelector('select[name="reworkReason"]').value;
    const stationID = fieldSet.querySelector('select[name="stationSelector"]').value;
    const stationFieldId = fieldSet.querySelector('select[name="stationFieldSelector"]').value;  
                    //Global Element usage : MasterArray
    const sectionArray=MasterArray.filter(section=>section.uid==stationID)
                                  .filter(section=>{
                                    const result = section.childs.filter(child=>child.uid==stationFieldId);
                                    if(result.length>0){
                                        return true;
                                    }
                                    return false;
                                  }); //get only applicable section with the appropriate child
    const selectedFieldArray=sectionArray[0].childs.filter(child=>child.uid==stationFieldId); //get only applicable field;
    const newSection= JSON.parse(JSON.stringify(sectionArray[0]));
    newSection.childs=JSON.parse(JSON.stringify(selectedFieldArray));
    newSection.childs[0].reworkRemarks=reworkRemarks;
    newSection.childs[0].reworkReason=reworkReason;
    newSection.childs[0].valueData=newSpecInput;
    ReworkArray.push(newSection); //Global Element usage : ReworkArray
    //populateForm(MasterArray,fieldContainerElement,);
    addReworkSection(newSection);
    inputElem.click();
}

async function addReworkSection(newSection){
    let i=-1;
    let reworkCollection=document.getElementById("reworkUpdates");
    let sectionDividerContainer = document.getElementById("sectionDividerTemplateContainerNone");
    reworkCollection.appendChild(await generateSection(newSection,typeSection="rework"));
    reworkCollection.appendChild(sectionDividerElementAuthoring(i,sectionDividerContainer.innerHTML));  
}

async function populateRework(recordArray, formElem){
    let resultElem = htmlToElement('<div class="reWorkFieldContainerBox" id="reworkUpdates"></div>');
    let formHeader= document.getElementById("sectionTableHeaderNone");
    let sectionDividerContainer = document.getElementById("sectionDividerTemplateContainerNone");
    resultElem.appendChild(htmlToElement(formHeader.innerHTML));
    for(let i=0; i<recordArray.length;i++)
    {
        resultElem.appendChild(await generateSection(recordArray[i],typeSection="rework"));
        resultElem.appendChild(sectionDividerElementAuthoring(i,sectionDividerContainer.innerHTML));
    }
    formElem.insertAdjacentElement('afterend',resultElem);
    return resultElem;
}

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
            <label class="reworkInputHeader" for="reworkQuestion" onclick="OnCheckRework(event,this);">
                <span>Want to add details about rework ?</span>
                <input type="radio" name="reworkOption" value="1" "><label>Yes</label>
                <input type=radio name="reworkOption" value="0" checked><label>No</label>
            </label>
        </fieldset>
    </div>
    `;
    return htmlToElement(htmlString);
}


async function OnCheckRework(event, elem){
    const element = event.target;
    if (element.tagName=="INPUT") {
        const parentElem=elem;
        const fieldset=parentElem.parentElement;
        const childrenCollection = fieldset.children;
        for (i=childrenCollection.length-1;i>1;i--){ // i>1 for legend & label to be spared from deletion 
            fieldset.removeChild(childrenCollection[i]);
        }
        if (element.value=="1"){
            fieldset.appendChild(await populateStations());
        }
    }
    //
}
async function populateStations(){
    const htmlString=`
        <div class="reworkInputSection" class="reworkBaseIdentifier">
                <label  class="labelAlign" for="stationSelector">
                    Select applicable station's Rework
                </label>
                <select name="stationSelector">
                </select>
                <br/>
        </div>
    `;
    const result = htmlToElement(htmlString);
    const selectorElem =result.querySelector('select[name=stationSelector]');
    const nameArray=MasterArray.map(obj=>({value:obj.uid, text: obj.descText}));
    createOptionElementsFromPairItems(selectorElem, nameArray, 
        nullDefinition={text:'select station', value:0});
    selectorElem.setAttribute('onchange','onSelectStation(event,this);');
    return result; 
}

async function onSelectStation(event, elem){
    const reworkBaseIdentifier = elem.parentElement;
    const fieldset = reworkBaseIdentifier.parentElement;
    const childrenCollection=fieldset.children;
    for (i=childrenCollection.length-1;i>2;i--){ // i>2 for label selector br element spared from deletion 
        fieldset.removeChild(childrenCollection[i]); //remove existing children present before adding new
    }
    if(elem.value!="0"){
        constructFieldSelector(fieldset,elem.value);
    }
}
async function constructFieldSelector(parentElem,selectedStation){
    let elemHolder = htmlToElement(`<div class="reworkInputSection"></div>`);
    parentElem.appendChild(elemHolder);
    elemHolder.appendChild(
        htmlToElement(
            `
            <label class="labelAlign" for="stationFieldSelector">
                Select applicable Field in Rework
            </label>
            `
        )
    );
    const htmlString=`
    <select name="stationFieldSelector">
    </select>
    `;
    const result = htmlToElement(htmlString);
    const filteredArray=MasterArray.filter(section=>section.uid==selectedStation);
    const selectedStationContent = filteredArray[0];
    const optionArray = selectedStationContent.childs.map(child=>({value:child.uid, text: child.descText}));
    createOptionElementsFromPairItems (result,optionArray,
                                        {text:'select applicable field', value:0});
    //createOptionElements();
    elemHolder.appendChild(result);
    result.setAttribute("onchange","createDOMReworkInput(event, this);")
    return result;
}

async function createDOMReworkInput(event, elem){
    const reworkReasons = [
        'Part Replacement', 'Torquing Correction', 'Detailed Rework', 'Others' 
    ];
    const reworkBaseIdentifier = elem.parentElement;
    const fieldset = reworkBaseIdentifier.parentElement;
    const index=Array.prototype.indexOf.call(fieldset.children, reworkBaseIdentifier);
    
    for(i=fieldset.children.length-1; i>index;i--){
        fieldset.removeChild(fieldset.children[i]);
    }
    if (elem.value!="0" && elem.value!=undefined){
        const htmlString = `
            <div class="reworkInputSection" >   
                <label class="labelAlign"> Select the rework type</label>
                <select name="reworkReason" onchange="displayReworkInputs(event,this);"> </select>
            </div>
            <div class="hideContainer" id="reworkInputs">
                <label class="hideContainer " for="replaceSpec">Provide change in final specification </label>
                <input  class="hideContainer" type="text" name="replaceSpec" placeholder="Change detail"> <br/> &nbsp;
                <label class="labelAlign" for="reworkRemark"> Rework Remarks </label><br/>
                <textarea  name="reworkRemark" rows="5" cols="25" >Description & Remarks of rework content</textarea>
            </div>
            <div class="hideContainer " id="saveButton">
                <button onclick="pushReworkOnSave(event,this);"> Save Rework Details</button>
            </div>
        `;
        const reworkElemCollection= Array.prototype.slice.call(htmlToMultiElement(htmlString));
        for(j=0;j<reworkElemCollection.length;j++){
            fieldset.insertAdjacentElement("beforeend", reworkElemCollection[j]); 
        }
        const selectorElem = fieldset.querySelector('select[name="reworkReason"]');
        createOptionElements(selectorElem, reworkReasons, nullDefinition="Select Rework Type");
        return true;
    }
    return false;
}

async function displayReworkInputs(event,elem){
    const reworkBaseIdentifier= elem.parentElement.parentElement;
    const reworkInputElem=reworkBaseIdentifier.querySelector('div#reworkInputs');
    const buttonContainer = reworkBaseIdentifier.querySelector('div#saveButton')
    if(elem.value!="0"){
        reworkInputElem.classList.add("reworkInputSection");
        buttonContainer.classList.add("reworkInputSection");
        //reworkInputElem.classList.remove("hideContainer");
        //buttonContainer.classList.remove('hideContainer');
        return true;
    }
    reworkInputElem.classList.remove("reworkInputSection");
    buttonContainer.classList.remove("reworkInputSection");
    return false;
}

async function reworkInspectionSave(event,buttonElem){
    const formContainer = buttonElem.parentElement;
    const ESN = document.getElementById("ESNInput").value;
    const dateTimeBlock = document.getElementById("DateEntry").value;
    const pageTopHeader = document.getElementById('pageTopHeader');
    const paramSets = new Array();
    const result = 
        Array.from(formContainer.querySelectorAll('div.sectionContainer[data-type-section="rework"]'))
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
                                    const index = getChildIndexInParentStack(subSectionItem);
                                    const sectionContainer = subSectionItem.parentElement.parentElement;
                                    const statusElement= sectionContainer.querySelector('div[data-detail-status-index="0"]');
                                    paramSets.push(
                                        {   fieldID:paramName, 
                                            fieldValue:inputValue,
                                            dateTime : dateTimeBlock,
                                            operatorID: getLocalOrThenUrl("operatorWWID"),
                                            formSN : ESN,
                                            StationName : getLocalOrThenUrl("filter"),
                                            reworkReason:statusElement.getAttribute('data-detail-reworkreason'),
                                            reworkRemarks:statusElement.getAttribute('data-detail-reworkremarks'),
                                        });
                                }
                            });//closing for each 
            // below code is not needed because forEach is utilized instead of Map
            //returning map values
            //return {stationName:stationName,valueSets:paramSets};
            //return paramSets;
        });
    const sheetID = getLocalOrThenUrl('sid');
    const payload = { ESN:ESN, sheetId: sheetID, reworkUpdates:paramSets};
    const response = await postJsonData("/reworkDataUpdate",payload,);
    return response;
} 