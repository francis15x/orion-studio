"use client";

import { useEffect, useState } from "react";

import Scene01Signal from "./Scene01Signal";
import Scene02Restore from "./Scene02Restore";
import Scene03Memory from "./Scene03Memory";
import Scene04Photos from "./Scene04Photos";
import Scene05Reveal from "./Scene05Reveal";
import Scene06Values from "./Scene06Values";
import Scene07Score from "./Scene07Score";
import Scene08Chest from "./Scene08Chest";
import Scene09Ending from "./Scene09Ending";
import Scene10Organizer from "./Scene10Organizer";
export default function FinalCinematic({ teamName }: { teamName: string }) {
  const [scene, setScene] = useState(1);
  const [fragments, setFragments] = useState(0);

  useEffect(() => {
    if (scene !== 1) return;
    const timer = setTimeout(() => setScene(2), 7000);
    return () => clearTimeout(timer);
  }, [scene]);

  useEffect(() => {
    if (scene !== 2) return;

    setFragments(0);

    const interval = setInterval(() => {
      setFragments((value) => {
        if (value >= 12) {
          clearInterval(interval);
          return 12;
        }
        return value + 1;
      });
    }, 450);

    return () => clearInterval(interval);
  }, [scene]);

  useEffect(() => {
    if (scene !== 2 || fragments < 12) return;
    const timer = setTimeout(() => setScene(3), 3000);
    return () => clearTimeout(timer);
  }, [scene, fragments]);

  useEffect(() => {
    if (scene !== 3) return;
    const timer = setTimeout(() => setScene(4), 12000);
    return () => clearTimeout(timer);
  }, [scene]);

  useEffect(() => {
    if (scene !== 4) return;
    const timer = setTimeout(() => setScene(5), 80000);
    return () => clearTimeout(timer);
  }, [scene]);

  useEffect(() => {
    if (scene !== 5) return;
    const timer = setTimeout(() => setScene(6), 18000);
    return () => clearTimeout(timer);
  }, [scene]);

useEffect(() => {
if (scene !== 6) return;
  const timer = setTimeout(() => setScene(7), 17000);
  return () => clearTimeout(timer);
}, [scene]);

useEffect(() => {
  if (scene !== 7) return;
  const timer = setTimeout(() => setScene(8), 8000);
  return () => clearTimeout(timer);
}, [scene]);

useEffect(() => {
    if (scene !== 8) return;

    const timer = setTimeout(() => {
        setScene(9);
    }, 9000);

    return () => clearTimeout(timer);

}, [scene]);

useEffect(() => {
  if (scene !== 9) return;
  const timer = setTimeout(() => setScene(10), 26000);
  return () => clearTimeout(timer);
}, [scene]);

  switch (scene) {
  case 1:
    return <Scene01Signal />;

  case 2:
    return <Scene02Restore fragments={fragments} />;

  case 3:
    return <Scene03Memory />;

  case 4:
    return <Scene04Photos />;

  case 5:
    return <Scene05Reveal />;

  case 6:
    return <Scene06Values />;

  case 7:
    return <Scene07Score teamName={teamName} />;

    case 8:
  return <Scene08Chest teamName={teamName} />;

  case 9:
    return <Scene09Ending />;

    case 10:
  return <Scene10Organizer teamName={teamName} />;

  default:
  return <Scene10Organizer teamName={teamName} />;
}
}