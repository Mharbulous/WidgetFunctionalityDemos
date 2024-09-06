let partyTypes = ['plaintiff', 'defendant'];

function setupPartyList(listId, initialParties) {
    const list = document.getElementById(listId);
    list.innerHTML = '';
    initialParties.forEach((party, index) => {
        const span = document.createElement('span');
        span.className = 'party-name';
        span.textContent = party.toUpperCase();
        span.addEventListener('dblclick', () => editPartyName(span, listId));
        list.appendChild(span);
        if (index < initialParties.length - 1) {
            list.appendChild(document.createTextNode(index === initialParties.length - 2 ? ' and ' : ', '));
        }
    });
    updatePartyType(listId);
    updateAddButtonVisibility(listId.replace('List', ''));
}

function editPartyName(span, listId) {
    const currentName = span.textContent;
    const input = document.createElement('input');
    input.value = currentName;
    input.style.width = `${span.offsetWidth}px`;
    span.textContent = '';
    span.appendChild(input);
    input.focus();

    function saveAndRevert() {
        const newName = input.value.trim().toUpperCase();
        if (newName === '') {
            span.remove();
            updatePartyList(listId);
        } else {
            span.textContent = newName;
            span.addEventListener('dblclick', () => editPartyName(span, listId));
            updatePartyList(listId);
        }
    }

    input.addEventListener('blur', saveAndRevert);
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveAndRevert();
        }
    });
}

function updatePartyList(listId) {
    const list = document.getElementById(listId);
    const parties = Array.from(list.querySelectorAll('.party-name')).map(span => span.textContent);
    list.innerHTML = '';
    parties.forEach((party, index) => {
        const span = document.createElement('span');
        span.className = 'party-name';
        span.textContent = party;
        span.addEventListener('dblclick', () => editPartyName(span, listId));
        list.appendChild(span);
        if (index < parties.length - 1) {
            list.appendChild(document.createTextNode(index === parties.length - 2 ? ' and ' : ', '));
        }
    });
    updatePartyType(listId);
    
    if (parties.length === 0) {
        const partyType = listId.replace('List', '');
        addDefaultParty(partyType);
    }
}

function updatePartyType(listId) {
    const list = document.getElementById(listId);
    const parties = list.querySelectorAll('.party-name');
    const typeDisplay = document.getElementById(`${listId.replace('List', 'TypeDisplay')}`);
    const currentType = typeDisplay.textContent.trim();
    const newType = parties.length > 1 ? pluralize(currentType) : singularize(currentType);
    typeDisplay.textContent = newType;
    updateAddButton(listId.replace('List', ''), newType);
}

function updateAddButton(partyType, newType) {
    const button = document.getElementById(`add${capitalize(partyType)}Button`);
    const singularType = singularize(newType);
    button.textContent = `Add ${singularType}`;
}

function updateAddButtonVisibility(partyType) {
    const container = document.getElementById(`${partyType}Container`);
    const button = document.getElementById(`add${capitalize(partyType)}Button`);
    
    function showButton() {
        button.style.display = 'inline-block';
    }
    
    function hideButton() {
        if (!container.matches(':hover')) {
            button.style.display = 'none';
        }
    }

    container.addEventListener('mouseenter', showButton);
    container.addEventListener('mouseleave', hideButton);
    
    // Initially hide the button
    hideButton();
}

function pluralize(word) {
    if (word.endsWith('Y')) {
        return word.slice(0, -1) + 'IES';
    } else if (word.endsWith('S')) {
        return word;
    } else {
        return word + 'S';
    }
}

function singularize(word) {
    if (word.endsWith('IES')) {
        return word.slice(0, -3) + 'Y';
    } else if (word.endsWith('S') && !word.endsWith('SS')) {
        return word.slice(0, -1);
    } else {
        return word;
    }
}

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

function addParty(containerType) {
    const list = document.getElementById(`${containerType}List`);
    const parties = Array.from(list.querySelectorAll('.party-name')).map(span => span.textContent);
    const partyCount = parties.length + 1;
    const partyType = document.getElementById(`${containerType}TypeDisplay`).textContent.trim();
    const singularType = singularize(partyType);
    const newPartyName = `${singularType} #${partyCount}`;
    
    parties.push(newPartyName);
    setupPartyList(`${containerType}List`, parties);
    
    // Keep the button visible after adding a party
    const button = document.getElementById(`add${capitalize(containerType)}Button`);
    button.style.display = 'inline-block';
    
    // Trigger editing for the new party
    const newPartySpan = list.lastElementChild;
    editPartyName(newPartySpan, `${containerType}List`);
}

function addDefaultParty(partyType) {
    const list = document.getElementById(`${partyType}List`);
    const typeDisplay = document.getElementById(`${partyType}TypeDisplay`);
    const singularType = singularize(typeDisplay.textContent.trim());
    const defaultName = `${singularType.toUpperCase()} #1`;
    
    const span = document.createElement('span');
    span.className = 'party-name';
    span.textContent = defaultName;
    span.addEventListener('dblclick', () => editPartyName(span, `${partyType}List`));
    list.appendChild(span);
    
    updatePartyType(`${partyType}List`);
}

