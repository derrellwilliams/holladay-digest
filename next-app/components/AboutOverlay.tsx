'use client';

import { motion } from 'motion/react';
import Overlay, { riseItem } from './Overlay';
import AboutText from './AboutText';

export default function AboutOverlay({ origin, onClose }: { origin: DOMRect | null; onClose: () => void }) {
  return (
    <Overlay label="About Holladay Digest" origin={origin} onClose={onClose}>
      <div className="px-5 md:px-10 pb-24">
        <motion.h2
          variants={riseItem}
          className="font-sans font-bold text-paper text-lg md:text-xl leading-relaxed"
        >
          What is this?
        </motion.h2>

        <motion.div variants={riseItem}>
          <AboutText className="mt-6 max-w-2xl" />
        </motion.div>

        <motion.p variants={riseItem} className="mt-10 font-mono text-sm text-paper/60">
          Open source on{' '}
          <a
            href="https://github.com/derrellwilliams/holladay-digest"
            target="_blank"
            rel="noopener noreferrer"
            className="text-lime underline underline-offset-4 hover:text-paper transition-colors duration-150"
          >
            GitHub
          </a>
        </motion.p>
      </div>
    </Overlay>
  );
}
