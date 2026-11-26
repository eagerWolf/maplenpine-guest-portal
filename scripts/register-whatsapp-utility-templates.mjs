// Explicit operator action. Credentials remain on the portal server and are sent only to Twilio.
import Database from 'better-sqlite3'
import {createHash,createDecipheriv} from 'node:crypto'
import {readFileSync,writeFileSync} from 'node:fs'
const definitions=JSON.parse(readFileSync(new URL('./whatsapp-utility-templates.json',import.meta.url),'utf8'))
if(!process.argv.includes('--submit') && !process.argv.includes('--status')) {
 console.log('Prepared event templates:',definitions.map(x=>x.friendly_name).join(', '))
 console.log('Use --status for a read-only provider check or --submit to create and submit Utility templates. No WhatsApp messages are sent.')
 process.exit(0)
}
const db=new Database('data/portal.db',{readonly:true,fileMustExist:true})
const values=Object.fromEntries(db.prepare("SELECT key,value FROM app_settings WHERE key IN ('twilio_account_sid','twilio_auth_token')").all().map(r=>[r.key,r.value]));db.close()
let token=values.twilio_auth_token
if(token?.startsWith('enc:v1:')) {
 const key=process.env.NUXT_SETTINGS_ENCRYPTION_KEY
 if(!key)throw Error('Missing settings encryption key')
 const [iv,tag,data]=token.slice(7).split(':')
 const decipher=createDecipheriv('aes-256-gcm',createHash('sha256').update(key.trim()).digest(),Buffer.from(iv,'base64'))
 decipher.setAuthTag(Buffer.from(tag,'base64'))
 token=Buffer.concat([decipher.update(Buffer.from(data,'base64')),decipher.final()]).toString('utf8')
}
if(!/^AC[0-9a-f]{32}$/i.test(values.twilio_account_sid || '') || !token)throw Error('Twilio credentials are not configured')
async function request(path,body) {
 const response=await fetch('https://content.twilio.com'+path,{method:body?'POST':'GET',headers:{Authorization:'Basic '+Buffer.from(values.twilio_account_sid+':'+token).toString('base64'),...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{}),redirect:'error',signal:AbortSignal.timeout(30000)})
 if(!response.ok)throw Error(`Twilio Content API returned HTTP ${response.status}`)
 return response.json()
}
let page='/v1/Content?PageSize=1000';const existing=[]
while(page) {
 const result=await request(page);existing.push(...result.contents)
 const next=result.meta?.next_page_url
 if(next && new URL(next).origin!=='https://content.twilio.com')throw Error('Unexpected provider pagination origin')
 page=next?new URL(next).pathname+new URL(next).search:''
}
const registry={updatedAt:new Date().toISOString(),templates:{}}
for(const definition of definitions) {
 let item=existing.find(x=>x.friendly_name===definition.friendly_name)
 if(item && (item.language!==definition.language || item.types?.['twilio/text']?.body!==definition.body))throw Error('Existing template differs; choose a new version before continuing')
 if(!item && process.argv.includes('--submit'))item=await request('/v1/Content',{friendly_name:definition.friendly_name,language:definition.language,variables:definition.variables,types:{'twilio/text':{body:definition.body}}})
 if(!item){console.log(definition.event,'not created');continue}
 let approval=await request(`/v1/Content/${item.sid}/ApprovalRequests`)
 if((!approval.whatsapp || approval.whatsapp.status === 'unsubmitted') && process.argv.includes('--submit')) {
  await request(`/v1/Content/${item.sid}/ApprovalRequests/whatsapp`,{name:definition.friendly_name,category:'UTILITY'})
  approval=await request(`/v1/Content/${item.sid}/ApprovalRequests`)
 }
 registry.templates[definition.event]={sid:item.sid,status:approval.whatsapp?.status || 'unsubmitted',category:approval.whatsapp?.category || 'unknown'}
 console.log(definition.event,JSON.stringify(registry.templates[definition.event]))
 writeFileSync('data/whatsapp-utility-template-registry.json',JSON.stringify(registry,null,2)+'\n',{mode:0o600})
}
