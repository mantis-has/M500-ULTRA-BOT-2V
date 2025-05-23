import { ogmp3 } from '../lib/youtubedl.js'
import yts from 'yt-search'

const handler = async (m, { conn, text, args, command }) => {
  if (!text) return m.reply('🔎 Ingresa un nombre de canción o link de YouTube.')

  try {
    const isYT = ogmp3.isUrl(text)
    let video, result

    if (isYT) {
      // Extraer datos mínimos desde el link directamente
      const search = await yts({ videoId: ogmp3.youtube(text) })
      video = search
    } else {
      const busqueda = await yts(text)
      if (!busqueda || !busqueda.videos.length) return m.reply('❌ No se encontró ningún resultado.')

      video = busqueda.videos[0]
    }

    result = await ogmp3.download(video.url, '320', 'audio')
    if (!result.status) return m.reply(`❌ Error: ${result.error}`)

    const { title, download, thumbnail, quality } = result.result
    const info = `🎵 *Título:* ${video.title}
👤 *Autor:* ${video.author.name}
⏱️ *Duración:* ${video.timestamp}
📆 *Publicado:* ${video.ago}
🎧 *Calidad:* ${quality}kbps
🔗 *Link:* ${video.url}`

    await conn.sendMessage(m.chat, {
      image: { url: thumbnail },
      caption: info,
      contextInfo: {
        externalAdReply: {
          title: title,
          body: 'Descarga MP3',
          thumbnailUrl: thumbnail,
          mediaType: 1,
          mediaUrl: video.url,
          sourceUrl: video.url
        }
      }
    })

    await conn.sendMessage(m.chat, {
      audio: { url: download },
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply(`⚠️ Ocurrió un error: ${e.message}`)
  }
}

handler.command = ['play']
handler.help = ['play <texto o link>']
handler.tags = ['descargas']

export default handler
