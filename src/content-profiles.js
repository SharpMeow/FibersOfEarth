import {entriesA} from './content-entries-a.js';
import {entriesB} from './content-entries-b.js';
const entries={...entriesA,...entriesB};
export const profiles=Object.fromEntries(Object.entries(entries).map(([id,v])=>[id,{id,name:v[0],family:v[1],tagline:v[2],composition:v[3],feel:v[4],uses:v[5],care:v[6],tradeoff:v[7],question:v[8],sources:v[9],legacyOnly:v[1]==='Specialty'}]));
