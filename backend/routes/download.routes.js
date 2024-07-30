import express from 'express';
import File from '../models/file.model.js';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.get('/:uuid', async (req, res) => {
    try {
        const file = await File.findOne({ uuid: req.params.uuid });
        if (!file) {
            return res.render('download', { error: 'Link has been expired' });
        }
        
        const filePath = path.join(__dirname, '..', file.path);
        res.download(filePath);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

export default router;
