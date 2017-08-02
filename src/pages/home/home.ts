import {Component, ElementRef, ViewChild} from '@angular/core';
import { NavController } from 'ionic-angular';

declare var google;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  @ViewChild('map') mapElement: ElementRef;
  map: any;

  constructor(public navCtrl: NavController) {

  }

  ionViewDidLoad(){
    this.loadMap();
  }

  loadMap(){
    let latLng = new google.maps.LatLng(4.6381938,-74.0862351);

    let mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

   this.AccurateCurrentPosition((e)=>{
     console.log("Pudo con", e);
   },(e)=>{
     console.log("no pudo con", e)
   },(e)=>{
     console.log("esta pensando con", e)
   },{desiredAccuracy:20, maxWait:15000}, this.map)

  }

  AccurateCurrentPosition(geolocationSuccess, geolocationError, geoprogress, options, map){
    var lastCheckedPosition,
      locationEventCount = 0,
      watchID,
      timerID;

    options = options || {};

    var checkLocation = function (position) {
      lastCheckedPosition = position;
      locationEventCount = locationEventCount + 1;
      // We ignore the first event unless it's the only one received because some devices seem to send a cached
      // location even when maxaimumAge is set to zero
      if ((position.coords.accuracy <= options.desiredAccuracy) && (locationEventCount > 1)) {
        clearTimeout(timerID);
        navigator.geolocation.clearWatch(watchID);
        foundPosition(position);
      } else {
        geoprogress(position);
      }
    };

    var stopTrying = function () {
      navigator.geolocation.clearWatch(watchID);
      foundPosition(lastCheckedPosition);
    };

    var onError = function (error) {
      clearTimeout(timerID);
      navigator.geolocation.clearWatch(watchID);
      geolocationError(error);
    };

    var foundPosition = function (position) {
      geolocationSuccess(position);
      let marker = new google.maps.Marker({
        map: map,
        animation: google.maps.Animation.DROP,
        position: map.getCenter()
      });
    };

    if (!options.maxWait)            options.maxWait = 10000; // Default 10 seconds
    if (!options.desiredAccuracy)    options.desiredAccuracy = 20; // Default 20 meters
    if (!options.timeout)            options.timeout = options.maxWait; // Default to maxWait

    options.maximumAge = 0; // Force current locations only
    options.enableHighAccuracy = true; // Force high accuracy (otherwise, why are you using this function?)

    watchID = navigator.geolocation.watchPosition(checkLocation, onError, options);
    timerID = setTimeout(stopTrying, options.maxWait); // Set a timeout that will abandon the location loop
  }

  addMarker(){
    //console.log(this.map.getCenter())
    let marker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: this.map.getCenter()
    });

    let content = "<h4>Information!</h4>";

    this.addInfoWindow(marker, content);

  }

  addInfoWindow(marker, content){

    let infoWindow = new google.maps.InfoWindow({
      content: content
    });

    google.maps.event.addListener(marker, 'click', () => {
      infoWindow.open(this.map, marker);
    });

  }

}
