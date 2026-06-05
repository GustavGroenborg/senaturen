import L from 'leaflet';
import { map, dmsStatus, setDmsStatus, usrWPCollection, totalDistance, facilityCollection } from './appState';
import { rmvUsrWP, latlngToString, ddToDms, dmsStringToDdLatlng } from './mapHandling';
import { updateDirections } from './directionsHandling';

// Hiding the Leaflet zoom controls
const zoomControl = document.querySelector('.leaflet-control-zoom') as HTMLElement;
if (zoomControl) zoomControl.style.display = 'none';

// Dropdown icon
export function dropDownIcon() {
    return `<!-- Created with Vectornator (http://vectornator.io/) -->
        <svg class="dropDownIcon" height="100%" stroke-miterlimit="10" style="fill-rule:nonzero;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;" version="1.1" viewBox="0 0 48 48" width="100%" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:vectornator="http://vectornator.io" xmlns:xlink="http://www.w3.org/1999/xlink">
    <g id="Layer-1" vectornator:layerName="Layer 1">
        <path d="M24 34L19 29L14 24L9 19L4 14C4 14 9 14 14 14C19 14 19 14 24 14C29 14 29 14 34 14C39 14 44 14 44 14L39 19L34 24L29 29L24 34Z" fill="none" fill-rule="evenodd" opacity="1" stroke="#609744" stroke-dasharray="32.0" stroke-linecap="round" stroke-linejoin="round" stroke-width="7"/>
    </g>
</svg>`;
}


/*** Removing the necessary properties depending on user OS ***/
(function() {
    if (navigator.userAgent.indexOf('Safari') !== -1 || navigator.userAgent.indexOf('iPhone') !== -1) {
        for (let i = 0; i < document.styleSheets.length; i++) {
            const sheet = document.styleSheets[i];
            if (!sheet) continue;
            try {
                for (let j = 0; j < sheet.cssRules.length; j++) {
                    const rule = sheet.cssRules[j] as CSSStyleRule;
                    if (rule.selectorText === '.facilIcon:hover') {
                        sheet.deleteRule(j);
                        break;
                    }
                }
            } catch (e) {
                // Ignore cross-origin stylesheet errors
            }
        }
    }
})();



/**********************************
 *** ELEMENT CREATION FUNCTIONS ***
 **********************************/

// Adds a child to a parent
export function addChildToParent(parentId: string, childEl: string, childId: string, childClass?: string) {
    let parent = document.querySelector(parentId);
    if (!parent) return;
    let newChild = document.createElement(childEl);


    newChild.id = childId;

    if (childClass) {
        newChild.className = childClass;
    }

    parent.appendChild(newChild);
}


// Adds a headline to a menu pane
export function addMenuPaneHeadLine(parentId: string, childId: string, childTextContent: string) {
    let parent = document.querySelector(parentId);
    if (!parent) return;
    let newHeadline = document.createElement('div');

    newHeadline.id = childId;
    newHeadline.className = 'menuPaneHeadline';
    newHeadline.classList.add('menuPaneHeaderChild');
    newHeadline.textContent = childTextContent;

    parent.appendChild(newHeadline);
}


// Adds an icon to a menu header
export function addIconToMenuHeader(parentId: string, childId: string, childClass: string, childInnerHTML: string) {
    let parent = document.querySelector(parentId);
    if (!parent) return;
    let newIcon = document.createElement('div');

    newIcon.id = childId;
    newIcon.className = childClass;
    newIcon.classList.add('menuPaneHeaderChild');
    newIcon.innerHTML = childInnerHTML;

    parent.appendChild(newIcon);
}


// Drops down a menu
export function menuDropDown(menuId: string, dropDownId: string) {
    let menuEl = document.querySelector(menuId) as HTMLElement;
    let dropDownBtn = document.querySelector(dropDownId) as HTMLElement;
    if (!menuEl || !dropDownBtn) return;

    if (getComputedStyle(menuEl).getPropertyValue('display') === 'inline-block') {
        // Hiding the menu
        dropDownBtn.style.transform = 'rotate(0deg)';
        menuEl.style.display = 'none';
        if (menuEl.parentElement) menuEl.parentElement.style.height = 'auto';
    }
    else {
        // Showing the menu
        dropDownBtn.style.transform = 'rotate(-180deg)';
        menuEl.style.display = 'inline-block';
        if (menuEl.parentElement) menuEl.parentElement.style.height = '35vh';
    }
}



/************************
 *** COORDINATES PANE ***
 ************************/

// Swapping two element of an array.
export function swapArrEl(arr: any[], el1Idx: number, el2Idx: number) {
    // Swapping the elements.
    arr.splice(el1Idx, 1, arr.splice(el2Idx, 1, arr[el1Idx])[0]);
}


