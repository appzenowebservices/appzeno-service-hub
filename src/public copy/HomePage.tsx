import PublicLayout      from "../../components/layout/PublicLayout";
import HeroBanner        from "../../components/home/HeroBanner";
import PopularCategories from "../../components/home/PopularCategories";
import HowItWorks        from "../../components/home/HowItWorks";
import WhyChooseADDies   from "../../components/home/WhyChooseADDies";
import BecomeVendorCTA   from "../../components/home/BecomeVendorCTA";
import Testimonials      from "../../components/home/Testimonials";

export default function HomePage() {
  return (
    <PublicLayout>
      <HeroBanner />
      <PopularCategories />
      <HowItWorks />
      <WhyChooseADDies />
      <BecomeVendorCTA />
      <Testimonials />
    </PublicLayout>
  );
}
