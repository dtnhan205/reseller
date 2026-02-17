import { Link } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { Heart, MessageCircle, Send, Shield, Info, HelpCircle, Scale } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16 sm:mt-20 md:mt-24 pb-6 sm:pb-8">
      <div className="p-6 sm:p-8 md:p-10 rounded-[28px] border border-gray-800/40 bg-slate-900/10 backdrop-blur-md">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-10">
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 flex items-center justify-center flex-shrink-0 rounded-2xl border border-gray-800/50 bg-black/20">
                <Shield className="w-6 h-6 text-indigo-400/80" />
              </div>
              <h3 className="text-xl font-bold text-gray-300">{t('footer.brand')}</h3>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">{t('footer.description')}</p>
          </div>

          <div className="space-y-4">
            <h4 className="text-base font-semibold text-gray-400 flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-500/40" />
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/about"
                  className="text-gray-500 hover:text-indigo-400 text-sm flex items-center gap-2 group transition-colors"
                >
                  <span className="w-1.5 h-1.5 bg-indigo-500/20 rounded-full" />
                  <span>{t('footer.about')}</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/support"
                  className="text-gray-500 hover:text-indigo-400 text-sm flex items-center gap-2 group transition-colors"
                >
                  <span className="w-1.5 h-1.5 bg-indigo-500/20 rounded-full" />
                  <span>{t('footer.support')}</span>
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-base font-semibold text-gray-400 flex items-center gap-2">
              <Scale className="w-4 h-4 text-indigo-500/40" />
              Legal
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/privacy"
                  className="text-gray-500 hover:text-indigo-400 text-sm flex items-center gap-2 group transition-colors"
                >
                  <span className="w-1.5 h-1.5 bg-indigo-500/20 rounded-full" />
                  <span>{t('footer.privacy')}</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-gray-500 hover:text-indigo-400 text-sm flex items-center gap-2 group transition-colors"
                >
                  <span className="w-1.5 h-1.5 bg-indigo-500/20 rounded-full" />
                  <span>{t('footer.terms')}</span>
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-base font-semibold text-gray-400 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-500/40" />
              {t('footer.contact')}
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://zalo.me/0342031354"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-indigo-400 text-sm flex items-center gap-3 group transition-colors"
                >
                  <div className="w-9 h-9 flex items-center justify-center flex-shrink-0 rounded-xl border border-gray-800/40 bg-black/10">
                    <MessageCircle className="w-5 h-5 text-indigo-500/30" />
                  </div>
                  <span>{t('footer.zalo')}</span>
                </a>
              </li>
              <li>
                <a
                  href="https://t.me/dtnregedit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-indigo-400 text-sm flex items-center gap-3 group transition-colors"
                >
                  <div className="w-9 h-9 flex items-center justify-center flex-shrink-0 rounded-xl border border-gray-800/40 bg-black/10">
                    <Send className="w-5 h-5 text-indigo-500/30" />
                  </div>
                  <span>{t('footer.telegram')}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="h-px bg-gray-800/20 mb-6 sm:mb-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-gray-600 text-xs sm:text-sm">
            © {currentYear} {t('footer.brand')}. {t('footer.allRightsReserved')}
          </p>
          <div className="flex items-center gap-1 sm:gap-2 text-gray-600 text-xs sm:text-sm">
            <span>{t('footer.madeWith')}</span>
            <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-rose-900/30 fill-rose-900/10" />
            <span>{t('footer.by')}</span>
            <span className="text-indigo-500/40 font-semibold">
              {t('footer.team')}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
