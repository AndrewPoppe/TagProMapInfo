

var vars = ["Map Width","Map Height","Total Area","Adjusted Area" ,"Shortest Path Between Flags","Percent Not Empty" ,"Empty Spaces","Walls","Walls (Square)","Walls (Diagonal)","Floor Tiles","Floor Tiles % of Interior","Flags (Red)","Flags (Blue)","Flags (Yellow)","Speed Pads (Total)","Speed Pads (Neutral)","Speed Pads (Red)","Speed Pads (Blue)","Power-Ups","Spikes","Buttons","Gates (Inactive)" ,"Gates (Green)" ,"Gates (Red)" ,"Gates (Blue)" ,"Bombs" ,"Team Tiles (Red)" ,"Team Tiles (Blue)" ,"Portals" ,"Goal Tiles (Red)" ,"Goal Tiles (Blue)" ,"Gravity Wells"],
    defaultTable = document.getElementById("defaultMetrics").children[0],
    index = 0;
vars.forEach(function(e) {
    var tr = document.createElement('tr'),
        indexTd = document.createElement('td'),
        nameTd = document.createElement('td');

    index += 1;
    indexTd.innerHTML = index;
    nameTd.id = 'field' + index;
    nameTd.innerHTML = e;
    [indexTd, nameTd].forEach(function(i) {tr.appendChild(i);});
    defaultTable.appendChild(tr);
});

var userTable = document.getElementById('userMetrics'),
    formulaInput = document.getElementById('formulaInput'),
    nameInput = document.getElementById('nameInput'),
    storedFormulas = [],
    numDefaultMetrics = document.getElementById('defaultMetrics').children[0].children.length - 1;


function removeFormula() {
    var thisTr = this;
    chrome.storage.sync.get("formulas", function(result) {
        var formulas = result.formulas,
            thisId = thisTr.closest('tr').children[0].innerHTML;
        for(var i = 0; i < formulas.length; i++) {
            console.log(thisId, formulas[i]);
            if(formulas[i].index === thisId) {
                formulas.splice(i, 1);
                chrome.storage.sync.set({formulas: formulas}, function() {
                    window.location.href = "page_action.html";
                });
            }
        }

    });
}

chrome.storage.sync.get("formulas", function(result) {
    storedFormulas = result.formulas;
    if(storedFormulas) {
        storedFormulas.forEach(function(d){
            var newRow = document.createElement('tr'),
                index = document.createElement('td'),
                name = document.createElement('td'),
                formula = document.createElement('td'),
                remove = document.createElement('button');
            remove.textContent = 'Remove';
            remove.onclick = removeFormula;
            index.innerHTML = d.index;
            name.innerHTML = d.name;
            name.id  = 'field' + d.index;
            formula.innerHTML = d.formula;
            console.log(d.actualFormula);
            formula.actualFormula = d.actualFormula;
            [index, name, formula, remove].forEach(function(i){newRow.appendChild(i);});
            userTable.children[0].appendChild(newRow);
        });
    } else {
        storedFormulas = [];
    }
});


document.getElementById('saveButton').addEventListener('click', function() {

    var name = document.createElement('td'),
        formula = document.createElement('td'),
        index = document.createElement('td'),
        newRow = document.createElement('tr'),
        remove = document.createElement('button'),
        inputtedName = nameInput.value,
        equation = formulaInput.value.replace(/[^\d \+\-\/\*\.\(\)\$]/g, ''),
        displayedEquation = equation,
        actualEquation = equation,
        regexp = /\$[0-9]{0,4}/g,
        match = [],
        matches = [];

    if(!inputtedName) return;

    while ((match = regexp.exec(equation)) !== null) {
        matches.push({index: match.index, value:match[0]});
    }

    matches.forEach(function(match) {
        var matchedField = document.getElementById('field' + match.value.replace('$', ''));
        if(!matchedField) {
            chrome.runtime.sendMessage({type:'error', message:'Cannot recognize ' + match.value});
        } 

        displayedEquation = displayedEquation.replace( match.value, '{'+matchedField.innerHTML+'}' );
        actualEquation = actualEquation.replace( match.value, 'mapInfo["' + matchedField.innerHTML + '"]');
    });

    var entries = userTable.children[0].children,
        lastIndex = (!entries.length || entries.length <= 1) ? numDefaultMetrics : entries[entries.length - 1].children[0].innerHTML;
    index.innerHTML = +lastIndex + 1;
    name.innerHTML = inputtedName;
    name.id = 'field' + index.innerHTML;
    formula.innerHTML = displayedEquation;
    formula.actualFormula = actualEquation;
    remove.textContent = 'Remove';
    remove.onclick = removeFormula;
    [index, name, formula, remove].forEach(function(i){newRow.appendChild(i);});
    userTable.children[0].appendChild(newRow);


    nameInput.value = '';
    formulaInput.value = '';
    storedFormulas.push({index: index.innerHTML,
                         name: name.innerHTML,
                         formula: formula.innerHTML,
                         actualFormula: actualEquation
                        });
    chrome.storage.sync.set({formulas: storedFormulas});

});

document.getElementById('reset').addEventListener('click', function(){

    chrome.storage.sync.clear(function(){
        window.location.href = "page_action.html";
    });
});


