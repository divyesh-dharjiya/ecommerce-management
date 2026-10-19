/**
 * Framer Motion's animation engine, loaded lazily by <LazyMotion> in
 * AppProviders. `domMax` includes layout/`layoutId` animations (nav
 * underline, segmented controls, tabs). Splitting it out keeps it off the
 * critical path: components render immediately and start animating once
 * this chunk arrives.
 */
import { domMax } from "framer-motion";

export default domMax;
