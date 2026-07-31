import { saveContentImage } from '../../../../utils/contentImages'

export default defineEventHandler(event => saveContentImage(event, 'howto_items', 'howto'))
