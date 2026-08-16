[out:json][timeout:120];
(
  nwr(around:35000,-35.0540248,-58.7617379)["shop"="bakery"]["name"];
  nwr(around:35000,-35.0540248,-58.7617379)["craft"="bakery"]["name"];
  nwr(around:35000,-35.0540248,-58.7617379)["amenity"~"^(restaurant|fast_food|cafe)$"]["name"];
  nwr(around:35000,-35.0540248,-58.7617379)["tourism"~"^(hotel|motel|guest_house|hostel|apartment)$"]["name"];
  nwr(around:35000,-35.0540248,-58.7617379)["amenity"="car_wash"]["name"];
  nwr(around:35000,-35.0540248,-58.7617379)["shop"~"^(laundry|dry_cleaning)$"]["name"];
  nwr(around:35000,-35.0540248,-58.7617379)["landuse"="farmyard"]["name"];
  nwr(around:35000,-35.0540248,-58.7617379)["landuse"="industrial"]["name"];
  nwr(around:35000,-35.0540248,-58.7617379)["man_made"~"^(works|silo|storage_tank)$"]["name"];
  nwr(around:35000,-35.0540248,-58.7617379)["shop"~"^(agrarian|farm)$"]["name"];
  nwr(around:35000,-35.0540248,-58.7617379)["landuse"="greenhouse_horticulture"]["name"];
  nwr(around:35000,-35.0540248,-58.7617379)["building"~"^(greenhouse|industrial|warehouse|farm_auxiliary)$"]["name"];
  nwr(around:35000,-35.0540248,-58.7617379)["industrial"]["name"];
  nwr(around:35000,-35.0540248,-58.7617379)["craft"~"^(brewery|caterer|distillery|winery)$"]["name"];
);
out center tags 400;
