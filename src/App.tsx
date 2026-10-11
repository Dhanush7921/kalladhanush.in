import { useCallback, useState } from 'react';
import Intro, { resetIntro, shouldPlayIntro } from './components/Intro';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Hero from './sections/Hero';
import About from './sections/About';
import Projects from './sections/Projects';
import Skills from './sections/Skills';
import Experience from './sections/Experience';
import MyWorld from './sections/MyWorld';
import Vision from './sections/Vision';
import Journal from './sections/Journal';
import Contact from './sections/Contact';

export default function App() {
  const [intro, setIntro] = useState(shouldPlayIntro);
  const finishIntro = useCallback(() => setIntro(false), []);
  const replayIntro = useCallback(() => {
    resetIntro();
    window.scrollTo({ top: 0, behavior: 'auto' });
    setIntro(true);
  }, []);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      {intro && <Intro onDone={finishIntro} />}
      <Navbar hidden={intro} />
      <main id="main" inert={intro}>
        <Hero ready={!intro} />
        <About />
        <Projects />
        <Skills />
        <Experience />
        <MyWorld />
        <Vision />
        <Journal />
        <Contact />
      </main>
      <Footer hidden={intro} onReplayIntro={replayIntro} />
    </>
  );
}
