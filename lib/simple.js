const axios = require('axios');
const chalk = require('chalk');
const FileType = require('file-type');
const fs = require('fs');
const path = require('path');
const { Markup } = require('telegraf');

function escapeMarkdown(text) {
  if (typeof text !== 'string') return text;
  return text.replace(/([_*\[\]()~`>#+=|{}.!-])/g, '\\$1');
}

function safeParseMode(text, parseMode) {
  if (parseMode === null || parseMode === false) {
    return { text, parseMode: undefined };
  }
  
  if (parseMode === 'Markdown' || parseMode === 'MarkdownV2') {
    try {
      return { text, parseMode };
    } catch (error) {
      return { text: escapeMarkdown(text), parseMode };
    }
  }
  
  return { text, parseMode: parseMode || 'Markdown' };
}

function initializeHelper(bot) {

  bot.sendMessage = async function(chatId, textOrOptions, options = {}) {
    try {
      let replyToMessageId = null;
      
      if (typeof options === 'object' && options.id) {
        replyToMessageId = options.id;
      } else if (typeof options === 'object' && options.message_id) {
        replyToMessageId = options.message_id;
      }

      if (typeof textOrOptions === 'object' && !Buffer.isBuffer(textOrOptions)) {
        const msg = textOrOptions;
        const parseMode = msg.parse_mode !== undefined ? msg.parse_mode : (options.parse_mode !== undefined ? options.parse_mode : 'Markdown');

        if (msg.video) {
          const videoSource = msg.video.url || msg.video;
          let videoBuffer;

          if (Buffer.isBuffer(videoSource)) {
            videoBuffer = videoSource;
          } else if (typeof videoSource === 'string' && /^https?:\/\//.test(videoSource)) {
            const response = await axios.get(videoSource, { responseType: 'arraybuffer' });
            videoBuffer = Buffer.from(response.data);
          } else if (fs.existsSync(videoSource)) {
            videoBuffer = fs.readFileSync(videoSource);
          }

          const caption = msg.caption || '';
          const safeParse = safeParseMode(caption, parseMode);
          
          return await this.telegram.sendVideo(chatId, { source: videoBuffer }, {
            caption: safeParse.text,
            parse_mode: safeParse.parseMode,
            reply_to_message_id: replyToMessageId || msg.reply_to_message_id,
            supports_streaming: msg.supports_streaming || false,
            ...msg.options
          });
        }

        if (msg.audio) {
          const audioSource = msg.audio.url || msg.audio;
          let audioBuffer;

          if (Buffer.isBuffer(audioSource)) {
            audioBuffer = audioSource;
          } else if (typeof audioSource === 'string' && /^https?:\/\//.test(audioSource)) {
            const response = await axios.get(audioSource, { responseType: 'arraybuffer' });
            audioBuffer = Buffer.from(response.data);
          } else if (fs.existsSync(audioSource)) {
            audioBuffer = fs.readFileSync(audioSource);
          }

          const caption = msg.caption || '';
          const safeParse = safeParseMode(caption, parseMode);

          return await this.telegram.sendAudio(chatId, { source: audioBuffer }, {
            caption: safeParse.text,
            parse_mode: safeParse.parseMode,
            reply_to_message_id: replyToMessageId || msg.reply_to_message_id,
            ...msg.options
          });
        }

        if (msg.image || msg.photo) {
          const imageSource = msg.image || msg.photo;
          const imgSrc = imageSource.url || imageSource;
          let imageBuffer;

          if (Buffer.isBuffer(imgSrc)) {
            imageBuffer = imgSrc;
          } else if (typeof imgSrc === 'string' && /^https?:\/\//.test(imgSrc)) {
            const response = await axios.get(imgSrc, { responseType: 'arraybuffer' });
            imageBuffer = Buffer.from(response.data);
          } else if (fs.existsSync(imgSrc)) {
            imageBuffer = fs.readFileSync(imgSrc);
          }

          const caption = msg.caption || '';
          const safeParse = safeParseMode(caption, parseMode);

          return await this.telegram.sendPhoto(chatId, { source: imageBuffer }, {
            caption: safeParse.text,
            parse_mode: safeParse.parseMode,
            reply_to_message_id: replyToMessageId || msg.reply_to_message_id,
            ...msg.options
          });
        }

        if (msg.document) {
          const docSource = msg.document.url || msg.document;
          let docBuffer;
          let filename = msg.filename || 'document';

          if (Buffer.isBuffer(docSource)) {
            docBuffer = docSource;
          } else if (typeof docSource === 'string' && /^https?:\/\//.test(docSource)) {
            const response = await axios.get(docSource, { responseType: 'arraybuffer' });
            docBuffer = Buffer.from(response.data);
          } else if (fs.existsSync(docSource)) {
            docBuffer = fs.readFileSync(docSource);
            filename = path.basename(docSource);
          }

          const caption = msg.caption || '';
          const safeParse = safeParseMode(caption, parseMode);

          return await this.telegram.sendDocument(chatId, { source: docBuffer, filename }, {
            caption: safeParse.text,
            parse_mode: safeParse.parseMode,
            reply_to_message_id: replyToMessageId || msg.reply_to_message_id,
            ...msg.options
          });
        }

        if (msg.sticker) {
          const stickerSource = msg.sticker.url || msg.sticker;
          let stickerBuffer;

          if (Buffer.isBuffer(stickerSource)) {
            stickerBuffer = stickerSource;
          } else if (typeof stickerSource === 'string' && /^https?:\/\//.test(stickerSource)) {
            const response = await axios.get(stickerSource, { responseType: 'arraybuffer' });
            stickerBuffer = Buffer.from(response.data);
          } else if (fs.existsSync(stickerSource)) {
            stickerBuffer = fs.readFileSync(stickerSource);
          }

          return await this.telegram.sendSticker(chatId, { source: stickerBuffer }, {
            reply_to_message_id: replyToMessageId || msg.reply_to_message_id,
            ...msg.options
          });
        }

        if (msg.text) {
          const text = msg.text;
          const safeParse = safeParseMode(text, parseMode);
          
          return await this.telegram.sendMessage(chatId, safeParse.text, {
            parse_mode: safeParse.parseMode,
            reply_to_message_id: replyToMessageId || msg.reply_to_message_id,
            ...msg.options
          });
        }
      }

      const parseMode = options.parse_mode !== undefined ? options.parse_mode : 'Markdown';
      const text = textOrOptions;
      const safeParse = safeParseMode(text, parseMode);

      return await this.telegram.sendMessage(chatId, safeParse.text, {
        ...options,
        parse_mode: safeParse.parseMode,
        reply_to_message_id: replyToMessageId
      });
    } catch (error) {
      try {
        const text = typeof textOrOptions === 'string' ? textOrOptions : (textOrOptions.text || 'Error sending message');
        return await this.telegram.sendMessage(chatId, text);
      } catch (retryError) {
        throw error;
      }
    }
  };

  bot.reply = async function(chatId, text, replyToMessageId = null, options = {}) {
    try {
      if (typeof chatId === 'object' && chatId.chat) {
        const m = chatId;
        replyToMessageId = m.id || m.message_id;
        chatId = m.chat;
      }

      const parseMode = options.parse_mode !== undefined ? options.parse_mode : 'Markdown';
      const safeParse = safeParseMode(text, parseMode);

      if (replyToMessageId === null || replyToMessageId === undefined) {
        return await this.telegram.sendMessage(chatId, safeParse.text, {
          ...options,
          parse_mode: safeParse.parseMode
        });
      }

      return await this.telegram.sendMessage(chatId, safeParse.text, {
        ...options,
        reply_to_message_id: replyToMessageId,
        parse_mode: safeParse.parseMode
      });
    } catch (error) {
      throw error;
    }
  };

  bot.sendPhoto = async function(chatId, photo, options = {}) {
    try {
      let photoBuffer;

      if (Buffer.isBuffer(photo)) {
        photoBuffer = photo;
      } else if (typeof photo === 'string' && /^https?:\/\//.test(photo)) {
        const response = await axios.get(photo, { responseType: 'arraybuffer' });
        photoBuffer = Buffer.from(response.data);
      } else if (fs.existsSync(photo)) {
        photoBuffer = fs.readFileSync(photo);
      } else {
        photoBuffer = photo;
      }

      const parseMode = options.parse_mode !== undefined ? options.parse_mode : 'Markdown';
      const caption = options.caption || '';
      const safeParse = safeParseMode(caption, parseMode);

      return await this.telegram.sendPhoto(chatId, { source: photoBuffer }, {
        caption: safeParse.text,
        parse_mode: safeParse.parseMode,
        ...options
      });
    } catch (error) {
      throw error;
    }
  };

  bot.sendVideo = async function(chatId, video, options = {}) {
    try {
      let videoBuffer;

      if (Buffer.isBuffer(video)) {
        videoBuffer = video;
      } else if (typeof video === 'string' && /^https?:\/\//.test(video)) {
        const response = await axios.get(video, { responseType: 'arraybuffer' });
        videoBuffer = Buffer.from(response.data);
      } else if (fs.existsSync(video)) {
        videoBuffer = fs.readFileSync(video);
      } else {
        videoBuffer = video;
      }

      const parseMode = options.parse_mode !== undefined ? options.parse_mode : 'Markdown';
      const caption = options.caption || '';
      const safeParse = safeParseMode(caption, parseMode);

      return await this.telegram.sendVideo(chatId, { source: videoBuffer }, {
        caption: safeParse.text,
        parse_mode: safeParse.parseMode,
        ...options
      });
    } catch (error) {
      throw error;
    }
  };

  bot.sendAudio = async function(chatId, audio, options = {}) {
    try {
      let audioBuffer;

      if (Buffer.isBuffer(audio)) {
        audioBuffer = audio;
      } else if (typeof audio === 'string' && /^https?:\/\//.test(audio)) {
        const response = await axios.get(audio, { responseType: 'arraybuffer' });
        audioBuffer = Buffer.from(response.data);
      } else if (fs.existsSync(audio)) {
        audioBuffer = fs.readFileSync(audio);
      } else {
        audioBuffer = audio;
      }

      const parseMode = options.parse_mode !== undefined ? options.parse_mode : 'Markdown';
      const caption = options.caption || '';
      const safeParse = safeParseMode(caption, parseMode);

      return await this.telegram.sendAudio(chatId, { source: audioBuffer }, {
        caption: safeParse.text,
        parse_mode: safeParse.parseMode,
        ...options
      });
    } catch (error) {
      throw error;
    }
  };

  bot.profilePictureUrl = async function(userId) {
  try {
    const photos = await this.telegram.getUserProfilePhotos(userId, 0, 1);
    
    if (!photos || !photos.photos || photos.photos.length === 0) {
      return null;
    }

    const photo = photos.photos[0];
    const fileId = photo[photo.length - 1].file_id;
    const file = await this.telegram.getFile(fileId);
    const fileUrl = `https://api.telegram.org/file/bot${this.telegram.token}/${file.file_path}`;
    const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
    
    return Buffer.from(response.data);
  } catch (error) {
    return null;
  }
};


  bot.sendDocument = async function(chatId, document, options = {}) {
    try {
      let docBuffer;
      let filename = options.filename || 'document';

      if (Buffer.isBuffer(document)) {
        docBuffer = document;
      } else if (typeof document === 'string' && /^https?:\/\//.test(document)) {
        const response = await axios.get(document, { responseType: 'arraybuffer' });
        docBuffer = Buffer.from(response.data);
      } else if (fs.existsSync(document)) {
        docBuffer = fs.readFileSync(document);
        filename = path.basename(document);
      } else {
        docBuffer = document;
      }

      const parseMode = options.parse_mode !== undefined ? options.parse_mode : 'Markdown';
      const caption = options.caption || '';
      const safeParse = safeParseMode(caption, parseMode);

      return await this.telegram.sendDocument(chatId, { source: docBuffer, filename }, {
        caption: safeParse.text,
        parse_mode: safeParse.parseMode,
        ...options
      });
    } catch (error) {
      throw error;
    }
  };

  bot.sendSticker = async function(chatId, sticker, options = {}) {
    try {
      let stickerBuffer;

      if (Buffer.isBuffer(sticker)) {
        stickerBuffer = sticker;
      } else if (typeof sticker === 'string' && /^https?:\/\//.test(sticker)) {
        const response = await axios.get(sticker, { responseType: 'arraybuffer' });
        stickerBuffer = Buffer.from(response.data);
      } else if (fs.existsSync(sticker)) {
        stickerBuffer = fs.readFileSync(sticker);
      } else {
        stickerBuffer = sticker;
      }

      return await this.telegram.sendSticker(chatId, { source: stickerBuffer }, options);
    } catch (error) {
      throw error;
    }
  };
    
  bot.getChatAdministrators = async function(chatId) {
    try {
      return await this.telegram.getChatAdministrators(chatId);
    } catch (error) {
      throw error;
    }
  };

  bot.groupMetadata = async function(chatId, getAllMembers = false) {
    try {
      const chat = await this.telegram.getChat(chatId);
      const admins = await this.telegram.getChatAdministrators(chatId).catch(() => []);
      const membersCount = await this.telegram.getChatMembersCount(chatId).catch(() => 0);
      
      let participants = admins.map(admin => ({
        id: admin.user.id,
        admin: admin.status === 'creator' ? 'superadmin' : (admin.status === 'administrator' ? 'admin' : null),
        isSuperAdmin: admin.status === 'creator',
        isAdmin: admin.status === 'administrator' || admin.status === 'creator',
        username: admin.user.username || null,
        name: admin.user.first_name || admin.user.username || 'User',
        status: admin.status
      }));

      let photoBuffer = null;
      if (chat.photo && chat.photo.big_file_id) {
        try {
          const fileLink = await this.telegram.getFileLink(chat.photo.big_file_id);
          const response = await axios.get(fileLink.href, { responseType: 'arraybuffer' });
          photoBuffer = Buffer.from(response.data);
        } catch (error) {
          photoBuffer = null;
        }
      }

      return {
        id: chat.id,
        subject: chat.title || 'Group',
        subjectOwner: chat.username || null,
        subjectTime: chat.date || null,
        creation: chat.date || null,
        owner: admins.find(a => a.status === 'creator')?.user.id || null,
        desc: chat.description || '',
        descId: chat.description ? chat.id : null,
        restrict: chat.permissions ? !chat.permissions.can_send_messages : false,
        announce: chat.permissions ? !chat.permissions.can_send_messages : false,
        participants: participants,
        admins: admins.filter(a => a.status === 'administrator' || a.status === 'creator').map(a => a.user.id),
        size: membersCount,
        participantsCount: participants.length,
        invite: chat.invite_link || null,
        photo: photoBuffer,
        chatType: chat.type,
        metadata: chat
      };
    } catch (error) {
      throw error;
    }
  };

  bot.isAdmin = async function(chatId, userId) {
    try {
      const metadata = await this.groupMetadata(chatId);
      return metadata.admins.includes(userId);
    } catch (error) {
      return false;
    }
  };

  bot.sendFile = async function(chatId, file, filename = '', caption = '', quoted = null, options = {}) {
    let data;
    let mimeType = null;

    try {
      if (typeof chatId === 'object' && chatId.chat) {
        if (chatId.id || chatId.message_id) {
          quoted = chatId;
        }
        chatId = chatId.chat;
      }

      if (typeof file === 'object' && !Buffer.isBuffer(file)) {
        const fileObj = file;
        file = fileObj.file || fileObj.url || fileObj.path || fileObj.buffer;
        filename = fileObj.filename || fileObj.name || filename;
        caption = fileObj.caption || caption;
        quoted = fileObj.quoted || fileObj.reply || quoted;
        mimeType = fileObj.mimetype || fileObj.type || null;
        options = { ...options, ...fileObj.options };
        
        if (fileObj.ptt !== undefined) options.ptt = fileObj.ptt;
        if (fileObj.asDocument !== undefined) options.asDocument = fileObj.asDocument;
        if (fileObj.performer) options.performer = fileObj.performer;
        if (fileObj.title) options.title = fileObj.title;
        if (fileObj.duration) options.duration = fileObj.duration;
        if (fileObj.width) options.width = fileObj.width;
        if (fileObj.height) options.height = fileObj.height;
        if (fileObj.thumbnail) options.thumbnail = fileObj.thumbnail;
        if (fileObj.supports_streaming !== undefined) options.supports_streaming = fileObj.supports_streaming;
      }

      mimeType = mimeType || options.mimetype || null;

      if (Buffer.isBuffer(file)) {
        data = file;
      } else if (typeof file === 'string') {
        if (/^https?:\/\//.test(file)) {
          const response = await axios.get(file, { 
            responseType: 'arraybuffer',
            timeout: 30000,
            maxContentLength: 50 * 1024 * 1024
          });
          data = Buffer.from(response.data);
          
          if (!mimeType && response.headers['content-type']) {
            mimeType = response.headers['content-type'].split(';')[0];
          }
          
          if (!filename || filename === '') {
            const contentDisposition = response.headers['content-disposition'];
            if (contentDisposition) {
              const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
              if (match && match[1]) {
                filename = match[1].replace(/['"]/g, '');
              }
            } else {
              const urlPath = new URL(file).pathname;
              const urlFilename = path.basename(urlPath);
              if (urlFilename && urlFilename !== '/') {
                filename = urlFilename;
              }
            }
          }
        } else if (fs.existsSync(file)) {
          data = fs.readFileSync(file);
          if (!filename || filename === '') {
            filename = path.basename(file);
          }
        } else {
          throw new Error('Invalid file: URL not valid or file not found');
        }
      } else {
        throw new Error('Invalid file input: must be Buffer, URL, or file path');
      }

      if (!mimeType) {
        const type = await FileType.fromBuffer(data);
        mimeType = type ? type.mime : 'application/octet-stream';
      }

      if (!filename || filename === '') {
        const type = await FileType.fromBuffer(data);
        const ext = type ? type.ext : 'bin';
        filename = `file.${ext}`;
      }

      let replyToMessageId = null;
      if (quoted) {
        if (typeof quoted === 'object' && (quoted.id || quoted.message_id)) {
          replyToMessageId = quoted.id || quoted.message_id;
        } else if (typeof quoted === 'number') {
          replyToMessageId = quoted;
        }
      }

      const parseMode = options.parse_mode !== undefined ? options.parse_mode : 'Markdown';
      const safeParse = safeParseMode(caption || '', parseMode);

      const commonOptions = {
        caption: safeParse.text,
        parse_mode: safeParse.parseMode,
        reply_to_message_id: replyToMessageId || options.reply_to_message_id || options.reply_to,
        disable_notification: options.disable_notification || false
      };

      if (options.ptt) {
        return await this.telegram.sendVoice(chatId, { source: data }, {
          ...commonOptions,
          duration: options.duration
        });
      }

      if (options.asDocument) {
        return await this.telegram.sendDocument(chatId, { 
          source: data, 
          filename: filename 
        }, {
          ...commonOptions,
          thumbnail: options.thumbnail,
          disable_content_type_detection: options.disable_content_type_detection
        });
      }

      if (mimeType.startsWith('image/')) {
        return await this.telegram.sendPhoto(chatId, { source: data }, commonOptions);
      } else if (mimeType.startsWith('video/')) {
        return await this.telegram.sendVideo(chatId, { source: data }, {
          ...commonOptions,
          supports_streaming: options.supports_streaming !== false,
          duration: options.duration,
          width: options.width,
          height: options.height,
          thumbnail: options.thumbnail
        });
      } else if (mimeType.startsWith('audio/')) {
        return await this.telegram.sendAudio(chatId, { source: data }, {
          ...commonOptions,
          duration: options.duration,
          performer: options.performer,
          title: options.title,
          thumbnail: options.thumbnail
        });
      } else if (mimeType === 'image/webp' && data.length < 500000) {
        return await this.telegram.sendSticker(chatId, { source: data }, {
          reply_to_message_id: commonOptions.reply_to_message_id,
          disable_notification: commonOptions.disable_notification
        });
      } else {
        return await this.telegram.sendDocument(chatId, { 
          source: data, 
          filename: filename 
        }, {
          ...commonOptions,
          thumbnail: options.thumbnail,
          disable_content_type_detection: options.disable_content_type_detection
        });
      }

    } catch (error) {
      if (data && Buffer.isBuffer(data)) {
        try {
          return await this.telegram.sendDocument(chatId, { 
            source: data, 
            filename: filename || 'file'
          }, {
            caption: caption || ''
          });
        } catch (fallbackError) {
          throw error;
        }
      }
      throw error;
    }
  }
  
  bot.sendFiles = async function(chatId, files, caption = '', quoted = null, options = {}) {
    try {
      if (!Array.isArray(files)) {
        throw new Error('files parameter must be an array');
      }

      if (typeof chatId === 'object' && chatId.chat) {
        if (chatId.id || chatId.message_id) {
          quoted = chatId;
        }
        chatId = chatId.chat;
      }

      const results = [];
      for (let i = 0; i < files.length; i++) {
        let fileInput, fileOptions, fileCaption, fileFilename;
        
        if (typeof files[i] === 'object' && !Buffer.isBuffer(files[i])) {
          fileInput = files[i].file || files[i].url || files[i].path;
          fileFilename = files[i].filename || '';
          fileCaption = files[i].caption || (i === 0 ? caption : '');
          fileOptions = { ...options, ...files[i].options };
        } else {
          fileInput = files[i];
          fileFilename = '';
          fileCaption = i === 0 ? caption : '';
          fileOptions = options;
        }
        
        const result = await this.sendFile(chatId, fileInput, fileFilename, fileCaption, quoted, fileOptions);
        results.push(result);
        
        if (i < files.length - 1) {
          await this.delay(500);
        }
      }
      
      return results;
    } catch (error) {
      throw error;
    }
  };

  bot.downloadMedia = async function(msg) {
    try {
      let fileId;

      if (msg.photo) {
        fileId = msg.photo[msg.photo.length - 1].file_id;
      } else if (msg.video) {
        fileId = msg.video.file_id;
      } else if (msg.document) {
        fileId = msg.document.file_id;
      } else if (msg.audio) {
        fileId = msg.audio.file_id;
      } else if (msg.voice) {
        fileId = msg.voice.file_id;
      } else if (msg.sticker) {
        fileId = msg.sticker.file_id;
      } else {
        throw new Error('No media found in message');
      }

      const fileLink = await this.telegram.getFileLink(fileId);
      const response = await axios.get(fileLink.href, { responseType: 'arraybuffer' });
      return Buffer.from(response.data);
    } catch (error) {
      throw error;
    }
  };

  bot.sendButton = async function(chatId, options = {}) {
    try {
      if (typeof chatId === 'object' && chatId.chat) {
        chatId = chatId.chat;
      }

      const {
        text = '',
        caption = '',
        image,
        photo,
        video,
        audio,
        document,
        sticker,
        buttons = [],
        footer = '',
        parse_mode,
        reply_to_message_id,
        reply_to,
        ...extraOptions
      } = options;

      const replyToMessageId = reply_to_message_id || reply_to;
      const messageText = text || caption;
      const fullText = messageText + (footer ? `\n\n${footer}` : '');
      const parseMode = parse_mode !== undefined ? parse_mode : 'Markdown';
      const safeParse = safeParseMode(fullText, parseMode);

      if (!Array.isArray(buttons) || buttons.length === 0) {
        throw new Error('Buttons must be a non-empty array');
      }

      const processedButtons = [];

      for (const buttonRow of buttons) {
        const rowButtons = [];
        const buttonsInRow = Array.isArray(buttonRow) ? buttonRow : [buttonRow];

        for (const btn of buttonsInRow) {
          const buttonType = btn.type || 'callback';

          switch (buttonType.toLowerCase()) {
            case 'url':
              rowButtons.push(
                Markup.button.url(btn.name || btn.text, btn.value || btn.url)
              );
              break;

            case 'callback':
              rowButtons.push(
                Markup.button.callback(
                  btn.name || btn.text,
                  btn.id || btn.value || btn.data || (btn.name || btn.text)
                )
              );
              break;

            case 'web_app':
            case 'webapp':
              rowButtons.push(
                Markup.button.webApp(
                  btn.name || btn.text,
                  btn.value || btn.url
                )
              );
              break;

            case 'login':
            case 'login_url':
              rowButtons.push(
                Markup.button.login(
                  btn.name || btn.text,
                  btn.value || btn.url
                )
              );
              break;

            case 'switch_inline':
            case 'switchInline':
              rowButtons.push(
                Markup.button.switchToChat(
                  btn.name || btn.text,
                  btn.value || btn.query || ''
                )
              );
              break;

            case 'switch_inline_current':
            case 'switchInlineCurrent':
              rowButtons.push(
                Markup.button.switchToCurrentChat(
                  btn.name || btn.text,
                  btn.value || btn.query || ''
                )
              );
              break;

            case 'game':
              rowButtons.push(
                Markup.button.game(btn.name || btn.text)
              );
              break;

            case 'pay':
              rowButtons.push(
                Markup.button.pay(btn.name || btn.text)
              );
              break;

            default:
              rowButtons.push(
                Markup.button.callback(
                  btn.name || btn.text,
                  btn.id || btn.value || (btn.name || btn.text)
                )
              );
          }
        }

        if (rowButtons.length > 0) {
          processedButtons.push(rowButtons);
        }
      }

      const keyboard = Markup.inlineKeyboard(processedButtons);

      const sendOptions = {
        ...keyboard,
        parse_mode: safeParse.parseMode,
        reply_to_message_id: replyToMessageId,
        ...extraOptions
      };

      if (image || photo) {
        const imgSource = image || photo;
        let imageBuffer;

        if (Buffer.isBuffer(imgSource)) {
          imageBuffer = imgSource;
        } else if (typeof imgSource === 'string' && /^https?:\/\//.test(imgSource)) {
          const response = await axios.get(imgSource, { responseType: 'arraybuffer' });
          imageBuffer = Buffer.from(response.data);
        } else if (fs.existsSync(imgSource)) {
          imageBuffer = fs.readFileSync(imgSource);
        } else {
          imageBuffer = imgSource;
        }

        return await this.telegram.sendPhoto(
          chatId,
          { source: imageBuffer },
          {
            caption: safeParse.text,
            ...sendOptions
          }
        );
      }

      if (video) {
        let videoBuffer;

        if (Buffer.isBuffer(video)) {
          videoBuffer = video;
        } else if (typeof video === 'string' && /^https?:\/\//.test(video)) {
          const response = await axios.get(video, { responseType: 'arraybuffer' });
          videoBuffer = Buffer.from(response.data);
        } else if (fs.existsSync(video)) {
          videoBuffer = fs.readFileSync(video);
        } else {
          videoBuffer = video;
        }

        return await this.telegram.sendVideo(
          chatId,
          { source: videoBuffer },
          {
            caption: safeParse.text,
            ...sendOptions
          }
        );
      }

      if (audio) {
        let audioBuffer;

        if (Buffer.isBuffer(audio)) {
          audioBuffer = audio;
        } else if (typeof audio === 'string' && /^https?:\/\//.test(audio)) {
          const response = await axios.get(audio, { responseType: 'arraybuffer' });
          audioBuffer = Buffer.from(response.data);
        } else if (fs.existsSync(audio)) {
          audioBuffer = fs.readFileSync(audio);
        } else {
          audioBuffer = audio;
        }

        return await this.telegram.sendAudio(
          chatId,
          { source: audioBuffer },
          {
            caption: safeParse.text,
            ...sendOptions
          }
        );
      }

      if (document) {
        let docBuffer;
        let filename = options.filename || 'document';

        if (Buffer.isBuffer(document)) {
          docBuffer = document;
        } else if (typeof document === 'string' && /^https?:\/\//.test(document)) {
          const response = await axios.get(document, { responseType: 'arraybuffer' });
          docBuffer = Buffer.from(response.data);
        } else if (fs.existsSync(document)) {
          docBuffer = fs.readFileSync(document);
          filename = path.basename(document);
        } else {
          docBuffer = document;
        }

        return await this.telegram.sendDocument(
          chatId,
          { source: docBuffer, filename },
          {
            caption: safeParse.text,
            ...sendOptions
          }
        );
      }

      if (sticker) {
        let stickerBuffer;

        if (Buffer.isBuffer(sticker)) {
          stickerBuffer = sticker;
        } else if (typeof sticker === 'string' && /^https?:\/\//.test(sticker)) {
          const response = await axios.get(sticker, { responseType: 'arraybuffer' });
          stickerBuffer = Buffer.from(response.data);
        } else if (fs.existsSync(sticker)) {
          stickerBuffer = fs.readFileSync(sticker);
        } else {
          stickerBuffer = sticker;
        }

        return await this.telegram.sendSticker(
          chatId,
          { source: stickerBuffer },
          sendOptions
        );
      }

      return await this.telegram.sendMessage(
        chatId,
        safeParse.text,
        sendOptions
      );

    } catch (error) {
      console.error('Error in sendButton:', error);
      throw error;
    }
  };

  bot.sendKeyboard = async function(chatId, options = {}) {
    try {
      if (typeof chatId === 'object' && chatId.chat) {
        chatId = chatId.chat;
      }

      const {
        text = '',
        caption = '',
        image,
        photo,
        video,
        audio,
        document,
        sticker,
        keyboard = [],
        footer = '',
        parse_mode,
        reply_to_message_id,
        reply_to,
        resize_keyboard = true,
        one_time_keyboard = false,
        selective = false,
        input_field_placeholder = '',
        ...extraOptions
      } = options;

      const replyToMessageId = reply_to_message_id || reply_to;
      const messageText = text || caption;
      const fullText = messageText + (footer ? `\n\n${footer}` : '');
      const parseMode = parse_mode !== undefined ? parse_mode : 'Markdown';
      const safeParse = safeParseMode(fullText, parseMode);

      if (!Array.isArray(keyboard) || keyboard.length === 0) {
        throw new Error('Keyboard must be a non-empty array');
      }

      const processedKeyboard = [];

      for (const keyboardRow of keyboard) {
        const rowButtons = [];
        const buttonsInRow = Array.isArray(keyboardRow) ? keyboardRow : [keyboardRow];

        for (const btn of buttonsInRow) {
          if (typeof btn === 'string') {
            rowButtons.push(Markup.button.text(btn));
          } else if (typeof btn === 'object') {
            const buttonType = btn.type || 'text';

            switch (buttonType.toLowerCase()) {
              case 'text':
                rowButtons.push(Markup.button.text(btn.text || btn.name || btn.label));
                break;

              case 'contact':
              case 'request_contact':
                rowButtons.push(Markup.button.contactRequest(btn.text || btn.name || 'Share Contact'));
                break;

              case 'location':
              case 'request_location':
                rowButtons.push(Markup.button.locationRequest(btn.text || btn.name || 'Share Location'));
                break;

              case 'poll':
              case 'request_poll':
                const pollType = btn.poll_type || btn.pollType;
                rowButtons.push(Markup.button.pollRequest(btn.text || btn.name || 'Create Poll', pollType));
                break;

              case 'web_app':
              case 'webapp':
                if (btn.url || btn.value) {
                  rowButtons.push(Markup.button.webApp(btn.text || btn.name, btn.url || btn.value));
                }
                break;

              default:
                rowButtons.push(Markup.button.text(btn.text || btn.name || btn.label || 'Button'));
            }
          }
        }

        if (rowButtons.length > 0) {
          processedKeyboard.push(rowButtons);
        }
      }

      let keyboardMarkup = Markup.keyboard(processedKeyboard);

      if (resize_keyboard) {
        keyboardMarkup = keyboardMarkup.resize();
      }

      if (one_time_keyboard) {
        keyboardMarkup = keyboardMarkup.oneTime();
      }

      if (selective) {
        keyboardMarkup = keyboardMarkup.selective();
      }

      if (input_field_placeholder) {
        keyboardMarkup = keyboardMarkup.placeholder(input_field_placeholder);
      }

      const sendOptions = {
        ...keyboardMarkup,
        parse_mode: safeParse.parseMode,
        reply_to_message_id: replyToMessageId,
        ...extraOptions
      };

      if (image || photo) {
        const imgSource = image || photo;
        let imageBuffer;

        if (Buffer.isBuffer(imgSource)) {
          imageBuffer = imgSource;
        } else if (typeof imgSource === 'string' && /^https?:\/\//.test(imgSource)) {
          const response = await axios.get(imgSource, { responseType: 'arraybuffer' });
          imageBuffer = Buffer.from(response.data);
        } else if (fs.existsSync(imgSource)) {
          imageBuffer = fs.readFileSync(imgSource);
        } else {
          imageBuffer = imgSource;
        }

        return await this.telegram.sendPhoto(
          chatId,
          { source: imageBuffer },
          {
            caption: safeParse.text,
            ...sendOptions
          }
        );
      }

      if (video) {
        let videoBuffer;

        if (Buffer.isBuffer(video)) {
          videoBuffer = video;
        } else if (typeof video === 'string' && /^https?:\/\//.test(video)) {
          const response = await axios.get(video, { responseType: 'arraybuffer' });
          videoBuffer = Buffer.from(response.data);
        } else if (fs.existsSync(video)) {
          videoBuffer = fs.readFileSync(video);
        } else {
          videoBuffer = video;
        }

        return await this.telegram.sendVideo(
          chatId,
          { source: videoBuffer },
          {
            caption: safeParse.text,
            ...sendOptions
          }
        );
      }

      if (audio) {
        let audioBuffer;

        if (Buffer.isBuffer(audio)) {
          audioBuffer = audio;
        } else if (typeof audio === 'string' && /^https?:\/\//.test(audio)) {
          const response = await axios.get(audio, { responseType: 'arraybuffer' });
          audioBuffer = Buffer.from(response.data);
        } else if (fs.existsSync(audio)) {
          audioBuffer = fs.readFileSync(audio);
        } else {
          audioBuffer = audio;
        }

        return await this.telegram.sendAudio(
          chatId,
          { source: audioBuffer },
          {
            caption: safeParse.text,
            ...sendOptions
          }
        );
      }

      if (document) {
        let docBuffer;
        let filename = options.filename || 'document';

        if (Buffer.isBuffer(document)) {
          docBuffer = document;
        } else if (typeof document === 'string' && /^https?:\/\//.test(document)) {
          const response = await axios.get(document, { responseType: 'arraybuffer' });
          docBuffer = Buffer.from(response.data);
        } else if (fs.existsSync(document)) {
          docBuffer = fs.readFileSync(document);
          filename = path.basename(document);
        } else {
          docBuffer = document;
        }

        return await this.telegram.sendDocument(
          chatId,
          { source: docBuffer, filename },
          {
            caption: safeParse.text,
            ...sendOptions
          }
        );
      }

      if (sticker) {
        let stickerBuffer;

        if (Buffer.isBuffer(sticker)) {
          stickerBuffer = sticker;
        } else if (typeof sticker === 'string' && /^https?:\/\//.test(sticker)) {
          const response = await axios.get(sticker, { responseType: 'arraybuffer' });
          stickerBuffer = Buffer.from(response.data);
        } else if (fs.existsSync(sticker)) {
          stickerBuffer = fs.readFileSync(sticker);
        } else {
          stickerBuffer = sticker;
        }

        return await this.telegram.sendSticker(
          chatId,
          { source: stickerBuffer },
          sendOptions
        );
      }

      return await this.telegram.sendMessage(
        chatId,
        safeParse.text,
        sendOptions
      );

    } catch (error) {
      console.error('Error in sendKeyboard:', error);
      throw error;
    }
  };

  bot.removeKeyboard = async function(chatId, text = 'Keyboard removed', options = {}) {
    try {
      if (typeof chatId === 'object' && chatId.chat) {
        chatId = chatId.chat;
      }

      const {
        parse_mode,
        reply_to_message_id,
        reply_to,
        selective = false,
        ...extraOptions
      } = options;

      const replyToMessageId = reply_to_message_id || reply_to;
      const parseMode = parse_mode !== undefined ? parse_mode : 'Markdown';
      const safeParse = safeParseMode(text, parseMode);

      let removeMarkup = Markup.removeKeyboard();

      if (selective) {
        removeMarkup = removeMarkup.selective();
      }

      return await this.telegram.sendMessage(
        chatId,
        safeParse.text,
        {
          ...removeMarkup,
          parse_mode: safeParse.parseMode,
          reply_to_message_id: replyToMessageId,
          ...extraOptions
        }
      );

    } catch (error) {
      console.error('Error in removeKeyboard:', error);
      throw error;
    }
  };

  bot.await = function(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  if (!global.waitingForAnswer) {
    global.waitingForAnswer = new Map();
  }

  bot.sendValue = async function(chatId, questions = []) {
    try {
      if (typeof chatId === 'object' && chatId.chat) {
        chatId = chatId.chat;
      }

      const sessionId = `${chatId}_${Date.now()}`;
      const responses = [];

      global.waitingForAnswer.set(chatId, {
        sessionId,
        questionIndex: 0,
        questions,
        responses,
        resolve: null,
        timeout: null
      });

      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const questionText = question.text || question;
        const timeout = question.timeout || 60000;
        const timeoutMsg = question.timeout_msg !== undefined ? question.timeout_msg : '⏱️ Timeout! Question expired.';
        const parseMode = question.parse_mode !== undefined ? question.parse_mode : 'Markdown';
        const safeParse = safeParseMode(questionText, parseMode);
        
        await bot.telegram.sendMessage(chatId, safeParse.text, {
          parse_mode: safeParse.parseMode,
          ...question.options
        });

        const session = global.waitingForAnswer.get(chatId);
        if (!session || session.sessionId !== sessionId) {
          break;
        }

        session.questionIndex = i;

        const userAnswer = await new Promise((resolve) => {
          session.resolve = resolve;

          session.timeout = setTimeout(() => {
            if (global.waitingForAnswer.get(chatId)?.sessionId === sessionId) {
              global.waitingForAnswer.delete(chatId);
              if (timeoutMsg) {
                bot.telegram.sendMessage(chatId, timeoutMsg).catch(() => {});
              }
              resolve(null);
            }
          }, timeout);
        });

        if (userAnswer === null) {
          break;
        }

        responses.push(userAnswer);

        if (question.response) {
          let responseText = question.response;
          
          if (typeof responseText === 'function') {
            responseText = await Promise.resolve(responseText(userAnswer, responses));
          } else if (typeof responseText === 'string') {
            responseText = responseText.replace(/\$\{ask\}/g, userAnswer);
            
            for (let j = 0; j < responses.length; j++) {
              responseText = responseText.replace(new RegExp(`\\$\\{ask${j}\\}`, 'g'), responses[j]);
            }
          }

          const responseParseMode = question.parse_mode !== undefined ? question.parse_mode : 'Markdown';
          const responseSafeParse = safeParseMode(responseText, responseParseMode);
          
          await bot.telegram.sendMessage(chatId, responseSafeParse.text, {
            parse_mode: responseSafeParse.parseMode,
            ...question.response_options
          });
        }
      }

      global.waitingForAnswer.delete(chatId);
      return responses;
    } catch (error) {
      console.error('Error in sendValue:', error);
      global.waitingForAnswer.delete(chatId);
      throw error;
    }
  };
    
  bot.sendList = async function(chatId, text, title, rows = [], options = {}) {
    const fullText = `*${title}*\n\n${text}`;
    const parseMode = options.parse_mode !== undefined ? options.parse_mode : 'Markdown';
    const safeParse = safeParseMode(fullText, parseMode);
    
    const keyboard = Markup.keyboard(
      rows.map(row => [row.title || row])
    ).resize().oneTime();

    return await this.telegram.sendMessage(chatId, safeParse.text, {
      ...keyboard,
      parse_mode: safeParse.parseMode,
      ...options
    });
  };

  bot.deleteMessage = async function(chatId, messageId) {
    try {
      return await this.telegram.deleteMessage(chatId, messageId);
    } catch (error) {
      return false;
    }
  };

  bot.editMessage = async function(chatId, messageId, text, options = {}) {
    try {
      if (typeof chatId === 'object' && chatId.chat && chatId.message_id) {
        const msg = chatId;
        const parseMode = options.parse_mode !== undefined ? options.parse_mode : 'Markdown';
        const safeParse = safeParseMode(text, parseMode);
        
        return await this.telegram.editMessageText(
          msg.chat.id,
          msg.message_id,
          undefined,
          safeParse.text,
          {
            parse_mode: safeParse.parseMode,
            ...options
          }
        );
      }
      
      const parseMode = options.parse_mode !== undefined ? options.parse_mode : 'Markdown';
      const safeParse = safeParseMode(text, parseMode);
      
      return await this.telegram.editMessageText(
        chatId,
        messageId,
        undefined,
        safeParse.text,
        {
          parse_mode: safeParse.parseMode,
          ...options
        }
      );
    } catch (error) {
      throw error;
    }
  };

  bot.editMessageText = async function(text, options = {}) {
    try {
      const { chat_id, message_id, inline_message_id, parse_mode, mentions, ...rest } = options;
      const parseModeFinal = parse_mode !== undefined ? parse_mode : 'Markdown';
      const safeParse = safeParseMode(text, parseModeFinal);
      
      if (inline_message_id) {
        return await this.telegram.editMessageText(
          undefined,
          undefined,
          inline_message_id,
          safeParse.text,
          { parse_mode: safeParse.parseMode, ...rest }
        );
      }
      
      return await this.telegram.editMessageText(
        chat_id,
        message_id,
        undefined,
        safeParse.text,
        { parse_mode: safeParse.parseMode, ...rest }
      );
    } catch (error) {
      throw error;
    }
  };

  bot.editMessageCaption = async function(caption, options = {}) {
    try {
      const { chat_id, message_id, inline_message_id, parse_mode, mentions, ...rest } = options;
      const parseModeFinal = parse_mode !== undefined ? parse_mode : 'Markdown';
      const safeParse = safeParseMode(caption, parseModeFinal);
      
      if (inline_message_id) {
        return await this.telegram.editMessageCaption(
          undefined,
          undefined,
          inline_message_id,
          safeParse.text,
          { parse_mode: safeParse.parseMode, ...rest }
        );
      }
      
      return await this.telegram.editMessageCaption(
        chat_id,
        message_id,
        undefined,
        safeParse.text,
        { parse_mode: safeParse.parseMode, ...rest }
      );
    } catch (error) {
      throw error;
    }
  };

  bot.sendChatAction = async function(chatId, action) {
    try {
      const validActions = [
        'typing',
        'upload_photo',
        'record_video',
        'upload_video',
        'record_voice',
        'upload_voice',
        'upload_document',
        'choose_sticker',
        'find_location',
        'record_video_note',
        'upload_video_note',
        'upload_audio'
      ];
      
      if (!validActions.includes(action)) {
        action = 'typing';
      }
      
      return await this.telegram.sendChatAction(chatId, action);
    } catch (error) {
      return false;
    }
  };

  bot.delay = function(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  bot.getChat = async function(chatId) {
    try {
      return await this.telegram.getChat(chatId);
    } catch (error) {
      throw error;
    }
  };

  bot.getChatMember = async function(chatId, userId) {
    try {
      return await this.telegram.getChatMember(chatId, userId);
    } catch (error) {
      throw error;
    }
  };

  bot.getChatAdministrators = async function(chatId) {
    try {
      return await this.telegram.getChatAdministrators(chatId);
    } catch (error) {
      throw error;
    }
  };

  bot.banChatMember = async function(chatId, userId, options = {}) {
    try {
      return await this.telegram.banChatMember(chatId, userId, options);
    } catch (error) {
      throw error;
    }
  };

  bot.unbanChatMember = async function(chatId, userId, options = {}) {
    try {
      return await this.telegram.unbanChatMember(chatId, userId, options);
    } catch (error) {
      throw error;
    }
  };

  bot.restrictChatMember = async function(chatId, userId, options = {}) {
    try {
      return await this.telegram.restrictChatMember(chatId, userId, options);
    } catch (error) {
      throw error;
    }
  };

  bot.promoteChatMember = async function(chatId, userId, options = {}) {
    try {
      return await this.telegram.promoteChatMember(chatId, userId, options);
    } catch (error) {
      throw error;
    }
  };

  bot.getName = async function(jid, withoutContact = false) {
    try {
      if (!jid) {
        const botInfo = await this.telegram.getMe();
        return botInfo.first_name || botInfo.username || 'Bot';
      }

      if (typeof jid === 'number' || (!isNaN(jid) && typeof jid !== 'object')) {
        try {
          const chatMember = await this.telegram.getChatMember(jid, jid).catch(() => null);
          if (chatMember && chatMember.user) {
            if (withoutContact) {
              return chatMember.user.username || String(jid);
            }
            return chatMember.user.first_name || chatMember.user.username || String(jid);
          }

          const chat = await this.telegram.getChat(jid).catch(() => null);
          if (chat) {
            if (chat.type === 'private') {
              if (withoutContact) {
                return chat.username || String(jid);
              }
              return chat.first_name || chat.username || String(jid);
            }
            
            if (chat.type === 'group' || chat.type === 'supergroup') {
              return chat.title || 'Group';
            }
            
            if (chat.type === 'channel') {
              return chat.title || 'Channel';
            }
            
            return chat.first_name || chat.username || String(jid);
          }
          
          return String(jid);
        } catch (error) {
          return String(jid);
        }
      }

      if (typeof jid === 'object') {
        if (jid.first_name || jid.username) {
          if (withoutContact) {
            return jid.username || String(jid.id || 'User');
          }
          return jid.first_name || jid.username || 'User';
        }
        if (jid.title) {
          return jid.title;
        }
      }

      return 'User';
    } catch (error) {
      return 'User';
    }
  };

  bot.getBuffer = async function(url) {
    try {
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      return Buffer.from(response.data);
    } catch (error) {
      throw error;
    }
  };

  bot.msToTime = function(ms) {
    let h = Math.floor(ms / 3600000);
    let m = Math.floor(ms / 60000) % 60;
    let s = Math.floor(ms / 1000) % 60;
    return `${h}h ${m}m ${s}s`;
  };

  bot.formatSize = function(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  bot.pickRandom = function(array) {
    return array[Math.floor(Math.random() * array.length)];
  };

  bot.resize = async function(buffer, width, height) {
    try {
      const sharp = require('sharp');
      return await sharp(buffer)
        .resize(width, height, {
          fit: 'cover',
          position: 'center'
        })
        .toBuffer();
    } catch (error) {
      return buffer;
    }
  };

  return bot;
}

async function smsg(bot, ctx) {
  if (!ctx.message && !ctx.channelPost) return ctx;

  const msg = ctx.message || ctx.channelPost;
  
  let m = {
    id: msg.message_id,
    chat: msg.chat.id,
    chatType: msg.chat.type === 'group' || msg.chat.type === 'supergroup' ? 'group' : 'private',
    from: msg.from || {},
    sender: msg.from ? msg.from.id : null,
    fromMe: msg.from ? msg.from.is_bot : false,
    isGroup: msg.chat.type === 'group' || msg.chat.type === 'supergroup',
    participant: (msg.chat.type === 'group' || msg.chat.type === 'supergroup') && msg.from ? msg.from.id : null,
    text: msg.text || msg.caption || '',
    pushName: msg.from ? (msg.from.first_name || msg.from.username || 'User') : 'User',
    name: msg.from ? (msg.from.first_name || msg.from.username || 'User') : 'User',
    usertag: msg.from && msg.from.username ? '@' + msg.from.username : null,
    mentionedJid: [],
    ctx: ctx,
    message: msg,
    message_id: msg.message_id
  };

  if (msg.entities) {
    for (let entity of msg.entities) {
      if (entity.type === 'mention' || entity.type === 'text_mention') {
        if (entity.user) {
          m.mentionedJid.push(entity.user.id);
        }
      }
    }
  }

  m.reply = async function(text, options = {}) {
    if (typeof text === 'object' && text.photo) {
      return await ctx.replyWithPhoto({ source: text.photo }, {
        caption: text.caption || '',
        parse_mode: options.parse_mode !== undefined ? options.parse_mode : 'Markdown',
        ...options
      });
    }

    if (typeof text === 'object' && text.video) {
      return await ctx.replyWithVideo({ source: text.video }, {
        caption: text.caption || '',
        parse_mode: options.parse_mode !== undefined ? options.parse_mode : 'Markdown',
        ...options
      });
    }

    if (typeof text === 'object' && text.audio) {
      return await ctx.replyWithAudio({ source: text.audio }, {
        caption: text.caption || '',
        parse_mode: options.parse_mode !== undefined ? options.parse_mode : 'Markdown',
        ...options
      });
    }

    if (typeof text === 'object' && text.document) {
      return await ctx.replyWithDocument({ source: text.document }, {
        caption: text.caption || '',
        parse_mode: options.parse_mode !== undefined ? options.parse_mode : 'Markdown',
        ...options
      });
    }

    if (typeof text === 'object' && text.sticker) {
      return await ctx.replyWithSticker({ source: text.sticker }, options);
    }

    const parseMode = options.parse_mode !== undefined ? options.parse_mode : 'Markdown';
    const safeParse = safeParseMode(text, parseMode);
    
    return await ctx.reply(safeParse.text, {
      parse_mode: safeParse.parseMode,
      ...options
    });
  };

  m.replyToSender = async function(text, options = {}) {
    const parseMode = options.parse_mode !== undefined ? options.parse_mode : 'Markdown';
    const safeParse = safeParseMode(text, parseMode);
    
    return await ctx.reply(safeParse.text, {
      parse_mode: safeParse.parseMode,
      ...options
    });
  };

  m.replyToQuoted = async function(text, options = {}) {
    const parseMode = options.parse_mode !== undefined ? options.parse_mode : 'Markdown';
    const safeParse = safeParseMode(text, parseMode);
    
    if (m.quoted) {
      return await ctx.telegram.sendMessage(m.chat, safeParse.text, {
        reply_to_message_id: m.quoted.id,
        parse_mode: safeParse.parseMode,
        ...options
      });
    }
    return await ctx.reply(safeParse.text, {
      parse_mode: safeParse.parseMode,
      ...options
    });
  };

  m.copy = function() {
    return { ...m };
  };

  m.download = async function() {
    try {
      let fileId;

      if (msg.photo) {
        fileId = msg.photo[msg.photo.length - 1].file_id;
      } else if (msg.video) {
        fileId = msg.video.file_id;
      } else if (msg.document) {
        fileId = msg.document.file_id;
      } else if (msg.audio) {
        fileId = msg.audio.file_id;
      } else if (msg.voice) {
        fileId = msg.voice.file_id;
      } else if (msg.sticker) {
        fileId = msg.sticker.file_id;
      } else {
        return null;
      }

      const fileLink = await ctx.telegram.getFileLink(fileId);
      const response = await axios.get(fileLink.href, { responseType: 'arraybuffer' });
      return Buffer.from(response.data);
    } catch (error) {
      return null;
    }
  };

  m.delete = async function() {
    try {
      return await ctx.deleteMessage();
    } catch (error) {
      return false;
    }
  };

  m.react = async function(emoji) {
    try {
      return await ctx.reply(emoji);
    } catch (error) {
      return false;
    }
  };

  if (msg.reply_to_message) {
    m.quoted = {
      id: msg.reply_to_message.message_id,
      sender: msg.reply_to_message.from.id,
      fromMe: msg.reply_to_message.from.is_bot || false,
      text: msg.reply_to_message.text || msg.reply_to_message.caption || '',
      isGroup: m.isGroup,
      participant: m.isGroup ? msg.reply_to_message.from.id : null,
      pushName: msg.reply_to_message.from.first_name || msg.reply_to_message.from.username || 'User',
      name: msg.reply_to_message.from.first_name || msg.reply_to_message.from.username || 'User',
      usertag: msg.reply_to_message.from && msg.reply_to_message.from.username ? '@' + msg.reply_to_message.from.username : null,
      mentionedJid: [],
      message: msg.reply_to_message
    };

    if (msg.reply_to_message.entities) {
      for (let entity of msg.reply_to_message.entities) {
        if (entity.type === 'mention' || entity.type === 'text_mention') {
          if (entity.user) {
            m.quoted.mentionedJid.push(entity.user.id);
          }
        }
      }
    }

    m.quoted.reply = async function(text, options = {}) {
      const parseMode = options.parse_mode !== undefined ? options.parse_mode : 'Markdown';
      const safeParse = safeParseMode(text, parseMode);
      
      return await ctx.telegram.sendMessage(m.chat, safeParse.text, {
        reply_to_message_id: m.quoted.id,
        parse_mode: safeParse.parseMode,
        ...options
      });
    };

    m.quoted.copy = function() {
      return { ...m.quoted };
    };

    m.quoted.download = async function() {
      try {
        let fileId;
        const quotedMsg = msg.reply_to_message;

        if (quotedMsg.photo) {
          fileId = quotedMsg.photo[quotedMsg.photo.length - 1].file_id;
        } else if (quotedMsg.video) {
          fileId = quotedMsg.video.file_id;
        } else if (quotedMsg.document) {
          fileId = quotedMsg.document.file_id;
        } else if (quotedMsg.audio) {
          fileId = quotedMsg.audio.file_id;
        } else if (quotedMsg.voice) {
          fileId = quotedMsg.voice.file_id;
        } else if (quotedMsg.sticker) {
          fileId = quotedMsg.sticker.file_id;
        } else {
          return null;
        }

        const fileLink = await ctx.telegram.getFileLink(fileId);
        const response = await axios.get(fileLink.href, { responseType: 'arraybuffer' });
        return Buffer.from(response.data);
      } catch (error) {
        return null;
      }
    };

    m.quoted.delete = async function() {
      try {
        return await ctx.telegram.deleteMessage(m.chat, m.quoted.id);
      } catch (error) {
        return false;
      }
    };

    m.quoted.react = async function(emoji) {
      try {
        return await ctx.telegram.sendMessage(m.chat, emoji, {
          reply_to_message_id: m.quoted.id
        });
      } catch (error) {
        return false;
      }
    };
  }
  return m;
}

module.exports = { initializeHelper, smsg, escapeMarkdown };
