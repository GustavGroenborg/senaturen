import L from 'leaflet';

import { map, dmsStatus, mapMode, usrWPCollection, usrWPLayerGroup, mapboxAccessToken } from './appState';

let wpNo = 0;

// Note: These functions are likely defined in other files.
// We'll need to import them once those files are refactored.
// For now, we'll use type-safe placeholders or imports if possible.
import { addCoordEl } from './menuPane';
import { updateDirections, getDirections } from './directionsHandling';

/************************
 *** MAP CONSTRUCTION ***
 ************************/

// Constructing the map.
L.tileLayer('https://api.mapbox.com/styles/v1/{style_id}/tiles/{tileSize}/{z}/{x}/{y}?access_token={accessToken}',
    {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Imagery © <a href="https://www.mapbox.com/">Mapbox</a> | &copy <a href="mailto:gustavrisagerus@gmail.com">Gustav C. R. Grønborg</a>',
        maxZoom: 18,
        // @ts-ignore
        style_id: 'mapbox/outdoors-v11', //Throws a 404 error, but works anyhow.
        tileSize: 512,
        zoomOffset: -1,
        accessToken: mapboxAccessToken

    }).addTo(map);

// Creating the necessary map panes.
map.createPane('waypoints');
map.getPane('waypoints')!.style.zIndex = '1000';

map.createPane('facility');
map.getPane('facility')!.style.zIndex = '800';

map.createPane('direction');
map.getPane('direction')!.style.zIndex = '900';

map.createPane('popupPane');
map.getPane('popupPane')!.style.zIndex = '1100';

// Adding the user waypoint layer group to the map.
usrWPLayerGroup.addTo(map);

/**********************
 *** MOUSE LOCATION ***
 **********************/

/*** Functions ***/

// Converting Decimal Degrees to Degrees-Minutes-Seconds.
export function ddToDms(latlngObj: L.LatLngLiteral) {
    let lat = latlngObj.lat;
    let lng = latlngObj.lng;
    let dms: any = { lat: {}, lng: {} };

    // Setting DMS latitude
    dms.lat.d = Math.floor(lat);
    dms.lat.m = Math.floor(60 * Math.abs(lat - dms.lat.d));
    dms.lat.s = 3600 * Math.abs(lat - dms.lat.d) - 60 * dms.lat.m;

    // Setting DMS longitude
    dms.lng.d = Math.floor(lng);
    dms.lng.m = Math.floor(60 * Math.abs(lng - dms.lng.d));
    dms.lng.s = 3600 * Math.abs(lng - dms.lng.d) - 60 * dms.lng.m;

    // Fixing north and south, east and west.
    dms.lat.d = Math.abs(dms.lat.d);
    dms.lng.d = Math.abs(dms.lng.d);

    return dms;
}


// Converts Decimal Degrees Minutes to Decimal Degrees and returns an object.
export function dmsToDd(dmsObj: any) {
    let latlng: any = {};

    if (dmsObj.lat.d !== undefined && dmsObj.lat.m !== undefined && dmsObj.lat.s !== undefined
        && dmsObj.lng.d !== undefined && dmsObj.lng.m !== undefined && dmsObj.lng.s !== undefined) {
        // Calculating the latitude and longitude in DD.
        latlng.lat = dmsObj.lat.d + dmsObj.lat.m / 60 + dmsObj.lat.s / 3600;
        latlng.lng = dmsObj.lng.d + dmsObj.lng.m / 60 + dmsObj.lng.s / 3600;

    } else {
        latlng.lat = 56.20746;
        latlng.lng = 10.48096;
        console.error('ERROR CODE 8: Invalid dmsObj! \n Value of dmsObj:');
        console.error(dmsObj);
        console.error('ERROR CODE 8: latlng has been set to: ');
        console.error(latlng);
    }

    return latlng;
}


