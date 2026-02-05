import About from "./Components/About";
import Hero from "./Components/Hero";
import HowItWorks from "./Components/HowItWorks";
import { Navbar } from "./Components/Navbar";

export default function Home() {
  return (
    <div>
      <Navbar />
      <Hero />
      <About />
      <HowItWorks />
    </div>
  );
}