function setupOtherEditable(displayId, editId, inputId, isTextarea = false, isTitleCase = false) {
    const displayElement = document.getElementById(displayId);
    const editElement = document.getElementById(editId);
    const inputElement = document.getElementById(inputId);

    displayElement.addEventListener('dblclick', function() {
        displayElement.style.display = 'none';
        editElement.style.display = 'inline-block';
        inputElement.value = displayElement.textContent;
        inputElement.focus();
    });

    inputElement.addEventListener('input', function() {
        if (isTitleCase) {
            this.value = toTitleCase(this.value);
        } else {
            this.value = this.value.toUpperCase();
        }
    });

    inputElement.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey && !isTextarea) {
            e.preventDefault();
            saveOtherChanges(displayId, editId, inputId, isTextarea, isTitleCase);
        }
    });

    inputElement.addEventListener('blur', function() {
        saveOtherChanges(displayId, editId, inputId, isTextarea, isTitleCase);
    });
}

function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

function saveOtherChanges(displayId, editId, inputId, isTextarea, isTitleCase) {
    const displayElement = document.getElementById(displayId);
    const editElement = document.getElementById(editId);
    const inputElement = document.getElementById(inputId);

    const oldValue = displayElement.textContent;
    let newValue;

    if (isTextarea) {
        newValue = inputElement.value;
        displayElement.innerHTML = '<strong>' + newValue.replace(/\n/g, '<br>') + '</strong>';
    } else if (isTitleCase) {
        newValue = toTitleCase(inputElement.value);
        displayElement.textContent = newValue;
    } else {
        newValue = inputElement.value.toUpperCase();
        displayElement.textContent = newValue;
    }
    displayElement.style.display = 'inline-block';
    editElement.style.display = 'none';

    if (displayId.includes('TypeDisplay')) {
        const listId = displayId.replace('TypeDisplay', 'List');
        updatePartyType(listId);
        updatePartyNames(listId, oldValue, newValue);
    }
}

function updatePartyNames(listId, oldType, newType) {
    const list = document.getElementById(listId);
    const parties = list.querySelectorAll('.party-name');
    
    parties.forEach(party => {
        const oldSingular = singularize(oldType);
        const newSingular = singularize(newType);
        if (party.textContent.includes(oldSingular)) {
            party.textContent = party.textContent.replace(oldSingular, newSingular);
        }
    });
    
    updatePartyList(listId);
}

function setupCourtRegistryDropdown() {
    const displayElement = document.getElementById('courtRegistryDisplay');
    const editElement = document.getElementById('courtRegistryEdit');
    const selectElement = document.getElementById('courtRegistrySelect');

    displayElement.addEventListener('dblclick', function() {
        displayElement.style.display = 'none';
        editElement.style.display = 'inline-block';
        selectElement.value = displayElement.textContent;
        selectElement.focus();
    });

    selectElement.addEventListener('change', function() {
        saveCourtRegistryChanges();
    });

    selectElement.addEventListener('blur', function() {
        saveCourtRegistryChanges();
    });

    // Initial shading check
    updateCourtRegistryShading();
}

function saveCourtRegistryChanges() {
    const displayElement = document.getElementById('courtRegistryDisplay');
    const editElement = document.getElementById('courtRegistryEdit');
    const selectElement = document.getElementById('courtRegistrySelect');

    const newValue = selectElement.value;
    displayElement.textContent = newValue || 'Court Registry';
    displayElement.style.display = 'inline-block';
    editElement.style.display = 'none';

    updateCourtRegistryShading();
}

function updateCourtRegistryShading() {
    const displayElement = document.getElementById('courtRegistryDisplay');
    const selectElement = document.getElementById('courtRegistrySelect');
    
    if (selectElement.value === '') {
        displayElement.classList.add('default-registry');
    } else {
        displayElement.classList.remove('default-registry');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize party lists with default values
    setupPartyList('plaintiffList', ['JOHN DOE']);
    setupPartyList('defendantList', ['JANE DOE', 'ACME CORP.']);

    // Setup add buttons
    document.getElementById('addPlaintiffButton').addEventListener('click', () => addParty('plaintiff'));
    document.getElementById('addDefendantButton').addEventListener('click', () => addParty('defendant'));

    // Setup other editable fields
    setupOtherEditable('courtFileNoDisplay', 'courtFileNoEdit', 'courtFileNoInput', false, true);
    setupCourtRegistryDropdown();
    setupOtherEditable('courtNameDisplay', 'courtNameEdit', 'courtNameInput', true);
    setupOtherEditable('plaintiffTypeDisplay', 'plaintiffTypeEdit', 'plaintiffTypeInput');
    setupOtherEditable('defendantTypeDisplay', 'defendantTypeEdit', 'defendantTypeInput');

    // Initial shading check
    updateCourtRegistryShading();
});