// Validating Degrees-Minutes-Seconds.
export function validateDMS(inputValue: string) {
    let safeString = '';

    for (let i = 0; i < inputValue.length; i++) {
        const char = inputValue[i]!;
        switch (char) {
            case 'N':
            case 'S':
            case 'E':
            case 'W':
            case '\xB0':
            case '\'':
            case '"':
            case '.':
                safeString += char;
                break;
            case '\u00A0':
                break;

            default:
                if (Number.isNaN(Number.parseInt(char)) === false) {
                    safeString += Number.parseInt(char);

                } else {
                    console.error('ERROR CODE 10: Illegal character\n Character: ' + char);
                }
                break;
        }

    }

    return safeString;
}


// Validating Decimal Degrees.
export function validateDD(inputValue: string) {
    let safeString = '';

    for (let i = 0; i < inputValue.length; i++) {
        const char = inputValue[i]!;
        if (Number.isNaN(Number.parseInt(char)) === false) {
            safeString += Number.parseInt(char);

        } else if (char === ',' || char === '.') {
            safeString += char;

        } else {
            console.error('ERROR CODE 11: Illegal character! \n Character is: ' + char);
        }
    }

    return safeString;
}


// Validating a coordinate.
export function validateCoord(inputValue: string) {
    if (dmsStatus === true) {
        return validateDMS(inputValue);

    } else {
        return validateDD(inputValue);
    }
}


// Converting a string to the latlng format.
export function stringToLatLng(str: string) {
    let input = str.split(',');
    return {'lat': parseFloat(input[0]!), 'lng': parseFloat(input[1]!) };
}


// Adding input from the coordinates input.
export function addCoordInput(event: KeyboardEvent, usrWPObj: any) {
    if (event.code === 'Enter') {
        const target = event.target as HTMLInputElement;
        // Validating the input.
        let inputCoord = validateCoord(target.value);
        let latlng: any = (dmsStatus === true) ? dmsStringToDdLatlng(inputCoord) : stringToLatLng(inputCoord);

        // Setting the new coordinate values.
        usrWPObj.geoJSON.geometry.coordinates = [latlng.lng, latlng.lat];
        usrWPObj.Leaflet.moveMarker(latlng);

        // Updating the directions.
        updateDirections();
    }
}


// Updating all cords to DMS.
export function updateCoordsTypes() {
    const listDiv = document.querySelector('#coordListDiv');
    if (!listDiv) return;
    let coordList = listDiv.children;

    for (let i = 0; i < coordList.length; i++) {
        const item = coordList[i]!;
        if (item.id) {
            let curCoord;
            const input = item.firstChild as HTMLInputElement;
            let curVal = input.value;

            // Incoming coordinates is in DD.
            if (dmsStatus === true) {
                // Converting to a DD object.
                curCoord = stringToLatLng(validateDD(curVal));
                // Converting to a DMS
                curCoord = ddToDms(curCoord as any);
                // Converting DMS to a string.
                curCoord = latlngToString(curCoord);


            } else if (dmsStatus === false) { // Incoming coordinates is in DMS.
                curCoord = latlngToString(dmsStringToDdLatlng(validateDMS(curVal)));
            }

            if (curCoord) {
                input.value = curCoord;
            }

        }
    }
}


