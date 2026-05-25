import fs from 'fs';
import path from 'path';
import { supabase, mapFromDb, mapToDb, mapUserFromDb, mapUserToDb, getSupabaseStatus } from './supabase';

export interface User {
  id: string;
  name: string;
  passwordHash: string;
  createdAt: string;
}

export interface Slide {
  id: string;
  type: 'title' | 'content' | 'agenda' | 'conclusion' | 'section' | 'two-column' | 'stat' | 'quote' | 'timeline';
  title: string;
  subtitle?: string;
  bullets: string[];
  image?: string;
  svg?: string;
  align?: 'left' | 'center' | 'right';
  layoutStyle?: 'default' | 'card' | 'split' | 'minimal';
  cardColor?: string;
  imageCount?: number;
  images?: string[];
}

export interface Presentation {
  id: string;
  userId: string;
  title: string;
  prompt: string;
  extraData?: string;
  numSlides: number;
  slideData: Slide[];
  theme: string;
  colors: {
    bg: string;
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    heading: string;
    muted: string;
  };
  fontTitle: string;
  fontBody: string;
  status: string;
  hideFooter?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DatabaseSchema {
  users: User[];
  presentations: Presentation[];
  deletedPresentations?: string[];
}

const DB_PATH = path.join(process.cwd(), 'db.json');

function readDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_PATH)) {
      const initial: DatabaseSchema = { users: [], presentations: [], deletedPresentations: [] };
      fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const content = fs.readFileSync(DB_PATH, 'utf-8');
    const parsed = JSON.parse(content);
    if (!parsed.deletedPresentations) {
      parsed.deletedPresentations = [];
    }
    return parsed;
  } catch (err) {
    console.error('Error reading DB, returning empty', err);
    return { users: [], presentations: [], deletedPresentations: [] };
  }
}

function writeDb(data: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing DB', err);
  }
}

