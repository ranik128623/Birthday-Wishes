/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  getDocFromServer 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export interface BirthdayConfig {
  id: string;
  name: string;
  relation: string;
  date: string;
}

const DEFAULT_CONFIG: BirthdayConfig = {
  id: 'active',
  name: 'Naim',
  relation: 'Dear Friend',
  date: 'June 15, 2026',
};

// Test active collection connection
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test-db-connection', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firebase client reports as offline. Please check network/config.");
    }
  }
}
testConnection();

/**
 * Fetch active dynamic birthday layout parameters from Firestore
 */
export async function getBirthdayConfig(): Promise<BirthdayConfig> {
  try {
    const docRef = doc(db, 'birthday_config', 'active');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      const loadedDate = data.date || DEFAULT_CONFIG.date;
      
      // Auto upgrade existing default date if it's the old one
      if (loadedDate === 'June 8, 2026') {
        const updatedConfig = {
          id: data.id || 'active',
          name: data.name || DEFAULT_CONFIG.name,
          relation: data.relation || DEFAULT_CONFIG.relation,
          date: 'June 15, 2026',
        };
        // Save back synchronously or fire and forget
        setDoc(docRef, updatedConfig).catch(err => console.error("Auto-migrating date failed", err));
        return updatedConfig;
      }

      return {
        id: data.id || 'active',
        name: data.name || DEFAULT_CONFIG.name,
        relation: data.relation || DEFAULT_CONFIG.relation,
        date: loadedDate,
      };
    } else {
      // Document does not exist yet - seed default values dynamically
      await setDoc(docRef, DEFAULT_CONFIG);
      return DEFAULT_CONFIG;
    }
  } catch (e) {
    console.warn("Failed to fetch custom name configuration from Firestore. Falling back to default keys.", e);
    return DEFAULT_CONFIG;
  }
}

/**
 * Updates the shared custom birthday configuration
 */
export async function updateBirthdayConfig(config: Omit<BirthdayConfig, 'id'>): Promise<void> {
  const docRef = doc(db, 'birthday_config', 'active');
  await setDoc(docRef, {
    id: 'active',
    ...config,
    lastUpdated: new Date().toISOString()
  });
}
