// Optional admin fields are returned as null by SQLite and sent back unchanged by the editor.
export function optionalContentText(value:unknown,label:string,maxLength=2048):string|null {
  if(value === undefined || value === null || value === '') return null
  if(typeof value !== 'string') throw createError({statusCode:400,statusMessage:`${label}: vnesite besedilo ali pustite polje prazno.`})
  const text=value.trim()
  if(text.length>maxLength)throw createError({statusCode:400,statusMessage:`${label}: največ ${maxLength} znakov.`})
  return text || null
}
export function optionalContentUrl(value:unknown,label:string):string|null {
  const text=optionalContentText(value,label)
  if(!text)return null
  try {const url=new URL(text);if(!['https:','http:'].includes(url.protocol) || url.username || url.password)throw new Error()}
  catch {throw createError({statusCode:400,statusMessage:`${label}: vnesite veljavno spletno povezavo (https://…).`})}
  return text
}