// Adding all necessary controls
export function addCoordControls(usrWPObj: any) {
    let parent = document.querySelector(usrWPObj.html.id);
    if (!parent) return;

    // Containers.
    let controlsContainer = document.createElement('div');
    controlsContainer.className = 'controlsContainerClass';

    let upDownContainer = document.createElement('div');
    upDownContainer.className = 'upDownContainerClass';

    // Buttons.
    let deleteBtn = document.createElement('img');
    let upBtn = document.createElement('img');
    let downBtn = document.createElement('img');


    /*** Configuring the delete button ***/

    deleteBtn.id = parent.id + 'DeleteBtn';
    deleteBtn.src = './icons/deleteIconSVG.svg';
    deleteBtn.className = 'deleteBtnClass';

    // Adding an event listener to delete the coordinate.
    deleteBtn.addEventListener('click', () => {
        rmvUsrWP(usrWPObj);
        parent!.remove();
    });

    // Adding it to the relevant container
    controlsContainer.appendChild(deleteBtn);


    /*** Configuring the up button ***/

    upBtn.id = parent.id + 'UpBtn';
    upBtn.src = './icons/upDownIconSVG.svg';
    // Making the up button point up.
    upBtn.style.transform = 'rotate(180deg)';
    upBtn.className = 'upBtnClass';

    // Adding an event listener to make the coordinate element move one up.
    upBtn.addEventListener('click', () => {
        let grandParentNode = parent!.parentNode;
        let parentNode = controlsContainer.parentNode as HTMLElement;
        if (!grandParentNode) return;

        // Swapping the relevant elements in the array.
        // Finding the index og the two elements to be swapped.
        let el1Idx = usrWPCollection.findIndex((obj) => obj.html.idName === parentNode.id);
        let el2Idx = usrWPCollection.findIndex((obj) => obj.html.idName === ((grandParentNode.firstChild === parentNode) ? grandParentNode.lastChild?.id : (parentNode.previousSibling as HTMLElement).id));

        swapArrEl(usrWPCollection, el1Idx, el2Idx);

        // Moving the coordinate.
        grandParentNode.insertBefore(parentNode, parentNode.previousSibling);

        // Updating the directions.
        updateDirections();
    });


    /*** Configuring the down button ***/

    downBtn.id = parent.id + 'DownBtn';
    downBtn.src = upBtn.src;
    downBtn.className = 'downBtnClass';

    // Adding an event listener to make the coordinate element move one down.
    downBtn.addEventListener('click', () => {
        let grandParentNode = parent!.parentNode;
        let parentNode = controlsContainer.parentNode as HTMLElement;
        if (!grandParentNode) return;
        let el1Idx, el2Idx;

        // If the given coordinate is the last child, move it to the top.
        if (grandParentNode.lastChild === parentNode) {
            // Swapping the elements in the user waypoint collection.
            el1Idx = usrWPCollection.findIndex((obj) => obj.html.idName === parentNode.id);
            el2Idx = usrWPCollection.findIndex((obj) => obj.html.idName === (grandParentNode.firstChild as HTMLElement).id);

            swapArrEl(usrWPCollection, el1Idx, el2Idx);

            // Swapping the order in the coordinate pane.
            grandParentNode.insertBefore(parentNode, grandParentNode.firstChild);

        } else {
            el1Idx = usrWPCollection.findIndex((obj) => obj.html.idName === parentNode.id);
            el2Idx = usrWPCollection.findIndex((obj) => obj.html.idName === (parentNode.nextSibling?.nextSibling as HTMLElement).id);

            swapArrEl(usrWPCollection, el1Idx, el2Idx);

            grandParentNode.insertBefore(parentNode, parentNode.nextSibling!.nextSibling);
        }

        // Updating the directions.
        updateDirections();
    });


    // Adding the up and down buttons to the relevant container.
    upDownContainer.appendChild(upBtn);
    upDownContainer.appendChild(downBtn);

    // Adding the up and down container to the controls container.
    controlsContainer.appendChild(upDownContainer);

    // Adding the controls container to the parent.
    parent.appendChild(controlsContainer);
}


// Adding a coordinates element to the coordinates list.
export function addCoordEl(usrWPObj: any) {
    let elParent = document.querySelector('#coordListDiv');
    if (!elParent) return;
    let elContainer = document.createElement('div');
    let coord = document.createElement('input'); 
    let submit = document.createElement('input');
    let coordinatesArr = usrWPObj.geoJSON.geometry.coordinates;


    /*** Configuring the element container ***/
    elContainer.id = usrWPObj.html.idName;
    usrWPObj.html.id = '#' + elContainer.id;
    elContainer.className = 'coordElContainer';


    /*** Configuring the coordinate element ***/
    coord.className = 'coordsStyle';
    coord.type = 'text';
    coord.id = usrWPObj.html.idName + 'Input';
    // Setting the coordinate value.
     if (dmsStatus === true) {
        setTimeout(() => { // Timeout added to make sure that, Leaflet layer is added in usrWPObj.
            coord.value = latlngToString(ddToDms(usrWPObj.Leaflet.getMarkerLatLng()));
        }, 5);

    } else if (dmsStatus === false) {
        coord.value = coordinatesArr[1].toFixed(3).toString() + ', ' + coordinatesArr[0].toFixed(3).toString();
    }  

    // Adding an event listener to the coordinate element.
    coord.addEventListener('keyup', (event) => {
        addCoordInput(event, usrWPObj);
    });

    // Adding the coordinate to the coordinate element container.
    elContainer.appendChild(coord);

    // Handling the submit button.
    submit.type = 'submit';
    submit.hidden = true;

    // Adding everything to the coordinates list.
    elParent.appendChild(elContainer);

    /*** Controls ***/
    addCoordControls(usrWPObj);

}


// Adding the coordinates pane
addChildToParent('#menuPane', 'div', 'coordPane', 'menuPaneStyle');

// Adding the coordinates pane header
addChildToParent('#coordPane', 'div', 'coordPaneHeader', 'menuPaneHeader');

// Adding the coordinates pane header headline
addMenuPaneHeadLine('#coordPaneHeader', 'menuPaneHeadline', 'Waypoints');

// Adding the drop-down icon to the coordinates pane header
addIconToMenuHeader('#coordPaneHeader', 'coordPaneDropDownIcon', 'dropDownIcon', dropDownIcon());

