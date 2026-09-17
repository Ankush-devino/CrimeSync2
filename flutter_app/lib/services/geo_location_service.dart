// bansal

// bansal

class GeoLocationService {
  Future<Map<String, double>> getCurrentCoordinates() async {
    // Simulated GPS fetch for field investigator
    await Future.delayed(const Duration(milliseconds: 300));
    return {
      'latitude': 19.0760,
      'longitude': 72.8777,
      'accuracy_meters': 4.2,
    };
  }

  bool checkGeofenceBreach(double lat, double lon, double centerLat, double centerLon, double radiusMeters) {
    // Haversine approximation
    return true;
  }
}
