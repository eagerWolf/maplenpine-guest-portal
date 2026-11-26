export const newsTagLabels = {
  bled: ['Bled','Bled','Bled','Bled','Bled'],
  surroundings: ['Okolica','Nearby','Umgebung','Okolica','Okolina'],
  events: ['Dogodki','Events','Veranstaltungen','Događanja','Događaji'],
  culture: ['Kultura','Culture','Kultur','Kultura','Kultura'],
  sport: ['Šport','Sport','Sport','Sport','Sport'],
  family: ['Za družine','Family','Für Familien','Za obitelji','Za porodice'],
  food: ['Kulinarika','Food','Kulinarik','Gastronomija','Gastronomija'],
  practical: ['Koristno','Practical','Praktisches','Korisno','Korisno'],
} as const
export type NewsTag = keyof typeof newsTagLabels
export interface GuestNewsItem {
  id: number
  title: Record<string,string>
  content: Record<string,string>
  tags: NewsTag[]
  createdAt: string
}
export function newsTagLabel(tag: NewsTag, locale: string) {
  return newsTagLabels[tag][Math.max(0,['sl','en','de','hr','sr'].indexOf(locale))]
}
export function parseNewsTags(value: unknown): NewsTag[] {
  if (!Array.isArray(value) || value.some(v => typeof v !== 'string' || !Object.hasOwn(newsTagLabels,v))) throw new Error('Izberite veljavne oznake novic.')
  return [...new Set(value)] as NewsTag[]
}
export function initialNewsTags(title: string): NewsTag[] {
  const s=title.toLowerCase()
  const tags: NewsTag[] = [/bohinj|kranjsk|radovlj|pokljuk/.test(s)?'surroundings':'bled','events']
  if(/koncert|pestner|kultur|razstav|legend/.test(s)) tags.push('culture')
  if(/biatlon|drsanj/.test(s)) tags.push('sport')
  if(/božiček|pravljic/.test(s)) tags.push('family')
  if(/zajtrk|večerj|medu|čokolad/.test(s)) tags.push('food')
  return tags
}
// News has already been filtered to its publication window. Local, time-sensitive
// notices come first; undated evergreen content follows dated notices.
export function sortGuestNews<T extends {id:number;tags:NewsTag[];valid_to:string|null;recurring:number;created_at:string}>(items:T[], today:string):T[] {
  const end=(n:T)=>{
    if(!n.valid_to)return '9999-12-31'
    if(!n.recurring)return n.valid_to
    const thisYear=today.slice(0,4)+'-'+n.valid_to
    return thisYear<today?`${Number(today.slice(0,4))+1}-${n.valid_to}`:thisYear
  }
  return [...items].sort((a,b)=>Number(b.tags.includes('bled'))-Number(a.tags.includes('bled')) || end(a).localeCompare(end(b)) || b.created_at.localeCompare(a.created_at) || b.id-a.id)
}
export const newsCopy = {
 sl:{more:'Prikaži več',back:'Nazaj na začetek',all:'Vse novice',empty:'Trenutno ni novic.',error:'Novic ni bilo mogoče naložiti.',retry:'Poskusi znova'},
 en:{more:'Show more',back:'Back to home',all:'All news',empty:'No news at the moment.',error:'Could not load the news.',retry:'Try again'},
 de:{more:'Mehr anzeigen',back:'Zur Startseite',all:'Alle Neuigkeiten',empty:'Derzeit keine Neuigkeiten.',error:'Die Neuigkeiten konnten nicht geladen werden.',retry:'Erneut versuchen'},
 hr:{more:'Prikaži više',back:'Natrag na početak',all:'Sve novosti',empty:'Trenutno nema novosti.',error:'Novosti nije moguće učitati.',retry:'Pokušaj ponovno'},
 sr:{more:'Prikaži više',back:'Nazad na početak',all:'Sve novosti',empty:'Trenutno nema novosti.',error:'Novosti nije moguće učitati.',retry:'Pokušaj ponovo'},
}
