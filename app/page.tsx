"use client"

import { useEffect } from "react";
import Experience from "./component/Experience"
import * as tfvis from '@tensorflow/tfjs-vis'

export default function Home() {

  useEffect(() => {
    tfvis.visor().open()

  }, []);

  return (
      <Experience />

  );
}
