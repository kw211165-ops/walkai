import makeWASocket, { useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys'
import pino from 'pino'

let balances = {}

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState('auth')
  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: 'silent' })
  })

  sock.ev.on('creds.update', saveCreds)

  if (!sock.authState.creds.registered) {
    let phone = "85265617229" // <-- CHANGE THIS TO YOUR NUMBER, NO +, NO SPACE
    setTimeout(async () => {
      try {
        let code = await sock.requestPairingCode(phone)
        console.log(`PAIRING CODE FOR ${phone}: ${code}`)
      } catch(e) { console.log(e) }
    }, 3000)
  }

  sock.ev.on('connection.update', (up) => {
    const { connection, lastDisconnect } = up
    if (connection === 'open') console.log('WalkAI ONLINE ✅')
    if (connection === 'close' && lastDisconnect?.error?.output?.statusCode!== DisconnectReason.loggedOut) start()
  })

  sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0]
