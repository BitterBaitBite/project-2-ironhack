

function initMap() {

    const elmLng = document.querySelector("input[name = 'latitude']")
    const elmLat = document.querySelector("input[name = 'longitude']")
    let marker = undefined
    const eventMap = new google.maps.Map(
        document.querySelector('#mapTest'),
        {
            zoom: 16,
            center: { lat: 40.392499, lng: -3.698214 },
            // styles: mapStyles.electric
        }
    )

    // google.maps.event.addListener(eventMap, 'click', function (event) {
    //     placeMarker(event.latLng);
    // });

    google.maps.event.addListener(eventMap, "click", function (event) {
        console.log(eventMap)
        let latitude = event.latLng.lat();
        let longitude = event.latLng.lng();
        console.log(latitude + ', ' + longitude);


        marker && marker.setMap(null)

        marker = new google.maps.Marker({
            map: eventMap,
            position: { lat: latitude, lng: longitude },

        });



        elmLat.value = latitude
        elmLng.value = longitude

        // radius = new google.maps.Circle({
        //     map: eventMap,
        //     radius: 500,
        //     center: event.latLng,
        //     fillColor: '#777',
        //     fillOpacity: 0.1,
        //     strokeColor: '#AA0000',
        //     strokeOpacity: 0.8,
        //     strokeWeight: 2,
        //     draggable: true,    // Dragable
        //     editable: true      // Resizable
        // });

        // Center of map
        eventMap.panTo(new google.maps.LatLng(latitude, longitude));
    })

}


function initDetailsMap() {


    const elmLng = Number(document.querySelector("input[name = 'latitude']").value)
    const elmLat = Number(document.querySelector("input[name = 'longitude']").value)
    let marker = undefined

    const detailsMap = new google.maps.Map(
        document.querySelector('#untouchableMap'),
        {
            zoom: 16,
            center: { lat: elmLat, lng: elmLng },
            // styles: mapStyles.electric
        }
    )

    marker = new google.maps.Marker({
        map: detailsMap,
        position: { lat: elmLat, lng: elmLng },
    });


}


function initgeoCoderMap() {

    const MAPS_KEY = 'AIzaSyC0b2WZqMlyFpOOXl8jrjNUaERWuyj8F_Y'

    const geocoder = new google.maps.Geocoder();

    // 2. The text address that you want to convert to coordinates
    const inputs = document.querySelectorAll('.addressInput')


    inputs.forEach((input) => input.oninput = e => {

        const inputElm = [...inputs]
        const inputValues = inputElm.map(elm => elm.value)
        const address = inputValues.join('%2B')
        const apiKey = `&key=${MAPS_KEY}`
        const apiString = `https://maps.googleapis.com/maps/api/geocode/json?address=`
        console.log(address)

        const fullAddress = apiString + address + apiKey

        axios.get(fullAddress).then((response)=>console.log(response.data))
    })

}
    // 3. Obtain coordinates from the API
//     geocoder.geocode({ address: address }, (results, status) => {
//         if (status === "OK") {
//             // Display response in the console
//             console.log(results);
//         } else {
//             alert("Geocode error: " + status);
//         }
//     });
// }



 //end addListener