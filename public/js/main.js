const yearSelect = document.querySelector('#year');
const newDestinationForm = document.querySelector('#newDestination');
const newDestinationButton = document.querySelector('#newDestinationButton');
const newDestinationError = document.querySelector('.newDestinationError')

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
    
    const formItems = Object.values(newDestinationForm);
    //check that location has been entered
    if (formItems[1].name === "location" && formItems[1].value === "") {
        //show error message
        return showErrorMessage("Please enter a location", newDestinationError);
    }

    let body = createRequestBody(formItems);
    
    await addDestination(body);
}

function createRequestBody(formItems) {
    let body = {};
    for (let field of formItems ) {
        if (field.name) body[field.name] = field.value;
    }
    return body;
}

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
        //reset the form fields (including clearing error messages)
        // for (let field of formItems ) {
        //     if (field.name === "month" || field.name === "year") {
        //         field.selectedIndex = 0;
        //     }
        //     else field.value = "";
        // }
        // newDestinationError.innerText = ""
    }

}

function showErrorMessage(message, item) {
    //displays error message in the screen provided
    item.innerText = message;
}