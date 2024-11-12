let map;
let markers = [];

// פונקציה לטעינת הסניפים מהקובץ JSON ולהצגת הרשימה
async function loadBranches() {
    try {
        const response = await fetch('/api/branches'); // עדכן את הנתיב לפי מיקום הקובץ
        const branches = await response.json();
        displayStores(branches);
        addMarkersToMap(branches);
    } catch (error) {
        console.error('Error loading branches:', error);
    }
}

// פונקציה להצגת רשימת הסניפים בטבלה
function displayStores(branches) {
    const storeList = document.getElementById('store-list');
    storeList.innerHTML = ''; // איפוס התוכן הקיים

    branches.forEach(branch => {
        const storeItem = document.createElement('tr');
        storeItem.innerHTML = `
            <td>${branch.name}</td>
            <td>${branch.address.street}, ${branch.address.city}, ${branch.address.country}</td>
        `;
        storeList.appendChild(storeItem);
    });
}


// פונקציה להוספת markers לכל סניף על המפה
function addMarkersToMap(branches) {
    clearMarkers(); // ניקוי markers קיימים
    branches.forEach(branch => {
        const marker = new google.maps.Marker({
            position: { lat: branch.location.latitude, lng: branch.location.longitude },
            map: map,
            icon: {
                url: '/images/lf.png', // הנתיב לתמונה שהגדרת
                scaledSize: new google.maps.Size(20, 20) // גודל חדש, נסה לשנות לפי הצורך
            },
            title: branch.name,
        });
        markers.push(marker);
        
        const infoWindow = new google.maps.InfoWindow({
            content: `<h3>${branch.name}</h3>
                      <p>${branch.address.street}, ${branch.address.city}, ${branch.address.country}</p>
                      <small>${branch.address.zip}</small>`,
        });

        marker.addListener('click', () => {
            infoWindow.open(map, marker);
        });
    });
}


// פונקציה לניקוי markers קיימים מהמפה
function clearMarkers() {
    markers.forEach(marker => marker.setMap(null));
    markers = [];
}

// פונקציה לאתחול המפה והצגת הסניפים
function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 32.100690, lng: 34.827005 },
        zoom: 10,
    });
    loadBranches(); // קריאת הסניפים מקובץ JSON
}

window.initMap = initMap;
