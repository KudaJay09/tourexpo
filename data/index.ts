import {
  beachImg,
  destinationImg,
  hotelImg,
  restaurantImg,
} from "@/public/assets";

export const navItems = [
  {
    name: "Discover",
    link: "/dashboard/travelers-choice",
  },
  {
    name: "Recommendations",
    link: "/dashboard/recommendations",
  },
  {
    name: "Favorites",
    link: "/dashboard/favorites",
  },
  {
    name: "Attractions Test",
    link: "/dashboard/attractions-test",
  },
];

export const TravelersChoiceData = [
  {
    id: 1,
    name: "Destinations",
    description: "Explore the top-rated destinations for 2026.",
    link: "/dashboard/destinations",
    image: destinationImg,
  },
  {
    id: 2,
    name: "Beaches",
    description: "Discover the best beaches around the world.",
    link: "/dashboard/beaches",
    image: beachImg,
  },
  {
    id: 3,
    name: "Hotels",
    description: "Find the most luxurious hotels for your stay.",
    link: "/dashboard/hotels",
    image: hotelImg,
  },
  {
    id: 4,
    name: "Restaurants",
    description: "Savor the finest dining experiences globally.",
    link: "/dashboard/restaurants",
    image: restaurantImg,
  },
];
