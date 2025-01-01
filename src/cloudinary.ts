import { v2 as cloudinary } from 'cloudinary';
import { API_KEY, API_SECRET, CLOUD_NAME } from './secrets';

cloudinary.config({ 
    cloud_name: CLOUD_NAME, 
    api_key: '5382632810901', 
    api_secret: API_SECRET // Click 'View API Keys' above to copy your API secret
});

export default cloudinary