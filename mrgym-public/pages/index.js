import Head from "next/head";
import Header from "../components/Header";
import Hero from "../components/Hero";
import ProgramSection from "../components/ProgramSection";
import TrainersSection from "../components/TrainersSection";
import Testimonial from "../components/Testimonial";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-cream text-ink">
      <Head>
        <title>MrGym</title>
        <meta
          name="description"
          content="MrGym — training programs and membership."
        />
      </Head>
      <Header />
      <Hero />
      <ProgramSection />
      <TrainersSection />
      <Testimonial />
      <Footer />
    </div>
  );
}
