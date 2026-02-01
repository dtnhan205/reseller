import { Link } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { Heart, MessageCircle, Send, Shield } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16 sm:mt-20 md:mt-24 pb-6 sm:pb-8">
      <div 
        className="droplet-container p-6 sm:p-8 md:p-10"
        style={{
          background: 'rgba(255, 255, 255, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: `
            0 36px 108px -18px rgba(0, 0, 0, 0.65),
            0 28px 84px -16px rgba(0, 0, 0, 0.6),
            0 20px 60px -12px rgba(0, 0, 0, 0.5),
            0 12px 36px -8px rgba(0, 0, 0, 0.4),
            0 6px 18px -4px rgba(0, 0, 0, 0.3),
            inset 0 3px 0 0 rgba(255, 255, 255, 0.4),
            inset 0 6px 12px 0 rgba(255, 255, 255, 0.2),
            inset -4px -4px 10px 0 rgba(255, 255, 255, 0.2),
            inset -6px -6px 14px 0 rgba(255, 255, 255, 0.12),
            inset 5px 5px 10px 0 rgba(0, 0, 0, 0.18),
            inset 7px 7px 14px 0 rgba(0, 0, 0, 0.12),
            -3px 0 10px 0 rgba(0, 0, 0, 0.2),
            3px 0 10px 0 rgba(0, 0, 0, 0.15),
            0 0 0 1px rgba(255, 255, 255, 0.12),
            0 0 30px rgba(255, 255, 255, 0.06)
          `,
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Brand Section */}
          <div 
            className="droplet-container p-4 sm:p-5 space-y-3 sm:space-y-4 relative"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: `
                0 4px 8px -2px rgba(0, 0, 0, 0.3),
                0 2px 4px -1px rgba(0, 0, 0, 0.2),
                inset 0 1px 0 0 rgba(255, 255, 255, 0.2),
                inset -1px -1px 2px 0 rgba(255, 255, 255, 0.1),
                inset 1px 1px 2px 0 rgba(0, 0, 0, 0.08),
                0 0 0 1px rgba(255, 255, 255, 0.05)
              `,
            }}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div 
                className="water-droplet w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(7px) saturate(200%)',
                  WebkitBackdropFilter: 'blur(7px) saturate(200%)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: `
                    0 20px 60px -12px rgba(0, 0, 0, 0.5),
                    0 12px 40px -8px rgba(0, 0, 0, 0.4),
                    0 4px 16px -4px rgba(0, 0, 0, 0.3),
                    inset 0 1px 0 0 rgba(255, 255, 255, 0.4),
                    inset -2px -2px 4px 0 rgba(255, 255, 255, 0.2),
                    inset 2px 2px 4px 0 rgba(0, 0, 0, 0.1),
                    0 0 0 1px rgba(255, 255, 255, 0.1)
                  `,
                }}
              >
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white relative z-10" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                {t('footer.brand')}
              </h3>
            </div>
            <p className="text-white/90 text-sm sm:text-base leading-relaxed">
              {t('footer.description')}
            </p>
          </div>

          {/* Quick Links */}
          <div 
            className="droplet-container p-4 sm:p-5 space-y-3 sm:space-y-4 relative"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: `
                0 4px 8px -2px rgba(0, 0, 0, 0.3),
                0 2px 4px -1px rgba(0, 0, 0, 0.2),
                inset 0 1px 0 0 rgba(255, 255, 255, 0.2),
                inset -1px -1px 2px 0 rgba(255, 255, 255, 0.1),
                inset 1px 1px 2px 0 rgba(0, 0, 0, 0.08),
                0 0 0 1px rgba(255, 255, 255, 0.05)
              `,
            }}
          >
            <h4 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link 
                  to="/about"
                  className="text-white/90 hover:text-white transition-all duration-300 text-sm sm:text-base flex items-center gap-2 group relative"
                >
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10">{t('footer.about')}</span>
                  <span className="absolute left-0 w-0 h-full bg-cyan-400/10 rounded-lg group-hover:w-full transition-all duration-300 -z-0" />
                </Link>
              </li>
              <li>
                <Link 
                  to="/support"
                  className="text-white/90 hover:text-white transition-all duration-300 text-sm sm:text-base flex items-center gap-2 group relative"
                >
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10">{t('footer.support')}</span>
                  <span className="absolute left-0 w-0 h-full bg-cyan-400/10 rounded-lg group-hover:w-full transition-all duration-300 -z-0" />
                </Link>
              </li>
              <li>
                <Link 
                  to="/privacy"
                  className="text-white/90 hover:text-white transition-all duration-300 text-sm sm:text-base flex items-center gap-2 group relative"
                >
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10">{t('footer.privacy')}</span>
                  <span className="absolute left-0 w-0 h-full bg-cyan-400/10 rounded-lg group-hover:w-full transition-all duration-300 -z-0" />
                </Link>
              </li>
              <li>
                <Link 
                  to="/terms"
                  className="text-white/90 hover:text-white transition-all duration-300 text-sm sm:text-base flex items-center gap-2 group relative"
                >
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10">{t('footer.terms')}</span>
                  <span className="absolute left-0 w-0 h-full bg-cyan-400/10 rounded-lg group-hover:w-full transition-all duration-300 -z-0" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div 
            className="droplet-container p-4 sm:p-5 space-y-3 sm:space-y-4 relative"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: `
                0 4px 8px -2px rgba(0, 0, 0, 0.3),
                0 2px 4px -1px rgba(0, 0, 0, 0.2),
                inset 0 1px 0 0 rgba(255, 255, 255, 0.2),
                inset -1px -1px 2px 0 rgba(255, 255, 255, 0.1),
                inset 1px 1px 2px 0 rgba(0, 0, 0, 0.08),
                0 0 0 1px rgba(255, 255, 255, 0.05)
              `,
            }}
          >
            <h4 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">
              {t('footer.contact')}
            </h4>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <a 
                  href="https://zalo.me/0342031354"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/90 hover:text-white transition-all duration-300 text-sm sm:text-base flex items-center gap-2 group relative"
                >
                  <div 
                    className="water-droplet w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center flex-shrink-0 relative z-10"
                    style={{
                      background: 'rgba(59, 130, 246, 0.2)',
                      backdropFilter: 'blur(20px) saturate(200%)',
                      WebkitBackdropFilter: 'blur(20px) saturate(200%)',
                      border: '1px solid rgba(59, 130, 246, 0.4)',
                      boxShadow: `
                        0 4px 8px -2px rgba(59, 130, 246, 0.3),
                        0 2px 4px -1px rgba(59, 130, 246, 0.2),
                        inset 0 1px 0 0 rgba(255, 255, 255, 0.3),
                        inset -1px -1px 2px 0 rgba(255, 255, 255, 0.15),
                        inset 1px 1px 2px 0 rgba(0, 0, 0, 0.08),
                        0 0 0 1px rgba(59, 130, 246, 0.2)
                      `,
                    }}
                  >
                    <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 group-hover:text-blue-300 transition-colors relative z-10" />
                  </div>
                  <span className="relative z-10">{t('footer.zalo')}</span>
                  <span className="absolute left-0 w-0 h-full bg-blue-400/10 rounded-lg group-hover:w-full transition-all duration-300 -z-0" />
                </a>
              </li>
              <li>
                <a 
                  href="https://t.me/dtnregedit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/90 hover:text-white transition-all duration-300 text-sm sm:text-base flex items-center gap-2 group relative"
                >
                  <div 
                    className="water-droplet w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center flex-shrink-0 relative z-10"
                    style={{
                      background: 'rgba(6, 182, 212, 0.2)',
                      backdropFilter: 'blur(20px) saturate(200%)',
                      WebkitBackdropFilter: 'blur(20px) saturate(200%)',
                      border: '1px solid rgba(6, 182, 212, 0.4)',
                      boxShadow: `
                        0 4px 8px -2px rgba(6, 182, 212, 0.3),
                        0 2px 4px -1px rgba(6, 182, 212, 0.2),
                        inset 0 1px 0 0 rgba(255, 255, 255, 0.3),
                        inset -1px -1px 2px 0 rgba(255, 255, 255, 0.15),
                        inset 1px 1px 2px 0 rgba(0, 0, 0, 0.08),
                        0 0 0 1px rgba(6, 182, 212, 0.2)
                      `,
                    }}
                  >
                    <Send className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 group-hover:text-cyan-300 transition-colors relative z-10" />
                  </div>
                  <span className="relative z-10">{t('footer.telegram')}</span>
                  <span className="absolute left-0 w-0 h-full bg-cyan-400/10 rounded-lg group-hover:w-full transition-all duration-300 -z-0" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-6 sm:mb-8" />

        {/* Copyright */}
        <div 
          className="droplet-container p-4 sm:p-5"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(7px) saturate(200%)',
              WebkitBackdropFilter: 'blur(7px) saturate(200%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: `
              0 4px 8px -2px rgba(0, 0, 0, 0.3),
              0 2px 4px -1px rgba(0, 0, 0, 0.2),
              inset 0 1px 0 0 rgba(255, 255, 255, 0.15),
              inset -1px -1px 2px 0 rgba(255, 255, 255, 0.08),
              inset 1px 1px 2px 0 rgba(0, 0, 0, 0.06),
              0 0 0 1px rgba(255, 255, 255, 0.05)
            `,
          }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <p className="text-white/70 text-xs sm:text-sm">
              © {currentYear} {t('footer.brand')}. {t('footer.allRightsReserved')}
            </p>
            <div className="flex items-center gap-1 sm:gap-2 text-white/70 text-xs sm:text-sm">
              <span>{t('footer.madeWith')}</span>
              <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-red-400 fill-red-400 animate-pulse" />
              <span>{t('footer.by')}</span>
              <span className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors cursor-pointer">
                {t('footer.team')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

