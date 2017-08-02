import {Component, ElementRef, ViewChild} from '@angular/core';
import {LoadingController, NavController} from 'ionic-angular';
import {FormBuilder, FormGroup} from "@angular/forms";

declare var google;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  @ViewChild('map') mapElement: ElementRef;
  map: any;
  loading:any;
  form: FormGroup;
  markers = [];

  constructor(public navCtrl: NavController, public loadingCtrl: LoadingController,  private  formBuilder: FormBuilder) {
    this.createForm(formBuilder);
  }

  ionViewDidLoad(){
    this.loadMap();
  }

  private createForm(formBuilder: FormBuilder) {
    this.form = formBuilder.group({
      error: ['20'],
      time: ['15000'],
    });
  }

  loadMap(){
    let latLng = new google.maps.LatLng(4.6381938,-74.0862351);

    let mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    this.addMarker();

  }

  AccurateCurrentPosition(geolocationSuccess, geolocationError, geoprogress, options, map, markers){
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
      console.log("como lo hace", map.getCenter());
      console.log("lo que devuleve position", position)
      let marker = new google.maps.Marker({
        map: map,
        animation: google.maps.Animation.DROP,
        position: new google.maps.LatLng(position.coords.latitude,position.coords.longitude)
      });
      markers.push(marker);
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
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });

    this.loading.present();
    this.AccurateCurrentPosition((e)=>{
      console.log("Pudo con", e);
      this.loading.dismiss();
    },(e)=>{
     alert("No pudo");
    },(e)=>{
      console.log("esta pensando con", e)
    },{desiredAccuracy:this.form.controls['error'].value, maxWait:this.form.controls['time'].value}, this.map, this.markers)



  }

  addInfoWindow(marker, content){

    let infoWindow = new google.maps.InfoWindow({
      content: content
    });

    google.maps.event.addListener(marker, 'click', () => {
      infoWindow.open(this.map, marker);
    });

  }

  deleteMarkers() {
    this.clearMarkers();
    this.markers = [];
  }

  clearMarkers() {
    this.setMapOnAll(null);
  }

  setMapOnAll(map) {
    for (let i = 0; i < this.markers.length; i++) {
      this.markers[i].setMap(map);
    }
  }

}
