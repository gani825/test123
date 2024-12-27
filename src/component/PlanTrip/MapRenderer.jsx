import React from "react";
import { GoogleMap, InfoWindow, Marker } from "@react-google-maps/api";

import PolylineRenderer from "./PolylineRenderer";

const MapRenderer = ({
  center,
  markers,
  selectedPlace,
  onMarkerClick,
  onCloseInfoWindow,
  datePaths, // 날짜별 경로와 색상 배열
}) => {
  return (
    <GoogleMap
      mapContainerClassName="mapContainer"
      center={center}
      zoom={12}
      options={{ mapTypeControl: false }}
    >
      {/* 마커 */}
      {markers.map((marker, idx) => (
        <Marker
          key={idx}
          position={{ lat: marker.latitude, lng: marker.longitude }}
          onClick={() => onMarkerClick(marker)}
          icon={{
            url: `https://maps.google.com/mapfiles/ms/icons/${
              ["red", "blue", "green", "yellow", "purple", "orange"][idx % 6]
            }-dot.png`, // 색상 선택
            scaledSize: new window.google.maps.Size(32, 32), // 크기 조정
          }}
        />
      ))}
      {/* 날짜별 폴리라인 */}
      <PolylineRenderer datePaths={datePaths} />

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
              src={selectedPlace.placeImgUrl || "/images/placeholder.jpg"}
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