// Converts Decimal Degrees to Degrees-Minutes-Seconds.
export function dmsStringToDdLatlng(latlngStr: string) {
    console.log(latlngStr);
    let latIdx = latlngStr.indexOf('N') + 1;
    let lat = latlngStr.slice(0, latIdx);
    let lng = latlngStr.slice(latIdx);

    let latArr = lat.split(/[\xB0'"]+/);
    let lngArr = lng.split(/[\xB0'"]+/);

    let latlngDMS: any = { 'lat': {}, 'lng': {} };
    let latlng: any;

    // Determining the latitude.
    latlngDMS.lat.d = Number.parseInt(latArr[0]!);
    latlngDMS.lat.m = Number.parseInt(latArr[1]!) / 60;
    latlngDMS.lat.s = (Number.parseFloat(latArr[2]!) / 3600);

    // Determining the longitude.
    latlngDMS.lng.d = Number.parseInt(lngArr[0]!);
    latlngDMS.lng.m = Number.parseInt(lngArr[1]!) / 60;
    latlngDMS.lng.s = (Number.parseFloat(lngArr[2]!) / 3600);

    // Converting latitude DMS to DD.
    latlng = dmsToDd(latlngDMS);

    // Checking if latitude is North or South.
    if (latArr[latArr.length - 1] === 'S') {
        latlng.lat *= -1;

    } else if (latArr[latArr.length - 1] !== 'N') {
        console.error('ERROR CODE 7: Latitude is neither "N" or "S"! \n Value of latitude: ' + latArr[latArr.length - 1]);
    }
    
    // Checking if the longitude is East or West.
    if (lngArr[lngArr.length - 1] === 'W') {
        latlng.lng *= -1;
        
    } else if (lngArr[lngArr.length - 1] !== 'E') {
        console.error('ERROR CODE 9: Longitude is netier "E" or "W"! \n Value of longitude: ' + lngArr[lngArr.length - 1]);
    }

    return latlng;
}


// Converts latlng obj to a nice-looking string
export function latlngToString(latlng: any) {
    let lat = latlng.lat;
    let lng = latlng.lng;
    let latlngStr, latStr, lngStr;

    if (dmsStatus) {
        latStr =  lat.d.toString() + "\xB0" + " " +  lat.m.toString() + "' " +  lat.s.toFixed(3).toString() + "\"" + ( lat.d > 0 ? "N" : "S");
        lngStr =  lng.d.toString() + "\xB0" + " " +  lng.m.toString() + "' " +  lng.s.toFixed(3).toString() + "\"" + ( lng.d > 0 ? "E" : "W");

        latlngStr = latStr + '\u00A0 \u00A0' + lngStr;

        return latlngStr;
    }
    else {
        latStr = latlng.lat.toFixed(5).toString(); // 5 decimals will yield a coordinate precision of 1.11m.
        lngStr = latlng.lng.toFixed(5).toString();
        latlngStr = latStr + ', ' + lngStr;

        return latlngStr;
    }
}



/**********************
 *** USER WAYPOINTS ***
 **********************/

/*** User waypoint class ***/
export class UsrGeoJSONWP {
    geoJSON: any;
    html: any;
    Leaflet: any;

    constructor(WPNo: number, latlng: L.LatLng)
    {
        let popupStr;
        if (dmsStatus === true) {
            popupStr = latlngToString(ddToDms(latlng));

        } else if (dmsStatus === false) {
            popupStr = latlngToString(latlng);
        }

        this.geoJSON = {
            'type': 'Feature',
            'properties': {
                'name': 'usrWP' + WPNo,
                'no': WPNo,
                'latlng': latlng,
                'popupContent': 'This waypoint is located at ' + popupStr
            },
            'geometry': {
                'type': 'Point',
                'coordinates': [latlng.lng, latlng.lat]
            }
        }

        this.html = {
            'idName': 'usrWPCoord' + WPNo
        };

        // Adding the new waypoint to the user waypoint collection.
        usrWPCollection.push(this);

        // Adding the coordinate to the pane
        addCoordEl(usrWPCollection[usrWPCollection.length - 1]!);
    }

    // Adding the necessary leaflet properties.
    addLeafletProps() {
        // Used for accessing the property within the leaflet methods.
        let self = this;

        this.Leaflet = L.geoJSON(this.geoJSON, {
            pointToLayer: function (_feature, latlng) {
                let marker = L.circleMarker(latlng, {
                    radius: 7,
                    fillColor: "#ef0a0a",
                    color: "#cc0000",
                    weight: 3,
                    opacity: 1,
                    fillOpacity: 0.8,

                    pane: 'waypoints'
                });

                // Allowing a circle marker to be dragged.
                function circleMarkerDrag(e: L.LeafletMouseEvent) {
                    marker.setLatLng(e.latlng);
                    marker.redraw();
                }

                // Preventing the propagation of the click event occurring after the mouse up event.
                function captureClick(e: Event) {
                    e.stopPropagation();
                    window.removeEventListener('click', captureClick, true);
                }

                // Highlighting the marker, when mouseover in coordinate pane.
                const el = document.querySelector('#' + self.html.idName);
                if (el) {
                    el.addEventListener('mouseover', () => {
                        marker.setStyle({
                            radius: 14,
                            fillColor: "#ef0a0a",
                            color: "#cc0000",
                            weight: 3,
                            opacity: 1,
                            fillOpacity: 0.8,

                            pane: 'waypoints'
                        });
                    });

                    // Making the marker normal again, when the mouse is no longer over it.
                    el.addEventListener('mouseout', () => {
                        marker.setStyle({
                            radius: 7,
                            fillColor: "#ef0a0a",
                            color: "#cc0000",
                            weight: 3,
                            opacity: 1,
                            fillOpacity: 0.8,

                            pane: 'waypoints'
                        })
                    });
                }

                // Dragging the marker.
                marker.addEventListener('mousedown', () => {
                    // Disabling the possibility to drag the map.
                    map.dragging.disable();

                    // Redrawing the marker to match the current mouse location.
                    map.on('mousemove', circleMarkerDrag);


                });

                // Setting the marker, after it has been dragged.
                marker.addEventListener('mouseup', (event) => {
                    // Prevents the click from propagating and adding a new waypoint.
                    window.addEventListener('click', captureClick, true);

                    marker.setLatLng(event.latlng);

                    // Updating the coordinates in the this.geojson.geometry.coordinates property.
                    let newLatlng = marker.getLatLng();
                    const el = document.querySelector('#' + self.html.idName);
                    if (el) {
                        let coordEl = el.firstChild as HTMLInputElement;
                        self.geoJSON.geometry.coordinates = [newLatlng.lng, newLatlng.lat];

                        // Setting the value in the coordinate pane.
                        if (dmsStatus === true ) {
                            coordEl.value = latlngToString(ddToDms(newLatlng));

                        } else if (dmsStatus === false) {
                            coordEl.value = latlngToString(newLatlng);
                        }
                    }

                    // Removing the event listeners that allows the marker to be dragged.
                    map.off('mousemove', circleMarkerDrag);

                    // Enabling the possibility to drag the map.
                    map.dragging.enable();

                    // Updating the directions.
                    updateDirections();
                });

                // Removing the marker.
                marker.addEventListener('contextmenu', () => {
                    const el = document.querySelector('#' + self.html.idName);
                    if (el) el.remove();
                    rmvUsrWP(self);

                    map.dragging.enable();

                    // Updating the directions.
                    updateDirections();
                });

                return marker;
            }
        });
    }
}


/*** Functions ***/

// Adding a new user waypoint.
export function addUsrWP(event: L.LeafletMouseEvent) {
    if (mapMode === true) {

        // Initiating the new user defined waypoint. Increment wpNo to always ensure a unique waypoint name.
        let usrWP = new UsrGeoJSONWP(wpNo++, event.latlng);

        // Adding the necessary leaflet properties.
        usrWP.addLeafletProps();

        usrWPLayerGroup.addLayer(usrWPCollection[usrWPCollection.length - 1]!.Leaflet);

        // Retrieving the directions.
        let usrWPCLength = usrWPCollection.length;
        if (usrWPCLength > 1) {
            getDirections(usrWPCollection[usrWPCLength - 2]!.geoJSON.geometry.coordinates,
                usrWPCollection[usrWPCLength - 1]!.geoJSON.geometry.coordinates);
        }

    } else {
        console.log('Something, something the dark side.');
    }
}


// Removing a user determined waypoint
export function rmvUsrWP(usrWPObj: UsrGeoJSONWP) {
    // Finding the index of the waypoint.
    let elIdx = usrWPCollection.findIndex((obj) => obj === usrWPObj);

    // Removing the waypoint layer and deleting it from the collection.
    usrWPLayerGroup.removeLayer(usrWPCollection[elIdx]!.Leaflet);
    usrWPCollection.splice(elIdx, 1);

    // Updating the directions.
    updateDirections();
}



/***********************
 *** EVENT LISTENERS ***
 ***********************/

// Add user waypoint on click.
map.addEventListener('click', addUsrWP as any);
