import { saveContentImage } from '../../../../utils/contentImages'

export default defineEventHandler(event => saveContentImage(event, 'restaurants', 'restaurants'))
