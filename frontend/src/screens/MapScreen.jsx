import MapView, { Marker } from 'react-native-maps';

export default function Map() {
  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{
        latitude: 45.6427,
        longitude: 25.5887,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
      showsUserLocation={true} // punctul albastru GPS
    >
      {/* Pin AED */}
      <Marker
        coordinate={{ latitude: 45.644, longitude: 25.590 }}
        title="AED - Mall Coresi"
        description="Disponibil 08:00 - 22:00"
        pinColor="red"
      />
    </MapView>
  );
}