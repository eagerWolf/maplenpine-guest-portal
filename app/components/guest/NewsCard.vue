<script setup lang="ts">
import { newsTagLabel, type GuestNewsItem } from '#shared/news'
const props=defineProps<{item:GuestNewsItem;compact?:boolean}>()
const {locale}=useLocale()
const title=computed(()=>props.item.title[locale.value]||props.item.title.en||props.item.title.sl)
const parts=computed(()=>{
 const content=props.item.content[locale.value]||props.item.content.en||props.item.content.sl||''
 if(props.compact){
  const text=content.replace(/^(?:[^\n]+? · )?https?:\/\/[^\s]+$/gm,'').trim()
  return [{text:text.length>230?text.slice(0,230).replace(/\s+\S*$/,'')+'…':text,href:undefined}]
 }
 const result:{text:string;href?:string}[]=[]
 let cursor=0
 for(const match of content.matchAll(/^(?:([^\n]+?) · )?(https?:\/\/[^\s]+)$/gm)){
  const [line,label,href]=match
  result.push({text:content.slice(cursor,match.index)},{text:label||href!,href})
  cursor=match.index+line.length
 }
 result.push({text:content.slice(cursor)})
 return result
})
</script>
<template>
 <article class="guest-news-card" :id="`news-${item.id}`">
  <div class="guest-news-tags"><span v-for="tag in item.tags" :key="tag">{{newsTagLabel(tag,locale)}}</span></div>
  <h3>{{title}}</h3>
  <p><template v-for="(part,i) in parts" :key="i"><a v-if="part.href" :href="part.href" target="_blank" rel="noopener noreferrer">{{part.text}}</a><template v-else>{{part.text}}</template></template></p>
 </article>
</template>
<style scoped>
.guest-news-card {padding:18px 0;border-top:1px solid #eee8de;scroll-margin-top:110px}
.guest-news-card:first-child {border-top:0;padding-top:0}
h3 {margin:7px 0;color:#1a2036;font-size:1.05rem;font-weight:700;line-height:1.4}
p {margin:0;color:#1c2541;font-size:.94rem;line-height:1.7;white-space:pre-wrap}
a {color:#16614e;text-decoration:underline;overflow-wrap:anywhere}
.guest-news-tags {display:flex;flex-wrap:wrap;gap:6px}
.guest-news-tags span {padding:3px 9px;border-radius:20px;background:#edf4ef;color:#32634e;font-size:.72rem;font-weight:600}
</style>
