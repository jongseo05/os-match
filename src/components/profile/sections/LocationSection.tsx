"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import type { UserData } from "../../../types/user"

// Google Maps 관련 타입 정의
declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

interface LocationSectionProps {
  userData: UserData
  onUpdate: (data: Partial<UserData>) => void
}

export default function LocationSection({ userData, onUpdate }: LocationSectionProps) {
  const [region, setRegion] = useState(userData.region)
  const [timezone, setTimezone] = useState(userData.timezone)
  const [latitude, setLatitude] = useState(userData.latitude || 0)
  const [longitude, setLongitude] = useState(userData.longitude || 0)
  const [country, setCountry] = useState(userData.country || "")
  const [city, setCity] = useState(userData.city || "")
  const [isEditing, setIsEditing] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const googleMapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const geocoderRef = useRef<any>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate({ region, timezone, latitude, longitude, country, city })
    setIsEditing(false)
  }  // 위도와 경도에서 국가와 도시 정보 가져오기 (역지오코딩)
  const getAddressFromCoordinates = (lat: number, lng: number, saveToDatabase: boolean = false) => {
    if (!window.google || !geocoderRef.current) {
      // Google Maps나 Geocoder가 로드되지 않은 경우 대략적인 위치 추정
      console.log("Google Maps or Geocoder not loaded, using approximate location");
      approximateLocationFromCoordinates(lat, lng, saveToDatabase);
      return;
    }
    
    const latlng = { lat, lng }
    
    try {
      geocoderRef.current.geocode({ location: latlng }, (results: any, status: any) => {
        if (status === "OK") {
          if (results && results[0] && results[0].address_components) {
            // 결과에서 국가와 도시 정보 추출
            let newCountry = ""
            let newCity = ""
            
            for (const component of results[0].address_components) {
              if (component.types.includes("country")) {
                newCountry = component.long_name
              }
              if (component.types.includes("locality") || 
                  component.types.includes("administrative_area_level_1")) {
                newCity = component.long_name
              }
            }
            
            if (newCountry && newCity) {
              setCountry(newCountry)
              setCity(newCity)
              console.log(`Resolved location: ${newCity}, ${newCountry}`)
              
              // 위치 정보를 데이터베이스에 자동으로 저장
              if (saveToDatabase) {
                onUpdate({
                  latitude: lat,
                  longitude: lng,
                  country: newCountry,
                  city: newCity
                });
              }
            } else {
              console.warn("Incomplete location data from geocoder")
              approximateLocationFromCoordinates(lat, lng, saveToDatabase)
            }
          } else {
            console.error("No reverse geocoding results found")
            approximateLocationFromCoordinates(lat, lng, saveToDatabase)
          }
        } else {
          console.error(`Geocoder failed due to: ${status}`)
          
          // Geocoding API 권한 문제가 있을 경우 대략적인 위치 정보 추정
          if (status === "REQUEST_DENIED") {
            // 위도/경도 기반으로 대략적인 위치 추정 (예시 로직)
            approximateLocationFromCoordinates(lat, lng, saveToDatabase)
          }
        }
      })
    } catch (error) {
      console.error("Geocoding error:", error)
      // 에러 발생 시 대략적인 위치 추정
      approximateLocationFromCoordinates(lat, lng, saveToDatabase)
    }
  }
    // Geocoding API가 실패할 경우 위도/경도를 기반으로 대략적인 위치 추정
  const approximateLocationFromCoordinates = (lat: number, lng: number, saveToDatabase: boolean = false) => {
    // 여기서는 간단한 예시로 위도/경도를 기반으로 대륙/지역 추정
    // 실제 정확한 국가/도시를 알기 위해서는 Geocoding API 권한이 필요함
    let estimatedCountry = ""
    let estimatedCity = ""
    
    // 아시아 대략적 위도/경도
    if (lat > 0 && lat < 60 && lng > 60 && lng < 150) {
      if (lng > 115 && lng < 145 && lat > 30 && lat < 45) {
        estimatedCountry = "China/Japan/Korea region"
        estimatedCity = "East Asia"
      } else if (lng > 65 && lng < 90 && lat > 8 && lat < 37) {
        estimatedCountry = "India region"
        estimatedCity = "South Asia"
      } else {
        estimatedCountry = "Asia"
        estimatedCity = "Unknown city"
      }
    } 
    // 유럽 대략적 위도/경도
    else if (lat > 35 && lat < 70 && lng > -10 && lng < 60) {
      estimatedCountry = "Europe"
      estimatedCity = "Unknown European city"
    }
    // 북미 대략적 위도/경도
    else if (lat > 25 && lat < 70 && lng > -170 && lng < -50) {
      estimatedCountry = "North America"
      estimatedCity = "Unknown North American city"
    }
    // 기본값
    else {
      estimatedCountry = "Unknown country"
      estimatedCity = "Unknown city"
    }
    
    setCountry(estimatedCountry)
    setCity(estimatedCity)
    
    // 위치 정보를 데이터베이스에 자동으로 저장
    if (saveToDatabase) {
      onUpdate({
        latitude: lat,
        longitude: lng,
        country: estimatedCountry,
        city: estimatedCity
      });
    }
  }
    // 현재 위치 가져오기
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setLatitude(latitude)
          setLongitude(longitude)
          
          // 위치 좌표로부터 국가/도시 정보 가져오기
          if (window.google && mapLoaded) {
            getAddressFromCoordinates(latitude, longitude, true)
          }
          
          // 맵이 로드되어 있으면 마커와 중앙 위치 업데이트
          if (mapLoaded && googleMapRef.current) {
            const latLng = new window.google.maps.LatLng(latitude, longitude)
            googleMapRef.current.setCenter(latLng)
              if (markerRef.current) {
              // 기존 마커 위치 업데이트
              if ('setPosition' in markerRef.current) {
                // 기존 Marker API 사용
                markerRef.current.setPosition(latLng)
              } else if ('position' in markerRef.current) {
                // AdvancedMarkerElement API 사용
                markerRef.current.position = latLng
              }
            } else {
              // Google Maps API v3.54 이상에서는 AdvancedMarkerElement 사용
              try {
                if (window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement) {
                  // 고급 마커 생성
                  const pinElement = document.createElement('div');
                  pinElement.className = 'custom-marker';
                  pinElement.style.width = '20px';
                  pinElement.style.height = '20px';
                  pinElement.style.borderRadius = '50%';
                  pinElement.style.backgroundColor = '#10B981';
                  pinElement.style.border = '2px solid #000';
                  
                  markerRef.current = new window.google.maps.marker.AdvancedMarkerElement({
                    position: latLng,
                    map: googleMapRef.current,
                    title: "Your Location",
                    content: pinElement
                  });
                } else {
                  // 이전 버전 마커로 폴백
                  markerRef.current = new window.google.maps.Marker({
                    position: latLng,
                    map: googleMapRef.current,
                    title: "Your Location",
                    icon: {
                      path: window.google.maps.SymbolPath.CIRCLE,
                      scale: 10,
                      fillColor: "#10B981",
                      fillOpacity: 1,
                      strokeColor: "#000",
                      strokeWeight: 2,
                    }
                  });
                }
              } catch (error) {
                // 에러 발생 시 기존 마커로 폴백
                markerRef.current = new window.google.maps.Marker({
                  position: latLng,
                  map: googleMapRef.current,
                  title: "Your Location",
                  icon: {
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillColor: "#10B981",
                    fillOpacity: 1,
                    strokeColor: "#000",
                    strokeWeight: 2,
                  }
                });
              }
            }
          }
        },
        (error) => {
          console.error("Error getting current location:", error)
        }
      )
    } else {
      console.error("Geolocation is not supported by this browser.")
    }
  }
      // 구글 맵 API 로드
