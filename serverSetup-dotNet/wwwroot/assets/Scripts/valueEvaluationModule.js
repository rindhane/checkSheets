const evaluationReceiver = async function(event, elem){ //event handler for "evaluation" event
    const index = event.detail.selfIndex;
    const targetElem = elem.querySelector('div.statusSubSection').children[index];
    let textInput = "not evaluated";
    if(event.detail.evaluationResult=="ok"){
        textInput="O.K."; 
    }
    if (event.detail.evaluationResult=="nok"){
        textInput="Requirement Not Met";
    }
    if(    event.detail.evaluationResult==null 
        || event.detail.evaluationResult=="" 
        || event.detail.evaluationResult=="null" ) {
            textInput="No Input";
        }
    targetElem.innerHTML=textInput;
    targetElem.classList.remove('highlightError');
    targetElem.classList.add('highlightNormal');
    return ;
}


async function dispatchEvaluationOnInspectionValue(event, elem){ //ref: https://developer.mozilla.org/en-US/docs/Web/Events/Creating_and_triggering_events#creating_and_dispatching_events_dynamically
    let elementForIndex;
    if(elem.getAttribute('data-detail-inputtype')!="incrementSelector") {
        elementForIndex = elem.parentNode.parentNode;
        
    }
    if(elem.getAttribute('data-detail-inputtype')=='incrementSelector'){
        elementForIndex=elem.parentNode.parentNode.parentNode;
    }
    const parentElemChildrenArray = elementForIndex.parentNode.children;
    const index = Array.prototype.indexOf.call(parentElemChildrenArray, elementForIndex); //ref : https://stackoverflow.com/questions/5913927/get-child-node-index
    elem.dispatchEvent(
        new CustomEvent("evaluation",{
            bubbles:true,
            detail: {
            selfIndex:index,
            evaluationResult:getEvaluationResult(elem), //correctionPending: to be replaced with result;
            },
        })
    );
}

function getEvaluationResult(elem){
    const result = elem.getAttribute("data-detail-evaluation");
    return result;
    //return 'ok';
}

async function evaluateElemForStatus(elem){
    if(elem.getAttribute("data-detail-inputtype")=="text"){
        await evaluateTextType(elem);
        return;
    }
    if(elem.getAttribute("data-detail-inputtype")=="numerical" || 
    elem.getAttribute("data-detail-inputtype")=="incrementSelector"){
        await evaluateNumericalType(elem);
        return;
    }
    if (elem.getAttribute("data-detail-inputtype")=="yesNoSelector" ){
        await evaluateYesNoSelector(elem);
        return;
    }
    if(elem.getAttribute("data-detail-inputtype")=="multipleSelector"){
        await evaluateMultipleSelector(elem);
        return;
    }
    if(elem.getAttribute("data-detail-inputtype")=="pictureField"){
        await evaluateTextType(elem);
        return;
    }
    if(elem.getAttribute("data-detail-inputtype")=="externalSourceField"){
        await evaluateTextType(elem);
        return;
    }
    return ;
}

async function evaluateTextType(elem){
    const measuredValue = elem.getAttribute("data-detail-input");
    let result="";
    if(measuredValue=="null"|| measuredValue=="" || measuredValue=="undefined"){
        result="";
    }
    else{
        result="ok"
    }
    elem.setAttribute("data-detail-evaluation",result);
    return ;
}

async function evaluateNumericalType(elem){
    const measuredValue = parseFloat(elem.getAttribute("data-detail-input"));
    let minValue = parseFloat(elem.getAttribute("min"));
    let maxValue = parseFloat(elem.getAttribute('max')); 
    minValue = isNaN(minValue) ? -99999999 : minValue;
    maxValue = isNaN(minValue)? 99999999999 : maxValue; 
    let result = "";
    if(isNaN(measuredValue)){
        result="";
    }
    else if(measuredValue > maxValue || measuredValue < minValue){
        result="nok";
    }
    else{
        result="ok";
    }
    elem.setAttribute("data-detail-evaluation",result);
}

async function evaluateYesNoSelector(elem){
    const measuredValue = elem.getAttribute("data-detail-input");
    let result="";
    if(measuredValue=="null"|| measuredValue=="" || measuredValue=="undefined"){
        result="";
    }
    else if (measuredValue=="0"){
        result="nok";
    }
    else {
        result="ok";
    }
    elem.setAttribute("data-detail-evaluation",result);
    return ;
}

async function evaluateMultipleSelector(elem){
    const measuredValue = elem.getAttribute("data-detail-input");
    let result="";
    if(measuredValue=="null"|| measuredValue=="" || measuredValue=="undefined"){
        result="";
    }
    else {
        result="ok";
    }
    elem.setAttribute("data-detail-evaluation",result);
    return ;
}