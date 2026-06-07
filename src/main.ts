import 'leaflet/dist/leaflet.css';
import './CSS/style.css';
import './CSS/menuPane.css';
import './CSS/mapControlsStyle.css';

import './JS/leafletPlugins';
import { initFacilities } from './JS/geoFAHandling';
import { createMapControls } from './JS/mapControls';
import { constructFacilityRows } from './JS/menuPane';

// Initialize the app
function init() {
    // Initialize facilities
    initFacilities();

    // Create map controls
    createMapControls();

    // Construct facility rows in the menu
    constructFacilityRows();

    // Alerting the user, that some features might not work properly if they are on MacOS Safari
    (function () {
        let ua = navigator.userAgent.toLowerCase();

        if (ua.indexOf('mac os') !== -1 && ua.indexOf('safari') !== -1 && ua.indexOf('iphone') === -1) {
            alert('Denne hjemmeside understøtter ikke Safari fuldt ud. Funktioner såsom visning af information om faciliteter virker ikke. For en bedre oplevelse bedes du bruge Mozilla Firefox, Google Chrome eller besøge siden fra din telefon.');
        }
    })();
}

// Ensure DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
