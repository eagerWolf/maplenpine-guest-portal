import type { Locale, LocalizedText } from '../db/index'

export const CONTENT_LOCALES: Locale[] = ['en', 'sl', 'de', 'hr', 'sr']

export function parseLocalizedText(value: unknown, fieldLabel: string): LocalizedText {
  if (!value || typeof value !== 'object') {
    throw createError({ statusCode: 400, statusMessage: `${fieldLabel}: manjkajo prevodi` })
  }
  const obj = value as Record<string, unknown>
  const result = {} as LocalizedText
  for (const locale of CONTENT_LOCALES) {
    const text = obj[locale]
    if (typeof text !== 'string' || !text.trim()) {
      throw createError({ statusCode: 400, statusMessage: `${fieldLabel}: manjka prevod (${locale.toUpperCase()})` })
    }
    result[locale] = text.trim()
  }
  return result
}

export function normalizeLocalizedLabel(value: unknown): LocalizedText {
  if (value && typeof value === 'object') {
    const obj=value as Record<string,unknown>
    return Object.fromEntries(CONTENT_LOCALES.map(l=>[l,typeof obj[l]==='string'?obj[l]:''])) as LocalizedText
  }
  const text=typeof value==='string'?value:''
  return {en:text,sl:text,de:text,hr:text,sr:text}
}

export function parseLocalizedLinks(value: unknown, fieldLabel: string) {
  if(value===undefined||value===null) return []
  if(!Array.isArray(value)) throw createError({statusCode:400,statusMessage:`${fieldLabel}: napačen zapis`})
  return value.map((item:any,index)=>{
    if(!item||typeof item!=='object'||typeof item.href!=='string'||!item.href.trim()) throw createError({statusCode:400,statusMessage:`${fieldLabel} #${index+1}: povezava je obvezna`})
    return {label:parseLocalizedText(item.label,`${fieldLabel} #${index+1}`),href:item.href.trim(),...(item.target?{target:String(item.target)}:{})}
  })
}