export const db = {
  // Sync fallback methods
  getUsers(): User[] {
    return readDb().users;
  },

  addUser(user: User) {
    const data = readDb();
    if (!data.users.find(u => (u.name || (u as any).email || '').toLowerCase() === user.name.toLowerCase())) {
      data.users.push(user);
      writeDb(data);
    }
  },

  async findUserByName(name: string): Promise<User | undefined> {
    const status = await getSupabaseStatus();
    if (status.usersTableAvailable) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', name.toLowerCase())
          .maybeSingle();
        if (!error && data) {
          return mapUserFromDb(data);
        }
      } catch (err) {
        console.warn('Failed querying public.users table on Supabase, using local db fallback', err);
      }
    }
    const local = readDb().users;
    return local.find(u => (u.name || (u as any).email || '').toLowerCase() === name.toLowerCase());
  },

  async createUser(user: User): Promise<void> {
    const status = await getSupabaseStatus();
    if (status.usersTableAvailable) {
      try {
        const mappedRow = mapUserToDb(user);
        const { error } = await supabase
          .from('users')
          .insert(mappedRow);
        
        if (!error) {
          console.log(`Synced user ${user.name} with Supabase public.users table!`);
        } else {
          console.warn('Failed creating user Row on Supabase public.users:', error.message);
        }
      } catch (err) {
        console.warn('Error saving to Supabase public.users table', err);
      }
    }
    
    // Always persist in local fallbacks too
    const data = readDb();
    if (!data.users.find(u => (u.name || (u as any).email || '').toLowerCase() === user.name.toLowerCase())) {
      data.users.push(user);
      writeDb(data);
    }
  },

  // Async hybrid methods attempting Supabase tables first, falling back to local db
  async getPresentations(): Promise<Presentation[]> {
    const dbData = readDb();
    const local = dbData.presentations;
    const deletedIds = dbData.deletedPresentations || [];
    const status = await getSupabaseStatus();
    if (status.tableAvailable) {
      try {
        const { data, error } = await supabase
          .from('presentations')
          .select('*');
        if (!error && data) {
          const remote = data.map(row => mapFromDb(row));
          const mergedMap = new Map<string, Presentation>();
          local.forEach(p => {
            if (!deletedIds.includes(p.id)) {
              mergedMap.set(p.id, p);
            }
          });
          remote.forEach(p => {
            if (!deletedIds.includes(p.id)) {
              mergedMap.set(p.id, p);
            }
          });
          return Array.from(mergedMap.values());
        }
      } catch (err) {
        console.warn('Failed querying Supabase presentations, using local json db fallback', err);
      }
    }
    return local.filter(p => !deletedIds.includes(p.id));
  },

  async getPresentationsByUser(userId: string): Promise<Presentation[]> {
    const dbData = readDb();
    const local = dbData.presentations.filter(p => p.userId === userId);
    const deletedIds = dbData.deletedPresentations || [];
    const status = await getSupabaseStatus();
    if (status.tableAvailable) {
      try {
        const { data, error } = await supabase
          .from('presentations')
          .select('*')
          .eq('user_id', userId);
        if (!error && data) {
          const remote = data.map(row => mapFromDb(row));
          const mergedMap = new Map<string, Presentation>();
          
          // Seed local presentations first
          local.forEach(p => {
            if (!deletedIds.includes(p.id)) {
              mergedMap.set(p.id, p);
            }
          });
          // Overwrite/extend with what actually exists on Supabase
          remote.forEach(p => {
            if (!deletedIds.includes(p.id)) {
              mergedMap.set(p.id, p);
            }
          });
          
          return Array.from(mergedMap.values());
        }
      } catch (err) {
        console.warn('Failed querying Supabase user presentations, using local json db fallback', err);
      }
    }
    return local.filter(p => !deletedIds.includes(p.id));
  },

  async getPresentationById(id: string): Promise<Presentation | undefined> {
    const dbData = readDb();
    const deletedIds = dbData.deletedPresentations || [];
    if (deletedIds.includes(id)) {
      return undefined;
    }
    const local = dbData.presentations.find(p => p.id === id);
    const status = await getSupabaseStatus();
    if (status.tableAvailable) {
      try {
        const { data, error } = await supabase
          .from('presentations')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (!error && data) {
          const mapped = mapFromDb(data);
          if (mapped && !deletedIds.includes(mapped.id)) {
            return mapped;
          }
          return undefined;
        }
      } catch (err) {
        console.warn('Failed querying single presentation on Supabase, using local json db fallback', err);
      }
    }
    return local;
  },

  async addPresentation(presentation: Presentation): Promise<void> {
    // 1. Always persist in local fallbacks first to ensure absolute safety on error
    const data = readDb();
    if (!data.deletedPresentations) {
      data.deletedPresentations = [];
    }
    // If we are adding/saving, make sure it is not marked as deleted anymore
    data.deletedPresentations = data.deletedPresentations.filter(id => id !== presentation.id);

    if (!data.presentations.find(p => p.id === presentation.id)) {
      data.presentations.push(presentation);
      writeDb(data);
    } else {
      writeDb(data);
    }

    // 2. Try Supabase synchronization in the background/hybrid
    const status = await getSupabaseStatus();
    if (status.tableAvailable) {
      try {
        const mappedRow = mapToDb(presentation);
        const { error } = await supabase
          .from('presentations')
          .insert(mappedRow);
        
        if (!error) {
          console.log(`Inserted presentation ${presentation.id} into Supabase successfully!`);
          return;
        }
        console.warn('Failed inserting to Supabase:', error.message);
      } catch (err) {
        console.warn('Error saving to Supabase presentations table, saved to local json db instead', err);
      }
    }
  },

  async updatePresentation(id: string, updates: Partial<Presentation>): Promise<Presentation | null> {
    let updatedLocalRes: Presentation | null = null;
    
    // Always persist in local fallbacks first
    const data = readDb();
    const index = data.presentations.findIndex(p => p.id === id);
    if (index !== -1) {
      const updated = {
        ...data.presentations[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      data.presentations[index] = updated;
      writeDb(data);
      updatedLocalRes = updated;
    }

    // Try Supabase synchronization
    const status = await getSupabaseStatus();
    if (status.tableAvailable) {
      try {
        const { data: existingData, error: loadError } = await supabase
          .from('presentations')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (!loadError && existingData) {
          const presentation = mapFromDb(existingData);
          const updatedPresentation = {
            ...presentation,
            ...updates,
            updatedAt: new Date().toISOString()
          };

          const mappedRow = mapToDb(updatedPresentation);
          const { error: saveError } = await supabase
            .from('presentations')
            .update(mappedRow)
            .eq('id', id);

          if (!saveError) {
            return updatedPresentation;
          }
          console.warn('Failed updating Supabase presentations table:', saveError.message);
        }
      } catch (err) {
        console.warn('Failed updating Supabase row, fall back to local json db', err);
      }
    }

    return updatedLocalRes;
  },

  async deletePresentation(id: string): Promise<boolean> {
    let deletedLocally = false;
    
    // Always delete locally first
    const data = readDb();
    const initialLen = data.presentations.length;
    data.presentations = data.presentations.filter(p => p.id !== id);
    if (!data.deletedPresentations) {
      data.deletedPresentations = [];
    }
    if (!data.deletedPresentations.includes(id)) {
      data.deletedPresentations.push(id);
    }
    if (data.presentations.length < initialLen) {
      writeDb(data);
      deletedLocally = true;
    } else {
      writeDb(data);
    }

    // Try Supabase synchronization
    const status = await getSupabaseStatus();
    if (status.tableAvailable) {
      try {
        const { error } = await supabase
          .from('presentations')
          .delete()
          .eq('id', id);
        if (error) {
          console.error('[Supabase Delete Error]:', error);
        } else {
          console.log(`Successfully deleted presentation ${id} from Supabase.`);
          return true;
        }
      } catch (err) {
        console.warn('Failed deleting row on Supabase, using local json db fallback', err);
      }
    }

    return deletedLocally;
  }
};
