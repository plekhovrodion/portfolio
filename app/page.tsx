import { PortfolioExperience } from "@/components/portfolio/portfolio-experience";
import { ProfileCardHero } from "@/components/portfolio/profile-card-hero";

export default function Home() {
  return <PortfolioExperience hero={<ProfileCardHero />} />;
}
