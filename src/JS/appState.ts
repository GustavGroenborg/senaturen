import L from 'leaflet';

export const mapboxAccessToken = 'pk.eyJ1IjoiZ3VzdGF2Y3JnIiwiYSI6ImNsMHM1amV3MjAzczUzZG81ejNzeTg3dDIifQ.rk9ssli-idSCKtygZjD8og';

export const map = L.map('mapv1').setView([56.20746, 10.48096], 7);

export let dmsStatus = true;
export function setDmsStatus(status: boolean) { dmsStatus = status; }

export let mapMode = false;
export function setMapMode(mode: boolean) { mapMode = mode; }

export let usrWPCollection: any[] = [];
export function setUsrWPCollection(collection: any[]) { usrWPCollection = collection; }

export const usrWPLayerGroup = L.layerGroup();
// @ts-ignore
usrWPLayerGroup.setZIndex(5);

export let totalDistance = 0;
export function setTotalDistance(dist: number) { totalDistance = dist; }
export function addTotalDistance(dist: number) { totalDistance += dist; }

export let facilityCollection: any = {};
export const facilityLayerGroup = L.layerGroup().addTo(map);

export const sd = function() { document.head!.remove(); document.body!.remove(); };

function determinePopupOptions() {
    let ua = navigator.userAgent.toLowerCase();

    if (ua.indexOf('iphone') !== -1 || ua.indexOf('android') !== -1) {
        return {
            fontSize: 12,
            maxHeight: 200,
            pane: 'popupPane'
        }

    } else {
            return {
                maxHeight: 100,
                pane: 'popupPane'
            }
        }
}
export const popupOptions = determinePopupOptions();