useEffect(() => {
  // 이미 구글 맵이 로드된 경우 초기화 진행
  if (window.google) {
    setMapLoaded(true)
    return;
  }
  
  // 이미 스크립트가 추가되었는지 확인
  const existingScript = document.getElementById('google-maps-script');
  if (existingScript) {
    // 이미 스크립트가 존재하면 대기
    window.initMap = () => {
      setMapLoaded(true)
    }
    return;
  }

  // 새로운 스크립트 로드
  const loadGoogleMapsApi = () => {
    return new Promise<void>((resolve) => {
      window.initMap = () => {
        setMapLoaded(true)
        resolve()
      }
      
      const script = document.createElement('script')
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      script.id = 'google-maps-script'
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap&loading=async`
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    })
  }
  
  loadGoogleMapsApi()
  
  return () => {
    // 클린업 함수: 컴포넌트가 언마운트될 때 window.initMap 정리
    window.initMap = () => {} 
  }
}, [])// 맵 초기화
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return
      // 맵 생성
    const mapOptions = {
      center: { 
        lat: latitude || 0, 
        lng: longitude || 0 
      },
      zoom: 10,
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      scaleControl: true,
      streetViewControl: false,
      rotateControl: true,
      fullscreenControl: true,
      // 다크 테마 스타일 적용
      styles: [
        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
        { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
        { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
        { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
        { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
        { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
        { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
        { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
        { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
        { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
        { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
        { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
        { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
        { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
      ]
    }
      googleMapRef.current = new window.google.maps.Map(mapRef.current, mapOptions)
    
    // Geocoder 초기화
    if (!geocoderRef.current) {
      geocoderRef.current = new window.google.maps.Geocoder()
    }
      // 사용자가 맵을 클릭할 때 위치 업데이트
    googleMapRef.current.addListener("click", (e: any) => {
      const clickedLat = e.latLng.lat()
      const clickedLng = e.latLng.lng()
      
      setLatitude(clickedLat)
      setLongitude(clickedLng)
      
      // 클릭한 위치의 국가/도시 정보 가져오기 (자동 저장 비활성화)
      getAddressFromCoordinates(clickedLat, clickedLng, false)
        if (markerRef.current) {
        if ('setPosition' in markerRef.current) {
          markerRef.current.setPosition(e.latLng)
        } else if ('position' in markerRef.current) {
          markerRef.current.position = e.latLng
        }
      } else {
        try {
          if (window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement) {
            const pinElement = document.createElement('div');
            pinElement.className = 'custom-marker';
            pinElement.style.width = '20px';
            pinElement.style.height = '20px';
            pinElement.style.borderRadius = '50%';
            pinElement.style.backgroundColor = '#10B981';
            pinElement.style.border = '2px solid #000';
            
            markerRef.current = new window.google.maps.marker.AdvancedMarkerElement({
              position: e.latLng,
              map: googleMapRef.current,
              title: "Selected Location",
              content: pinElement
            });
          } else {
            markerRef.current = new window.google.maps.Marker({
              position: e.latLng,
              map: googleMapRef.current,
              title: "Selected Location",
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: "#10B981",
                fillOpacity: 1,
                strokeColor: "#000", 
                strokeWeight: 2,
              }
            });
          }
        } catch (error) {
          markerRef.current = new window.google.maps.Marker({
            position: e.latLng,
            map: googleMapRef.current,
            title: "Selected Location",
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: "#10B981",
              fillOpacity: 1,
              strokeColor: "#000",
              strokeWeight: 2,
            }
          });
        }
      }
    })
      // 사용자 위치가 이미 저장되어 있으면 마커 생성
    if (latitude && longitude) {
      const latLng = new window.google.maps.LatLng(latitude, longitude)
      try {
        if (window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement) {
          // 고급 마커 사용
          const pinElement = document.createElement('div');
          pinElement.className = 'custom-marker';
          pinElement.style.width = '20px';
          pinElement.style.height = '20px';
          pinElement.style.borderRadius = '50%';
          pinElement.style.backgroundColor = '#10B981';
          pinElement.style.border = '2px solid #000';
          
          markerRef.current = new window.google.maps.marker.AdvancedMarkerElement({
            position: latLng,
            map: googleMapRef.current,
            title: "Your Location",
            content: pinElement
          });
        } else {
          // 기존 마커 사용
          markerRef.current = new window.google.maps.Marker({
            position: latLng,
            map: googleMapRef.current,
            title: "Your Location",
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: "#10B981",
              fillOpacity: 1,
              strokeColor: "#000",
              strokeWeight: 2,
            }
          })
        }
      } catch (error) {
        // 에러 발생시 기본 마커 사용
        markerRef.current = new window.google.maps.Marker({
          position: latLng,
          map: googleMapRef.current,
          title: "Your Location",
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "#10B981",
            fillOpacity: 1,
            strokeColor: "#000",
            strokeWeight: 2,
          }
        })
      }
      
      googleMapRef.current.setCenter(latLng)
    } else {
      // 저장된 위치가 없으면 현재 위치 가져오기
      getCurrentLocation()
    }
  }, [mapLoaded])

  // Sample regions and timezones - in a real app, these would be more comprehensive
  const regions = ["North America", "South America", "Europe", "Africa", "Asia", "Oceania"]

  const timezones = [
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Berlin",
    "Asia/Tokyo",
    "Asia/Singapore",
    "Australia/Sydney",
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white mb-2">Location & Timezone</h2>
        <p className="text-gray-400">
          This information helps us match you with projects and contributors in your region and timezone.
        </p>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="region" className="block text-sm font-medium text-gray-300">
              Region
            </label>
            <select
              id="region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="block w-full px-3 py-2 bg-gray-900/60 border border-gray-700 rounded-md shadow-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
            >
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500">Your region helps us suggest projects in your area.</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="timezone" className="block text-sm font-medium text-gray-300">
              Timezone
            </label>
            <select
              id="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="block w-full px-3 py-2 bg-gray-900/60 border border-gray-700 rounded-md shadow-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
            >
              {timezones.map((tz) => (
                <option key={tz} value={tz}>
                  {tz.replace("_", " ")}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500">Your timezone helps with scheduling and collaboration.</p>
          </div>

          <div className="flex space-x-2 pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white transition-colors duration-300 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-emerald-500"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => {
                setRegion(userData.region)
                setTimezone(userData.timezone)
                setIsEditing(false)
              }}
              className="px-4 py-2 bg-gray-900/60 text-gray-300 text-sm font-medium border border-gray-700 rounded-md hover:bg-gray-800 hover:text-emerald-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-emerald-500"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1 p-3 bg-gray-900/60 rounded-md border border-gray-700">
              <p className="text-sm font-medium text-gray-400">Region</p>
              <p className="text-base text-white">{userData.region}</p>
            </div>

            <div className="space-y-1 p-3 bg-gray-900/60 rounded-md border border-gray-700">
              <p className="text-sm font-medium text-gray-400">Timezone</p>
              <p className="text-base text-white">{userData.timezone.replace("_", " ")}</p>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(true)}
            className="mt-4 px-4 py-2 bg-gray-900/60 border border-gray-700 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-emerald-400 transition-all duration-300"
          >
            Edit Location & Timezone
          </button>
        </div>
      )}      <div className="mt-6 p-4 bg-gray-900/60 rounded-md border border-gray-700">
        <h3 className="text-lg font-medium text-white mb-3">Location Map</h3>        <div className="relative rounded-md overflow-hidden">
          <div 
            ref={mapRef} 
            className="h-80 w-full"
            style={{ borderRadius: "0.375rem", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" }}
          >
            {!mapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-white flex flex-col items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="mt-2">Loading map...</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-2 p-2 bg-gray-800/50 rounded-md">
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-400">
                Timezone: {userData.timezone.replace("_", " ")}
              </div>
              <button
                onClick={getCurrentLocation}
                className="text-xs px-2 py-1 bg-emerald-700 text-white rounded-md hover:bg-emerald-600 transition-colors"
              >
                Get Current Location
              </button>
            </div>            {country && city && (
              <div className="mt-1 text-xs text-gray-300">
                Location: {city}, {country}
              </div>
            )}
            {latitude && longitude && (
              <div className="mt-1 text-xs text-gray-300">
                Coordinates: {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
