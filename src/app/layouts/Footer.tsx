'use client';

import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, MessageCircle, Mail, Phone } from 'lucide-react';
import { api } from '~/trpc/react';

export default function Footer() {
  const usefulLinks = [
    { name: 'About Us', link: '/about-us', badge: null },
    { name: 'Contact Us', link: '/contact-us', badge: 'Contact Us' },
    { name: 'Marketplace Disclaimer', link: '/marketplace-disclaimer', badge: 'Marketplace Disclaimer'},
    { name: 'FAQ', link: '/faq', badge: 'FAQ' },
    { name: 'Careers', link: '/careers', badge: 'Careers' }
  ];

  const partnerLinks = [
    { name: "Help Center", link: "help-center" },
    { name: "Privacy Covenants", link: "privacy-covenants" },
    { name: "Partner Program", link: "partner-program" },
    { name: "Terms of Trade", link: "terms-of-trade" },
    { name: "Vendor Registration", link: "vendor-registration" },
    { name: "Delivery Partner Onboarding", link: "delivery-partner-onboarding" }
  ];

  const moreLinks = [
    { name: 'Terms & Conditions', link: '/terms-conditions' },
    { name: 'Privacy Policy', link: '/privacy-policy' },
    { name: 'Refund & Cancellation Policy', link: '/refund-cancellation-policy' },
    { name: 'Shipping / Delivery Policy', link: '/shipping-delivery-policy' },
    { name: 'Grievance Redressal Policy', link: '/grievance-redressal-policy' },
    { name: 'How We Operate', link: '/how-we-operate' }
  ];

  // Fetch categories via TRPC and split into 4 columns
  const { data: categories = [] } = api.category.getAll.useQuery();
  const categoriesPerColumn = Math.ceil((categories?.length || 0) / 4) || 1;
  const categoryColumns = [
    (categories || []).slice(0, categoriesPerColumn),
    (categories || []).slice(categoriesPerColumn, categoriesPerColumn * 2),
    (categories || []).slice(categoriesPerColumn * 2, categoriesPerColumn * 3),
    (categories || []).slice(categoriesPerColumn * 3),
  ];
// console.log(categories);

  return (
    <footer className="w-full bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50 border-t-2 border-gray-200">
      <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 sm:py-8 md:py-10 lg:py-12 xl:py-14">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-12 xl:grid-cols-12 gap-4 xs:gap-5 sm:gap-6 md:gap-6 lg:gap-8 xl:gap-10 mb-6 sm:mb-8 md:mb-10 lg:mb-12">
          
          {/* Company Section */}
          <div className="lg:col-span-2 xl:col-span-2">
            <h3 className="text-sm xs:text-base sm:text-base md:text-lg lg:text-lg xl:text-xl font-bold text-gray-800 mb-2 xs:mb-3 sm:mb-3 md:mb-4 border-b-2 border-blue-400 inline-block pb-1">
              Company
            </h3>
            <ul className="space-y-1.5 xs:space-y-2 sm:space-y-2 md:space-y-2.5">
              {usefulLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.link}
                    className="text-xs xs:text-sm sm:text-sm md:text-base text-gray-600 hover:text-blue-600 hover:translate-x-1 inline-block transition-all duration-200 active:scale-95"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Patronage Links Section */}
          <div className="lg:col-span-2 xl:col-span-2">
            <h3 className="text-sm xs:text-base sm:text-base md:text-lg lg:text-lg xl:text-xl font-bold text-gray-800 mb-2 xs:mb-3 sm:mb-3 md:mb-4 border-b-2 border-cyan-400 inline-block pb-1">
              Patronage
            </h3>
            <ul className="space-y-1.5 xs:space-y-2 sm:space-y-2 md:space-y-2.5">
              {partnerLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.link}
                    className="text-xs xs:text-sm sm:text-sm md:text-base text-gray-600 hover:text-cyan-600 hover:translate-x-1 inline-block transition-all duration-200 active:scale-95"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Policies Links Section */}
          <div className="lg:col-span-2 xl:col-span-2">
            <h3 className="text-sm xs:text-base sm:text-base md:text-lg lg:text-lg xl:text-xl font-bold text-gray-800 mb-2 xs:mb-3 sm:mb-3 md:mb-4 border-b-2 border-sky-400 inline-block pb-1">
              Legal & Policies
            </h3>
            <ul className="space-y-1.5 xs:space-y-2 sm:space-y-2 md:space-y-2.5">
              {moreLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.link}
                    className="text-xs xs:text-sm sm:text-sm md:text-base text-gray-600 hover:text-sky-600 hover:translate-x-1 inline-block transition-all duration-200 active:scale-95"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories Section - Dynamically rendered from shared data */}
          <div className="col-span-1 xs:col-span-2 sm:col-span-2 md:col-span-3 lg:col-span-6 xl:col-span-6">
            <div className="flex flex-row items-center justify-between mb-2 xs:mb-3 sm:mb-3 md:mb-4">
              <h3 className="text-sm xs:text-base sm:text-base md:text-lg lg:text-lg xl:text-xl font-bold text-gray-800 border-b-2 border-blue-500 inline-block pb-1">
                Categories
              </h3>
              <Link 
                href="/categories"
                className="text-xs xs:text-sm sm:text-sm md:text-base font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group active:scale-95"
              >
                <span>see all</span>
                <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
              </Link>
            </div>
            
            <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-3 xs:gap-4 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-8">
              {categoryColumns?.map((column, columnIndex) => (
                <ul key={columnIndex} className="space-y-1.5 xs:space-y-2 sm:space-y-2 md:space-y-2.5">
                  {column.map((category) => (
                    <li key={category?.id}>
                      <Link 
                        href={category?.link ?? `/explore-product/${category?.id}`}
                        className="text-xs xs:text-sm sm:text-sm md:text-base text-gray-600 hover:text-blue-600 hover:translate-x-1 inline-block transition-all duration-200 line-clamp-1 active:scale-95"
                        title={category?.name}
                      >
                        {category?.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        </div>

        {/* Download App & Social Media Section */}
        <div className="border-t-2 border-gray-200 pt-4 xs:pt-5 sm:pt-6 md:pt-7 lg:pt-8 mb-4 xs:mb-5 sm:mb-6 md:mb-7 lg:mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 xs:gap-5 sm:gap-6 md:gap-6 lg:gap-8">
            
            {/* Download App */}
            <div className="flex flex-col xs:flex-row sm:flex-row items-center gap-2 xs:gap-3 sm:gap-3 md:gap-4 w-full md:w-auto justify-center md:justify-start">
              <span className="text-xs xs:text-sm sm:text-sm md:text-base lg:text-base font-semibold text-gray-700 whitespace-nowrap">Download App</span>
              <div className="flex items-center gap-2 xs:gap-2.5 sm:gap-3 md:gap-3 flex-wrap justify-center">
                <Link 
                  href="https://apps.apple.com" 
                  target="_blank"
                  className="transform hover:scale-105 active:scale-95 transition-transform duration-200"
                >
                  <div className="bg-black text-white px-2.5 xs:px-3 sm:px-3.5 md:px-4 py-1.5 xs:py-2 sm:py-2 md:py-2.5 rounded-lg flex items-center gap-1.5 xs:gap-2 hover:bg-gray-800 shadow-md hover:shadow-lg">
                    <svg className="w-4 h-4 xs:w-4 sm:w-5 md:w-5 lg:w-6 h-4 xs:h-4 sm:h-5 md:h-5 lg:h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                    <div className="text-left">
                      <div className="text-[8px] xs:text-[9px] sm:text-[10px] leading-tight">Download on the</div>
                      <div className="text-[10px] xs:text-xs sm:text-sm md:text-sm font-semibold -mt-0.5 leading-tight">App Store</div>
                    </div>
                  </div>
                </Link>

                <Link 
                  href="https://play.google.com" 
                  target="_blank"
                  className="transform hover:scale-105 active:scale-95 transition-transform duration-200"
                >
                  <div className="bg-black text-white px-2.5 xs:px-3 sm:px-3.5 md:px-4 py-1.5 xs:py-2 sm:py-2 md:py-2.5 rounded-lg flex items-center gap-1.5 xs:gap-2 hover:bg-gray-800 shadow-md hover:shadow-lg">
                    <svg className="w-4 h-4 xs:w-4 sm:w-5 md:w-5 lg:w-6 h-4 xs:h-4 sm:h-5 md:h-5 lg:h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                    </svg>
                    <div className="text-left">
                      <div className="text-[8px] xs:text-[9px] sm:text-[10px] leading-tight">GET IT ON</div>
                      <div className="text-[10px] xs:text-xs sm:text-sm md:text-sm font-semibold -mt-0.5 leading-tight">Google Play</div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Social Media */}
            <div className="flex items-center gap-2 xs:gap-2.5 sm:gap-3 md:gap-3 lg:gap-4 flex-wrap justify-center">
              <Link 
                href="https://www.facebook.com/apnidesidukaan" 
                target="_blank"
                aria-label="Facebook"
                className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 bg-gray-800 hover:bg-blue-600 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-md hover:shadow-lg"
              >
                <Facebook className="w-4 h-4 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-6 lg:h-6 text-white" />
              </Link>
              <Link 
                href="https://x.com/apnidesidukaan" 
                target="_blank"
                aria-label="Twitter"
                className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 bg-gray-800 hover:bg-sky-500 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-md hover:shadow-lg"
              >
                <Twitter className="w-4 h-4 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-6 lg:h-6 text-white" />
              </Link>
              <Link 
                href="https://www.instagram.com/apnidesidukaan" 
                target="_blank"
                aria-label="Instagram"
                className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 bg-gray-800 hover:bg-pink-600 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-md hover:shadow-lg"
              >
                <Instagram className="w-4 h-4 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-6 lg:h-6 text-white" />
              </Link>
              <Link 
                href="https://www.linkedin.com/company/apni-desi-dukaan/" 
                target="_blank"
                aria-label="LinkedIn"
                className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 bg-gray-800 hover:bg-blue-700 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-md hover:shadow-lg"
              >
                <Linkedin className="w-4 h-4 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-6 lg:h-6 text-white" />
              </Link>
              <Link 
                href="https://www.threads.com/@apnidesidukaan" 
                target="_blank"
                aria-label="Threads"
                className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 bg-gray-800 hover:bg-purple-600 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-md hover:shadow-lg"
              >
                <MessageCircle className="w-4 h-4 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-6 lg:h-6 text-white" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Section */}
        <div className="border-t-2 border-gray-200 pt-4 xs:pt-5 sm:pt-6 md:pt-6 lg:pt-7">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 xs:gap-4 sm:gap-4 md:gap-5 text-center sm:text-left">
            <p className="text-[10px] xs:text-xs sm:text-xs md:text-sm lg:text-base text-gray-600 leading-relaxed">
              © APNI DESI DUKAAN powered by <Link href="https://www.appzenowebservices.com" target="_blank" className="text-blue-600 hover:underline">APPZENO WEB SERVICES PRIVATE LIMITED</Link>, {new Date().getFullYear()}
            </p>
            
            <div className="flex flex-col xs:flex-row items-right justify-center gap-2 xs:gap-2 sm:gap-3 md:gap-4 text-[10px] xs:text-xs sm:text-xs md:text-sm text-gray-600">
              <Link href="mailto:contact@appzenowebservices.com" className="hover:text-blue-600 flex items-center gap-1 transition-colors active:scale-95">
                <Mail className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="break-all">contact@appzenowebservices.com</span>
              </Link>
              <span className="hidden xs:inline">•</span>
              <Link href="tel:18001234567" className="hover:text-blue-600 flex items-center gap-1 transition-colors active:scale-95">
                <Phone className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                {/* <span><Link href="tel:+919511123564">+91 95111 23564</Link></span> */}
              </Link>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-3 xs:mt-4 sm:mt-5 md:mt-6 text-center">
            <p className="text-[9px] xs:text-[10px] sm:text-xs md:text-xs lg:text-sm text-gray-500 leading-relaxed px-2 xs:px-3 sm:px-4 md:px-6">
              "ADDies" is owned and operated by APPZENO WEB SERVICES PRIVATE LIMITED. ADDies is an independent digital commerce platform and is not affiliated with, associated with, endorsed by, or connected to any other brand, company, or service unless explicitly stated.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}