export type Format = 'mat' | 'reformer';
export interface Area { area: string; latitude: number; longitude: number }
export interface AppConfig { heroImageUrl: string; shopHeroImageUrl: string; areas: Area[]; interestOptions: { label: string; value: string }[]; formats: Format[] }
export interface Profile { area?: string; latitude?: number; longitude?: number; interests?: string[]; formats?: Format[]; onboardingComplete?: boolean }
export interface Session { id: string; token?: string; profile: Profile; expiresAt: string; referralCode?: string | null }
export interface List<T> { data: T[]; pagination: { page: number; limit: number; total: number; pages: number } }
export interface ReferralLink { code: string; deepLink: string }
export interface Studio { id: string; name: string; description: string; imageUrl: string; city: string; country: string; address: string; latitude: number; longitude: number; formats: Format[]; partnerType: 'partner' | 'stockist' | 'listed'; websiteUrl: string; bookingUrl: string; distanceKm?: number; instructors?: Instructor[]; workouts?: Workout[]; referrals?: ReferralLink[]; published: boolean }
export interface Instructor { id: string; name: string; bio: string; imageUrl: string; independent: boolean; approvalStatus: string; published: boolean; studios?: Studio[]; workouts?: Workout[]; referrals?: ReferralLink[] }
export interface Variant { id: string; title: string; price: number; available: boolean }
export interface Product { id: string; title: string; description: string; imageUrl: string; collection: string; tags: string[]; currency: string; variants: Variant[]; bundleProductIds: string[]; bundleProducts?: Product[]; published: boolean }
export interface Workout { id: string; title: string; description: string; format: Format; level: string; durationMinutes: number; studioId: string; instructorIds: string[]; productIds: string[]; imageUrl: string; products?: Product[]; instructors?: Instructor[]; studio?: Studio; publishedAt: string }
export interface CartItem { productId: string; variantId: string; quantity: number; productTitle: string; variantTitle: string | null; imageUrl: string | null; unitPrice: number | null; currency: string | null; available: boolean; lineTotal: number | null }
export interface Cart { items: CartItem[]; subtotal: number | null; currency: string | null; checkoutReady: boolean; revision: number }
export interface CheckoutInput { fulfillment: 'delivery' | 'warehouse-collect'; source: 'app'; discountCode?: 'WELCOME15' | 'SEASON10' }
export interface Quote { items: CartItem[]; currency: string; subtotal: number; discount: number; shipping: number; total: number; fulfillment: string; attribution: { code: string; ownerType: string; ownerId: string } | null; notice: string }
export interface Order extends Quote { id: string; status: string; createdAt: string }
export interface Referral extends ReferralLink { owner: { id: string; name: string }; ownerType: string; ownerId: string; commissionsEnabled: boolean }
export interface Affiliation { id: string; studioId: string; instructorId: string }
export interface Offer { id: string; title: string; description: string; studio: { id: string; name: string }; distanceKm: number }
