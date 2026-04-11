import { motion } from "framer-motion";
import { Activity, BellRing, MapPinned } from "lucide-react";
import { Link } from "react-router-dom";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { APP_NAME } from "../utils/constants";

const heroVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

function HomePage() {
  return (
    <div className="page-grid">
      <motion.section
        className="hero-section card-gradient ultra-glass"
        initial="hidden"
        animate="show"
        variants={heroVariants}
      >
        <div className="hero-copy">
          <p className="hero-kicker">Food Rescue Platform</p>
          <h1>{APP_NAME}</h1>
          <p>
            Connect donors, NGOs, and volunteers in real-time to reduce food wastage and deliver
            meals to those who need them most.
          </p>
          <div className="hero-actions">
            <Link to="/auth">
              <Button variant="primary">Get Started</Button>
            </Link>
            <Link to="/donations">
              <Button variant="outline">Explore Donations</Button>
            </Link>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <span className="float-chip chip-orange">Live Matching</span>
          <span className="float-chip chip-green">Real-time Alerts</span>
          <span className="float-chip chip-blue">Map Intelligence</span>
          <div className="hero-orb orb-a" />
          <div className="hero-orb orb-b" />
          <div className="hero-orb orb-c" />
        </div>
      </motion.section>

      <section className="stats-grid">
        <Card
          title="Live Matching"
          subtitle="Location based, instant notifications"
          className="hover-glow"
          delay={0.04}
        >
          <div className="card-icon-line"><MapPinned size={16} /> Donations are matched nearby in seconds.</div>
        </Card>
        <Card
          title="Status Tracking"
          subtitle="Transparent fulfillment flow"
          className="hover-glow"
          delay={0.08}
        >
          <div className="card-icon-line"><Activity size={16} /> PENDING {"->"} ACCEPTED {"->"} PICKED {"->"} DELIVERED.</div>
        </Card>
        <Card
          title="Reliable Logistics"
          subtitle="Map-first operations"
          className="hover-glow"
          delay={0.12}
        >
          <div className="card-icon-line"><BellRing size={16} /> Real-time notifications improve response time.</div>
        </Card>
      </section>
    </div>
  );
}

export default HomePage;
