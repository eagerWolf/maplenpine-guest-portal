const adminTitles:Record<string,string>={
 '/admin':'Koledar rezervacij','/admin/logs':'Pregled dogodkov','/admin/staff':'Osebje','/admin/news':'Novice','/admin/notifications':'Obvestila','/admin/orchestrator':'Windows worker','/admin/sales':'Prodaja',
 '/admin/content':'Vsebina','/admin/content/restaurants':'Restavracije','/admin/content/suggestions':'Predlogi za izlete','/admin/content/faq':'Pogosta vprašanja','/admin/content/how-to':'Navodila za apartma','/admin/content/house-rules':'Hišni red',
 '/admin/settings':'Nastavitve','/admin/settings/general':'Splošne nastavitve','/admin/settings/locations':'Lokacije','/admin/settings/tv':'TV zasloni','/admin/settings/integrations/whatsapp':'WhatsApp obvestila','/admin/settings/integrations/bentral':'Bentral povezava','/admin/settings/integrations/sumup':'Plačila','/admin/settings/services/breakfast':'Priporočilo za zajtrk','/admin/settings/services/ebikes':'Priporočilo za najem koles',
 '/login':'Prijava','/activate':'Aktivacija računa','/forgot-password':'Pozabil sem geslo','/reset-password':'Novo geslo',
}
const guestTitles:Record<string,string[]>={
 home:['Vaše bivanje','Your stay','Ihr Aufenthalt','Vaš boravak','Vaš boravak'],
 restaurants:['Restavracije','Restaurants','Restaurants','Restorani','Restorani'],
 suggestions:['Izleti in doživetja','Things to do','Ausflüge und Aktivitäten','Izleti i doživljaji','Izleti i aktivnosti'],
 faq:['Pogosta vprašanja','Frequently asked questions','Häufige Fragen','Česta pitanja','Česta pitanja'],
 'how-to':['Navodila za apartma','Apartment guide','Anleitung zur Wohnung','Upute za apartman','Uputstva za apartman'],
 breakfast:['Priporočilo za zajtrk','Breakfast recommendation','Frühstücksempfehlung','Preporuka za doručak','Preporuka za doručak'],
 ebikes:['Najem koles','Bike rental','Fahrradverleih','Najam bicikala','Iznajmljivanje bicikala'],
}
export function portalPageTitle(path:string,locale:string,baseUrl:string):string {
 const normalized=path.replace(/\/$/,'') || '/'
 let title=adminTitles[normalized]
 if(normalized.startsWith('/cleaning/'))title='Potrditev čiščenja'
 else if(normalized.startsWith('/partner/'))title='Partnerski portal'
 else if(normalized.startsWith('/guest/')) {
  const key=normalized.split('/').at(-1)!
  const index=Math.max(0,['sl','en','de','hr','sr'].indexOf(locale))
  title=(guestTitles[key] || guestTitles.home)![index]
 }
 let hostname=''
 try {hostname=new URL(baseUrl).hostname} catch {}
 const environment=hostname==='guesttest.maplenpine.com'?'TEST · ':hostname==='guest.maplenpine.com'?'':'LOKALNO · '
 return `${environment}${title || 'Portal'} | Maple & Pine`
}
