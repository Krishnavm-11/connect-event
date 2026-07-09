import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Categories from "../components/Categories";
import FeaturedEvents from "../components/FeaturedEvents";
import Footer from "../components/Footer";


function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Categories />
      <FeaturedEvents />
      <Footer />
    </>
  );
}

export default Home;