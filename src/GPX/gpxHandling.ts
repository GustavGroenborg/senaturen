import togpx from 'togpx';
import { directionsArr } from '../JS/directionsHandling';

// Compile GeoJSONData
export function compileDirectionsData() {
    // Creating a geoJSON object.
    let geoJSONData = {
        'type': 'Feature',
        'properties': {
            'name': `usrRoute${Date.now().toString()}`
        },
        'geometry': {
            'type': 'LineString',
            'coordinates': [] as any[]
        }
    };

    // Filling the geoJSON object.
    if (directionsArr.length > 1) {
        for (let el in directionsArr) {
            let data = directionsArr[el][0].geometry.coordinates;
            for (let el in data) {
                geoJSONData.geometry.coordinates.push(data[el]);
            }
        }
    }

    return geoJSONData;
}


// Creates a gpx file.
export function createGpxFile(geoJSONData: any) {
    let data = new Blob([togpx(geoJSONData)], { type: 'application/gpx+xml' });

    return window.URL.createObjectURL(data);
}


// Downloads a gpx file.
export function downloadGpxFile(geoJSONData: any) {
    if (confirm('Do you want to download your route as a GPX-file?')) {
        let fileLink = document.createElement('a');

        fileLink.setAttribute('download', `myRoute${Date.now().toString()}.gpx`);

        fileLink.href = createGpxFile(geoJSONData);

        document.body.appendChild(fileLink);

        // Waiting for the link to be added, and removing it thereafter.
        window.requestAnimationFrame(() => {
            let event = new MouseEvent('click');
            fileLink.dispatchEvent(event);
            document.body.removeChild(fileLink);
        });
    }
}
