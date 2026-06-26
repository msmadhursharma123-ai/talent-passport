/* ============================================================
   MARKETPLACE TYPES
   Talent Passport OS
============================================================ */

export interface MarketplacePartner {
  id: string;

  name: string;
  slug: string;
  description: string | null;

  category: string;
  skills: string[];

  city: string;
  state: string;
  country: string;

  logo_url: string | null;
  cover_image_url: string | null;

  website: string | null;
  email: string | null;
  phone: string | null;

  rating: number;
  total_reviews: number;

  students_mentored: number;
  years_experience: number;

  consultation_duration: number;
  consultation_credits: number;

  verified: boolean;
  featured: boolean;
  active: boolean;

  created_at: string;
  updated_at: string;
}

export interface MarketplaceMentor {
  id: string;

  partner_id: string;

  full_name: string;
  designation: string | null;

  bio: string | null;

  profile_photo: string | null;

  experience_years: number;

  students_mentored: number;

  rating: number;
  total_reviews: number;

  consultation_duration: number;
  consultation_credits: number;

  languages: string[] | null;

  specializations: string[] | null;

  verified: boolean;
  featured: boolean;
  active: boolean;

  created_at: string;
  updated_at: string;
}

export interface PartnerGalleryImage {
  id: string;

  partner_id: string;

  image_url: string;

  title: string | null;

  description: string | null;

  category: string | null;

  display_order: number;

  active: boolean;

  created_at: string;
}

export interface ConsultationRequest {
  id: string;

  student_id: string;

  partner_id: string;

  mentor_id: string | null;

  category: string;

  skill: string;

  topic: string;

  description: string | null;

  consultation_credits: number;

  status: string;

  requested_at: string;

  updated_at: string;
}

export interface ConsultationBooking {
  id: string;

  request_id: string;

  student_id: string;

  partner_id: string;

  mentor_id: string | null;

  scheduled_date: string;

  scheduled_time: string;

  duration_minutes: number;

  meeting_mode: string;

  meeting_link: string | null;

  venue: string | null;

  booking_status: string;

  credits_deducted: number;

  booked_at: string;

  completed_at: string | null;
}

export interface CreditTransaction {
  id: string;

  student_id: string;

  booking_id: string | null;

  transaction_type: string;

  source: string;

  credits: number;

  description: string | null;

  reference_id: string | null;

  created_by: string;

  created_at: string;
}

export interface MarketplaceReview {
  id: string;

  booking_id: string;

  student_id: string;

  partner_id: string;

  mentor_id: string | null;

  rating: number;

  review: string | null;

  would_recommend: boolean;

  created_at: string;
}

export interface PartnerAdmin {
  id: string;

  partner_id: string;

  auth_user_id: string | null;

  full_name: string;

  email: string;

  phone: string | null;

  role: string;

  profile_photo: string | null;

  active: boolean;

  last_login: string | null;

  created_at: string;

  updated_at: string;
}