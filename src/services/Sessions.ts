import { trackModels } from '@aerogel/plugin-solid';
import { facade } from '@noeldemartin/utils';
import { IndexedDBEngine } from 'soukai-bis';

import Session from '@/models/Session';

import Service from './Sessions.state';

export class SessionsService extends Service {
    protected async boot() {
        Session.setEngine(new IndexedDBEngine());

        await trackModels(Session, {
            service: this,
            property: 'all',
        });
    }
}

export default facade(SessionsService);
