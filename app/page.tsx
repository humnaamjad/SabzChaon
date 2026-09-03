// Home page — redirects authenticated users to their role-based dashboard.
// Unauthenticated users see an engaging branded landing page.

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/shared/AuthProvider";
import {
  TreePine,
  Sprout,
  Shield,
  Camera,
  Brain,
  TrendingUp,
  Bell,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import LoadingState from "@/components/shared/LoadingState";

export default function Home() {
  const { user, userDoc, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (user && userDoc) {
      router.replace(
        userDoc.role === "ngo" ? "/dashboard" : "/browse-campaigns"
      );
    }
  }, [user, userDoc, loading, router]);

  if (loading) {
    return <LoadingState />;
  }

  // If authenticated, we're redirecting — show loading
  if (user && userDoc) {
    return <LoadingState message="Redirecting to your dashboard…" />;
  }

  // Unauthenticated landing
  return (
    <div className="relative min-h-[calc(100vh-60px)] bg-cream">
      {/* ── Watercolor Botanical Background ───────────────────────────────── */}
      {/*
       * Uses z-40 + pointer-events-none so the corner artwork is visible
       * at viewport edges without blocking any clicks or interactions.
       * Each leaf is built from 3-4 overlapping translucent fills to
       * create realistic watercolor pigment buildup.
       */}
      <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden" aria-hidden="true">

        {/* ═══ TOP-LEFT — green botanical branch ═══ */}
        <div className="absolute left-0 top-0 w-[220px] h-[210px] sm:w-[320px] sm:h-[305px] lg:w-[460px] lg:h-[440px]">
          <svg viewBox="0 0 500 460" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="w1" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="1.2"/></filter>
              <filter id="w2" x="-12%" y="-12%" width="124%" height="124%"><feGaussianBlur stdDeviation="0.5"/></filter>
            </defs>
            {/* Branch structure */}
            <path d="M-5,-5 C30,25 60,60 95,100 C130,145 170,195 220,260 C260,315 305,370 355,415" stroke="#8B7355" strokeWidth="3" opacity="0.22" fill="none" strokeLinecap="round"/>
            <path d="M95,100 C120,85 150,65 185,45" stroke="#8B7355" strokeWidth="2" opacity="0.18" fill="none" strokeLinecap="round"/>
            <path d="M220,260 C240,240 265,215 295,195" stroke="#8B7355" strokeWidth="1.8" opacity="0.15" fill="none" strokeLinecap="round"/>
            {/* Leaf A — large sage, main */}
            <path d="M5,10 C50,0 105,15 155,50 C210,92 260,148 295,215 C255,158 200,108 145,72 C95,40 42,18 5,10Z" fill="#A8C3A1" opacity="0.38" filter="url(#w1)"/>
            <path d="M18,22 C58,14 108,28 155,58 C205,95 250,145 278,205 C245,152 195,108 145,78 C100,50 52,28 18,22Z" fill="#8EAF87" opacity="0.28" filter="url(#w2)"/>
            <path d="M38,40 C72,32 112,45 150,68 C192,98 228,140 255,188 C228,148 190,112 152,85 C115,62 75,42 38,40Z" fill="#6F8F6A" opacity="0.22"/>
            {/* Leaf B — medium olive, lower angle */}
            <path d="M-5,85 C42,68 95,75 148,108 C205,148 252,202 285,275 C248,215 195,165 142,128 C92,95 40,78 -5,85Z" fill="#6F8F6A" opacity="0.36" filter="url(#w1)"/>
            <path d="M12,98 C50,82 98,90 145,118 C195,152 238,200 265,260 C235,208 188,165 142,135 C100,108 52,90 12,98Z" fill="#8EAF87" opacity="0.25" filter="url(#w2)"/>
            <path d="M28,112 C58,100 98,108 138,130 C178,158 215,198 238,248 C215,205 180,168 142,142 C108,120 65,105 28,112Z" fill="#A8C3A1" opacity="0.20"/>
            {/* Leaf C — brown accent, narrow upward */}
            <path d="M65,-5 C78,42 72,92 88,155 C105,225 118,278 135,325 C115,272 98,215 85,155 C72,100 65,48 65,-5Z" fill="#C9A88A" opacity="0.42" filter="url(#w1)"/>
            <path d="M75,12 C85,50 80,95 92,152 C105,215 115,262 128,305 C112,258 98,208 88,155 C78,105 72,55 75,12Z" fill="#B68C6A" opacity="0.32" filter="url(#w2)"/>
            <path d="M82,30 C88,60 85,98 95,148 C105,200 112,242 122,278 C110,240 100,198 92,152 C85,110 80,65 82,30Z" fill="#A3744F" opacity="0.22"/>
            {/* Leaf D — medium sage, upper branch */}
            <path d="M130,0 C148,32 155,72 175,125 C192,178 205,218 218,258 C200,212 185,165 170,118 C155,75 142,35 130,0Z" fill="#A8C3A1" opacity="0.34" filter="url(#w1)"/>
            <path d="M140,15 C155,42 160,78 178,125 C192,170 202,208 212,242 C198,202 185,160 172,118 C160,78 148,40 140,15Z" fill="#6F8F6A" opacity="0.24" filter="url(#w2)"/>
            {/* Leaf E — small brown sprig */}
            <path d="M220,125 C232,155 238,185 248,225 C255,258 262,285 268,308 C260,280 252,250 245,218 C238,182 230,148 220,125Z" fill="#B68C6A" opacity="0.35" filter="url(#w2)"/>
            <path d="M225,138 C235,162 240,188 248,222 C254,250 258,272 262,292 C256,268 250,242 244,218 C238,188 232,158 225,138Z" fill="#A3744F" opacity="0.25"/>
            {/* Scattered small leaves & dots */}
            <ellipse cx="345" cy="365" rx="18" ry="9" fill="#8EAF87" opacity="0.28" filter="url(#w2)" transform="rotate(-25,345,365)"/>
            <ellipse cx="375" cy="340" rx="14" ry="7" fill="#C9A88A" opacity="0.25" filter="url(#w2)" transform="rotate(15,375,340)"/>
            <ellipse cx="310" cy="395" rx="12" ry="6" fill="#6F8F6A" opacity="0.22" filter="url(#w2)" transform="rotate(-10,310,395)"/>
            <circle cx="400" cy="380" r="4" fill="#A3744F" opacity="0.22"/>
            <circle cx="365" cy="415" r="3.5" fill="#A8C3A1" opacity="0.20"/>
            <circle cx="420" cy="350" r="3" fill="#B68C6A" opacity="0.18"/>
            <circle cx="335" cy="430" r="2.5" fill="#8EAF87" opacity="0.18"/>
          </svg>
        </div>

        {/* ═══ TOP-RIGHT — brown botanical branch ═══ */}
        <div className="absolute right-0 top-0 w-[220px] h-[210px] sm:w-[320px] sm:h-[305px] lg:w-[460px] lg:h-[440px]">
          <svg viewBox="0 0 500 460" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="w3" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="1.2"/></filter>
              <filter id="w4" x="-12%" y="-12%" width="124%" height="124%"><feGaussianBlur stdDeviation="0.5"/></filter>
            </defs>
            {/* Branch structure */}
            <path d="M505,-5 C470,25 440,60 405,100 C370,145 330,195 280,260 C240,315 195,370 145,415" stroke="#8B7355" strokeWidth="3" opacity="0.22" fill="none" strokeLinecap="round"/>
            <path d="M405,100 C380,85 350,65 315,45" stroke="#8B7355" strokeWidth="2" opacity="0.18" fill="none" strokeLinecap="round"/>
            <path d="M280,260 C260,240 235,215 205,195" stroke="#8B7355" strokeWidth="1.8" opacity="0.15" fill="none" strokeLinecap="round"/>
            {/* Leaf A — large warm brown, main */}
            <path d="M495,10 C450,0 395,15 345,50 C290,92 240,148 205,215 C245,158 300,108 355,72 C405,40 458,18 495,10Z" fill="#C9A88A" opacity="0.38" filter="url(#w3)"/>
            <path d="M482,22 C442,14 392,28 345,58 C295,95 250,145 222,205 C255,152 305,108 355,78 C400,50 448,28 482,22Z" fill="#B68C6A" opacity="0.28" filter="url(#w4)"/>
            <path d="M462,40 C428,32 388,45 350,68 C308,98 272,140 245,188 C272,148 310,112 348,85 C385,62 425,42 462,40Z" fill="#A3744F" opacity="0.22"/>
            {/* Leaf B — medium brown, lower angle */}
            <path d="M505,85 C458,68 405,75 352,108 C295,148 248,202 215,275 C252,215 305,165 358,128 C408,95 460,78 505,85Z" fill="#B68C6A" opacity="0.36" filter="url(#w3)"/>
            <path d="M488,98 C450,82 402,90 355,118 C305,152 262,200 235,260 C265,208 312,165 358,135 C400,108 448,90 488,98Z" fill="#C9A88A" opacity="0.25" filter="url(#w4)"/>
            <path d="M472,112 C442,100 402,108 362,130 C322,158 285,198 262,248 C285,205 320,168 358,142 C392,120 435,105 472,112Z" fill="#A3744F" opacity="0.20"/>
            {/* Leaf C — green accent, narrow upward */}
            <path d="M435,-5 C422,42 428,92 412,155 C395,225 382,278 365,325 C385,272 402,215 415,155 C428,100 435,48 435,-5Z" fill="#8EAF87" opacity="0.40" filter="url(#w3)"/>
            <path d="M425,12 C415,50 420,95 408,152 C395,215 385,262 372,305 C388,258 402,208 412,155 C422,105 428,55 425,12Z" fill="#6F8F6A" opacity="0.30" filter="url(#w4)"/>
            <path d="M418,30 C412,60 415,98 405,148 C395,200 388,242 378,278 C390,240 400,198 408,152 C415,110 420,65 418,30Z" fill="#A8C3A1" opacity="0.22"/>
            {/* Leaf D — light brown, upper branch */}
            <path d="M370,0 C352,32 345,72 325,125 C308,178 295,218 282,258 C300,212 315,165 330,118 C345,75 358,35 370,0Z" fill="#C9A88A" opacity="0.34" filter="url(#w3)"/>
            <path d="M360,15 C345,42 340,78 322,125 C308,170 298,208 288,242 C302,202 315,160 328,118 C340,78 352,40 360,15Z" fill="#B68C6A" opacity="0.24" filter="url(#w4)"/>
            {/* Leaf E — small green sprig */}
            <path d="M280,125 C268,155 262,185 252,225 C245,258 238,285 232,308 C240,280 248,250 255,218 C262,182 270,148 280,125Z" fill="#8EAF87" opacity="0.35" filter="url(#w4)"/>
            <path d="M275,138 C265,162 260,188 252,222 C246,250 242,272 238,292 C244,268 250,242 256,218 C262,188 268,158 275,138Z" fill="#6F8F6A" opacity="0.25"/>
            {/* Scattered small leaves & dots */}
            <ellipse cx="155" cy="365" rx="18" ry="9" fill="#B68C6A" opacity="0.28" filter="url(#w4)" transform="rotate(25,155,365)"/>
            <ellipse cx="125" cy="340" rx="14" ry="7" fill="#8EAF87" opacity="0.25" filter="url(#w4)" transform="rotate(-15,125,340)"/>
            <ellipse cx="190" cy="395" rx="12" ry="6" fill="#A3744F" opacity="0.22" filter="url(#w4)" transform="rotate(10,190,395)"/>
            <circle cx="100" cy="380" r="4" fill="#A8C3A1" opacity="0.22"/>
            <circle cx="135" cy="415" r="3.5" fill="#C9A88A" opacity="0.20"/>
            <circle cx="80" cy="350" r="3" fill="#6F8F6A" opacity="0.18"/>
          </svg>
        </div>

        {/* ═══ BOTTOM-LEFT — brown and green mix ═══ */}
        <div className="absolute bottom-0 left-0 w-[200px] h-[190px] sm:w-[280px] sm:h-[270px] lg:w-[400px] lg:h-[380px]">
          <svg viewBox="0 0 420 400" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="w5" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="1.2"/></filter>
              <filter id="w6" x="-12%" y="-12%" width="124%" height="124%"><feGaussianBlur stdDeviation="0.5"/></filter>
            </defs>
            {/* Branch structure */}
            <path d="M-5,405 C30,375 65,335 100,290 C140,240 185,190 230,145 C268,105 305,68 340,35" stroke="#8B7355" strokeWidth="2.5" opacity="0.20" fill="none" strokeLinecap="round"/>
            <path d="M100,290 C120,305 145,325 175,345" stroke="#8B7355" strokeWidth="1.8" opacity="0.15" fill="none" strokeLinecap="round"/>
            {/* Leaf A — large warm brown, main */}
            <path d="M5,395 C50,405 105,388 155,355 C210,315 258,262 290,195 C252,255 200,305 148,338 C98,368 45,392 5,395Z" fill="#C9A88A" opacity="0.38" filter="url(#w5)"/>
            <path d="M18,385 C55,392 105,378 152,350 C200,315 242,268 270,210 C240,262 195,305 148,335 C105,360 55,380 18,385Z" fill="#B68C6A" opacity="0.28" filter="url(#w6)"/>
            <path d="M35,370 C65,375 108,362 148,340 C188,312 222,272 248,225 C225,265 192,300 155,328 C118,352 72,368 35,370Z" fill="#A3744F" opacity="0.22"/>
            {/* Leaf B — medium green, mixed in */}
            <path d="M-5,315 C40,330 92,322 142,295 C195,262 238,215 268,155 C235,210 188,255 140,285 C92,312 40,328 -5,315Z" fill="#8EAF87" opacity="0.36" filter="url(#w5)"/>
            <path d="M12,305 C48,318 95,312 140,288 C185,260 225,218 250,168 C225,215 185,252 142,278 C100,302 52,315 12,305Z" fill="#A8C3A1" opacity="0.25" filter="url(#w6)"/>
            <path d="M28,295 C58,305 95,298 132,278 C170,255 202,220 225,178 C205,215 175,245 140,268 C108,288 65,300 28,295Z" fill="#6F8F6A" opacity="0.20"/>
            {/* Leaf C — brown narrow, going up */}
            <path d="M62,405 C75,362 68,315 85,258 C102,195 115,148 130,105 C112,155 98,208 85,262 C72,318 65,365 62,405Z" fill="#B68C6A" opacity="0.40" filter="url(#w5)"/>
            <path d="M72,390 C82,352 78,310 90,258 C102,205 112,162 125,125 C110,168 100,215 90,262 C80,312 75,355 72,390Z" fill="#A3744F" opacity="0.28" filter="url(#w6)"/>
            {/* Leaf D — small sage accent */}
            <path d="M180,310 C192,282 198,255 210,222 C222,192 232,165 242,140 C230,168 220,198 210,228 C200,260 190,288 180,310Z" fill="#A8C3A1" opacity="0.32" filter="url(#w6)"/>
            <path d="M185,298 C195,275 200,250 210,222 C220,195 228,172 235,150 C225,175 218,200 210,225 C202,252 192,278 185,298Z" fill="#6F8F6A" opacity="0.22"/>
            {/* Scattered small leaves & dots */}
            <ellipse cx="295" cy="105" rx="15" ry="7" fill="#C9A88A" opacity="0.25" filter="url(#w6)" transform="rotate(20,295,105)"/>
            <ellipse cx="320" cy="78" rx="12" ry="6" fill="#8EAF87" opacity="0.22" filter="url(#w6)" transform="rotate(-15,320,78)"/>
            <circle cx="345" cy="55" r="4" fill="#B68C6A" opacity="0.20"/>
            <circle cx="275" cy="130" r="3" fill="#A3744F" opacity="0.18"/>
            <circle cx="355" cy="90" r="2.5" fill="#A8C3A1" opacity="0.18"/>
          </svg>
        </div>

        {/* ═══ BOTTOM-RIGHT — green botanical ═══ */}
        <div className="absolute bottom-0 right-0 w-[200px] h-[190px] sm:w-[280px] sm:h-[270px] lg:w-[400px] lg:h-[380px]">
          <svg viewBox="0 0 420 400" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="w7" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="1.2"/></filter>
              <filter id="w8" x="-12%" y="-12%" width="124%" height="124%"><feGaussianBlur stdDeviation="0.5"/></filter>
            </defs>
            {/* Branch structure */}
            <path d="M425,405 C390,375 355,335 320,290 C280,240 235,190 190,145 C152,105 115,68 80,35" stroke="#8B7355" strokeWidth="2.5" opacity="0.20" fill="none" strokeLinecap="round"/>
            <path d="M320,290 C300,305 275,325 245,345" stroke="#8B7355" strokeWidth="1.8" opacity="0.15" fill="none" strokeLinecap="round"/>
            {/* Leaf A — large sage, main */}
            <path d="M415,395 C370,405 315,388 265,355 C210,315 162,262 130,195 C168,255 220,305 272,338 C322,368 375,392 415,395Z" fill="#A8C3A1" opacity="0.38" filter="url(#w7)"/>
            <path d="M402,385 C365,392 315,378 268,350 C220,315 178,268 150,210 C180,262 225,305 272,335 C315,360 365,380 402,385Z" fill="#8EAF87" opacity="0.28" filter="url(#w8)"/>
            <path d="M385,370 C355,375 312,362 272,340 C232,312 198,272 172,225 C195,265 228,300 265,328 C302,352 348,368 385,370Z" fill="#6F8F6A" opacity="0.22"/>
            {/* Leaf B — medium olive, lower angle */}
            <path d="M425,315 C380,330 328,322 278,295 C225,262 182,215 152,155 C185,210 232,255 280,285 C328,312 380,328 425,315Z" fill="#6F8F6A" opacity="0.36" filter="url(#w7)"/>
            <path d="M408,305 C372,318 325,312 280,288 C235,260 195,218 170,168 C195,215 235,252 278,278 C320,302 368,315 408,305Z" fill="#8EAF87" opacity="0.25" filter="url(#w8)"/>
            <path d="M392,295 C362,305 325,298 288,278 C250,255 218,220 195,178 C215,215 245,245 280,268 C312,288 355,300 392,295Z" fill="#A8C3A1" opacity="0.20"/>
            {/* Leaf C — brown accent, narrow */}
            <path d="M358,405 C345,362 352,315 335,258 C318,195 305,148 290,105 C308,155 322,208 335,262 C348,318 355,365 358,405Z" fill="#C9A88A" opacity="0.40" filter="url(#w7)"/>
            <path d="M348,390 C338,352 342,310 330,258 C318,205 308,162 295,125 C310,168 320,215 330,262 C340,312 345,355 348,390Z" fill="#B68C6A" opacity="0.28" filter="url(#w8)"/>
            {/* Leaf D — small sage accent */}
            <path d="M240,310 C228,282 222,255 210,222 C198,192 188,165 178,140 C190,168 200,198 210,228 C220,260 230,288 240,310Z" fill="#8EAF87" opacity="0.32" filter="url(#w8)"/>
            <path d="M235,298 C225,275 220,250 210,222 C200,195 192,172 185,150 C195,175 202,200 210,225 C218,252 228,278 235,298Z" fill="#6F8F6A" opacity="0.22"/>
            {/* Scattered small leaves & dots */}
            <ellipse cx="125" cy="105" rx="15" ry="7" fill="#8EAF87" opacity="0.25" filter="url(#w8)" transform="rotate(-20,125,105)"/>
            <ellipse cx="100" cy="78" rx="12" ry="6" fill="#C9A88A" opacity="0.22" filter="url(#w8)" transform="rotate(15,100,78)"/>
            <circle cx="75" cy="55" r="4" fill="#A3744F" opacity="0.20"/>
            <circle cx="145" cy="130" r="3" fill="#A8C3A1" opacity="0.18"/>
          </svg>
        </div>

        {/* ═══ EDGE SPRIGS ═══ */}
        <div className="absolute left-0 top-[42%] w-[120px] h-[115px] sm:w-[160px] sm:h-[155px] lg:w-[200px] lg:h-[190px]">
          <svg viewBox="0 0 200 190" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <path d="M-5,95 C35,72 72,58 120,38 C78,62 42,80 -5,95Z" fill="#8EAF87" opacity="0.28" filter="url(#w2)"/>
            <path d="M-5,105 C30,88 62,78 105,62 C68,82 35,95 -5,105Z" fill="#A8C3A1" opacity="0.20" filter="url(#w2)"/>
            <path d="M-5,80 C22,68 48,55 82,38 C52,58 28,72 -5,80Z" fill="#6F8F6A" opacity="0.22" filter="url(#w2)"/>
            <circle cx="130" cy="35" r="4" fill="#B68C6A" opacity="0.20"/>
            <circle cx="115" cy="58" r="3" fill="#C9A88A" opacity="0.18"/>
          </svg>
        </div>
        <div className="absolute right-0 top-[52%] w-[120px] h-[115px] sm:w-[160px] sm:h-[155px] lg:w-[200px] lg:h-[190px]">
          <svg viewBox="0 0 200 190" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <path d="M205,95 C165,72 128,58 80,38 C122,62 158,80 205,95Z" fill="#6F8F6A" opacity="0.28" filter="url(#w4)"/>
            <path d="M205,80 C175,65 148,52 110,38 C145,55 172,68 205,80Z" fill="#C9A88A" opacity="0.22" filter="url(#w4)"/>
            <path d="M205,108 C178,92 152,82 118,68 C148,85 175,98 205,108Z" fill="#8EAF87" opacity="0.20" filter="url(#w4)"/>
            <circle cx="70" cy="35" r="4" fill="#A8C3A1" opacity="0.20"/>
            <circle cx="85" cy="58" r="3" fill="#A3744F" opacity="0.18"/>
          </svg>
        </div>

        {/* ═══ BACKGROUND TEXTURE DOTS ═══ */}
        <div className="absolute inset-0">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <circle cx="15%" cy="25%" r="2" fill="#C9A88A" opacity="0.12"/>
            <circle cx="82%" cy="18%" r="2.5" fill="#B68C6A" opacity="0.10"/>
            <circle cx="45%" cy="72%" r="2" fill="#A3744F" opacity="0.10"/>
            <circle cx="72%" cy="55%" r="1.8" fill="#A8C3A1" opacity="0.10"/>
            <circle cx="28%" cy="62%" r="2" fill="#8EAF87" opacity="0.10"/>
            <circle cx="55%" cy="38%" r="1.5" fill="#C9A88A" opacity="0.08"/>
            <circle cx="38%" cy="85%" r="2" fill="#B68C6A" opacity="0.10"/>
            <circle cx="65%" cy="78%" r="1.8" fill="#6F8F6A" opacity="0.08"/>
          </svg>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative z-50 overflow-hidden">
        <div className="relative mx-auto max-w-5xl px-4 pb-16 pt-16 sm:pt-24 sm:pb-24">
          <div className="text-center">
            {/* Brand icon */}
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-forest shadow-lg shadow-forest/20">
              <TreePine className="h-8 w-8 text-white" />
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-inktext sm:text-5xl lg:text-6xl">
              Sabz Chaon
            </h1>
            <p className="mt-2 text-lg font-medium text-forest sm:text-xl">
              Green Shade
            </p>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-warmgray-text">
              Turning &ldquo;trees planted&rdquo; into &ldquo;trees that survive.&rdquo;
            </p>
            <p className="mx-auto mt-2 max-w-xl text-base text-warmgray-text">
              NGOs run plantation campaigns. Volunteers become tree Guardians.
              AI monitors tree health. Together, we ensure every planted tree thrives.
            </p>

            {/* CTA */}
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/auth"
                className="inline-flex items-center gap-2 rounded-xl bg-forest px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-forest/20 transition-all duration-200 hover:bg-forest-hover hover:shadow-xl hover:shadow-forest/25"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Journey Section — how the platform works */}
      <section className="relative z-50 border-t border-warmgray-border/50 bg-cream-card">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:py-20">
          <h2 className="mb-2 text-center text-2xl font-semibold text-inktext sm:text-3xl">
            How Sabz Chaon Works
          </h2>
          <p className="mx-auto mb-12 max-w-lg text-center text-sm text-warmgray-text">
            Every tree planted becomes a tree that survives — through Guardians, AI, and accountability.
          </p>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: <Sprout className="h-6 w-6 text-forest" />,
                step: "01",
                title: "Plant & Join",
                desc: "Volunteers join plantation campaigns and plant trees in their community.",
              },
              {
                icon: <Shield className="h-6 w-6 text-forest" />,
                step: "02",
                title: "Become a Guardian",
                desc: "Each volunteer becomes the Guardian of the tree they planted — responsible for its care.",
              },
              {
                icon: <Camera className="h-6 w-6 text-forest" />,
                step: "03",
                title: "Check In",
                desc: "Guardians upload periodic photo updates. AI analyzes visible tree health instantly.",
              },
              {
                icon: <TrendingUp className="h-6 w-6 text-forest" />,
                step: "04",
                title: "Track Impact",
                desc: "NGOs see real survival data, get alerts for struggling trees, and measure true impact.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="group relative rounded-2xl border border-warmgray-border/60 bg-cream p-6 transition-all duration-300 hover:border-forest/20 hover:shadow-md"
              >
                {/* Step number */}
                <span className="mb-3 block text-xs font-bold tracking-widest text-forest/40">
                  STEP {item.step}
                </span>
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-forest/8 transition-colors group-hover:bg-forest/12">
                  {item.icon}
                </div>
                <h3 className="text-base font-semibold text-inktext">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-warmgray-text">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For whom section */}
      <section className="relative z-50 border-t border-warmgray-border/50 bg-cream">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:py-20">
          <div className="grid gap-8 sm:grid-cols-2">
            {/* For Volunteers */}
            <div className="rounded-2xl border border-warmgray-border/60 bg-cream-card p-8 transition-shadow hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-forest/8">
                <Sprout className="h-6 w-6 text-forest" />
              </div>
              <h3 className="text-xl font-semibold text-inktext">
                For Volunteers
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-warmgray-text">
                Join plantation drives near you. Plant a tree and become its Guardian.
                Upload check-ins, watch your virtual plant grow, and know you&apos;re making a real difference.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["Join Campaigns", "AI Health Checks", "Virtual Avatar"].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-forest/8 px-3 py-1 text-xs font-medium text-forest"
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>
            </div>

            {/* For NGOs */}
            <div className="rounded-2xl border border-warmgray-border/60 bg-cream-card p-8 transition-shadow hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brown/8">
                <Bell className="h-6 w-6 text-brown" />
              </div>
              <h3 className="text-xl font-semibold text-inktext">For NGOs</h3>
              <p className="mt-2 text-sm leading-relaxed text-warmgray-text">
                Create campaigns, recruit volunteers, and monitor tree survival at scale.
                Get real-time alerts when trees need attention. Report impact with data, not estimates.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["Impact Dashboard", "Tree Alerts", "Campaign Management"].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-brown/8 px-3 py-1 text-xs font-medium text-brown"
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-50 border-t border-warmgray-border/50 bg-cream-card">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2 text-sm text-warmgray-text">
              <TreePine className="h-4 w-4 text-forest" />
              <span>
                Sabz Chaon — Turning &ldquo;trees planted&rdquo; into &ldquo;trees that survive.&rdquo;
              </span>
            </div>
            <p className="text-xs text-warmgray-text">
              Alibaba Cloud AI Hackathon Project
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
