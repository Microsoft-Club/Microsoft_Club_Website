import clubLogo from '../assets/club-logo.png';

const Footer = () => {
  return (
    <footer className="border-t-4 border-black bg-primaryDark text-white mt-8">
      <div className="max-w-6xl mx-auto px-4 py-4 md:px-8 md:py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <img
            src={clubLogo}
            alt="Microsoft Club GIKI logo"
            className="w-8 h-8 object-contain bg-white border-2 border-black"
          />
          <p className="font-body">
          © {new Date().getFullYear()} Microsoft Club GIKI. All rights
          reserved.
          </p>
        </div>
        <div className="flex gap-4 flex-wrap justify-center md:justify-end">
          <a
            href="#"
            className="underline underline-offset-2 hover:text-purpleAccent"
          >
            Instagram
          </a>
          <a
            href="#"
            className="underline underline-offset-2 hover:text-purpleAccent"
          >
            LinkedIn
          </a>
          <a
            href="#"
            className="underline underline-offset-2 hover:text-purpleAccent"
          >
            YouTube
          </a>
          <a
            href="#"
            className="underline underline-offset-2 hover:text-purpleAccent"
          >
            WhatsApp Community
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

