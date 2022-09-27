//Look... I know... it's alot 😅 Cluttering the namespace and what not. I'll figure out how to handle this better 
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
const deleteError = document.querySelector('.deleteError');
const deleteScreen = document.querySelector('.deleteScreen');
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
    let optionsHtml = data.data.slice(0,8).map(obj => `<li class="dropdownEntry">${obj.attributes.name}</li>`).join('');

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
    //hide any other screens that may be open
    hideScreens()

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
    console.log('closing view screen ... should remove details ')
    //remove details from view box
    document.querySelector('.destinationDetails').remove();
    console.log(document.querySelector('.destinationDetails'))
}) 
viewButtons.forEach(button => button.addEventListener('click', (e) => {
    //hide any other screens that may be open
    hideScreens()

    //add stored values to view Window
    let container = document.createElement('div');
    container.classList.add('destinationDetails');
    //add image
    let img = e.target.parentNode.parentNode.querySelector('.imageURL').cloneNode(true);
    img.classList.add('imageURL');
    console.log(img)
    container.appendChild(img);
    //add remaining elements
    for (let prop in previousEntry) {
        let newNode = document.createElement('p');
        newNode.innerText = previousEntry[prop];
        newNode.classList.add(prop);
        container.appendChild(newNode);
    }
    viewWindow.insertBefore(container, viewMoreWindow);
    
    //unhide view window
    viewScreen.classList.remove('hidden');
}))
moreButtons.forEach(button => button.addEventListener('click', (event) => {
    let parent = event.target.parentNode;
    //grab window
    let window = parent.querySelector('.moreWindow');

    //if window is hidden
    if (window.classList.contains('hidden')) {
        if (parent.className.includes('destinationCard')) {
            //clear previous entry 
            previousEntry = {};
            //store destination values
            storeDestinationValues(event.target.parentNode.children);
        }
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
    console.log(button.parentNode.parentNode.children)
    //unhide add button and hide update button on form
    addDestinationButton.classList.add('hidden');
    updateDestinationButton.classList.remove('hidden');
    //hide any other screens that may be open
    hideScreens()
    //open form
    formScreen.classList.remove('hidden');
}))
deleteButtons.forEach(button => button.addEventListener('click', async () => {
    //hide any other screens that may be open
    hideScreens() 
    //open confirm window
    deleteScreen.classList.remove('hidden');
}))
deleteCancel.addEventListener('click', () => {
    //close confirm window
    deleteScreen.classList.add('hidden');
    //clears any error message
    deleteError.innerText = "";
})
deleteConfirm.addEventListener('click', async (e) => {
    
    await sendRequest('DELETE', previousEntry, '/home', deleteError);
})

async function getDestinationImage() {
    let location = locationInput.value.split(',')[0];
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
    console.log(collection)
    //grab info from card and ppopulate in popup window
    for (let element of collection) {
        //skips edit button
        if (element.className.includes('cardDetails') || element.className.includes('destinationDetails')) {
            for (let child of element.children) {
                //populate infor in pop up window
                console.log(child);
                if( !child.className.includes('imageURL') ) {
                    document.querySelector(`[name="${child.className.split(' ')[0]}"]`).value = child.innerText;
                }

            }
        }
    }
}
function storeDestinationValues(collection) {
    previousEntry = {}
    for (let element of collection ) {
        if (element.className.includes('cardDetails') || element.className.includes('destinationDetails')) {
            for (let child of element.children) {
                if(!child.className.includes('imageURL')){
                    //save entry value to find in database later 
                    previousEntry[child.className.split(' ')[0]] = child.innerText;
                }
            }
        }
    }
    console.log(previousEntry)
}

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
        if (field.name && field.name !== "update" && field.name !== "add") {
            //add location as name if no name provided
            if(field.name === "name" && !field.value) {
                body[field.name] = document.querySelector('.locationInput').value.split(',')[0].trim();
            }
            else body[field.name] = field.value.trim();
        }
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
    console.log(data)

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
    deleteError.innerText = ""; 
}
function hideScreens() {
    formScreen.classList.add('hidden');
    viewScreen.classList.add('hidden');
    deleteScreen.classList.add('hidden');
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

//////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////RUN IMMEDIATELY TO POPULATE YEARS IN FORM
populateYears();