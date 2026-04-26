import { Router } from 'express';
import { MeetingController } from '../controllers/MeetingController.js';
import { NoteController } from '../controllers/NoteController.js';
import { AuthController } from '../controllers/AuthController.js';
import { SectorController } from '../controllers/SectorController.js';
import { MeetingTypeController } from '../controllers/MeetingTypeController.js';
import { SettingsController } from '../controllers/SettingsController.js';
import { RoomController } from '../controllers/RoomController.js';

const routes = Router();

// Configurações
routes.get('/settings', SettingsController.get);
routes.put('/settings', SettingsController.update);

// Setores
routes.get('/sectors', SectorController.list);
routes.post('/sectors', SectorController.create);
routes.put('/sectors/:id', SectorController.update);
routes.delete('/sectors/:id', SectorController.delete);


// Reuniões
routes.get('/meetings', MeetingController.list);
routes.post('/meetings', MeetingController.create);
routes.put('/meetings/:id', MeetingController.update);
routes.delete('/meetings/:id', MeetingController.delete);

routes.get('/meeting-types', MeetingTypeController.list);
routes.post('/meeting-types', MeetingTypeController.create);
routes.put('/meeting-types/:id', MeetingTypeController.update);
routes.delete('/meeting-types/:id', MeetingTypeController.delete);

// Notas Diárias
routes.get('/notes', NoteController.get);
routes.post('/notes', NoteController.upsert);

// Salas
routes.get('/rooms', RoomController.list);
routes.post('/rooms', RoomController.create);
routes.put('/rooms/:id', RoomController.update);
routes.delete('/rooms/:id', RoomController.delete);

// Autenticação
routes.post('/login', AuthController.login);

export default routes;