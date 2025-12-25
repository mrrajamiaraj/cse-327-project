import api from './api';

class LocationService {
  constructor() {
    this.watchId = null;
    this.isTracking = false;
    this.lastKnownPosition = null;
    this.updateInterval = null;
    this.callbacks = new Set();
  }

  // Start tracking user location (for riders)
  startTracking(options = {}) {
    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 5000,
      updateInterval: 5000, // Update every 5 seconds
      ...options
    };

    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported by this browser');
    }

    this.isTracking = true;

    // Start watching position
    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const locationData = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          speed: position.coords.speed,
          heading: position.coords.heading,
          timestamp: new Date().toISOString(),
          is_moving: this.calculateMovement(position.coords)
        };

        this.lastKnownPosition = locationData;
        this.notifyCallbacks(locationData);

        // Send to server if rider is logged in
        this.updateServerLocation(locationData);
      },
      (error) => {
        console.error('Location tracking error:', error);
        this.notifyCallbacks(null, error);
      },
      {
        enableHighAccuracy: defaultOptions.enableHighAccuracy,
        timeout: defaultOptions.timeout,
        maximumAge: defaultOptions.maximumAge
      }
    );

    // Set up periodic updates
    this.updateInterval = setInterval(() => {
      if (this.lastKnownPosition) {
        this.updateServerLocation(this.lastKnownPosition);
      }
    }, defaultOptions.updateInterval);

    return this.watchId;
  }

  // Stop tracking
  stopTracking() {
    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    this.isTracking = false;
    this.lastKnownPosition = null;
  }

  // Calculate if user is moving based on speed
  calculateMovement(coords) {
    if (!coords.speed) return false;
    return coords.speed > 0.5; // Moving if speed > 0.5 m/s (1.8 km/h)
  }

  // Get current position once
  async getCurrentPosition(options = {}) {
    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
      ...options
    };

    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString()
          };
          resolve(locationData);
        },
        (error) => reject(error),
        defaultOptions
      );
    });
  }

  // Update server with current location (for riders)
  async updateServerLocation(locationData) {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.role === 'rider') {
        await api.post('/rider/location/', {
          lat: locationData.lat,
          lng: locationData.lng,
          heading: locationData.heading,
          speed: locationData.speed ? (locationData.speed * 3.6) : null, // Convert m/s to km/h
          accuracy: locationData.accuracy,
          is_moving: locationData.is_moving
        });
      }
    } catch (error) {
      console.error('Failed to update server location:', error);
    }
  }

  // Get rider location from server
  async getRiderLocation(riderId) {
    try {
      const response = await api.get(`/rider/${riderId}/location/`);
      return response.data;
    } catch (error) {
      console.error('Failed to get rider location:', error);
      return null;
    }
  }

  // Subscribe to location updates
  subscribe(callback) {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  // Notify all callbacks
  notifyCallbacks(location, error = null) {
    this.callbacks.forEach(callback => {
      try {
        callback(location, error);
      } catch (err) {
        console.error('Error in location callback:', err);
      }
    });
  }

  // Calculate distance between two points (Haversine formula)
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  }

  // Calculate estimated time of arrival
  calculateETA(distance, averageSpeed = 30) {
    // distance in km, averageSpeed in km/h
    const timeInHours = distance / averageSpeed;
    const timeInMinutes = Math.round(timeInHours * 60);
    return timeInMinutes;
  }

  // Convert degrees to radians
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Format distance for display
  formatDistance(distance) {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  }

  // Format time for display
  formatTime(minutes) {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
  }

  // Get status
  getStatus() {
    return {
      isTracking: this.isTracking,
      lastKnownPosition: this.lastKnownPosition,
      watchId: this.watchId
    };
  }
}

// Create singleton instance
const locationService = new LocationService();

export default locationService;