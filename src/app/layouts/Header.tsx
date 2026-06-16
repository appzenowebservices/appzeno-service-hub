'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';
import { ShoppingCart, MapPin, Search, User, X, Trash2, Plus, Minus, ShoppingBag, ChevronDown, UserCircle, Package, Heart, LogOut, Mic, MicOff, ScanBarcode, Clock, TrendingUp, RefreshCw, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useCartActions } from '~/app/hooks/useCartActions';
import HeaderLogo from '../components/headers/HeaderLogo';
import LocationButton from '../components/headers/LocationButton';
import SearchBar from '../components/headers/SearchBar';
import ProfileDropdown from '../components/headers/ProfileDropdown';
import MobileSearchBar from '../components/headers/MobileSearchBar';
import CartDrawer from '../components/headers/CartDrawer';
import CartButton from '../components/ui/button/Cart';
import { api } from '~/trpc/react';
// import { useCartStore } from '@/store/cartStore';

export default function Header() {
  type UserAddress = {
    id: string;
    label?: string | null;
    street?: string | null;
    locality?: string | null;
    city?: string | null;
    state?: string | null;
    isDefault?: boolean | null;
  };

  type SearchResultItem = {
    id: string;
    name: string;
    subtitle?: string;
    categoryId: string;
    type?: 'category' | 'product';
  };

  const router = useRouter();
  const [location, setLocation] = useState('Select location');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isLoginDropdownOpen, setIsLoginDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [locationError, setLocationError] = useState(false);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trendingSearches] = useState(['Paneer', 'Biryani', 'Pizza', 'Burger', 'Ice Cream']);
  const [moduleId, setModuleId] = useState<string | null>(null);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // Login form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const loginDropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const [mounted, setMounted] = useState(false);

  const { data: session } = useSession();
  const { data: advancedSearchResults = [], isFetching: isSearching } = api.advnaceSearch.search.useQuery(
    {
      query: debouncedSearchQuery,
      moduleId: moduleId ?? undefined,
      limit: 10,
    },
    {
      enabled: debouncedSearchQuery.length >= 2,
      staleTime: 15_000,
    }
  );
  const { data: userAddresses = [], isLoading: isLoadingUserAddresses } = api.user.getAddress.useQuery(
    undefined,
    {
      enabled: !!session?.user,
    }
  );

  const { cartItems, updateQuantity, removeItem } = useCartActions();
  const items = cartItems;

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => {
    const basePrice = item?.InventoryVendor?.price ?? item.price ?? 0;
    const discountPrice = item?.InventoryVendor?.discountPrice ?? 0;
    const effectivePrice = discountPrice > 0 ? discountPrice : basePrice;
    return sum + (effectivePrice * item.quantity);
  }, 0);

  const vendorMap: Record<string, number> = {};
  items.forEach(item => {
    if (!vendorMap[item.vendorId]) {
      vendorMap[item.vendorId] = item.deliveryFee || 30;
    }
  });
  const deliveryFees = Object.values(vendorMap).reduce((sum, fee) => sum + fee, 0);
  const grandTotal = subtotal + deliveryFees;

  // Component mounted check
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setIsLoggedIn(!!session?.user);
  }, [session?.user]);

  // Load recent searches from localStorage
  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      const saved = localStorage.getItem('recentSearches');
      if (saved) {
        try {
          setRecentSearches(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to load recent searches:', e);
        }
      }
    }
  }, [mounted]);

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;

    const selectedModuleId = sessionStorage.getItem('selectedModuleId');
    if (selectedModuleId) {
      setModuleId(selectedModuleId);
    }
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;

    const timeoutId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [mounted, searchQuery]);

  const typedAdvancedSearchResults = advancedSearchResults as SearchResultItem[];

  // Hindi to English transliteration map
  const transliterateHindiToEnglish = (text: string): string => {
    const hindiToEnglishMap: { [key: string]: string } = {
      'पंजाबी': 'Punjabi', 'तड़का': 'Tadka', 'पनीर': 'Paneer',
      'बटर': 'Butter', 'मसाला': 'Masala', 'चिकन': 'Chicken',
      'बिरयानी': 'Biryani', 'दाल': 'Dal', 'रोटी': 'Roti',
      'नान': 'Naan', 'समोसा': 'Samosa', 'चाय': 'Chai',
      'कॉफी': 'Coffee', 'दही': 'Dahi', 'चावल': 'Rice',
      'आलू': 'Aloo', 'गोभी': 'Gobi', 'प्याज': 'Pyaz',
      'टमाटर': 'Tomato', 'मिर्च': 'Mirch',
    };

    let transliterated = text;
    Object.keys(hindiToEnglishMap).forEach(hindi => {
      const regex = new RegExp(hindi, 'gi');
      transliterated = transliterated.replace(regex, hindiToEnglishMap[hindi]);
    });

    return transliterated;
  };

  // Initialize Speech Recognition
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'hi-IN';

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          const transliterated = transliterateHindiToEnglish(transcript);
          setSearchQuery(transliterated);
          setIsListening(false);
          setShowSearchSuggestions(true);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      } catch (error) {
        console.error('Speech recognition initialization failed:', error);
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, [mounted]);

  const toggleVoiceSearch = () => {
    if (!recognitionRef.current) {
      alert('Voice search is not supported in your browser. Please try Chrome or Edge.');
      return;
    }

    try {
      if (isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
      } else {
        recognitionRef.current.start();
        setIsListening(true);
      }
    } catch (error) {
      console.error('Voice search error:', error);
      setIsListening(false);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    if (!mounted) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (loginDropdownRef.current && !loginDropdownRef.current.contains(event.target as Node)) {
        setIsLoginDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mounted]);

  const persistRecentSearch = (query: string) => {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) return;

    const updated = [normalizedQuery, ...recentSearches.filter((item) => item !== normalizedQuery)].slice(0, 5);
    setRecentSearches(updated);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('recentSearches', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save recent searches:', e);
      }
    }
  };

  const handleSearch = (query: string) => {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) return;

    persistRecentSearch(normalizedQuery);

    const exactCategoryMatch = typedAdvancedSearchResults.find(
      (item) => item.name.toLowerCase() === normalizedQuery.toLowerCase()
    );

    if (exactCategoryMatch?.categoryId) {
      router.push(`/explore-product/${exactCategoryMatch.categoryId}`);
    } else {
      // router.push(`/search?q=${encodeURIComponent(normalizedQuery)}`);
    }

    setShowSearchSuggestions(false);
  };

  const handleSelectSearchItem = (item: SearchResultItem) => {
    persistRecentSearch(item.name);
    router.push(`/explore-product/${item.categoryId}`);
    setShowSearchSuggestions(false);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('recentSearches');
    }
  };

  const formatAddressLabel = (address?: UserAddress | null) => {
    if (!address) return 'Saved Location';

    const label = address.label?.trim();
    const city = address.city?.trim();
    const state = address.state?.trim();
    const locality = address.locality?.trim();

    if (label && city) return `${label}, ${city}`;
    if (city && state) return `${city}, ${state}`;
    if (label) return label;
    if (locality) return locality;
    return 'Saved Location';
  };

  // Simplified location fetch function
  const fetchLocation = async (forceRefresh = false) => {
    if (!mounted || typeof window === 'undefined') return;

    setIsLoadingLocation(true);
    setLocationError(false);

    try {
      // Check geolocation support
      if (!('geolocation' in navigator)) {
        throw new Error('Geolocation not supported');
      }

      // Get position with timeout
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        const timeoutId = setTimeout(() => reject(new Error('Location timeout')), 8000);

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            clearTimeout(timeoutId);
            resolve(pos);
          },
          (err) => {
            clearTimeout(timeoutId);
            reject(err);
          },
          {
            enableHighAccuracy: true,
            timeout: 8000,
            maximumAge: forceRefresh ? 0 : 300000
          }
        );
      });

      const { latitude, longitude } = position.coords;

      // Try BigDataCloud API (no key needed)
      try {
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
          { signal: AbortSignal.timeout(5000) }
        );

        if (response.ok) {
          const data = await response.json();
          const locality = data.locality || data.city || '';
          const state = data.principalSubdivision || '';

          if (locality && state) {
            setLocation(`${locality}, ${state}`);
            setLocationError(false);
            setIsLoadingLocation(false);
            return;
          }
        }
      } catch (apiError) {
        console.log('BigDataCloud API failed, trying fallback...');
      }

      // Fallback: Try Nominatim
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`,
          {
            headers: { 'User-Agent': 'ADDies-App/1.0' },
            signal: AbortSignal.timeout(5000)
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.address) {
            const city = data.address.city || data.address.town || data.address.village || '';
            const state = data.address.state || '';

            if (city && state) {
              setLocation(`${city}, ${state}`);
              setLocationError(false);
              setIsLoadingLocation(false);
              return;
            }
          }
        }
      } catch (fallbackError) {
        console.log('All geocoding APIs failed');
      }

      // If all APIs fail
      throw new Error('Could not determine location');

    } catch (error: any) {
      console.error('Location error:', error);

      if (error.code === 1) {
        setLocation('Location access denied');
      } else if (error.code === 2) {
        setLocation('Location unavailable');
      } else if (error.message === 'Location timeout') {
        setLocation('Location timeout');
      } else {
        setLocation('Sankeshwar, Karnataka');
      }

      setLocationError(true);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Load location after mount
  useEffect(() => {
    if (!mounted) return;

    if (session?.user && isLoadingUserAddresses) return;

    if (userAddresses.length > 0) {
      const primary = userAddresses.find((address: UserAddress) => address.isDefault) ?? userAddresses[0];
      setLocation(formatAddressLabel(primary));

      setLocationError(false);
      setIsLoadingLocation(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      fetchLocation();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [mounted, session?.user, isLoadingUserAddresses, userAddresses]);

  // Prevent rendering until mounted (SSR safety)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    // Basic validation
    if (!loginEmail || !loginPassword) {
      setLoginError('Please enter both mobile/email and password');
      return;
    }

    if (!loginEmail.includes('@') && loginEmail.length < 10) {
      setLoginError('Please enter a valid email or mobile number');
      return;
    }

    setIsLoggingIn(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        mobile: loginEmail.trim(),
        password: loginPassword,
      });

      if (result?.error) {
        setLoginError('Invalid credentials');
        return;
      }

      setIsLoginDropdownOpen(false);
      setLoginEmail('');
      setLoginPassword('');
      setLoginError('');
    } catch (error) {
      setLoginError('Login failed. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    setIsLoginDropdownOpen(false);
    await signOut({ callbackUrl: '/' });
  };

  const handleSelectAddress = (address: UserAddress) => {
    setLocation(formatAddressLabel(address));
    setLocationError(false);
    setIsLoadingLocation(false);
  };

  if (!mounted) {
    return (
      <header data-main-header="true" className="sticky top-0 z-50 w-full bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold text-2xl px-6 py-2 rounded-lg">
              ADDies
            </div>
            <div className="h-10 w-32 bg-gray-200 animate-pulse rounded"></div>
            <div className="flex-1 max-w-2xl hidden md:block">
              <div className="h-12 bg-gray-200 animate-pulse rounded-xl"></div>
            </div>
            <div className="h-10 w-24 bg-gray-200 animate-pulse rounded"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header data-main-header="true" className="sticky top-0 z-50 w-full bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <HeaderLogo />
            {/* Location Button */}
            <LocationButton
              location={location}
              isLoadingLocation={isLoadingLocation}
              locationError={locationError}
              fetchLocation={fetchLocation}
              userAddresses={userAddresses}
              onSelectAddress={handleSelectAddress}
            />
            {/* Search Bar */}
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              showSearchSuggestions={showSearchSuggestions}
              setShowSearchSuggestions={setShowSearchSuggestions}
              handleSearch={handleSearch}
              recentSearches={recentSearches}
              clearRecentSearches={clearRecentSearches}
              trendingSearches={trendingSearches}
              isListening={isListening}
              toggleVoiceSearch={toggleVoiceSearch}
              searchRef={searchRef}
              searchResults={typedAdvancedSearchResults}
              isSearching={debouncedSearchQuery.length >= 2 && isSearching}
              onSelectSearchItem={handleSelectSearchItem}
            />
            {/* Profile Dropdown */}
            <ProfileDropdown
              isLoggedIn={isLoggedIn}
              isLoginDropdownOpen={isLoginDropdownOpen}
              setIsLoginDropdownOpen={setIsLoginDropdownOpen}
              loginDropdownRef={loginDropdownRef}
              sessionUser={session?.user}
              loginEmail={loginEmail}
              setLoginEmail={setLoginEmail}
              loginPassword={loginPassword}
              setLoginPassword={setLoginPassword}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              loginError={loginError}
              setLoginError={setLoginError}
              isLoggingIn={isLoggingIn}
              setIsLoggingIn={setIsLoggingIn}
              handleLogin={handleLogin}
              onLogout={handleLogout}
            />
          </div>
          {/* Mobile Search Bar */}
          <MobileSearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearch={handleSearch}
            isListening={isListening}
            toggleVoiceSearch={toggleVoiceSearch}
          />
        </div>
      </header>
      {/* Cart Drawer */}
      <CartDrawer
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        items={items}
        updateQuantity={updateQuantity}
        removeItem={removeItem}
        totalItems={totalItems}
        subtotal={subtotal}
        deliveryFees={deliveryFees}
        grandTotal={grandTotal}
      />
      <CartButton onOpen={() => setIsCartOpen(true)} />
      <style jsx>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
