# L’Agenda di Simona — Firebase Hosting gratuito

Quotidiano personale con sezioni modificabili, evidenza su Marco Squarta, foto dalle fonti, monitor istituzionale, archivio e stampa su più pagine.

## Architettura

- **Firebase Hosting (Spark)** serve i file statici nella cartella `out`.
- **Firebase Authentication** verifica email e password. Il giornale ammette soltanto l’UID configurato in `lib/firebase-client.ts` e nelle regole Firestore. La password non è presente nel codice.
- **Cloud Firestore Standard** conserva le raccolte, gli interessi richiesti e gli articoli salvati. Le regole proteggono i dati; i file HTML/CSS/JS del sito sono pubblici.
- **GitHub Actions** raccoglie le notizie al minuto 17 di ogni ora e aggiorna Firestore. Non occorrono App Hosting, Cloud Functions o il piano Blaze. I runner standard di GitHub Actions sono gratuiti per questo repository pubblico.

All’apertura e con «Aggiorna» il giornale legge l’ultima raccolta disponibile. Cambiando gli interessi si salva la richiesta per la raccolta successiva, entro il successivo ciclo salvo ritardi di GitHub o delle fonti. Non è una ricerca in tempo reale all’apertura. La data della raccolta è visibile; dopo tre ore compare un avviso. GitHub può ritardare i job e disabilita le pianificazioni dopo 60 giorni senza attività nel repository: in quel caso riattivare il workflow da Actions.

La gratuità è soggetta alle quote Spark. Non attivare Blaze per seguire questa procedura. Gli archivi della precedente versione Sites non vengono trasferiti automaticamente.

## Progetto predisposto

- Progetto: `agendasimona-561ce`
- Web app: `1:202037412917:web:0591189b0498d9201f1d7c`
- UID autorizzato: `RwWKrgrMJRRk7MYWGjSFrgvLKwg2`
- Ramo: `main`

I parametri Firebase Web identificano il progetto e sono pubblici per design. Non sono credenziali amministrative. Nessuna chiave privata deve essere aggiunta al repository.

## Configurazione iniziale nell’account Firebase

1. In Authentication abilitare Email/password e creare l’utente autorizzato (già effettuato). Firebase richiede almeno sei caratteri: il precedente codice a due lettere non è utilizzato.
2. In **Cloud Firestore**, creare il database **Standard**, ID `(default)`, in modalità produzione. Scegliere una località europea. Restare sul piano Spark.
3. Verificare nei domini autorizzati di Authentication `agendasimona-561ce.web.app` e `agendasimona-561ce.firebaseapp.com`.

## Collegamento a GitHub e prima pubblicazione

Sul computer già collegato a Firebase, aprire una copia di questo repository:

```sh
git clone https://github.com/cristianmatarazzi-bot/Agenda_Simona.git
cd Agenda_Simona
npm ci
firebase init hosting:github --project agendasimona-561ce
```

La procedura ufficiale Firebase autorizza GitHub, crea un account di servizio per Hosting e salva una credenziale nei segreti di GitHub. Selezionare `cristianmatarazzi-bot/Agenda_Simona`. I workflow del progetto sono già inclusi: non occorre pubblicare i workflow aggiuntivi generati dalla procedura guidata.

Verificare in GitHub → Settings → Secrets and variables → Actions che esista il segreto `FIREBASE_SERVICE_ACCOUNT_AGENDASIMONA_561CE`. Se la procedura usa un altro nome, allineare i riferimenti nei due workflow al nome effettivo. Non incollare la chiave in chat o in un file pubblico.

Nel progetto Google Cloud, concedere all’account di servizio appena creato anche **Cloud Datastore User**: il raccoglitore deve leggere gli interessi e scrivere i feed. Conservare il ruolo Hosting assegnato dalla procedura Firebase.

Dopo avere creato Firestore, pubblicare le regole dal proprio terminale:

```sh
firebase deploy --only firestore:rules --project agendasimona-561ce
```

Da GitHub → Actions, eseguire manualmente **Aggiorna notizie**, poi **Pubblica giornale su Firebase Hosting**. Le successive modifiche a `main` pubblicano automaticamente il sito; le notizie si aggiornano ogni ora senza ricompilare la pagina.

L’indirizzo atteso dopo una pubblicazione riuscita è `https://agendasimona-561ce.web.app`. La presenza di questo indirizzo nel README non indica che il sito sia già pubblicato.

## Verifica

```sh
npm test
npm run build
```

`out/` è l’unica directory pubblicata. Le API Next.js e il middleware della precedente versione server sono stati rimossi. I test controllano le chiavi delle raccolte, l’intervallo italiano dei sette giorni e la configurazione statica. Accesso reale, autorizzazioni Firestore e raccolta pianificata richiedono la configurazione del progetto e vanno verificati dopo la prima pubblicazione.

Il raccoglitore si può eseguire anche con `npm run collect`, usando credenziali amministrative locali autorizzate tramite Application Default Credentials o la variabile protetta `FIREBASE_SERVICE_ACCOUNT`.

## Fonti e limiti

Gli articoli completi si leggono sui siti originali, che possono richiedere un abbonamento. Quando tutte le fonti di una sezione non rispondono, viene conservata la precedente raccolta con la sua data. Le foto vengono caricate direttamente dalla fonte e nascoste se non disponibili. Il monitor istituzionale conserva una cache e mostra la data dell’ultima lettura; i documenti possono essere precedenti al giorno di consultazione. I social pubblici non offrono un flusso completo garantito senza API e permessi della piattaforma.

Documentazione: [Hosting e GitHub](https://firebase.google.com/docs/hosting/github-integration), [Firebase Authentication](https://firebase.google.com/docs/auth/web/password-auth), [GitHub Actions e costi](https://docs.github.com/en/billing/concepts/product-billing/github-actions), [pianificazioni inattive](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/disable-and-enable-workflows).
