"use client";

import { useEffect, useState } from "react";

import Scene01Signal from "./Scene01Signal";
import Scene02Restore from "./Scene02Restore";
import Scene03Memory from "./Scene03Memory";
import Scene04Photos from "./Scene04Photos";

export default function FinalCinematic() {
  const [scene, setScene] = useState(1);
  const [fragments, setFragments] = useState(0);

  useEffect(() => {
    if (scene !== 1) return;

    const timer = setTimeout(() => {
      setScene(2);
    }, 7000);

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
    if (scene !== 2) return;
    if (fragments < 12) return;

    const timer = setTimeout(() => {
      setScene(3);
    }, 3000);

    return () => clearTimeout(timer);
  }, [scene, fragments]);

  useEffect(() => {
    if (scene !== 3) return;

    const timer = setTimeout(() => {
      setScene(4);
    }, 12000);

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

    default:
      return <Scene04Photos />;
  }
}