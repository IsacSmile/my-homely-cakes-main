import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Cake, Heart, MapPin, ShieldCheck, Award, PhoneCall, Sparkles, Star, CheckCircle2, ArrowRight } from 'lucide-react';
import OutletsSection from '@/components/OutletsSection';
import { db } from '@/db';
import { settings, outlets as outletsTable } from '@/db/schema';
import { asc } from 'drizzle-orm';

export const revalidate = 3600; // Cache statically with 1-hour ISR revalidation

export const metadata = {
  title: 'About Us & Our Outlets | MyHomelyCake Trivandrum',
  description: 'Learn about our story, meet our head baker, and visit our fresh bakery outlets across Trivandrum including Kowdiar, Pattom, Kazhakkoottam, and Vellayambalam.',
};

const DEFAULT_FOUNDER = {
  name: 'Aswathy S.',
  title: 'Founder & Head Baker',
  photoUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80',
  heading: 'Baking with Pure Love, Tradition & Zero Preservatives',
  experience: '10+ Years of Passionate Home Baking',
  bio: `MyHomelyCake began in a cozy Kowdiar home kitchen driven by a simple belief: every milestone celebration deserves a cake crafted with the exact warmth, wholesome ingredients, and care you would find in your mother's own recipes.\n\nUnlike mass commercial bakeries that rely on premade frozen sponge bases and artificial enhancers, our head baker personally hand-crafts every cake strictly to order. We use 100% natural butter, fresh dairy cream, and pure cocoa to ensure every slice melts with authentic homemade goodness.\n\nToday, while our family of bakers has grown across Trivandrum, our core promise remains unchanged — zero stored stock, custom flavor personalizations, and guaranteed fresh delivery right to your doorstep.`,
};

async function getFounderData() {
  try {
    const allSettings = await db.select().from(settings).all();
    const settingsMap = (allSettings || []).reduce((acc: Record<string, string>, item: any) => {
      acc[item.key] = item.value;
      return acc;
    }, {});

    return {
      name: settingsMap.founder_name || DEFAULT_FOUNDER.name,
      title: settingsMap.founder_title || DEFAULT_FOUNDER.title,
      photoUrl: settingsMap.founder_photo_url || DEFAULT_FOUNDER.photoUrl,
      heading: settingsMap.founder_heading || DEFAULT_FOUNDER.heading,
      experience: settingsMap.founder_experience || DEFAULT_FOUNDER.experience,
      bio: settingsMap.founder_bio || DEFAULT_FOUNDER.bio,
    };
  } catch (error) {
    console.error('Error reading founder settings:', error);
    return DEFAULT_FOUNDER;
  }
}

async function getOutletsData() {
  try {
    const list = await db.select().from(outletsTable).orderBy(asc(outletsTable.sortOrder));
    return list || [];
  } catch (error) {
    console.error('Error reading outlets for About page:', error);
    return [];
  }
}

