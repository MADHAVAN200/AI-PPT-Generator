import { createClient } from '@supabase/supabase-js';

// Supplied by user
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://kclhgvmtdsorcxnysqwt.supabase.co';
// Use service role key if available server-side to bypass RLS policies, otherwise fallback to publishable
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_suNxaXIG6E-UKE58Q0y2NA_MGc8OUDb';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

// Flag to store whether SQL tables are verified
let isSupabaseTableAvailable = false;
let isUsersTableAvailable = false;
let verifiedOnce = false;
export const LOCAL_ONLY = true; // Set to true to bypass Supabase for pure local portfolio execution

// Convert snake_case from DB into camelCase for application Presentation structure
export function mapFromDb(row: any): any {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    prompt: row.prompt,
    extraData: row.extra_data,
    numSlides: row.num_slides,
    slideData: typeof row.slide_data === 'string' ? JSON.parse(row.slide_data) : row.slide_data,
    theme: row.theme,
    colors: typeof row.colors === 'string' ? JSON.parse(row.colors) : row.colors,
    fontTitle: row.font_title,
    fontBody: row.font_body,
    status: row.status,
    hideFooter: row.hide_footer === true || row.hideFooter === true,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function mapToDb(presentation: any): any {
  if (!presentation) return null;
  const payload: any = {
    id: presentation.id,
    user_id: presentation.userId,
    title: presentation.title,
    prompt: presentation.prompt,
    extra_data: presentation.extraData,
    num_slides: presentation.numSlides,
    slide_data: typeof presentation.slideData === 'string' ? presentation.slideData : JSON.stringify(presentation.slideData),
    theme: presentation.theme,
    colors: typeof presentation.colors === 'string' ? presentation.colors : JSON.stringify(presentation.colors),
    font_title: presentation.fontTitle,
    font_body: presentation.fontBody,
    status: presentation.status,
    created_at: presentation.createdAt,
    updated_at: presentation.updatedAt
  };
  
  if (presentation.hideFooter !== undefined) {
    payload.hide_footer = presentation.hideFooter;
  }
  return payload;
}

// User helper mappings for handling custom user profiles/users table in Supabase
export function mapUserFromDb(row: any): any {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name || row.email || '',
    passwordHash: row.password_hash || '',
    createdAt: row.created_at || row.createdAt
  };
}

export function mapUserToDb(user: any): any {
  if (!user) return null;
  return {
    id: user.id,
    email: user.name,
    password_hash: user.passwordHash || '',
    created_at: user.createdAt
  };
}

// Function to check connection/availability and return state
export async function getSupabaseStatus() {
  if (LOCAL_ONLY) {
    return {
      initialized: true,
      connected: false,
      tableAvailable: false,
      usersTableAvailable: false,
      localOnly: true,
      errors: {
        presentations: null,
        users: null
      }
    };
  }
  let presentationsError: any = null;
  let usersError: any = null;
  let isConnected = true;

  try {
    const { error: presError } = await supabase
      .from('presentations')
      .select('count', { count: 'exact', head: true });
    
    if (presError) {
      presentationsError = presError;
      console.error("[Supabase Check Error - presentations]:", presError);
      isSupabaseTableAvailable = presError.code !== '42P01';
    } else {
      isSupabaseTableAvailable = true;
    }
  } catch (err: any) {
    console.error("[Supabase Check Exception - presentations]:", err);
    presentationsError = { message: err?.message || String(err), code: 'EXCEPTION' };
    isSupabaseTableAvailable = false;
    isConnected = false;
  }

  try {
    const { error: userError } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });
    
    if (userError) {
      usersError = userError;
      console.error("[Supabase Check Error - users]:", userError);
      isUsersTableAvailable = userError.code !== '42P01';
    } else {
      isUsersTableAvailable = true;
    }
  } catch (err: any) {
    console.error("[Supabase Check Exception - users]:", err);
    usersError = { message: err?.message || String(err), code: 'EXCEPTION' };
    isUsersTableAvailable = false;
    isConnected = false;
  }
  
  verifiedOnce = true;
  return { 
    initialized: true, 
    connected: isConnected,
    tableAvailable: isSupabaseTableAvailable,
    usersTableAvailable: isUsersTableAvailable,
    errors: {
      presentations: presentationsError,
      users: usersError
    }
  };
}
