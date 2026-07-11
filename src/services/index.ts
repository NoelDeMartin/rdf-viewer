import Sessions from './Sessions';

export const services = {
    $sessions: Sessions,
};

export type AppServices = typeof services;

declare module '@aerogel/core' {
    interface Services extends AppServices {}
}