export default async function AboutPage() {
  const [founder, outlets] = await Promise.all([getFounderData(), getOutletsData()]);
  const bioParagraphs = (founder.bio || DEFAULT_FOUNDER.bio).split('\n\n').filter(Boolean);

  const rawPhotoUrl = founder.photoUrl || DEFAULT_FOUNDER.photoUrl;
  const optimizedFounderPhoto = rawPhotoUrl.includes('unsplash.com') && !rawPhotoUrl.includes('w=')
    ? `${rawPhotoUrl}${rawPhotoUrl.includes('?') ? '&' : '?'}auto=format&fit=crop&w=800&q=80`
    : rawPhotoUrl;

  return (
    <div className="min-h-screen bg-[#FAF5EF] text-bakery-chocolate selection:bg-amber-200 selection:text-amber-900 relative">
      
      {/* Subtle Background Ambience Glow - Hardware Accelerated */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 gpu-composite">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-200/35 via-amber-100/15 to-transparent blur-3xl opacity-70" />
        <div className="absolute top-[40%] -right-40 w-96 h-96 bg-amber-100/40 rounded-full blur-3xl" />
        <div className="absolute top-[75%] -left-40 w-96 h-96 bg-amber-100/30 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12 sm:pt-8 sm:pb-16 lg:pt-10 lg:pb-20 space-y-8 sm:space-y-12 lg:space-y-14 gpu-header">
        
        {/* ─── SECTION 1: HERO HEADER ─── */}
        <header className="relative text-center space-y-3 sm:space-y-4 max-w-3xl mx-auto pt-1 pb-1">
          {/* Subtle Decorative Background Flourish */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-amber-100/30 to-amber-200/10 rounded-full blur-2xl -z-10" />

          {/* Eyebrow Label */}
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 uppercase tracking-widest bg-amber-500/10 px-3.5 py-1 rounded-full border border-amber-300/40 shadow-xs mb-0.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Our Story & Heritage</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-bakery-chocolate tracking-tight leading-[1.15]">
            Crafting Sweet{' '}
            <span className="italic font-serif text-amber-700 font-normal underline decoration-amber-300/60 underline-offset-8">
              Memories
            </span>{' '}
            in Trivandrum
          </h1>

          <p className="text-xs sm:text-sm lg:text-base text-bakery-800/80 leading-relaxed max-w-xl mx-auto font-normal">
            From our modest home kitchen in Kowdiar to bringing fresh, handcrafted cakes to celebrations across Thiruvananthapuram.
          </p>

          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto rounded-full opacity-80 mt-1" />
        </header>


        {/* ─── SECTION 2: ELEVATED FOUNDER STORY CARD ─── */}
        <section
          aria-labelledby="founder-section-heading"
          className="relative bg-white/95 rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-10 lg:p-12 border border-amber-200/70 shadow-[0_15px_40px_rgba(69,26,3,0.05)] overflow-hidden gpu-header"
        >
          {/* Subtle Organic Ambient Blobs */}
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-amber-100/60 to-amber-200/20 rounded-full blur-3xl -z-0 pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-tr from-amber-50 to-amber-100/50 rounded-full blur-3xl -z-0 pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Founder Image Column with Layered Offset Backdrop Frame */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="relative w-full max-w-sm group">
                {/* Layered Color Block Backdrop Peeking From Behind */}
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-300/40 via-amber-200/50 to-amber-100/60 rounded-[2.5rem] transform rotate-3 scale-102 group-hover:rotate-1 transition-transform duration-500 -z-10 shadow-sm" />
                <div className="absolute inset-0 bg-bakery-chocolate/5 rounded-[2.5rem] transform -rotate-2 scale-101 group-hover:rotate-0 transition-transform duration-500 -z-10" />

                {/* Main Photo Frame */}
                <div className="relative h-80 sm:h-96 w-full rounded-[2.25rem] overflow-hidden border-4 border-white shadow-xl bg-bakery-100">
                  <Image
                    src={optimizedFounderPhoto}
                    alt={`${founder.name} - ${founder.title} of MyHomelyCake Trivandrum`}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 400px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 pointer-events-none" />
                  
                  {/* Clean Caption Overlay */}
                  <div className="absolute bottom-5 left-5 right-5 text-white space-y-1 z-10">
                    <p className="font-serif font-bold text-2xl text-amber-100 tracking-wide">{founder.name}</p>
                    <p className="text-xs font-semibold text-amber-200/90 tracking-widest uppercase">{founder.title}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Founder Text & Story Column */}
            <div className="lg:col-span-7 space-y-6 text-bakery-800">
              
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 text-[11px] font-extrabold text-amber-800 uppercase tracking-[0.2em]">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Meet Our Founder & Baker</span>
                </div>
                
                <h2
                  id="founder-section-heading"
                  className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-bakery-chocolate leading-snug tracking-tight"
                >
                  {founder.heading}
                </h2>
                
                <div className="w-16 h-1 bg-gradient-to-r from-amber-500 to-amber-300 rounded-full" />
              </div>

              {/* Story Bio Paragraphs */}
              <div className="space-y-4 text-sm sm:text-base leading-relaxed text-bakery-800/90 font-normal">
                {bioParagraphs.map((para: string, idx: number) => (
                  <p key={idx} className="first-letter:text-xl first-letter:font-serif first-letter:font-bold first-letter:text-amber-800">
                    {para}
                  </p>
                ))}
              </div>

              {/* Refined Feature Badges */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-3 border-t border-amber-100">
                <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200/70 flex items-center gap-3 shadow-2xs hover:bg-amber-100/50 transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <Heart className="w-4 h-4 text-amber-700" />
                  </div>
                  <span className="text-xs font-bold text-amber-950">100% Handcrafted</span>
                </div>

                <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200/70 flex items-center gap-3 shadow-2xs hover:bg-amber-100/50 transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4 text-amber-700" />
                  </div>
                  <span className="text-xs font-bold text-amber-950">Zero Preservatives</span>
                </div>
              </div>

            </div>

          </div>
        </section>


        {/* ─── SECTION 3: DYNAMIC OUR OUTLETS ─── */}
        <OutletsSection initialOutlets={outlets} />


        {/* ─── SECTION 4: CORE VALUES / FEATURES ROW ─── */}
        <section aria-label="Core Values" className="space-y-8">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-[11px] font-extrabold text-amber-800 uppercase tracking-[0.2em]">Our Uncompromising Promise</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-bakery-chocolate">Why Celebrations Choose Us</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            
            <div className="bg-white p-7 rounded-[2rem] border border-amber-200/60 shadow-[0_10px_30px_rgba(69,26,3,0.04)] hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 text-center space-y-4 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200/60 text-amber-900 mx-auto flex items-center justify-center font-bold shadow-inner group-hover:scale-110 transition-transform duration-300">
                <Heart className="w-7 h-7 text-amber-700" />
              </div>
              <h3 className="font-serif text-lg font-bold text-bakery-chocolate">Home Kitchen Hygiene</h3>
              <p className="text-xs sm:text-sm text-bakery-800/80 leading-relaxed">
                Prepared in sanitized home-style kitchens adhering to strict food safety standards and 100% pure natural ingredients.
              </p>
            </div>

            <div className="bg-white p-7 rounded-[2rem] border border-amber-200/60 shadow-[0_10px_30px_rgba(69,26,3,0.04)] hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 text-center space-y-4 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200/60 text-amber-900 mx-auto flex items-center justify-center font-bold shadow-inner group-hover:scale-110 transition-transform duration-300">
                <MapPin className="w-7 h-7 text-amber-700" />
              </div>
              <h3 className="font-serif text-lg font-bold text-bakery-chocolate">Prompt City Delivery</h3>
              <p className="text-xs sm:text-sm text-bakery-800/80 leading-relaxed">
                Guaranteed fresh delivery across Kowdiar, Pattom, Technopark, Vellayambalam, Kazhakkoottam, and Thiruvananthapuram.
              </p>
            </div>

            <div className="bg-white p-7 rounded-[2rem] border border-amber-200/60 shadow-[0_10px_30px_rgba(69,26,3,0.04)] hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 text-center space-y-4 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200/60 text-amber-900 mx-auto flex items-center justify-center font-bold shadow-inner group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck className="w-7 h-7 text-amber-700" />
              </div>
              <h3 className="font-serif text-lg font-bold text-bakery-chocolate">Zero Prepayment Required</h3>
              <p className="text-xs sm:text-sm text-bakery-800/80 leading-relaxed">
                Submit your order online completely free. Our head baker personally contacts you to verify custom details before payment.
              </p>
            </div>

          </div>
        </section>


        {/* ─── SECTION 5: CTA BANNER ─── */}
        <section
          aria-label="Order CTA"
          className="relative bg-gradient-to-br from-[#2A1711] via-[#381E16] to-[#1E0F0B] text-white rounded-[2.5rem] p-8 sm:p-14 text-center space-y-6 shadow-2xl overflow-hidden border border-amber-900/40"
        >
          {/* Subtle Ambient Light Beam */}
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
            <span className="inline-block text-[11px] font-extrabold text-amber-300 tracking-[0.2em] uppercase bg-white/10 px-4 py-1.5 rounded-full border border-white/15">
              Custom Orders & Inquiries
            </span>
            
            <h3 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-amber-50 leading-tight">
              Planning a Celebration in Trivandrum?
            </h3>
            
            <p className="text-xs sm:text-base text-amber-100/80 max-w-xl mx-auto leading-relaxed font-normal">
              Need a custom theme cake, specific flavor mix, or express doorstep delivery? Speak with our head baker directly.
            </p>
          </div>

          <div className="relative z-10 pt-2 flex flex-wrap justify-center items-center gap-4">
            <Link
              href="/shop"
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold text-xs sm:text-sm py-3.5 px-8 rounded-full shadow-lg hover:shadow-amber-500/25 transition-all active:scale-95 cursor-pointer inline-flex items-center gap-2 group"
            >
              <span>Explore Cake Menu</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <a
              href="tel:919947066011"
              className="bg-white/10 hover:bg-white/20 text-amber-100 font-bold text-xs sm:text-sm py-3.5 px-7 rounded-full border border-white/25 transition-all flex items-center gap-2.5 active:scale-95 cursor-pointer backdrop-blur-xs"
            >
              <PhoneCall className="w-4 h-4 text-amber-400" />
              <span>Call Baker (9947066011)</span>
            </a>
          </div>
        </section>

      </div>
    </div>
  );
}
