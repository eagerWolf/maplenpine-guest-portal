import { saveContentImage } from '../../../../utils/contentImages'

export default defineEventHandler(event => saveContentImage(event, 'suggestions', 'suggestions'))