// Adding the coordinates list <div> element
addChildToParent('#coordPane', 'div', 'coordListDiv');



/***********************
 *** FACILITIES PANE ***
 ***********************/


/*** Functions ***/

// Adds a facility icon to a facility row
export function addFacilityIcon(parentRowId: string, facObj: any) {
    let parentRow = document.querySelector(parentRowId);
    if (!parentRow) return;
    let newIcon = document.createElement('img');

    // Configuring the new icon.
    newIcon.src = facObj.iconPath;
    newIcon.id = facObj.html.idName;
    newIcon.title = facObj.html.title;
    newIcon.className = 'facilIcon';
    newIcon.style.filter = 'grayscale(100%) blur(2px)';

    let ua = navigator.userAgent.toLowerCase();
    // Making the icon larger, if the user is on mobile.
    if (ua.indexOf('iphone') !== -1 || ua.indexOf('android') !== -1) {
        newIcon.style.width = '6em';
        newIcon.style.height = '6em';
    }

    // Setting the id of the new icon.
    facObj.html.id = '#' + newIcon.id;

    // Adding the new icon to HTML.
    parentRow.appendChild(newIcon);
}


// Adds all necessary rows and all available facilities.
export function constructFacilityRows() {
    let ua = navigator.userAgent.toLowerCase();
    let maxFacilityNo = (ua.indexOf('iphone') !== -1 || ua.indexOf('android') !== -1) ? 2 : 4;
    let facilityNo = 0;
    let rowNo = 0;
    let rowIdName: string = '', rowId: string = '';

    for (let prop in facilityCollection) {
        // Increment the relevant variables when four icons are present in the current row.
        if (facilityNo === maxFacilityNo) {
            facilityNo = 0;
            rowNo++;
        }

        // Creating a new row
        if (facilityNo === 0) {
            // Defining the id for the new row.
            rowIdName = 'facilRow' + rowNo;
            rowId = '#' + rowIdName;

            // Adding the new row to HTML.
            addChildToParent('#facilPaneDropDown', 'div', rowIdName, 'row');
        }

        // Adding a new to facility to HTML.
        addFacilityIcon(rowId, facilityCollection[prop]);

        // Adding an event listener to the new icon.
        import('./geoFAHandling').then(m => m.addIconEventListener(facilityCollection[prop]));

        facilityNo++;
    }
}



/*** Constructing the facility pane ***/

// Adding the facility menu pane
addChildToParent('#menuPane', 'div','facilPane', 'menuPaneStyle');

// Adding facilities header pane
addChildToParent('#facilPane', 'div', 'facilPaneHeader', 'menuPaneHeader');

// Adding a headline to the facilities header pane
addMenuPaneHeadLine('#facilPaneHeader', 'facilPaneHeadline', 'Facilities');

// Adding a drop-down icon
addIconToMenuHeader('#facilPaneHeader', 'facilPaneDropDownIcon', 'dropDownIcon', dropDownIcon());

// Adding the element that drops down
addChildToParent('#facilPane', 'div', 'facilPaneDropDown');

// Adding the facility rows and icons.
// constructFacilityRows(); // We will call this after everything is loaded.



/**********************
 *** MOUSE LOCATION ***
 **********************/
// Adding the mouse location element.
addChildToParent('#menuPane', 'div', 'mouseLoc', 'menuPaneStyle');


/********************
 *** ROUTE LENGTH ***
 ********************/

// Adding the distance element.
addChildToParent('#menuPane', 'div', 'routeDistance', 'menuPaneStyle');


// Update totaltDistance.
export function updateTotalDistance() {
    const el = document.querySelector('#routeDistance');
    if (el) el.textContent = totalDistance.toFixed(3).toString() + ' ' + 'km';
}

updateTotalDistance();


/***********************
 *** Event listeners ***
 ***********************/

// Dropping down the coordinates list.
document.querySelector("#coordPaneDropDownIcon")?.addEventListener('click', () => {
    menuDropDown('#coordListDiv', '#coordPaneDropDownIcon');});

// Dropping down the facilities menu.
document.querySelector('#facilPaneDropDownIcon')?.addEventListener('click', () => {
    menuDropDown('#facilPaneDropDown', '#facilPaneDropDownIcon');});

// Showing the location of the mouse.
map.on('mousemove', (event: L.LeafletMouseEvent) => {
    let coord = event.latlng;
    let cordStr;

    if (dmsStatus === true) {
        cordStr = latlngToString(ddToDms(coord));

    } else if (dmsStatus === false) {
        cordStr = latlngToString(coord);
    }

    const el = document.querySelector('#mouseLoc');
    if (el) el.textContent = cordStr || '';
});


// Switching between DMS and DD.
document.querySelector('#mouseLoc')?.addEventListener('click', () => {
    setDmsStatus(!dmsStatus);
    updateCoordsTypes();
});
