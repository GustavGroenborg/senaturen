import L from 'leaflet';

declare module 'leaflet' {
    interface LayerGroup {
        unbindAllPopups(): void;
        bindAllPopups(popupOptions?: any): void;
    }
    interface Layer {
        moveMarker(latlng: L.LatLngExpression): void;
        getMarkerLatLng(): L.LatLng | undefined;
    }
}

/*** Additions to the Layer Group Class ***/
// @ts-ignore
L.LayerGroup.include({
    // Unbinding all popups.
    unbindAllPopups: function (this: L.LayerGroup) {
        // @ts-ignore
        for (let superLayer in this._layers) {
            // @ts-ignore
            let subLayer = this._layers[superLayer]._layers;

            for (let baseLayer in subLayer) {
                subLayer[baseLayer].unbindPopup();
            }
        }
    },


    // Binding all popups.
    bindAllPopups: function (this: L.LayerGroup, popupOptions: any) {
        // @ts-ignore
        for (let superLayer in this._layers) {
            // @ts-ignore
            let subLayer = this._layers[superLayer]._layers;

            for (let baseLayer in subLayer) {
                let layer = subLayer[baseLayer];
                let feature = layer.feature;

                if (feature.properties && feature.properties.popupContent) {
                    layer.bindPopup(feature.properties.popupContent, popupOptions);
                }
            }
        }
    }
});



/*** Additions to the Layer class ***/
// @ts-ignore
L.Layer.include({
    // Moving a circle marker.
    moveMarker: function (this: any, latlng: L.LatLngExpression) {
        for (let layer in this._layers) {
            let marker = this._layers[layer];

            marker.setLatLng(latlng);
        }
    },

    // Getting the latlng object.
    getMarkerLatLng: function(this: any) {
        let latlng;

        for (let layer in this._layers) {
            latlng = this._layers[layer]._latlng;
        }

        console.log(latlng);
        return latlng;
    }
});
