let MAPS_KEY;

axios.get('/api/key').then((response) => {
	MAPS_KEY = response.data;
});

function initMap() {
	const elmLng = document.querySelector("input[name = 'latitude']");
	const elmLat = document.querySelector("input[name = 'longitude']");
	let marker = undefined;

	const eventMap = new google.maps.Map(document.querySelector('#mapTest'), {
		zoom: 16,
		center: { lat: 40.392499, lng: -3.698214 },
	});

	google.maps.event.addListener(eventMap, 'click', function (event) {
		let latitude = event.latLng.lat();
		let longitude = event.latLng.lng();

		marker && marker.setMap(null);

		marker = new google.maps.Marker({
			map: eventMap,
			position: { lat: latitude, lng: longitude },
		});

		elmLat.value = latitude;
		elmLng.value = longitude;

		// Center of map
		eventMap.panTo(new google.maps.LatLng(latitude, longitude));
	});
}

function initDetailsMap() {
	const elmLng = Number(document.querySelector("input[name = 'latitude']").value);
	const elmLat = Number(document.querySelector("input[name = 'longitude']").value);
	let marker = undefined;

	const detailsMap = new google.maps.Map(document.querySelector('#untouchableMap'), {
		zoom: 16,
		center: { lat: elmLat, lng: elmLng },
	});

	marker = new google.maps.Marker({
		map: detailsMap,
		position: { lat: elmLat, lng: elmLng },
	});
}

function initGeocoderMap() {
	const inputs = document.querySelectorAll('.addressInput');

	let location = { lat: 40.392499, lng: -3.698214 };
	const arr = [...inputs];
	const values = arr.map((el) => el.value);
	const addStr = values.join('%2B');
	const keyStr = `&key=${MAPS_KEY}`;
	const apiStr = `https://maps.googleapis.com/maps/api/geocode/json?address=`;
	const fullStr = apiStr + addStr + keyStr;

	axios.get(fullStr).then((response) => {
		if (response.data.results.length > 0) {
			location = response.data.results[0].geometry.location;
		}

		let petMap = new google.maps.Map(document.querySelector('#petEnabledMap'), {
			zoom: 18,
			center: location,
		});

		let marker = new google.maps.Marker({
			map: petMap,
			position: location,
		});
	});

	// // Api data
	// petMap = new google.maps.Map(document.querySelector('#petEnabledMap'), {
	// 	zoom: 16,
	// 	center: { lat: 40.392499, lng: -3.698214 },
	// });

	// marker = new google.maps.Marker({
	// 	map: petMap,
	// 	position: { lat: 40.392499, lng: -3.698214 },
	// });
	// //

	inputs.forEach(
		(input) =>
			(input.oninput = (e) => {
				const inputElm = [...inputs];
				const inputValues = inputElm.map((elm) => elm.value);
				const address = inputValues.join('%2B');
				const apiKey = `&key=${MAPS_KEY}`;
				const apiString = `https://maps.googleapis.com/maps/api/geocode/json?address=`;

				const fullAddress = apiString + address + apiKey;

				axios
					.get(fullAddress)
					.then((response) => {
						let { location } = response.data.results[0].geometry;

						petMap = new google.maps.Map(document.querySelector('#petEnabledMap'), {
							zoom: 18,
							center: location,
						});

						marker = new google.maps.Marker({
							map: petMap,
							position: location,
						});
					})
					.catch((err) => console.error(err));
			})
	);
}

initGeocoderDisMap = () => {
	const inputs = document.querySelectorAll('.addressInput');

	let location = { lat: 40.392499, lng: -3.698214 };
	const arr = [...inputs];
	const values = arr.map((el) => el.value);
	const addStr = values.join('%2B');
	const keyStr = `&key=${MAPS_KEY}`;
	const apiStr = `https://maps.googleapis.com/maps/api/geocode/json?address=`;
	const fullStr = apiStr + addStr + keyStr;

	axios
		.get(fullStr)
		.then((response) => {
			if (response.data.results.length > 0) {
				location = response.data.results[0].geometry.location;
			}

			let petMap = new google.maps.Map(document.querySelector('#petDisabledMap'), {
				zoom: 18,
				center: location,
			});

			let marker = new google.maps.Marker({
				map: petMap,
				position: location,
			});
		})
		.catch((err) => console.error(err));
};
