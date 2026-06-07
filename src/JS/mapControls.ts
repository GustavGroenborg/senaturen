import { addChildToParent } from './menuPane';
import { mapMode, setMapMode, facilityLayerGroup, popupOptions } from './appState';
import { downloadGpxFile, compileDirectionsData } from '../GPX/gpxHandling';

export function createMapControls() {
    // Adding the map controls container.
    addChildToParent('body', 'div', 'mapControlsContainer');

    // Adding the mapModeToggle.
    addMapModeToggle();

    // Adding the gpx btn.
    addGpxBtn();
}


/*********************
 *** mapModeToggle ***
 *********************/
// Adding the mapModeToggle
export function addMapModeToggle() {
    // Adding the element to the controls container.
    addChildToParent('#mapControlsContainer', 'img', 'mapModeToggle');

    // Setting the source of the icon.
    let mapModeBtn = document.querySelector('#mapModeToggle') as HTMLImageElement;
    if (mapModeBtn) {
        mapModeBtn.src = `${import.meta.env.BASE_URL}icons/mapModeIconSVG.svg`;
        mapModeBtn.className = 'mapControlsEl';
        // Adding an event listener to the mapModeToggle.
        mapModeBtn.addEventListener('click', toggleMapMode);
    }
}


// Toggling the map mode
export function toggleMapMode() {
    const toggle = document.querySelector("#mapModeToggle") as HTMLElement;
    if (toggle) {
        toggle.style.filter = (mapMode) ? "grayscale(100%)" : "grayscale(0)";
    }

    if (mapMode === true) {
        // Binding all popups.
        facilityLayerGroup.bindAllPopups(popupOptions);
        setMapMode(false);

    } else {
        // Unbinding all popups.
        facilityLayerGroup.unbindAllPopups();
        setMapMode(true);
    }

}



/*********************
 *** EXPORT TO GPX ***
 *********************/
// Adding the export to gpx button.
export function addGpxBtn() {
    // Adding the element to the controls container.
    addChildToParent('#mapControlsContainer', 'img', 'gpxBtn');

    // Setting the source of the icon.
    let gpxbtn = document.querySelector('#gpxBtn') as HTMLImageElement;
    if (gpxbtn) {
        gpxbtn.src = `${import.meta.env.BASE_URL}icons/gpxIconSVG.svg`;
        gpxbtn.className = 'mapControlsEl';

        // Adding an event listener to the gpx button.
        gpxbtn.addEventListener('click', () => {
            downloadGpxFile(compileDirectionsData());
        });
    }
}
