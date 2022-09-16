const yearSelect = document.querySelector('#year');
const newDestinationForm = document.querySelector('#newDestination');
const newDestinationButton = document.querySelector('#addDestination');
const updateDestinationButton = document.querySelector('#updateDestination');
const newDestinationError = document.querySelector('.newDestinationError');
const editButtons = document.querySelectorAll('.edit');
const formItems = Object.values(newDestinationForm);
//stores entry information prior to edit
let previousEntry = {}

editButtons.forEach(button => button.addEventListener('click', async () => { await openPopup(button)}))

async function openPopup(e) {
    
    //clear previous entries, TODO: add this to close functionality instead
    resetForm(formItems);
    //grab info from card and ppopulate in popup window
    for (let element of e.parentNode.children) {
        //skips edit button
        if (element.className !== 'edit') {
        console.log(element.className, element.innerText)
        //save entry value to find in database later 
        previousEntry[element.className] = element.innerText;
        //populate infor in pop up window
        document.querySelector(`[name="${element.className}"]`).value = element.innerText;
        }
    }
        

}




//open pop up

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

async function validateNewSubmission() {
    //check that location has been entered
    if (formItems[1].name === "location" && formItems[1].value === "") {
        //show error message
        return showErrorMessage("Please enter a location", newDestinationError);
    }
    let body = createRequestBody(formItems);
    
    await addDestination(body);
}

//grab values from form fields
function createRequestBody(formItems) {
    let body = {};
    for (let field of formItems) {
        if (field.name && field.name !== "update" && field.name !== "add") body[field.name] = field.value;
    }
    return body;
}

//TODO: Refractor addDestination and updateDestination functions into one
async function addDestination(body) {
    //send the request
    let response = await fetch('/home', {
        method: 'POST',
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(body)
    })
    let data = await response.json();

    //check for error 
    if (data.error)
        return showErrorMessage(data.error, newDestinationError);
    else {
        //reload page
        location.reload();
        
    }

}

async function updateDestination() {
    //check that location has been entered
    if (formItems[1].name === "location" && formItems[1].value === "") {
        //show error message
        return showErrorMessage("Please enter a location", newDestinationError);
    }

    let body = createRequestBody(formItems);
     //send the request
    let response = await fetch('/home', {
        method: 'PUT',
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({new: body, previous: previousEntry})
    })
    let data = await response.json();

    //check for error 
    if (data.error)
        return showErrorMessage(data.error, newDestinationError);
    else {
        //reload page
        location.reload();
        previousEntry = {}; 
    }

}

function resetForm(formItems) {
    //reset the form fields (including clearing error messages)
    for (let field of formItems ) {
        if (field.name === "month" || field.name === "year") {
            field.selectedIndex = 0;
        }
        else if (field.name !== "add" && field.name !== "edit") field.value = "";
    }
    newDestinationError.innerText = "";
    previousEntry = {};
}

function showErrorMessage(message, element) {
    //displays error message in the screen provided
    element.innerText = message;
}