import React from 'react';
import { GoogleMap, InfoWindow, Marker } from '@react-google-maps/api';

const MapRenderer = ({
  center,
  markers,
  selectedPlace,
  onMarkerClick,
  onCloseInfoWindow,
}) => {
  return (
    <GoogleMap
      mapContainerClassName="mapContainer"
      center={center}
      zoom={12}
      options={{ mapTypeControl: false }}
    >
      {markers.map((marker, idx) => (
        <Marker
          key={idx}
          position={{ lat: marker.latitude, lng: marker.longitude }}
          onClick={() => onMarkerClick(marker)}
        />
      ))}
      {selectedPlace && (
        <InfoWindow
          position={{
            lat: selectedPlace.latitude,
            lng: selectedPlace.longitude,
          }}
          onCloseClick={onCloseInfoWindow}
        >
          <div className="infoWindowContent">
            <img
              src={selectedPlace.placeImgUrl || '/images/placeholder.jpg'}
              alt={selectedPlace.locationName}
              className="infoWindowImage"
            />
            <h3>{selectedPlace.locationName}</h3>
            <p>주소: {selectedPlace.formattedAddress}</p>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default MapRenderer;
