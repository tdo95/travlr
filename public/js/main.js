const yearSelect = document.querySelector('#year');
const newDestinationForm = document.querySelector('#newDestination');
const addDestinationButton = document.querySelector('#addDestination');
const updateDestinationButton = document.querySelector('#updateDestination');
const newDestinationError = document.querySelector('.newDestinationError');
const editButtons = document.querySelectorAll('.edit');
const deleteButtons = document.querySelectorAll('.delete');
const moreButtons = document.querySelectorAll('.moreButton')
const formItems = Object.values(newDestinationForm);
//stores entry information prior to edit
let previousEntry = {}
moreButtons.forEach(button => button.addEventListener('click', (event) => {
    //grab window
    let window = event.target.parentNode.querySelector('.moreWindow');

    //if window is hidden
    if (window.classList.contains('hidden')) {
        //store destination values
        storeDestinationValues(event.target.parentNode.children);
        //unhide window
        window.classList.remove('hidden');
    }
    else {
        //just hide window
        window.classList.add('hidden');
    }
}))
addDestinationButton.addEventListener('click', async () => {
    //check that location has been entered
    if (!validateForm()) return;
    let body = createRequestBody(formItems);
    await sendRequest('POST', body, '/home', newDestinationError);
})
updateDestinationButton.addEventListener('click', async() => {
    //check that location has been entered
    if (!validateForm()) return;
    let body = createRequestBody(formItems);
    await sendRequest('PUT', {new: body, previous: previousEntry}, '/home', newDestinationError);
})

editButtons.forEach(button => button.addEventListener('click', async () => {
    //clear previous entries, TODO: add this to close functionality instead
    resetForm(formItems);
    //clear previous stored destination entry
    clearStoredDestination()
    //display entries in form 
    displayValuesInForm(button.parentNode.children)
    //store current destination values of clicked element
    storeDestinationValues(button.parentNode.children);
    //TODO: open popup
}))
deleteButtons.forEach(button => button.addEventListener('click', async () => { 
    //clear previous entry TODO: put into it's own function, make name a bit more clear like 'stored destination entry'
    clearStoredDestination()
    //store current destination values of clicked element
    storeDestinationValues(button.parentNode.children);
    //TODO: open popup
    await sendRequest('DELETE', previousEntry, '/home', newDestinationError);
}))

function openPopup() {

}
function closePopup() {

}

//function populates clicked destination information in the popup window 
function displayValuesInForm(collection) {
    //grab info from card and ppopulate in popup window
    for (let element of collection) {
        //skips edit button
        if (element.className !== 'moreButton' && !(element.className.includes('moreWindow'))) {
            //populate infor in pop up window
            document.querySelector(`[name="${element.className}"]`).value = element.innerText;
        }
    }
}
function storeDestinationValues(collection) {
    previousEntry = {}
    for (let element of collection ) {
        if (element.className !== "moreButton" && !(element.className.includes('moreWindow'))) {
            //save entry value to find in database later 
            previousEntry[element.className] = element.innerText;
        } 
    }
}





populateYears();

//Fill in years on year select form within the add and edit destination forms
function populateYears() {
    let currentYear = new Date().getFullYear();

    for (let i = 0; i < 100; i++) {
        let option = document.createElement('option');
        option.textContent = currentYear + i;
        yearSelect.appendChild(option);
    }
}


//grab values from form fields
function createRequestBody(formItems) {
    let body = {};
    for (let field of formItems) {
        if (field.name && field.name !== "update" && field.name !== "add") body[field.name] = field.value.trim();
    }
    return body;
}


async function sendRequest(method, body, route, errorLocation) {
    let response = await fetch(route, {
        method: method,
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(body)
    })
    let data = await response.json();

    //check for error 
    if (data.error)
        return showErrorMessage(data.error, errorLocation);
    else {
        //reload page
        location.reload();
    }
}
//reset the form fields (including clearing error messages)
function resetForm(formItems) {
    for (let field of formItems ) {
        if (field.name === "month" || field.name === "year") {
            field.selectedIndex = 0;
        }
        else if (field.name !== "add" && field.name !== "update") field.value = "";
    }
    newDestinationError.innerText = ""; 
}
function clearStoredDestination() {
    previousEntry = {};
}
function showErrorMessage(message, element) {
    //displays error message in the screen provided
    element.innerText = message;
}
//Ensures that location has been enetered, if not enetered return false, else return true
function validateForm() {
    //check that location has been entered
    if (formItems[1].name === "location" && formItems[1].value === "") {
        //show error message
        showErrorMessage("Please enter a location", newDestinationError);
        return false;
    }
    return true;
}