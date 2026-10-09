# L’Agenda di Simona

Quotidiano personale per il lavoro di portavoce: notizie per argomento, evidenza su Marco Squarta, monitoraggio istituzionale, agenda, archivio condiviso e stampa su più pagine.

Versione autonoma Next.js per **Firebase App Hosting**, con codice su GitHub. Non richiede l’accesso a ChatGPT. GitHub Pages non esegue il server necessario a questa applicazione.

## Pubblicazione

1. Crea un progetto Firebase dedicato e attiva il piano Blaze, richiesto da App Hosting (fatturazione a consumo).
2. Crea un database Cloud Firestore `(default)` in modalità produzione.
3. In **App Hosting**, collega questo repository, scegli il ramo `main` e la cartella radice `/`. Annota l’ID del backend. La configurazione è in `apphosting.yaml`.
4. Crea i due segreti sotto indicati, concedi l’accesso al backend e avvia un rollout. Un primo rollout senza segreti configurati può fallire.
5. Assegna all’account di servizio di runtime del backend il ruolo **Cloud Datastore User** nel progetto, se non già presente: serve per archivio, cache e limite dei tentativi di accesso.
6. Pubblica le regole Firestore nel progetto dedicato e verifica il link HTTPS fornito da App Hosting.

Da un terminale con Node.js e Firebase CLI:

```sh
npm install -g firebase-tools
firebase login
firebase apphosting:secrets:set agenda-password --project ID_PROGETTO
firebase apphosting:secrets:set agenda-session-secret --project ID_PROGETTO
firebase apphosting:secrets:grantaccess agenda-password --backend ID_BACKEND --project ID_PROGETTO
firebase apphosting:secrets:grantaccess agenda-session-secret --backend ID_BACKEND --project ID_PROGETTO
firebase deploy --only firestore:rules --project ID_PROGETTO
```

Inserisci la password scelta al prompt di `agenda-password`. Per `agenda-session-secret` usa un valore casuale di almeno 32 caratteri, generato ad esempio con:

```sh
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
```

Non inserire i valori dei segreti nel repository. Dopo modifiche ai segreti esegui un nuovo rollout; la rotazione della password invalida le sessioni precedenti.

Documentazione: [configurazione App Hosting](https://firebase.google.com/docs/app-hosting/configure), [costi](https://firebase.google.com/docs/app-hosting/costs).

## Accesso e dati

La password viene verificata dal server. Il cookie firmato è HttpOnly, Secure in produzione e dura sette giorni. Il pulsante **Esci** chiude la sessione. Le API del giornale richiedono la stessa sessione; dieci tentativi al minuto complessivi limitano le prove di password.

Firestore conserva l’archivio condiviso, la cache istituzionale e il contatore degli accessi. Le regole negano l’accesso diretto dai client; il server usa le proprie credenziali di servizio. Gli articoli già salvati nella precedente versione Sites non vengono trasferiti automaticamente: il nuovo archivio parte vuoto. Le preferenze degli argomenti restano nel browser utilizzato.

Le notizie vengono aggiornate alla richiesta da fonti esterne. La disponibilità dipende dai siti di origine; nessun accesso ai contenuti a pagamento è incluso. Il monitor istituzionale usa dati verificati di riserva se la fonte non risponde e mostra le date. Le immagini vengono mostrate quando recuperabili dalle fonti autorizzate. I profili social pubblici non garantiscono un flusso automatico completo senza API e permessi della piattaforma.

## Sviluppo e verifica

```sh
npm ci
cp .env.example .env.local
npm test
npm run build
npm run dev
```

Compila `.env.local` con credenziali di prova. Per le funzioni che usano Firestore servono anche le Application Default Credentials autorizzate al progetto (oppure un emulatore Firestore configurato tramite `FIRESTORE_EMULATOR_HOST`). Non commettere file di credenziali.

I test automatici verificano firma, scadenza, manomissione, rotazione e assenza dei segreti. Login completo, archivio e refresh delle fonti vanno verificati sul progetto Firebase configurato.
