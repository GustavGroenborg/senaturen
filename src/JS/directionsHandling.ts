import L from 'leaflet';
import { map, mapboxAccessToken, usrWPCollection, setTotalDistance, addTotalDistance } from './appState';
import { updateTotalDistance } from './menuPane';

// Used for directions.
export const directionsLayerGroup = L.layerGroup().addTo(map);
// @ts-ignore
directionsLayerGroup.setZIndex(3);
export let directionsArr: any[] = [];


// Directions class.
export class GeojsonDirections {
    type: string;
    properties: any;
    geometry: any;

    constructor(name: string, routesArr: any) {
        this.type = "Feature";
        this.properties = {
            "name": name
        };
        this.geometry = {
            "type": "LineString",
            "coordinates": routesArr
        };
    }

    // Adds the route to the map.
    addToMap() {
        let locArr = [this, L.geoJSON(this as any, {
            pane: 'direction',
            style: {
                // @ts-ignore
                interactive: false
            }
        })];

        directionsArr.push(locArr);

        directionsLayerGroup.addLayer(directionsArr[directionsArr.length - 1][1]);
    }
}


// Connecting the waypoints with the route.
export function connectEnds(startCoordArr: any, endCoordArr: any) {
    // This constructor like function is created in this scope, because it will only be used in this scope.
    let ConnectEnds = (coordArr: any) => {
        return {
            'type': 'Feature',
            'properties': {
                'name': 'connectingEnds' + coordArr.toString()
            },
            'geometry': {
                'type': 'LineString',
                'coordinates': coordArr
            }
        };
    }

    // Defining the style of the connecting ends linestring.
    let style = {
        dashArray: '3, 7',
        color: '#cc0000',
        weight: 2,

        fill: true,
        fillColor: '#ef0a0a',
        fillOpacity: 0.8
    };

    // Initiating the start and end.
    let connectStart = ConnectEnds(startCoordArr);
    let connectEnd = ConnectEnds(endCoordArr);

    // Calculating the distance.
    addDistanceFromRouteArr(connectStart.geometry.coordinates);
    addDistanceFromRouteArr(connectEnd.geometry.coordinates);

    // Adding the start to the map
    directionsArr.push([connectStart, L.geoJSON(connectStart as any, style as any)]);
    directionsLayerGroup.addLayer(directionsArr[directionsArr.length - 1][1]);

    // Adding the end to the map
    directionsArr.push([connectEnd, L.geoJSON(connectEnd as any, style as any)]);
    directionsLayerGroup.addLayer(directionsArr[directionsArr.length - 1][1]);
}

// Fetching the directions.
export async function fetchDirections(startCoordsArr: any, endCoordsArr: any) {
    let query = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/walking/${startCoordsArr};${endCoordsArr}?steps=true&geometries=geojson&overview=full&access_token=${mapboxAccessToken}`,
        {method: 'GET'}
    );

    return await query.json();
}


// Requesting directions.
export async function getDirections(startCoordsArr: any, endCoordsArr: any) {
    if (usrWPCollection.length > 1) {
        let data = await fetchDirections(startCoordsArr, endCoordsArr);
        let route = data.routes[0].geometry.coordinates;

        // Adding the distance to from the new route to total distance.
        addDistanceFromRouteArr(route);

        // Adding the new directions to the map
        let directions = new GeojsonDirections(data.waypoints[0].name, route);
        directions.addToMap();


        // Connecting the ends
        let routeStart = route[0];
        let routeEnd = route[route.length - 1];
        connectEnds([startCoordsArr, routeStart], [endCoordsArr, routeEnd]);

    }
}


// Removing directions.
export function removeDirections() {
    // Resetting the distance.
    setTotalDistance(0);
    updateTotalDistance();

    // Removing all the layers.
    directionsLayerGroup.clearLayers();

    // Deleting all contents of the array.
    directionsArr.splice(0);
}


// Updating directions.
export function updateDirections() {
    // Removing all existing directions.
    removeDirections();

    // Getting new directions.
    if (usrWPCollection.length > 1) {
        for (let i = 1; i < usrWPCollection.length; i++) {
            getDirections(usrWPCollection[i - 1].geoJSON.geometry.coordinates, usrWPCollection[i].geoJSON.geometry.coordinates);
        }
    }
}

export function addDistanceFromRouteArr(routeArr: any[]) {
    for (let i = 1; i < routeArr.length; i++) {
        const latLng1 = L.latLng(routeArr[i-1][1], routeArr[i-1][0]);
        const latLng2 = L.latLng(routeArr[i][1], routeArr[i][0]);
        addTotalDistance(map.distance(latLng1, latLng2) / 1000);
    }
    updateTotalDistance();
}
