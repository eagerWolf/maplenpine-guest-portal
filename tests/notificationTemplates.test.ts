import { expect, it } from 'vitest'
import { notificationEvents, notificationSamples, defaultNotificationTemplate, renderNotificationTemplate, validateNotificationTemplate } from '../shared/notificationTemplates'
it('keeps the original title, details and cleaner capability link with the default template',()=>{
 const text = 'Čiščenje Pine\nOdhod ob 11:00\nhttps://portal.test/cleaning/token'
 expect(renderNotificationTemplate(defaultNotificationTemplate,text,'https://portal.test')).toBe(text)
})
it('substitutes content once, preserving braces inside guest data',()=>{
 expect(renderNotificationTemplate('Hej\n{title}\n{details}\n{link}','Naslov\nGost {title}','https://portal.test')).toBe('Hej\nNaslov\nGost {title}\nhttps://portal.test')
})
it('rejects templates that drop operational data or introduce unsupported variables',()=>{
 for(const value of ['', '{title}', '{title}{details}{link}{pin}', 'x'.repeat(1501)]) expect(validateNotificationTemplate(value)).toBe(false)
 expect(validateNotificationTemplate(defaultNotificationTemplate)).toBe(true)
 expect(Object.keys(notificationSamples)).toEqual(Object.keys(notificationEvents))
})
