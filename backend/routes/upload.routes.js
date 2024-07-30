import express from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import File from '../models/file.model.js';
import dotenv from 'dotenv';
import sendMail from '../services/mailService.js';
import emailTemplate from '../services/emailTemplate.js';

dotenv.config();

const router = express.Router();

let storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});

let upload = multer({
    storage,
    limits: { fileSize: 1000000 * 100 },
}).single('myfile');

router.post('/', (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(500).send({ error: err.message });
        }
        try {
            const file = new File({
                filename: req.file.filename,
                uuid: uuidv4(),
                path: req.file.path,
                size: req.file.size,
            });
            const response = await file.save();
            res.json({ file: `${process.env.APP_BASE_URL}/files/${response.uuid}` });
        } catch (error) {
            res.status(500).send({ error: 'Failed to save file' });
        }
    });
});

router.post('/send', async (req, res) => {
    const { uuid, emailTo, emailFrom, expiresIn } = req.body;
    if (!uuid || !emailTo || !emailFrom) {
        return res.status(422).send({ error: 'All fields are required except expiry.' });
    }

    try {
        const file = await File.findOne({ uuid });
        if (file.sender) {
            return res.status(422).send({ error: 'Email already sent once.' });
        }
        file.sender = emailFrom;
        file.receiver = emailTo;
        await file.save();

        sendMail({
            from: emailFrom,
            to: emailTo,
            subject: 'SweetShare file sharing',
            text: `${emailFrom} shared a file with you.`,
            html: emailTemplate({
                emailFrom,
                downloadLink: `${process.env.APP_BASE_URL}/files/${file.uuid}?source=email`,
                size: parseInt(file.size / 1000) + ' KB',
                expires: '24 hours',
            }),
        })
            .then(() => {
                return res.json({ success: true });
            })
            .catch(err => {
                return res.status(500).json({ error: 'Error in email sending.' });
            });
    } catch (err) {
        return res.status(500).send({ error: 'Something went wrong.' });
    }
});

export default router;
