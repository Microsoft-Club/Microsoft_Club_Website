import clubLogoWhite from '../assets/club_logo_white.png';

const Footer = () => {
  return (
    <footer className="border-t-4 border-black bg-primaryDark text-white mt-8">
      <div className="max-w-6xl mx-auto px-4 py-4 md:px-8 md:py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <img
            src={clubLogoWhite}
            alt="Microsoft Club GIKI"
            className="h-8 w-auto max-w-[160px] object-contain"
          />
          <p className="font-body">
            © {new Date().getFullYear()} Microsoft Club GIKI. All rights
            reserved.
          </p>
        </div>
        <div className="flex gap-4 flex-wrap justify-center md:justify-end">
          <a
            href="https://www.instagram.com/microsoftclubgiki/?hl=en"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:text-purpleAccent"
          >
            Instagram
          </a>
          <a
            href="https://www.linkedin.com/company/microsoft-club-giki/?viewAsMember=true"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:text-purpleAccent"
          >
            LinkedIn
          </a>
          <a
            href="https://www.youtube.com/@LOGIKALGIKI"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:text-purpleAccent"
          >
            YouTube
          </a>
          <a
            href="https://linktr.ee/MS_clubgiki"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:text-purpleAccent"
          >
            All links
          </a>
          <a
            href="https://chat.whatsapp.com/IGUY9fBM2SRC5baqV5DvoH"
            target="_blank"
            rel="noreferrer"
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

