<script setup lang="ts">
const form = defineModel<{
  name: string; email: string; role: string; whatsapp_phone: string
  notify_housekeeper: boolean; notify_checkin: boolean; staff_manager: boolean
  notifications_enabled: boolean; guest_contact: boolean; portal_access: boolean; active: boolean
}>({ required: true })
defineProps<{ busy: boolean; error: string; creating?: boolean }>()
defineEmits<{ save: []; cancel: [] }>()
const roles = [
  { key: 'notify_housekeeper', label: 'Čistilka', detail: 'Opomniki in potrditev čiščenja' },
  { key: 'notify_checkin', label: 'Sprejem', detail: 'Prihodi in spremembe rezervacij' },
  { key: 'staff_manager', label: 'Skrbnik', detail: 'Sistemska opozorila in napake' },
] as const
const options = [
  { key: 'notifications_enabled', label: 'Obveščanje', detail: 'Prejema obvestila za izbrane vloge.' },
  { key: 'guest_contact', label: 'Kontakt za goste', detail: 'Telefonska številka je vidna gostom.' },
  { key: 'portal_access', label: 'Dostop do portala', detail: 'Oseba se lahko prijavi v portal.' },
  { key: 'active', label: 'Aktivna oseba', detail: 'Izklop prekliče dostop, obvestila in povezave.' },
] as const
</script>

<template>
  <form class="person-form" @submit.prevent="$emit('save')">
    <fieldset :disabled="busy" class="form-content">
      <div class="fields">
        <label>Ime in priimek<input v-model="form.name" required autocomplete="off" placeholder="Ime osebe" /></label>
        <label>WhatsApp številka<input v-model="form.whatsapp_phone" type="tel" placeholder="+386 40 123 456" /><span class="hint">Vključno z mednarodno klicno številko.</span></label>
      </div>
      <fieldset class="roles">
        <legend>Vloge</legend>
        <p class="hint">Izberete lahko več vlog.</p>
        <div class="role-grid">
          <label v-for="role in roles" :key="role.key" class="choice" :class="{ selected: form[role.key] }">
            <input v-model="form[role.key]" type="checkbox" />
            <span><strong>{{ role.label }}</strong><small>{{ role.detail }}</small></span>
          </label>
        </div>
      </fieldset>
      <section aria-label="Obveščanje in dostop">
        <h3>Obveščanje in dostop</h3>
        <div class="option-grid">
          <label v-for="option in options" :key="option.key" class="option">
            <span><strong>{{ option.label }}</strong><small>{{ option.detail }}</small></span>
            <input v-model="form[option.key]" type="checkbox" class="switch" />
          </label>
        </div>
      </section>
      <div v-if="form.portal_access" class="login-fields">
        <div class="fields">
          <label>Email za prijavo<input v-model="form.email" required type="email" autocomplete="off" placeholder="ime@primer.si" /></label>
          <label>Pravice v portalu<select v-model="form.role"><option value="staff">Osebje — glede na vloge</option><option value="admin">Administrator — poln dostop</option></select></label>
        </div>
        <p class="hint">Čistilka brez drugih pravic vidi samo koledar čiščenj.</p>
      </div>
    </fieldset>
    <p v-if="error" role="alert" class="form-error">{{ error }}</p>
    <footer>
      <button type="button" class="cancel" :disabled="busy" @click="$emit('cancel')">Prekliči</button>
      <button type="submit" class="save" :disabled="busy">{{ busy ? 'Shranjujem…' : creating ? 'Dodaj osebo' : 'Shrani spremembe' }}</button>
    </footer>
  </form>
</template>

<style scoped>
.person-form{border-top:1px solid #e7e5e4;background:#fcfcfa;padding:24px}.form-content{display:grid;gap:24px;min-width:0;border:0;padding:0;margin:0}.fields{display:grid;grid-template-columns:1fr 1fr;gap:18px}.fields label{display:flex;flex-direction:column;gap:7px;font-size:13px;font-weight:600;color:#44403c}.fields input,.fields select{width:100%;min-width:0;border:1px solid #d6d3d1;border-radius:8px;background:white;padding:10px 12px;font-size:14px;font-weight:400;color:#292524;outline:none}.fields input:focus,.fields select:focus{border-color:#58745c;box-shadow:0 0 0 3px #e7eee7}.hint{font-size:12px;color:#78716c;font-weight:400;line-height:1.5}.roles{border:0;padding:0;margin:0;min-width:0}.roles legend,h3{font-size:13px;font-weight:600;color:#44403c;margin:0 0 6px}.role-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:10px}.choice{display:flex;align-items:flex-start;gap:10px;padding:13px 12px;border:1px solid #e7e5e4;border-radius:9px;background:white;cursor:pointer}.choice.selected{border-color:#8ea38e;background:#f0f5ef}.choice input{margin-top:3px;accent-color:#456149;width:16px;height:16px;flex-shrink:0}.choice strong,.option strong{display:block;font-size:13px;font-weight:600;color:#292524}.choice small,.option small{display:block;font-size:12px;color:#78716c;line-height:1.5;margin-top:3px}.option-grid{display:grid;grid-template-columns:1fr 1fr;column-gap:24px}.option{display:flex;align-items:center;justify-content:space-between;gap:15px;padding:14px 0;border-bottom:1px solid #e7e5e4;cursor:pointer}.switch{appearance:none;width:34px;height:20px;border-radius:20px;background:#d6d3d1;position:relative;flex-shrink:0;cursor:pointer;transition:background .15s}.switch:before{content:'';position:absolute;width:14px;height:14px;top:3px;left:3px;background:white;border-radius:50%;box-shadow:0 1px 2px #0002;transition:transform .15s}.switch:checked{background:#4b6750}.switch:checked:before{transform:translateX(14px)}input:focus-visible,button:focus-visible{outline:2px solid #456149;outline-offset:3px}.login-fields{background:#f2f1ed;padding:16px;border-radius:9px}.login-fields>.hint{margin-top:10px}footer{display:flex;justify-content:flex-end;gap:10px;margin-top:22px}footer button{border-radius:8px;font-size:13px;font-weight:600;padding:10px 16px}.save{background:#3f5c45;color:white}.save:hover{background:#304b36}.cancel{background:white;border:1px solid #d6d3d1;color:#57534e}.cancel:hover{background:#f5f5f4}.form-error{font-size:13px;color:#b91c1c;margin-top:16px}button:disabled{opacity:.5;cursor:wait}@media(max-width:640px){.person-form{padding:18px}.fields,.role-grid,.option-grid{grid-template-columns:1fr}.form-content{gap:20px}.choice small{margin-top:0}footer button{flex:1}}
</style>
