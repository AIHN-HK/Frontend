import { HomeNavigation } from '../components/HomeNavigation';
import { HomeStory } from '../components/HomeStory';
import { HomeSplash } from '../components/HomeSplash';
import { HomeHero, HomeIntroduction, HomeRiasec, HomeMatches, HomeSkillGap, HomeRoadmap, HomeAdvisor, HomeTrust, HomeFinalCta, HomeFooter } from '../components/HomeSections';
import { useHomeMotion } from '../hooks/useHomeMotion';
import styles from './HomePage.module.css';
import './HomeFonts.css';

export function HomePage() {
  const root = useHomeMotion();
  return <div ref={root} className={styles.page} data-home-editorial="">
    <a href="#main-content" className={styles.skipLink}>Bỏ qua điều hướng</a>
    <HomeNavigation />
    <main id="main-content" tabIndex={-1}>
      <div className={styles.opening} data-home-opening="">
        <HomeSplash />
        <HomeHero />
        <HomeIntroduction />
      </div>
      <HomeStory />
      <HomeRiasec />
      <HomeMatches />
      <HomeSkillGap />
      <HomeRoadmap />
      <HomeAdvisor />
      <HomeTrust />
      <HomeFinalCta />
    </main>
    <HomeFooter />
  </div>;
}
