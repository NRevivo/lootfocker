// Fetch branches and display them on the map
async function loadBranches() {
    try {
      const response = await fetch('/api/branches');
      const branches = await response.json();
  
      branches.forEach(branch => {
        // Adding marker for each branch with Google Maps
        const marker = new google.maps.Marker({
          position: { lat: branch.location.latitude, lng: branch.location.longitude },
          map: map,
          title: branch.name,
        });
  
        const infoWindow = new google.maps.InfoWindow({
          content: `<h3>${branch.name}</h3>
                    <p>${branch.address.street}, ${branch.address.city}, ${branch.address.country}</p>
                    <a href="${branch.navigationLink}" target="_blank">Navigate Here</a>`,
        });
  
        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });
      });
    } catch (error) {
      console.error('Error loading branches:', error);
    }
  }
  
  // Initialize the map and load branches
  function initMap() {
    const map = new google.maps.Map(document.getElementById("map"), {
      center: { lat: 32.100690, lng: 34.827005 },
      zoom: 10,
    });
  
    loadBranches();
  }
  
  window.initMap = initMap;
  