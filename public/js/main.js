const yearSelect = document.querySelector('#year');
const newDestinationForm = document.querySelector('#newDestination');
const addDestinationButton = document.querySelector('#addDestination');
const updateDestinationButton = document.querySelector('#updateDestination');
const newDestinationError = document.querySelector('.newDestinationError');
const editButtons = document.querySelectorAll('.edit');
const deleteButtons = document.querySelectorAll('.delete');
const moreButtons = document.querySelectorAll('.moreButton')
const viewButtons = document.querySelectorAll('.view')
const viewScreen = document.querySelector('.viewScreen');
const viewWindow = document.querySelector('.viewWindow');
const viewMoreWindow = viewWindow.querySelector('.moreWindow');
const closeView = document.querySelector('.closeView');
const formScreen = document.querySelector('.formScreen');
const closeForm = document.querySelector('.closeForm')
const addNewButton = document.querySelector('.addNewButton');
const deleteConfirm = document.querySelector('.deleteConfirm');
const deleteCancel = document.querySelector('.deleteCancel');
const confirmScreen = document.querySelector('.confirmScreen');
const locationInput = document.querySelector('.locationInput');
const locationDropdown = document.querySelector('.locationDropdown');
const homePage = document.querySelector('.homePage');
const explorePage = document.querySelector('.explorePage');
const pageContainer = document.querySelector('.pageContainer');
const homeButton = document.querySelector('.homeButton');
const exploreButton = document.querySelector('.exploreButton');
const formItems = Object.values(newDestinationForm);



//home and explore page toggle TODO: refractor into one function
homeButton.addEventListener('click', () => {
    if(pageContainer.classList.contains('exploreOpen')) {
        //remove exploreOpen transition
        pageContainer.classList.remove('exploreOpen'); 
        //slide page container left to open Explore
        pageContainer.classList.add('homeOpen');
    }
})
exploreButton.addEventListener('click', () => {
    if(!pageContainer.classList.contains('exploreOpen')) {
        //remove homeOpen transition
        pageContainer.classList.remove('homeOpen'); 
        //slide page container left to open Explore
        pageContainer.classList.add('exploreOpen');
    }
})



//stores entry information prior to edit
let previousEntry = {};
let timeout;
locationInput.addEventListener('input', (e) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(async () => await showDropdownOptions(e.target.value), 1000);
    
})
//hides location dropdown on click away from input
formScreen.addEventListener('click', (e) => {
    //clear options
    locationDropdown.innerHTML = '';
})
async function showDropdownOptions(text) {
    let response = await fetch('/roadgoat', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({input: text})
    })
    let data = await response.json()
    console.log(text);
    console.log(data);
    locationDropdown.innerHTML = '';
    let optionsHtml = data.data.map(obj => `<li class="dropdownEntry">${obj.attributes.name}</li>`).join('');

    locationDropdown.innerHTML = `<ul>${optionsHtml}</ul>`;
    document.querySelectorAll('.dropdownEntry').forEach(entry => entry.addEventListener('click',(e) => {
        
        //put target value into input box
        locationInput.value = e.target.innerText;
        console.log('click event!', e.target.innerText)
        //clear options
        locationDropdown.innerHTML = '';
    }))
}


addNewButton.addEventListener('click', () => {
    //unhide add button and hide update button on form
    addDestinationButton.classList.remove('hidden');
    updateDestinationButton.classList.add('hidden');
    //open form
    formScreen.classList.remove('hidden');
})
//closing form will clear form entries and hide form
closeForm.addEventListener('click', () => {
    //hide form 
    formScreen.classList.add('hidden');
    resetForm(formItems);
})
closeView.addEventListener('click', () => {
    //hide screen 
    viewScreen.classList.add('hidden');
    //remove details from view box
    document.querySelector('.destinationDetails').remove();
}) 
viewButtons.forEach(button => button.addEventListener('click', () => {
    //add stored values to view Window
    let container = document.createElement('div');
    container.classList.add('destinationDetails');
    for (let prop in previousEntry) {
        let newNode = document.createElement('p');
        newNode.innerText = previousEntry[prop];
        container.appendChild(newNode);
    }
    viewWindow.insertBefore(container, viewMoreWindow);
    //unhide view window
    viewScreen.classList.remove('hidden');
}))
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
        //clear previous entry 
        previousEntry = {};
    }
}))
addDestinationButton.addEventListener('click', async () => {
    //check that location has been entered
    if (!validateForm()) return;
    let body = createRequestBody(formItems);
    let image = await getDestinationImage();
    body['imageURL'] = image;
    await sendRequest('POST', body, '/home', newDestinationError);
})
updateDestinationButton.addEventListener('click', async() => {
    //check that location has been entered
    if (!validateForm()) return;
    let body = createRequestBody(formItems);
    let image = await getDestinationImage();
    body['imageURL'] = image;
    console.log(previousEntry);
    await sendRequest('PUT', {new: body, previous: previousEntry}, '/home', newDestinationError);
})

editButtons.forEach(button => button.addEventListener('click', async () => {
    //clear previous entries, TODO: add this to close functionality instead
    resetForm(formItems);
    //display entries in form 
    displayValuesInForm(button.parentNode.parentNode.children)
    //unhide add button and hide update button on form
    addDestinationButton.classList.add('hidden');
    updateDestinationButton.classList.remove('hidden');
    //open form
    formScreen.classList.remove('hidden');
}))
deleteButtons.forEach(button => button.addEventListener('click', async () => { 
    //open confirm window
    confirmScreen.classList.remove('hidden');
}))
deleteCancel.addEventListener('click', () => {
    //close confirm window
    confirmScreen.classList.add('hidden');
})
deleteConfirm.addEventListener('click', async (e) => {
    
    await sendRequest('DELETE', previousEntry, '/home', newDestinationError);
})

async function getDestinationImage() {
    let location = locationInput.value.split(',').join(' ');
    console.log(location)
    let response = await fetch('/unsplash', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({input: location})
    })
    let data = await response.json();
    //TODO: use prop image instead
    if(data.error) return "";
    else return data.urls.regular;
}

//function populates clicked destination information in the popup window 
function displayValuesInForm(collection) {
    //grab info from card and ppopulate in popup window
    for (let element of collection) {
        //skips edit button
        if (element.className.includes('cardDetails')) {
            for (let child of element.children) {
                //populate infor in pop up window
                document.querySelector(`[name="${child.className}"]`).value = child.innerText;

            }
        }
    }
}
function storeDestinationValues(collection) {
    previousEntry = {}
    for (let element of collection ) {
        if (element.className.includes('cardDetails')) {
            for (let child of element.children) {
                //save entry value to find in database later 
                previousEntry[child.className] = child.innerText;

            }
        }
    }
    console.log(previousEntry)
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