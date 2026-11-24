import Seo from '../components/Seo';
import ContactWindow from '../components/board/ContactWindow';

/** Standalone mail page; the phone home screen's Mail app opens it. */
const Contact = () => (
  <div className="space-y-6">
    <Seo title="Contact" description="Write to Microsoft Club GIKI." path="/contact" />
    <h1 className="sr-only">Contact</h1>
    <ContactWindow />
  </div>
);

export default Contact;
